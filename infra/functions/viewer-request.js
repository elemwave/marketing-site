// CloudFront Function (viewer-request) for the site distributions.
//
// It does two things a private S3 origin cannot do on its own:
//   1. gate the environment behind shared basic auth credentials, where it has any;
//   2. resolve extension-less paths to the static page document Next.js exported.
//
// The placeholder below is replaced at synth time (see renderViewerRequestFunction
// in index.ts): with the quoted "Basic <base64 of user:password>" header value
// for an environment behind shared credentials, or with null for a public one.
// The runtime is JS 2.0, so this file stays on widely supported syntax and has
// no imports.

function handler(event) {
  var request = event.request;
  var expectedAuthorisation = __EXPECTED_AUTHORISATION__;
  var authorisation = request.headers.authorization;

  if (expectedAuthorisation !== null && (!authorisation || authorisation.value !== expectedAuthorisation)) {
    return {
      statusCode: 401,
      statusDescription: "Unauthorized",
      headers: {
        "www-authenticate": { value: 'Basic realm="Elemwave staging"' },
        "cache-control": { value: "no-store" },
      },
    };
  }

  request.uri = pageDocumentFor(request.uri);

  return request;
}

// The exported site names its documents after the route ("/policies" is
// "policies.html"), because the app does not set `trailingSlash`. Only the site
// root is an "index.html".
function pageDocumentFor(uri) {
  if (uri === "/") {
    return "/index.html";
  }

  var path = uri.charAt(uri.length - 1) === "/" ? uri.substring(0, uri.length - 1) : uri;
  var lastSegment = path.substring(path.lastIndexOf("/") + 1);

  if (lastSegment.indexOf(".") === -1) {
    return path + ".html";
  }

  return path;
}
