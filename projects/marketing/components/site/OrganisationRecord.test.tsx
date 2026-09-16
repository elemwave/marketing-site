import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { organisationRecord } from "@/lib/organisation-record";
import { expectOrganisationRecordScript } from "@/test/expect-organisation-record";
import { OrganisationRecord } from "./OrganisationRecord";

describe("the organisation record chrome", () => {
  it("should publish the shared organisation record as a JSON-LD script", () => {
    render(<OrganisationRecord />);

    expectOrganisationRecordScript();
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML || script?.textContent).toBe(
      JSON.stringify(organisationRecord()).replace(/</g, "\\u003c"),
    );
  });

  it("should publish nothing a visitor can see", () => {
    const { container } = render(<OrganisationRecord />);

    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild?.tagName).toBe("SCRIPT");
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.queryByRole("contentinfo")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
