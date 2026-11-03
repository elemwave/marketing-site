import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, screen, within } from "@testing-library/react";
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

/** Which tabs are pressed, and the title heading the card. */
export function selection() {
  return {
    pressed: screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-pressed") === "true")
      .map((button) => button.textContent),
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
