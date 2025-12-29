import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // other config options...
  allowedDevOrigins: ["*"],

  // ⚡ static export
  output: "export",
  trailingSlash: true, // ensures routing works for static paths
};

export default nextConfig;
