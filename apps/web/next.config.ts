import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@naijalingo/shared",
    "@naijalingo/translation",
    "@naijalingo/data",
  ],
};

export default nextConfig;
