import type { CSSProperties } from "react";

/**
 * The inline style of a video's frame inside a picture area that is a size
 * container: the video's own shape, `"<width> / <height>"`, as large as fits,
 * so the video is shown whole with no bars. Its width is the smaller of the
 * area's width and the area's height times the video's ratio.
 */
export function videoFrameStyle(aspectRatio: string): Pick<CSSProperties, "aspectRatio" | "width"> {
  return { aspectRatio, width: `min(100cqw, calc(100cqh * ${aspectRatio}))` };
}
