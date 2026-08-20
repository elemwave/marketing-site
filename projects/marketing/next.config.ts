import type { NextConfig } from "next";

const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // The site has no server-side behaviour, so it ships as static files to the
  // S3 origin behind CloudFront (see specs/decisions/ADR-0003).
  output: "export",
  // The Image Optimization API needs a server, and the export has none, so
  // `next/image` serves its sources untouched.
  images: {
    unoptimized: true,
  },
  // Pin the workspace root to this app (a stray lockfile in $HOME otherwise
  // makes Next infer the wrong root and warn during build).
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins,
};

export default nextConfig;
