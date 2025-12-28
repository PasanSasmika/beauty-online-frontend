import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000', // Allow images from your backend port
        pathname: '/uploads/**', // Allow files in the uploads folder
      },
    ],
  },
};

export default nextConfig;
