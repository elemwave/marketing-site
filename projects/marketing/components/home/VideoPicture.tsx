"use client";

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/components/site/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import type { ItemVideo } from "@/lib/home-content";
import { videoFrameStyle } from "./videoFrameStyle";

/**
 * Mutes the video before it can play. React sets the `muted` property but not
 * the attribute, so `defaultMuted`, which reflects the attribute, is set too:
 * some browsers, iOS among them, allow a video to start by itself only when it
 * is muted.
 */
function muteBeforePlayback(video: HTMLVideoElement | null) {
  if (video) {
    video.defaultMuted = true;
    video.muted = true;
  }
}

/**
 * Pauses the video while it plays or is about to, and otherwise asks it to
 * play. The element is read, not the component's state, so several quick
 * activations end in the state the last one asked for. After a failure the
 * video is loaded afresh first: `play()` alone does not fetch again a source
 * that failed. A refused play changes nothing, and shows no message.
 */
function toggle(video: HTMLVideoElement | null) {
  if (!video) {
    return;
  }
  if (!video.paused && !video.error) {
    video.pause();
    return;
  }
  if (video.error) {
    video.load();
  }
  video.play()?.catch(() => undefined);
}

/**
 * Moves focus to `still` when reduced motion removes the button while it holds
 * focus, so keyboard focus is never dropped to the page. React detaches the
 * button's ref just before it removes the button from the page, while it still
 * holds focus, so whether it did is noted there: a browser delivers the
 * preference's `change` event to React's own subscriber first, and by the time
 * any later listener ran the button would be gone and focus already on the
 * page. Returns the ref callback for the button.
 */
function useFocusHandOff(still: RefObject<HTMLDivElement | null>, reducedMotion: boolean) {
  const buttonHadFocus = useRef(false);
  const attachButton = useCallback((node: HTMLButtonElement | null) => {
    if (!node) {
      return;
    }
    return () => {
      buttonHadFocus.current = document.activeElement === node;
    };
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion && buttonHadFocus.current) {
      buttonHadFocus.current = false;
      still.current?.focus();
    }
  }, [reducedMotion, still]);

  return attachButton;
}

/**
 * A video item's picture area: Elemwave's own simulation, published with the
 * site, playing muted and looping over its still. The area keeps the size
 * every item's picture has; inside it the frame takes the video's shape, as
 * large as fits, so the video is shown whole with no bars.
 *
 * The video stays transparent over the still until it fires `playing`, so
 * the visitor sees the still while it loads, where a browser declines to
 * start it by itself, and again after it fails; a pause holds the picture it
 * reached. The frame is a native button, the moving surface as its own pause
 * control, named by what activating it does: `Pause …` from the moment the
 * browser is asked to start the video, `Play …` before that, after a pause
 * and after a failure.
 *
 * A visitor who asks for reduced motion is shown the still alone: no video is
 * mounted, so no video byte is requested, and nothing offers to start
 * movement. Turning the preference on while the button has focus hands focus
 * to the still.
 */
export function VideoPicture({ label, stillUrl, video }: { label: string; stillUrl: string; video: ItemVideo }) {
  const reducedMotion = usePrefersReducedMotion();
  const element = useRef<HTMLVideoElement | null>(null);
  const still = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(true);
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    element.current = video;
    muteBeforePlayback(video);
  }, []);
  const frameStyle = videoFrameStyle(video.aspectRatio);
  const stillStyle = { backgroundImage: `url('${stillUrl}')` };
  const attachButton = useFocusHandOff(still, reducedMotion);

  return (
    <div className="flex h-[clamp(220px,42vw,460px)] w-full items-center justify-center [container-type:size]">
      {reducedMotion ? (
        <div className="relative max-h-full max-w-full overflow-hidden rounded-[12px]" style={frameStyle}>
          <div
            ref={still}
            role="img"
            aria-label={label}
            tabIndex={-1}
            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
            style={stillStyle}
          />
        </div>
      ) : (
        <button
          ref={attachButton}
          type="button"
          aria-label={`${paused ? "Play" : "Pause"} ${label}`}
          onClick={() => toggle(element.current)}
          className="relative block max-h-full max-w-full cursor-pointer appearance-none overflow-hidden rounded-[12px] border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-950"
          style={frameStyle}
        >
          <div aria-hidden className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={stillStyle} />
          <video
            ref={attachVideo}
            src={video.src}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden
            onPlay={() => setPaused(false)}
            onPlaying={() => {
              setPlaying(true);
              setPaused(false);
            }}
            onPause={() => setPaused(true)}
            onError={() => {
              setPlaying(false);
              setPaused(true);
            }}
            className={cn("absolute inset-0 h-full w-full object-contain", playing ? "opacity-100" : "opacity-0")}
          />
        </button>
      )}
    </div>
  );
}
