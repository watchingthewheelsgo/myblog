import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      }
    ]
  },
  reactStrictMode: true, 
  serverExternalPackages: ["@prisma/client"]
};

export default withContentlayer(nextConfig);