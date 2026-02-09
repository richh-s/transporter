import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: "export" to support Amplify SSR deployment
  // For Capacitor mobile builds, add output: "export" in capacitor.config.ts or build script
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.wetruck.ai",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
