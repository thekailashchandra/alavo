import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@alavo/brand"],
  poweredByHeader: false,
};

export default nextConfig;
