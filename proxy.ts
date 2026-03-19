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

  // Bloquer les fichiers de test résiduels
  if (pathname.startsWith("/test-") && pathname.endsWith(".html")) {
    return NextResponse.json(
      { error: "Accès non autorisé" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/uploads/:path*"],
};
