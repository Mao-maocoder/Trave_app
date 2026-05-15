import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 1080, 1920],
    qualities: [75, 85, 90],
  },
};

export default nextConfig;
