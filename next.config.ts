import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Restored to working configuration from last successful deployment
  // Removed Capacitor-specific settings (trailingSlash, unoptimized) that conflict with Amplify SSR
  images: {
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
