/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Configuration de Turbopack
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Désactive Turbopack pour utiliser Webpack
    turbo: false,
  },
  // Configuration des alias pour la compatibilité avec Webpack
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      "@": path.resolve(__dirname, "./"),
    };
    
    // Assurer le traitement correct des fichiers CSS
    config.module.rules.push({
      test: /\.css$/i,
      use: ['style-loader', 'css-loader', 'postcss-loader'],
    });

    return config;
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
    ignoreBuildErrors: true,
    ignoreWarnings: true
  }
};

module.exports = nextConfig;
