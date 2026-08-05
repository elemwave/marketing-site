import { renderViewerRequestFunction } from "../lib/basic-auth";

type CloudFrontRequest = {
  uri: string;
  headers: Record<string, { value: string }>;
};

type CloudFrontResponse = {
  statusCode: number;
  statusDescription?: string;
  headers?: Record<string, { value: string }>;
};

const credentials = { username: "elemwave", password: "let-me-in" };

/**
 * CloudFront Functions run a standalone `handler` in their own runtime, so the
 * rendered source is evaluated here the same way the edge would evaluate it.
 */
function loadHandler(): (event: { request: CloudFrontRequest }) => CloudFrontRequest | CloudFrontResponse {
  const source = renderViewerRequestFunction(credentials);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(`${source}; return handler;`)();
}

function requestFor(uri: string, authorization?: string): { request: CloudFrontRequest } {
  const headers: Record<string, { value: string }> = {};
  if (authorization !== undefined) {
    headers.authorization = { value: authorization };
  }
  return { request: { uri, headers } };
}

function validAuthorizationHeader(): string {
  const encoded = Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
  return `Basic ${encoded}`;
}

describe("staging viewer-request function", () => {
  describe("access control", () => {
    it("challenges a request that carries no credentials", () => {
      const result = loadHandler()(requestFor("/")) as CloudFrontResponse;

      expect(result.statusCode).toBe(401);
      expect(result.headers?.["www-authenticate"].value).toContain("Basic realm=");
    });

    it("challenges a request that carries the wrong credentials", () => {
      const wrong = `Basic ${Buffer.from("elemwave:wrong").toString("base64")}`;

      const result = loadHandler()(requestFor("/", wrong)) as CloudFrontResponse;

      expect(result.statusCode).toBe(401);
    });

    it("lets a request with the shared credentials through", () => {
      const result = loadHandler()(requestFor("/", validAuthorizationHeader())) as CloudFrontRequest;

      expect(result.uri).toBe("/index.html");
    });
  });

  // Next.js exports `/policies` as `policies.html`, not `policies/index.html`,
  // because the app does not set `trailingSlash`.
  describe("static path resolution", () => {
    const authorised = (uri: string) => loadHandler()(requestFor(uri, validAuthorizationHeader())) as CloudFrontRequest;

    it("resolves the site root to the home document", () => {
      expect(authorised("/").uri).toBe("/index.html");
    });

    it("resolves a trailing-slash path to its page document", () => {
      expect(authorised("/policies/").uri).toBe("/policies.html");
    });

    it("resolves an extension-less path to its page document", () => {
      expect(authorised("/policies").uri).toBe("/policies.html");
    });

    it("resolves a nested page path to its page document", () => {
      expect(authorised("/legal/privacy").uri).toBe("/legal/privacy.html");
    });

    it("leaves a file request untouched", () => {
      expect(authorised("/_next/static/chunk.js").uri).toBe("/_next/static/chunk.js");
    });

    it("leaves a dotted file in a nested directory untouched", () => {
      expect(authorised("/images/hero.webp").uri).toBe("/images/hero.webp");
    });
  });
});
