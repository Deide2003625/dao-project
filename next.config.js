const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const securityHeaders = isProd
  ? [
      // Content Security Policy
      {
        key: "Content-Security-Policy",
        value: `
          default-src 'self';
          script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://code.jquery.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
          font-src 'self' https://fonts.gstatic.com;
          img-src 'self' data:;
          connect-src 'self';
          frame-ancestors 'none';
          form-action 'self';
          base-uri 'self';
          object-src 'none';
        `.replace(/\s{2,}/g, " ").trim(),
      },

      // Anti-clickjacking
      { key: "X-Frame-Options", value: "DENY" },

      // MIME sniffing
      { key: "X-Content-Type-Options", value: "nosniff" },

      // Referrer policy
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

      // Permissions Policy (anciennement Feature-Policy)
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), fullscreen=()",
      },

      // Cross-origin headers pour sécurité renforcée
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },

      // Strict Transport Security pour HTTPS
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ]
  : null; // En dev, pas de headers pour éviter HMR errors

module.exports = {
  poweredByHeader: false, // supprime X-Powered-By
  productionBrowserSourceMaps: false,
  async headers() {
    if (!securityHeaders) return []; // pas de headers en dev
    return [
      {
        source: "/(.*)", // applique à toutes les pages et API
        headers: securityHeaders,
      },
    ];
  },
};
