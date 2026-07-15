import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app (a stray lockfile in $HOME otherwise
  // makes Next infer the wrong root and warn during build).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
