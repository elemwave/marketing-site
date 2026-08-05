import { readBasicAuthCredentials, renderViewerRequestFunction } from "../lib/basic-auth";

describe("basic auth credentials", () => {
  it("reads the username and password from the environment", () => {
    const credentials = readBasicAuthCredentials({
      STAGING_BASIC_AUTH_USER: "elemwave",
      STAGING_BASIC_AUTH_PASSWORD: "let-me-in",
    });

    expect(credentials).toEqual({ username: "elemwave", password: "let-me-in" });
  });

  it("fails with an actionable message when the credentials are missing", () => {
    expect(() => readBasicAuthCredentials({})).toThrow(/STAGING_BASIC_AUTH_USER/);
  });

  it("fails when only one half of the credentials is present", () => {
    expect(() => readBasicAuthCredentials({ STAGING_BASIC_AUTH_USER: "elemwave" })).toThrow(
      /STAGING_BASIC_AUTH_PASSWORD/,
    );
  });

  it("renders the edge function with the encoded credentials and no placeholder left", () => {
    const source = renderViewerRequestFunction({ username: "elemwave", password: "let-me-in" });

    expect(source).toContain(Buffer.from("elemwave:let-me-in").toString("base64"));
    expect(source).not.toContain("__BASIC_AUTH_CREDENTIALS__");
  });
});
