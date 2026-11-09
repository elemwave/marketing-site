import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { pressedTabs, showPageFromHistory } from "@/test/item-tabs";
import Home, { metadata } from "./page";

vi.mock("react-calendly", () => ({ PopupModal: () => <div data-testid="calendly" /> }));

function renderHome() {
  return render(
    <BookingModalProvider calendlyUrl="https://calendly.test/x">
      <Home />
    </BookingModalProvider>,
  );
}

describe("the home page", () => {
  it("presents its own content", () => {
    renderHome();

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(document.querySelector("#problems")).not.toBeNull();
    expect(document.querySelector("#software")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Peer-Reviewed Publications" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Certifications" }),
    ).toBeInTheDocument();
    expect(document.querySelector("#certifications")).not.toBeNull();
    expect(document.querySelector("#book")).not.toBeNull();
  });

  it("orders the sections hero, The challenges, Our Solution, Peer-Reviewed Publications, Book a Meeting, Certifications", () => {
    const { container } = renderHome();

    const sections = Array.from(container.children) as HTMLElement[];
    const indexOf = (matches: (section: HTMLElement) => boolean) =>
      sections.findIndex(matches);
    const holds = (selector: string) => (section: HTMLElement) =>
      section.matches(selector) || section.querySelector(selector) !== null;

    const order = [
      indexOf((section) => within(section).queryByRole("heading", { level: 1 }) !== null),
      indexOf(holds("#problems")),
      indexOf(holds("#software")),
      indexOf(
        (section) =>
          within(section).queryByRole("heading", { name: "Peer-Reviewed Publications" }) !== null,
      ),
      indexOf(holds("#book")),
      indexOf(holds("#certifications")),
    ];

    expect(order).toEqual([0, 1, 2, 3, 4, 5]);
    expect(order.at(-1)).toBe(sections.length - 1);
  });

  it("puts The challenges before Our Solution in reading order", () => {
    renderHome();

    const theChallenges = screen.getByRole("heading", { level: 2, name: "The challenges" });
    const ourSolution = screen.getByRole("heading", { level: 2, name: "Our Solution" });

    expect(
      theChallenges.compareDocumentPosition(ourSolution) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("puts Schedule a Call after Peer-Reviewed Publications and before Certifications in reading order", () => {
    renderHome();

    const publications = screen.getByRole("heading", { name: "Peer-Reviewed Publications" });
    const scheduleACall = within(document.querySelector<HTMLElement>("#book")!).getByRole(
      "button",
      { name: "Schedule a Call" },
    );
    const certifications = screen.getByRole("heading", { name: "Certifications" });

    expect(
      publications.compareDocumentPosition(scheduleACall) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      scheduleACall.compareDocumentPosition(certifications) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps the hero on its own navy surface", () => {
    renderHome();

    const heroSurfaceClasses = within(document.body)
      .getByRole("heading", { level: 1 })
      .closest("section")
      ?.className.split(/\s+/);
    expect(heroSurfaceClasses).toContain("bg-navy-950");
    expect(heroSurfaceClasses).not.toContain("max-w-[1440px]");
  });

  it("leaves Our Solution without an item when an application is chosen, and The challenges without one when a capability is chosen", () => {
    renderHome();
    const challenges = within(document.querySelector("#problems") as HTMLElement);
    const solution = within(document.querySelector("#software") as HTMLElement);

    fireEvent.click(challenges.getByRole("button", { name: "Lightning" }));

    expect(challenges.getByRole("heading", { level: 3 })).toHaveTextContent("Lightning");
    expect(solution.queryByRole("heading", { level: 3 })).toBeNull();
    expect(pressedTabs()).toEqual(["Lightning"]);

    fireEvent.click(solution.getByRole("button", { name: "HPC" }));

    expect(challenges.getByRole("heading", { level: 3 })).toHaveTextContent("Lightning");
    expect(solution.getByRole("heading", { level: 3 })).toHaveTextContent("HPC");
    expect(pressedTabs()).toEqual(["Lightning", "HPC"]);
  });

  it("shows no item in either section when the page is shown again from the browser's history", () => {
    renderHome();
    const challenges = within(document.querySelector("#problems") as HTMLElement);
    const solution = within(document.querySelector("#software") as HTMLElement);
    fireEvent.click(challenges.getByRole("button", { name: "Lightning" }));
    fireEvent.click(solution.getByRole("button", { name: "HPC" }));
    expect(pressedTabs()).toEqual(["Lightning", "HPC"]);

    showPageFromHistory();

    expect(pressedTabs()).toEqual([]);
    expect(challenges.queryByRole("heading", { level: 3 })).toBeNull();
    expect(solution.queryByRole("heading", { level: 3 })).toBeNull();
    for (const status of screen.getAllByRole("status")) {
      expect(status).toHaveTextContent("");
    }
  });

  it("publishes its own identity as the brand title", () => {
    expect(metadata.title).toEqual({
      absolute: "Elemwave - Advanced electromagnetics simulations",
    });
    expect(metadata.description).toBe(
      "Innovative solutions for advanced electromagnetics simulations.",
    );
    expect(metadata.alternates?.canonical).toBe("https://www.elemwave.com/");
    expect(metadata.openGraph?.title).toBe("Elemwave - Advanced electromagnetics simulations");
    expect(metadata.openGraph?.description).toBe(
      "Innovative solutions for advanced electromagnetics simulations.",
    );
    expect(metadata.openGraph?.url).toBe("https://www.elemwave.com/");
  });
});
