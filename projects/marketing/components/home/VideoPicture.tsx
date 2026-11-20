"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { REDUCED_MOTION_QUERY, usePrefersReducedMotion } from "@/components/site/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import type { ItemVideo } from "@/lib/home-content";

/** YouTube's privacy-enhanced host: the only third party the player comes from. */
export const PLAYER_ORIGIN = "https://www.youtube-nocookie.com";

/** `YT.PlayerState.PLAYING` in YouTube's player protocol. */
const PLAYING = 1;

/** How often the player is greeted until it first answers, as YouTube's own widget does. */
const GREETING_INTERVAL_MS = 250;

/**
 * The player's address: the video by itself, muted and looping (`loop` needs
 * the video as its own `playlist`), with no controls, related videos or
 * annotations, and with its message protocol switched on for this page.
 * `disablekb` is left out so the player keeps its keyboard toggle.
 */
export function playerAddress(video: ItemVideo, pageOrigin: string, widgetId: number): string {
  const query = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: video.youtubeId,
    controls: "0",
    playsinline: "1",
    rel: "0",
    iv_load_policy: "3",
    enablejsapi: "1",
    origin: pageOrigin,
    widgetid: String(widgetId),
  });
  return `${PLAYER_ORIGIN}/embed/${video.youtubeId}?${query.toString()}`;
}

const noSubscription = () => () => undefined;

/**
 * This page's origin for the player's `origin` parameter, or null while
 * rendering on the server, where there is none: the player is mounted only
 * once the browser knows it, so server markup never carries a frame.
 */
function usePageOrigin(): string | null {
  return useSyncExternalStore(
    noSubscription,
    () => window.location.origin,
    () => null,
  );
}

interface PlayerReport {
  event: string;
  info?: unknown;
}

/** A message the player sent, or null when it is not one this page understands. */
function playerReport(data: unknown): PlayerReport | null {
  if (typeof data !== "string") {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(data);
    return typeof parsed === "object" && parsed !== null && typeof (parsed as PlayerReport).event === "string"
      ? (parsed as PlayerReport)
      : null;
  } catch {
    return null;
  }
}

/** Whether the report says the video is playing: a state change, or the player's information. */
function reportsPlaying({ event, info }: PlayerReport): boolean {
  if (event === "onStateChange") {
    return info === PLAYING;
  }
  return event === "infoDelivery" && typeof info === "object" && info !== null && (info as { playerState?: unknown }).playerState === PLAYING;
}

/**
 * Listens to the player in `frame` and greets it until it answers: the
 * `listening` handshake and a subscription to its state changes, sent when it
 * loads, whenever it says it is ready to listen, and on an interval until its
 * first answer. Only a message from that frame's own window and origin counts,
 * and only one this page understands. Returns `greet` for the frame's `load`.
 */
function usePlayerPlaying(frame: RefObject<HTMLIFrameElement | null>, widgetId: number, active: boolean) {
  const [playing, setPlaying] = useState(false);

  const greet = useCallback(() => {
    const player = frame.current?.contentWindow;
    if (!player) {
      return;
    }
    const greetings = [
      { event: "listening", id: widgetId, channel: "widget" },
      { event: "command", func: "addEventListener", args: ["onStateChange"], id: widgetId, channel: "widget" },
    ];
    for (const greeting of greetings) {
      player.postMessage(JSON.stringify(greeting), PLAYER_ORIGIN);
    }
  }, [frame, widgetId]);

  useEffect(() => {
    if (!active) {
      return;
    }
    let answered = false;
    const greeting = window.setInterval(() => (answered ? window.clearInterval(greeting) : greet()), GREETING_INTERVAL_MS);
    const listen = (event: MessageEvent) => {
      const report = event.origin === PLAYER_ORIGIN && event.source === frame.current?.contentWindow ? playerReport(event.data) : null;
      if (!report) {
        return;
      }
      answered = true;
      if (report.event === "readyToListen") {
        greet();
      }
      if (reportsPlaying(report)) {
        setPlaying(true);
      }
    };
    window.addEventListener("message", listen);
    return () => {
      window.clearInterval(greeting);
      window.removeEventListener("message", listen);
    };
  }, [active, frame, greet]);

  return { playing, greet };
}

/**
 * Moves focus to `still` when reduced motion removes the player while it holds
 * focus, so keyboard focus is never dropped to the page. Whether the player
 * held focus is noted as the preference changes, before React removes it.
 */
function useFocusHandOff(frame: RefObject<HTMLIFrameElement | null>, still: RefObject<HTMLDivElement | null>, reducedMotion: boolean) {
  const frameHadFocus = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const note = () => {
      frameHadFocus.current = frame.current !== null && document.activeElement === frame.current;
    };
    media.addEventListener("change", note);
    return () => media.removeEventListener("change", note);
  }, [frame]);

  useLayoutEffect(() => {
    if (reducedMotion && frameHadFocus.current) {
      frameHadFocus.current = false;
      still.current?.focus();
    }
  }, [reducedMotion, still]);
}

/**
 * A video item's picture area: the video's still, and above it Elemwave's own
 * simulation playing from YouTube's privacy-enhanced player. The area keeps the
 * size every item's picture has; inside it the frame takes the video's shape,
 * as large as fits, so the video is shown whole and the player adds no bars.
 * The area is a size container, so the frame's width is the smaller of its
 * width and its height times the video's ratio.
 *
 * The player stays transparent, above the still, until it reports that the
 * video is playing: the visitor sees the still rather than the player's own
 * loading, play-button or error state, and a click still reaches the player
 * where a browser blocks autoplay. Once playing it never hides again, so a
 * pause holds the frame the video reached.
 *
 * A visitor who asks for reduced motion is shown the still alone: no player is
 * mounted, so nothing is requested from YouTube. Nor is one in server markup.
 */
export function VideoPicture({
  label,
  stillUrl,
  video,
  widgetId,
}: {
  label: string;
  stillUrl: string;
  video: ItemVideo;
  widgetId: number;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const still = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const pageOrigin = usePageOrigin();
  const playerShown = !reducedMotion && pageOrigin !== null;
  const { playing, greet } = usePlayerPlaying(frame, widgetId, playerShown);
  useFocusHandOff(frame, still, reducedMotion);

  return (
    <div className="flex h-[clamp(220px,42vw,460px)] w-full items-center justify-center [container-type:size]">
      <div
        className="relative max-h-full max-w-full overflow-hidden rounded-[12px]"
        style={{ aspectRatio: video.aspectRatio, width: `min(100cqw, calc(100cqh * ${video.aspectRatio}))` }}
      >
        <div
          ref={still}
          role="img"
          aria-label={label}
          aria-hidden={(playing && playerShown) || undefined}
          tabIndex={-1}
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${stillUrl}')` }}
        />
        {playerShown && pageOrigin !== null && (
          <iframe
            ref={frame}
            title={label}
            src={playerAddress(video, pageOrigin, widgetId)}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={greet}
            className={cn("absolute inset-0 h-full w-full border-0", playing ? "opacity-100" : "opacity-0")}
          />
        )}
      </div>
    </div>
  );
}
