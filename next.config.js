/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  // Autoriser les origines de développement pour le browser preview
  allowedDevOrigins: ['127.0.0.1'],

  typescript: {
    ignoreBuildErrors: true,
  },

  // jspdf/fflate utilisent des workers Node.js incompatibles avec le SSR.
  // serverExternalPackages les exclut du bundle serveur.
  serverExternalPackages: ['jspdf', 'fflate'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
{ key: 'Content-Security-Policy', value: ["default-src 'self'",process.env.NODE_ENV === 'development' ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://code.jquery.com" : "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://code.jquery.com","style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com","font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net","img-src 'self' data: blob:","connect-src 'self'","frame-ancestors 'none'","object-src 'none'","base-uri 'self'","form-action 'self'"].join('; ') },
{ key: 'X-Frame-Options',              value: 'DENY' },
{ key: 'X-Content-Type-Options',       value: 'nosniff' },
{ key: 'Strict-Transport-Security',    value: 'max-age=63072000; includeSubDomains; preload' },
{ key: 'Referrer-Policy',              value: 'strict-origin-when-cross-origin' },
{ key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
{ key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
{ key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
{ key: 'Permissions-Policy',           value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
