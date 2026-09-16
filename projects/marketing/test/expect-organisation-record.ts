import { expect } from "vitest";
import { organisationRecord } from "@/lib/organisation-record";

function jsonLdScripts(container: ParentNode = document): NodeListOf<HTMLScriptElement> {
  return container.querySelectorAll('script[type="application/ld+json"]');
}

function parsedRecord(script: HTMLScriptElement): unknown {
  const raw = script.innerHTML || script.textContent || "";
  return JSON.parse(raw);
}

/** The page publishes exactly one organisation record, matching the shared value. */
export function expectOrganisationRecordScript(container: ParentNode = document): unknown {
  const scripts = jsonLdScripts(container);
  expect(scripts).toHaveLength(1);
  const parsed = parsedRecord(scripts[0]);
  expect(parsed).toEqual(organisationRecord());
  return parsed;
}

/** The page publishes no organisation record. */
export function expectNoOrganisationRecordScript(container: ParentNode = document): number {
  const scripts = jsonLdScripts(container);
  expect(scripts).toHaveLength(0);
  return scripts.length;
}
