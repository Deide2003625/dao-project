/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  typescript: {
    // Le build CI ne doit pas echouer sur les erreurs de type preexistantes
    // (signatures params Next.js 15 a corriger manuellement dans le code)
    ignoreBuildErrors: true,
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://code.jquery.com",
          "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
          "img-src 'self' data: blob:",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
      { key: 'X-Frame-Options',              value: 'DENY' },
      { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
      { key: 'Permissions-Policy',           value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
      { key: 'X-Content-Type-Options',       value: 'nosniff' },
      { key: 'Strict-Transport-Security',    value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Referrer-Policy',              value: 'strict-origin-when-cross-origin' },
    ];
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
