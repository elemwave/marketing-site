// CloudFront Function (viewer-request) for the staging distribution.
//
// It does two things a private S3 origin cannot do on its own:
//   1. gate the whole environment behind shared basic auth credentials;
//   2. resolve extension-less paths to the static page document Next.js exported.
//
// The credentials placeholder below is replaced at synth time with the base64
// of "user:password" (see lib/basic-auth.ts). The runtime is JS 2.0, so this
// file stays on widely supported syntax and has no imports.

function handler(event) {
  var request = event.request;
  var expectedAuthorisation = "Basic __BASIC_AUTH_CREDENTIALS__";
  var authorisation = request.headers.authorization;

  if (!authorisation || authorisation.value !== expectedAuthorisation) {
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
