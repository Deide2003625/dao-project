import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bloquer l'accès direct au dossier uploads
  if (pathname.startsWith("/uploads/")) {
    return NextResponse.json(
      { error: "Accès non autorisé" },
      { status: 403 }
    );
  }

  const response = NextResponse.next();

  // Récupérer le nonce généré par Next.js s'il existe
  const existingCSP = response.headers.get("Content-Security-Policy") || "";
  const nonceMatch = existingCSP.match(/'nonce-([^']+)'/);
  const nonce = nonceMatch ? `'nonce-${nonceMatch[1]}'` : "'unsafe-inline'";

  // Construire notre CSP en incluant le nonce de Next.js
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${nonce} https://code.jquery.com https://cdn.jsdelivr.net`,
      `style-src 'self' 'unsafe-inline' 'unsafe-hashes' ${nonce} https://cdn.jsdelivr.net https://fonts.googleapis.com`,
      "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "connect-src 'self' ws://localhost:* wss://localhost:*",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
