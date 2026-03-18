/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  poweredByHeader: false,
  // Configuration de Turbopack
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Configuration des en-têtes pour les API
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST, PUT, DELETE, OPTIONS" }
        ]
      }
    ]
  },
  // Active le mode strict pour React (meilleur comportement)
  reactStrictMode: true,
  // Configuration pour le traitement CSS
  compiler: {
    removeConsole: false,
  },
  // Désactive la vérification ESLint pendant la compilation
  eslint: {
    ignoreDuringBuilds: true,
    ignoreDuringTests: true
  },
  // Désactive les vérifications TypeScript pendant la compilation
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
