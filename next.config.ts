import type { NextConfig } from "next";

const API_HOST = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
  : "vitrine-web-api.onrender.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: API_HOST,
      },
      // Permitir imagens de storage externo se necessário
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
