import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // other config options...
  allowedDevOrigins: ["*"],

  // ⚡ static export
  output: "export",
  trailingSlash: true, // ensures routing works for static paths
  images: {
    unoptimized: true, // Required because Next.js Image Optimization needs a server
  },
};

export default nextConfig;
