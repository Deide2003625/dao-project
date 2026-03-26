/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,

  // mysql2 doit rester externe — pas bundlé au build
  serverExternalPackages: ['mysql2'],

  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://code.jquery.com https://cdn.jsdelivr.net`,
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob: https://cdn.jsdelivr.net https://fonts.gstatic.com https://lh3.googleusercontent.com",
              "media-src 'self' blob:",
              "connect-src 'self' https://cdn.jsdelivr.net ws://localhost:* wss://localhost:*",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;