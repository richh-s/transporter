import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Conditional output: 'export' for Capacitor (mobile), undefined for Amplify SSR
  // Only use static export when building for Capacitor (mobile apps)
  // For Amplify SSR deployment, leave output undefined
  ...(process.env.CAPACITOR_BUILD === 'true' ? { output: "export" } : {}),
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
