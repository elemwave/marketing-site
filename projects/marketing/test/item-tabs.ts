import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { act, fireEvent, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";
import { SLIDES } from "@/lib/home-content";

/**
 * Shared queries for a home section built on `ItemTabs`: its tab buttons,
 * active card and picture. Each returns what it found, so that the test
 * itself states what it expects.
 */

const PUBLIC_IMAGES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/images");

export function itemButton(name: string) {
  return screen.getByRole("button", { name });
}

export function select(name: string) {
  fireEvent.click(itemButton(name));
}

/** The active card's text: its heading and paragraphs, nothing else. */
export function cardText() {
  const heading = screen.getByRole("heading", { level: 3 });
  return heading.parentElement?.textContent ?? "";
}

export function picture() {
  return screen.getByRole("img", { name: /screenshot$/ });
}

/** The phrases the text does not contain, ignoring case. */
export function missingPhrases(text: string, phrases: string[]) {
  return phrases.filter((phrase) => !text.toLowerCase().includes(phrase.toLowerCase()));
}

/** How many of the phrases the text contains, ignoring case. */
export function phrasesFound(text: string, phrases: string[]) {
  return phrases.length - missingPhrases(text, phrases).length;
}

/** The labels of the tabs indicated as chosen, whether or not an item is shown. */
export function pressedTabs() {
  return screen
    .getAllByRole("button")
    .filter((button) => button.getAttribute("aria-pressed") === "true")
    .map((button) => button.textContent);
}

/** Which tabs are pressed, and the title heading the card. */
export function selection() {
  return {
    pressed: pressedTabs(),
    title: screen.getByRole("heading", { level: 3 }).textContent,
  };
}

/** Each tab's label, and the title the card shows once that tab is chosen. */
export function labelsAndTitles() {
  return screen.getAllByRole("button").map((button) => {
    fireEvent.click(button);
    return { label: button.textContent, title: screen.getByRole("heading", { level: 3 }).textContent };
  });
}

/** The links in the active card that go to a DOI address. */
export function paperLinks() {
  const card = screen.getByRole("heading", { level: 3 }).parentElement as HTMLElement;
  return within(card)
    .queryAllByRole("link")
    .filter((link) => link.getAttribute("href")?.startsWith("https://doi.org/"));
}

/**
 * Selects each item in turn and reports the picture it shows: its address,
 * whether its accessible name names the item, whether the file exists under
 * public/images/, and whether it is a figure from a paper.
 */
export function shownPictures(names: string[]) {
  const paperFigures = new Set(SLIDES.map((slide) => slide.imageUrl));
  return names.map((name) => {
    select(name);
    const url = picture().style.backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] ?? "";
    return {
      name,
      url,
      namedAfterItem: screen.queryByRole("img", { name: `${name} screenshot` }) === picture(),
      exists: existsSync(path.join(PUBLIC_IMAGES, url.replace(/^\/images\//, ""))),
      paperFigure: paperFigures.has(url) || /publication-|tab-tulip/.test(url),
    };
  });
}

/** What `shownPictures` reports when every item shows its own file, named after it, and no paper figure. */
export function ownPictures(pictures: Record<string, string>) {
  return Object.entries(pictures).map(([name, file]) => ({
    name,
    url: `/images/${file}`,
    namedAfterItem: true,
    exists: true,
    paperFigure: false,
  }));
}

/** Chooses the named item again and reports whether the card's content and the announcement changed. */
export function reselect(name: string) {
  const before = cardText();
  select(name);
  return {
    ...selection(),
    contentChanged: cardText() !== before,
    announcement: screen.getByRole("status").textContent,
  };
}

/**
 * Focuses the named tab, activates it the way a pointer click or Enter does,
 * and reports each `scrollIntoView` call: its options, and whether the
 * element it was called on is the item card (it holds both the title and the
 * picture). Also reports whether focus stayed on the tab.
 */
export function scrollsOnActivation(name: string) {
  const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
  try {
    const button = itemButton(name);
    button.focus();
    fireEvent.click(button);
    const title = screen.getByRole("heading", { level: 3 });
    return {
      calls: scroll.mock.calls.map((args, i) => {
        const target = scroll.mock.contexts[i] as Element;
        return { options: args[0], onItemCard: target.contains(title) && target.contains(picture()) };
      }),
      focusStayed: document.activeElement === button,
    };
  } finally {
    scroll.mockRestore();
  }
}

/**
 * Renders a section through `renderSection` and reports what a visitor finds
 * before choosing anything: the tabs indicated or emphasised as chosen, how
 * many item titles and pictures are shown, and how many times the page was
 * asked to scroll.
 */
export function openedFresh(renderSection: () => unknown) {
  const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
  try {
    renderSection();
    const buttons = screen.getAllByRole("button");
    return {
      pressed: pressedTabs(),
      emphasised: buttons.filter((button) => button.querySelector(".font-semibold")).map((button) => button.textContent),
      itemTitles: screen.queryAllByRole("heading", { level: 3 }).length,
      pictures: screen.queryAllByRole("img", { name: /screenshot$/ }).length,
      scrolled: scroll.mock.calls.length,
      tabStates: [...new Set(buttons.map((button) => button.getAttribute("aria-pressed")))],
    };
  } finally {
    scroll.mockRestore();
  }
}

/** What the server sends for the element, before any script runs. */
export function serverMarkup(element: ReactElement) {
  return renderToStaticMarkup(element);
}

/** A browser announcing a page restored from its back-forward cache, state and all. */
export function showPageFromHistory() {
  const event = new Event("pageshow");
  Object.defineProperty(event, "persisted", { value: true });
  act(() => {
    window.dispatchEvent(event);
  });
}

/** What `openedFresh` reports for a section opening with its tabs alone: nothing chosen, shown or scrolled. */
export const NOTHING_SHOWN = {
  pressed: [],
  emphasised: [],
  itemTitles: 0,
  pictures: 0,
  scrolled: 0,
  tabStates: ["false"],
};

/** What the server sends: the tab labels it lacks, and which parts of an item it carries. */
export function serverMarkupFacts(element: ReactElement, labels: string[]) {
  const markup = serverMarkup(element);
  return {
    missingLabels: labels.filter((label) => !markup.includes(label)),
    itemMarkup: ["<h3", "screenshot", 'aria-pressed="true"'].filter((part) => markup.includes(part)),
  };
}

/** Chooses the first item and reports what is shown, pressed and announced. */
export function firstChoice(name: string) {
  select(name);
  return { ...selection(), announcement: screen.getByRole("status").textContent };
}

/** Chooses each item in a row, starting from none, and reports the tabs pressed before and the item shown at the end. */
export function chooseInTurn(names: string[]) {
  const before = pressedTabs();
  for (const name of names) {
    select(name);
  }
  return { before, ...selection() };
}

/** Chooses an item, leaves the section, shows it afresh, and reports what it then shows. */
export function shownAfreshAfterChoosing(renderSection: () => { unmount: () => void }, chosen: string) {
  const { unmount } = renderSection();
  select(chosen);
  unmount();

  renderSection();

  return { pressed: pressedTabs(), itemTitles: screen.queryAllByRole("heading", { level: 3 }).length };
}
