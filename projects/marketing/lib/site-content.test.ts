import { describe, expect, it } from "vitest";
import { ADDRESS_LINES, LOGO_PATH, TRADING_NAME } from "./site-content";

describe("the shared organisation facts", () => {
  it("should publish the trading name visitors already see", () => {
    expect(TRADING_NAME).toBe("Elemwave");
  });

  it("should keep the visitor-facing address lines exactly as they are", () => {
    expect(ADDRESS_LINES).toEqual(["Recogidas 35 1A", "18005 Granada, Spain"]);
  });

  it("should name the public path of the brand mark", () => {
    expect(LOGO_PATH).toBe("/images/logo-elemwave.png");
  });
});
