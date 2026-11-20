import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { select } from "@/test/item-tabs";
import { stubLivePrefersReducedMotion } from "@/test/prefersReducedMotion";
import { ProblemsSection } from "./ProblemsSection";

/**
 * A video item's picture area, driven the way a visitor reaches it: The
 * challenges with Radiated immunity chosen. jsdom plays no media, so the cases
 * stub `play`, `pause` and `load` and dispatch the element's events as a
 * browser would.
 */
const NAME = "Radiated immunity video: Elemwave's own simulation of currents induced on an aircraft by high-intensity radiated fields";
const STILL = "/images/problem-radiated-immunity.jpg";
const VIDEO = { src: "/images/problem-radiated-immunity.mp4", aspectRatio: "1278 / 720" } as const;

function renderPicture() {
  const rendered = render(<ProblemsSection />);
  select("Radiated immunity");
  return rendered;
}

/** The shown video; the case fails here when there is none. */
function video() {
  const shown = document.querySelector("video");
  expect(shown, "the video item's video").not.toBeNull();
  return shown as HTMLVideoElement;
}

/** The picture area's button, whichever name it has. */
function button() {
  return screen.getByRole("button", { name: /^(Play|Pause) Radiated immunity video\b/ });
}

/** The still: the button's still layer, or with reduced motion the picture alone. */
function still() {
  return (document.querySelector('[role="img"]') ?? button().firstElementChild) as HTMLElement;
}

/** Whether the visitor sees the video rather than the still beneath it. */
function showsVideo() {
  return !video().classList.contains("opacity-0");
}

/** Sets a media property jsdom keeps on the prototype, as the browser would report it. */
function report(element: HTMLMediaElement, property: "paused" | "error", value: unknown) {
  Object.defineProperty(element, property, { configurable: true, value });
}

/** The element fires `type`, as the browser does. */
function fire(type: "play" | "playing" | "pause" | "error") {
  act(() => {
    video().dispatchEvent(new Event(type));
  });
}

/** The browser has started the video by itself: it is no longer paused, and has fired `play` and `playing`. */
function startsByItself() {
  report(video(), "paused", false);
  fire("play");
  fire("playing");
}

/** The video fails: the element reports its error and fires `error`. */
function fails() {
  report(video(), "error", { code: 2, message: "network" });
  fire("error");
}

/** What `play()` answers next; resolved unless a case says otherwise. */
let nextPlay: () => Promise<void>;
let media: {
  play: ReturnType<typeof vi.spyOn>;
  pause: ReturnType<typeof vi.spyOn>;
  load: ReturnType<typeof vi.spyOn>;
};

beforeEach(() => {
  nextPlay = () => Promise.resolve();
  // A browser reports no error as null; jsdom does not define `error` at all.
  Object.defineProperty(HTMLMediaElement.prototype, "error", { configurable: true, get: () => null });
  media = {
    play: vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      report(this, "paused", false);
      this.dispatchEvent(new Event("play"));
      return nextPlay();
    }),
    pause: vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      report(this, "paused", true);
      this.dispatchEvent(new Event("pause"));
    }),
    load: vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(function (this: HTMLMediaElement) {
      report(this, "error", null);
    }),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (HTMLMediaElement.prototype as { error?: unknown }).error;
});

describe("VideoPicture", () => {
  it("shows the still, whole, until the video fires playing", () => {
    renderPicture();
    const before = showsVideo();
    fire("play");

    expect({
      src: video().getAttribute("src"),
      background: still().style.backgroundImage,
      whole: still().classList.contains("bg-contain"),
      before,
      afterPlay: showsVideo(),
    }).toEqual({ src: VIDEO.src, background: `url("${STILL}")`, whole: true, before: false, afterPlay: false });
  });

  it("shows the video and hides the still from assistive technology once the video fires playing", () => {
    renderPicture();

    startsByItself();

    expect({
      showsVideo: showsVideo(),
      stillHidden: still().getAttribute("aria-hidden"),
      videoHidden: video().getAttribute("aria-hidden"),
      pictures: screen.queryAllByRole("img").length,
      name: button().getAttribute("aria-label"),
    }).toEqual({ showsVideo: true, stillHidden: "true", videoHidden: "true", pictures: 0, name: `Pause ${NAME}` });
  });

  it("keeps the still and shows no message when the video fires an error before it has played", () => {
    renderPicture();

    fails();

    expect({
      showsVideo: showsVideo(),
      background: still().style.backgroundImage,
      text: button().textContent,
      alerts: screen.queryAllByRole("alert").length,
    }).toEqual({ showsVideo: false, background: `url("${STILL}")`, text: "", alerts: 0 });
  });

  it("shows the still again, and no message, when the video fires an error after it has played", () => {
    renderPicture();
    startsByItself();
    const whilePlaying = showsVideo();

    fails();

    expect({
      whilePlaying,
      showsVideo: showsVideo(),
      name: button().getAttribute("aria-label"),
      text: button().textContent,
      alerts: screen.queryAllByRole("alert").length,
    }).toEqual({ whilePlaying: true, showsVideo: false, name: `Play ${NAME}`, text: "", alerts: 0 });
  });

  it("names the button Pause and the item's video name from the moment the video fires play, before it has fired playing, and while it plays", () => {
    renderPicture();

    report(video(), "paused", false);
    fire("play");
    const afterPlay = button().getAttribute("aria-label");
    fire("playing");

    expect({ afterPlay, whilePlaying: button().getAttribute("aria-label") }).toEqual({
      afterPlay: `Pause ${NAME}`,
      whilePlaying: `Pause ${NAME}`,
    });
  });

  it("names the button Play and the item's video name before the video fires play, after it fires pause, and after it fires error", () => {
    renderPicture();
    const before = button().getAttribute("aria-label");
    startsByItself();
    report(video(), "paused", true);
    fire("pause");
    const afterPause = button().getAttribute("aria-label");
    report(video(), "paused", false);
    fire("play");
    fire("playing");
    fails();

    expect({ before, afterPause, afterError: button().getAttribute("aria-label") }).toEqual({
      before: `Play ${NAME}`,
      afterPause: `Play ${NAME}`,
      afterError: `Play ${NAME}`,
    });
  });

  it("pauses the video when the playing video is activated and plays it when the paused video is activated", () => {
    renderPicture();
    startsByItself();

    fireEvent.click(button());
    const afterFirst = { pause: media.pause.mock.calls.length, play: media.play.mock.calls.length, paused: video().paused };
    fireEvent.click(button());

    expect({
      afterFirst,
      afterSecond: { pause: media.pause.mock.calls.length, play: media.play.mock.calls.length, paused: video().paused },
      showsVideo: showsVideo(),
    }).toEqual({
      afterFirst: { pause: 1, play: 0, paused: true },
      afterSecond: { pause: 1, play: 1, paused: false },
      showsVideo: true,
    });
  });

  it("ignores a rejected play without showing a message", async () => {
    renderPicture();
    nextPlay = () => Promise.reject(new DOMException("The play() request was interrupted", "NotAllowedError"));

    fireEvent.click(button());
    await act(async () => {
      await Promise.resolve();
    });

    expect({
      play: media.play.mock.calls.length,
      text: button().textContent,
      alerts: screen.queryAllByRole("alert").length,
      showsVideo: showsVideo(),
    }).toEqual({ play: 1, text: "", alerts: 0, showsVideo: false });
  });

  it("starts the video when a browser that declined to start it by itself has the button activated", () => {
    renderPicture();
    const name = button().getAttribute("aria-label");

    fireEvent.click(button());

    expect({ name, play: media.play.mock.calls.length, pause: media.pause.mock.calls.length }).toEqual({
      name: `Play ${NAME}`,
      play: 1,
      pause: 0,
    });
  });

  it("pauses a video whose start is still pending, which the button announced as Pause", () => {
    renderPicture();
    report(video(), "paused", false);
    fire("play");
    const name = button().getAttribute("aria-label");

    fireEvent.click(button());

    expect({ name, pause: media.pause.mock.calls.length, play: media.play.mock.calls.length }).toEqual({
      name: `Pause ${NAME}`,
      pause: 1,
      play: 0,
    });
  });

  it("loads the failed video afresh and asks for a play when its button is activated", () => {
    renderPicture();
    report(video(), "paused", false);
    fire("play");
    fails();
    const calls: string[] = [];
    media.load.mockImplementation(function (this: HTMLMediaElement) {
      calls.push("load");
      report(this, "error", null);
    });
    media.play.mockImplementation(() => {
      calls.push("play");
      return Promise.resolve();
    });
    media.pause.mockImplementation(() => {
      calls.push("pause");
    });

    fireEvent.click(button());
    const afterFailure = [...calls];
    calls.length = 0;
    report(video(), "paused", true);
    fireEvent.click(button());

    expect({ afterFailure, withoutError: calls }).toEqual({ afterFailure: ["load", "play"], withoutError: ["play"] });
  });

  it("ends in the state the last of several quick activations asked for, and each name announced what that activation did once its events were delivered, even while the first start is still pending", () => {
    renderPicture();
    nextPlay = () => new Promise<void>(() => undefined);

    const steps = [1, 2, 3, 4, 5].map(() => {
      fireEvent.click(button());
      const nextCallsPause = !video().paused && video().error === null;
      return { paused: video().paused, namedPause: button().getAttribute("aria-label") === `Pause ${NAME}`, nextCallsPause };
    });

    expect(steps.map(({ paused }) => paused)).toEqual([false, true, false, true, false]);
    expect(steps.filter(({ namedPause, nextCallsPause }) => namedPause !== nextCallsPause)).toEqual([]);
  });

  it("removes the video and focuses the still when reduced motion is turned on while the button has focus", () => {
    const motion = stubLivePrefersReducedMotion();
    try {
      renderPicture();
      button().focus();
      const focusedButton = document.activeElement === button();

      act(() => motion.enable());

      expect({
        focusedButton,
        buttons: screen.queryAllByRole("button", { name: /^(Play|Pause) / }).length,
        videos: document.querySelectorAll("video").length,
        focusOnStill: document.activeElement === still(),
        stillName: still().getAttribute("aria-label"),
      }).toEqual({ focusedButton: true, buttons: 0, videos: 0, focusOnStill: true, stillName: NAME });
    } finally {
      motion.restore();
    }
  });
});
