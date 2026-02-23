import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Critical for containerized deployment (App Runner, Docker, etc.)
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export (output: 'export')
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
