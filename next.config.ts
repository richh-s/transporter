import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Critical for containerized deployment (App Runner, Docker, etc.)
  output: 'standalone',
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
