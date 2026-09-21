import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { organisationRecord } from "@/lib/organisation-record";
import { expectOrganisationRecordScript } from "@/test/expect-organisation-record";
import SiteLayout from "./layout";

describe("the (site) layout", () => {
  it("publishes the shared organisation record", () => {
    render(<SiteLayout>content</SiteLayout>);

    expect(expectOrganisationRecordScript()).toEqual(organisationRecord());
  });

  it("renders the child content unchanged", () => {
    render(<SiteLayout>content</SiteLayout>);

    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
