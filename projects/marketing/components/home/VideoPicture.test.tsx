import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stubLivePrefersReducedMotion } from "@/test/prefersReducedMotion";
import { PLAYER_ORIGIN, VideoPicture } from "./VideoPicture";

const NAME = "Radiated immunity video: Elemwave's own simulation of currents induced on an aircraft by high-intensity radiated fields";
const STILL = "/images/problem-radiated-immunity.jpg";
const VIDEO = { youtubeId: "Q64_MgQxD_U", aspectRatio: "16 / 9" } as const;
const WIDGET_ID = 1;

function renderPicture() {
  return render(<VideoPicture label={NAME} stillUrl={STILL} video={VIDEO} widgetId={WIDGET_ID} />);
}

function frame() {
  return document.querySelector("iframe") as HTMLIFrameElement;
}

/** The still, found whether or not assistive technology is told to skip it. */
function still() {
  return document.querySelector('[role="img"]') as HTMLElement;
}

/** Whether the visitor sees the player rather than the still. */
function showsPlayer() {
  return !frame().classList.contains("opacity-0");
}

/** A message from the frame's own window, as the player sends it, or from wherever `from` says. */
function message(data: unknown, from: { source?: Window | null; origin?: string } = {}) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: typeof data === "string" ? data : JSON.stringify(data),
        origin: from.origin ?? PLAYER_ORIGIN,
        source: from.source === undefined ? frame().contentWindow : from.source,
      }),
    );
  });
}

const PLAYING_STATE_CHANGE = { event: "onStateChange", info: 1, id: WIDGET_ID, channel: "widget" };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("VideoPicture", () => {
  it("shows the still, whole, while the player has not reported that the video is playing", () => {
    renderPicture();

    expect({
      name: screen.getByRole("img", { name: NAME }) === still(),
      background: still().style.backgroundImage,
      whole: still().classList.contains("bg-contain"),
      showsPlayer: showsPlayer(),
    }).toEqual({ name: true, background: `url("${STILL}")`, whole: true, showsPlayer: false });
  });

  it("treats a state change to playing from the player's own frame as playing", () => {
    renderPicture();

    message(PLAYING_STATE_CHANGE);

    expect(showsPlayer()).toBe(true);
  });

  it("treats player information showing the playing state as playing", () => {
    renderPicture();

    message({ event: "infoDelivery", info: { playerState: 1, currentTime: 0.4 }, id: WIDGET_ID, channel: "widget" });

    expect(showsPlayer()).toBe(true);
  });

  it("keeps the still when the player reports a state other than playing", () => {
    renderPicture();

    for (const state of [-1, 0, 2, 3, 5]) {
      message({ event: "onStateChange", info: state, id: WIDGET_ID, channel: "widget" });
      message({ event: "infoDelivery", info: { playerState: state }, id: WIDGET_ID, channel: "widget" });
    }

    expect(showsPlayer()).toBe(false);
  });

  it("ignores a report that does not come from the player's own frame and origin", () => {
    renderPicture();

    message(PLAYING_STATE_CHANGE, { source: window });
    message(PLAYING_STATE_CHANGE, { origin: "https://www.youtube.com" });
    message(PLAYING_STATE_CHANGE, { origin: "https://attacker.example" });

    expect(showsPlayer()).toBe(false);
  });

  it("ignores a message that does not parse as JSON or names no event", () => {
    renderPicture();

    message("{not json");
    message("1");
    message({ info: 1 });
    message({ event: 1, info: 1 });

    expect({ showsPlayer: showsPlayer(), stillShown: still().getAttribute("aria-hidden") !== "true" }).toEqual({
      showsPlayer: false,
      stillShown: true,
    });
  });

  it("greets the player with the listening handshake and subscribes to state changes when its frame loads and whenever it says it is ready to listen", () => {
    renderPicture();
    const post = vi.spyOn(frame().contentWindow as Window, "postMessage").mockImplementation(() => undefined);

    fireEvent.load(frame());
    const afterLoad = post.mock.calls.map(([data, target]) => ({ data: JSON.parse(data as string), target }));
    post.mockClear();
    message({ event: "readyToListen", id: WIDGET_ID, channel: "widget" });
    const afterReady = post.mock.calls.map(([data]) => JSON.parse(data as string).event);

    expect(afterLoad).toEqual(
      expect.arrayContaining([
        { data: { event: "listening", id: WIDGET_ID, channel: "widget" }, target: PLAYER_ORIGIN },
        {
          data: { event: "command", func: "addEventListener", args: ["onStateChange"], id: WIDGET_ID, channel: "widget" },
          target: PLAYER_ORIGIN,
        },
      ]),
    );
    expect(afterReady).toEqual(expect.arrayContaining(["listening", "command"]));
    expect(new URL(frame().src).searchParams.get("enablejsapi")).toBe("1");
    expect(new URL(frame().src).searchParams.get("origin")).toBe(window.location.origin);
    expect(new URL(frame().src).searchParams.get("widgetid")).toBe(String(WIDGET_ID));
  });

  it("removes the player frame and focuses the still when reduced motion is turned on while the frame has focus", () => {
    const motion = stubLivePrefersReducedMotion();
    try {
      renderPicture();
      frame().focus();
      const focusedFrame = document.activeElement === frame();

      act(() => motion.enable());

      expect({
        focusedFrame,
        frames: document.querySelectorAll("iframe").length,
        focusOnStill: document.activeElement === still(),
        stillName: still().getAttribute("aria-label"),
      }).toEqual({ focusedFrame: true, frames: 0, focusOnStill: true, stillName: NAME });
    } finally {
      motion.restore();
    }
  });

  it("renders the still and no player frame in its server markup", () => {
    const markup = renderToStaticMarkup(<VideoPicture label={NAME} stillUrl={STILL} video={VIDEO} widgetId={WIDGET_ID} />);

    expect({ still: markup.includes(`aria-label="${NAME.replace(/'/g, "&#x27;")}"`), frame: markup.includes("<iframe") }).toEqual({
      still: true,
      frame: false,
    });
  });

  it("does not greet the player before its frame has loaded, and keeps greeting after the load until the player answers", () => {
    vi.useFakeTimers();
    try {
      renderPicture();
      const post = vi.spyOn(frame().contentWindow as Window, "postMessage").mockImplementation(() => undefined);

      act(() => vi.advanceTimersByTime(1_000));
      const beforeLoad = post.mock.calls.length;
      fireEvent.load(frame());
      post.mockClear();
      act(() => vi.advanceTimersByTime(600));
      const whileUnanswered = post.mock.calls.length;
      message({ event: "initialDelivery", info: {}, id: WIDGET_ID, channel: "widget" });
      post.mockClear();
      act(() => vi.advanceTimersByTime(1_000));

      expect({ beforeLoad, greetedWhileUnanswered: whileUnanswered > 0, afterAnswer: post.mock.calls.length }).toEqual({
        beforeLoad: 0,
        greetedWhileUnanswered: true,
        afterAnswer: 0,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the name on the frame and hides the still from assistive technology once the video is playing", () => {
    renderPicture();

    message(PLAYING_STATE_CHANGE);

    expect({
      frameTitle: frame().title,
      stillHidden: still().getAttribute("aria-hidden"),
      namedPictures: screen.queryAllByRole("img", { name: NAME }).length,
    }).toEqual({ frameTitle: NAME, stillHidden: "true", namedPictures: 0 });
  });
});
