import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
      { protocol: "https", hostname: "baanmaevilla.com", pathname: "/**" },
      { protocol: "http", hostname: "baanmaevilla.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
