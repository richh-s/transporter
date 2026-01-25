import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
