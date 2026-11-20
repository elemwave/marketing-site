"use client";

import type { ItemVideo } from "@/lib/home-content";

/** YouTube's privacy-enhanced host: the only third party the player comes from. */
export const PLAYER_ORIGIN = "https://www.youtube-nocookie.com";

/**
 * The player's address: the video by itself, muted and looping (`loop` needs
 * the video as its own `playlist`), with no controls, related videos or
 * annotations. `disablekb` is left out so the player keeps its keyboard toggle.
 */
export function playerAddress(video: ItemVideo): string {
  const query = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: video.youtubeId,
    controls: "0",
    playsinline: "1",
    rel: "0",
    iv_load_policy: "3",
  });
  return `${PLAYER_ORIGIN}/embed/${video.youtubeId}?${query.toString()}`;
}

/**
 * A video item's picture area: the video's still, and above it Elemwave's own
 * simulation playing from YouTube's privacy-enhanced player. The area keeps the
 * size every item's picture has; inside it the frame takes the video's shape,
 * as large as fits, so the video is shown whole and the player adds no bars.
 * The area is a size container, so the frame's width is the smaller of its
 * width and its height times the video's ratio.
 */
export function VideoPicture({ label, stillUrl, video }: { label: string; stillUrl: string; video: ItemVideo }) {
  return (
    <div className="flex h-[clamp(220px,42vw,460px)] w-full items-center justify-center [container-type:size]">
      <div
        className="relative max-h-full max-w-full overflow-hidden rounded-[12px]"
        style={{ aspectRatio: video.aspectRatio, width: `min(100cqw, calc(100cqh * ${video.aspectRatio}))` }}
      >
        <div
          role="img"
          aria-label={label}
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${stillUrl}')` }}
        />
        <iframe
          title={label}
          src={playerAddress(video)}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0 opacity-0"
        />
      </div>
    </div>
  );
}
