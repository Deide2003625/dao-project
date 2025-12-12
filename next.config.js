/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Configuration de Turbopack
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Désactive Turbopack pour utiliser Webpack
    turbo: false,
  },
  // Configuration des alias pour la compatibilité avec Webpack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    };
    return config;
  },
  // Configuration des en-têtes pour les API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // Désactive le mode strict pour éviter les problèmes de compatibilité
  reactStrictMode: true,
  // Désactive la vérification de type pendant la compilation
  typescript: {
    ignoreBuildErrors: false,
  },
  // Désactive la vérification ESLint pendant la compilation
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
