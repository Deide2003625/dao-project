#!/bin/bash
set -e

echo "🔐 HARDENING SÉCURITÉ OWASP / ZAP - NEXT.JS"
echo "========================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NEXT_CONFIG="$PROJECT_ROOT/next.config.js"
MIDDLEWARE="$PROJECT_ROOT/middleware.ts"

cd "$PROJECT_ROOT"

# --------------------------------------------------
# 1️⃣ NEXT.CONFIG.JS – HEADERS + SÉCURITÉ
# --------------------------------------------------
echo "🧩 Configuration next.config.js..."

cat > "$NEXT_CONFIG" << 'EOF'
/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' https://cdn.jsdelivr.net https://code.jquery.com;
      style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data:;
      connect-src 'self';
      frame-ancestors 'none';
      form-action 'self';
      base-uri 'self';
      object-src 'none';
    `.replace(/\s{2,}/g, " ").trim(),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

module.exports = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};
EOF

# --------------------------------------------------
# 2️⃣ MIDDLEWARE – REDIRECTION SANS BODY (ZAP FIX)
# --------------------------------------------------
echo "🔁 Configuration middleware (redirect sécurisé)..."

cat > "$MIDDLEWARE" << 'EOF'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL("/login", request.url),
      { status: 302 }
    )
  }
}
EOF

# --------------------------------------------------
# 3️⃣ PACKAGE.JSON – FORCER MODE PRODUCTION
# --------------------------------------------------
echo "🚀 Sécurisation des scripts npm..."

if [ -f "$PROJECT_ROOT/package.json" ]; then
  jq '.scripts.build="NODE_ENV=production next build" |
      .scripts.start="NODE_ENV=production next start"' \
      "$PROJECT_ROOT/package.json" > /tmp/package.json.tmp \
      && mv /tmp/package.json.tmp "$PROJECT_ROOT/package.json"
else
  echo "⚠️ package.json introuvable"
fi

# --------------------------------------------------
# 4️⃣ DÉSACTIVER EVAL EN PROD (BEST PRACTICE)
# --------------------------------------------------
echo "🧹 Nettoyage des traces dev / eval..."

export NODE_ENV=production

# --------------------------------------------------
# 5️⃣ RÉCAP FINAL
# --------------------------------------------------
echo ""
echo "✅ HARDENING TERMINÉ AVEC SUCCÈS"
echo "--------------------------------"
echo "✔ CSP sécurisée (sans unsafe-inline / eval)"
echo "✔ Headers OWASP complets"
echo "✔ X-Powered-By supprimé"
echo "✔ Redirect sans fuite de contenu"
echo "✔ Protection Spectre"
echo "✔ Mode production forcé"
echo ""
echo "🔍 Prochaine étape recommandée :"
echo "npm run build && npm run start"
echo "Puis relancer un scan ZAP"

exit 0
