import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Debug: logger les informations de la requête
  console.log('🔍 Middleware Debug:', {
    hostname: url.hostname,
    port: url.port,
    url: request.url,
    pathname: url.pathname
  });

  // Détecter si on est en développement
  const isDevelopment = 
    url.hostname === 'localhost' ||
    url.hostname.includes('127.0.0.1') ||
    url.port === '3000' ||
    url.port === '3001' ||
    request.url.includes('localhost');

  console.log('🚀 Environment Detection:', { isDevelopment });

  // En développement, pas de CSP pour éviter les erreurs eval()
  if (isDevelopment) {
    const response = NextResponse.next();
    response.headers.set('x-debug-env', 'development-no-csp');
    response.headers.set('x-debug-hostname', url.hostname);
    response.headers.set('x-debug-port', url.port || 'default');
    
    console.log('✅ No CSP applied for development');
    
    // Garder les autres sécurités mais pas de CSP
    applyOtherSecurityHeaders(response, url);
    return response;
  }

  // En production, appliquer CSP complète avec nonces
  const nonce = generateNonce();
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://code.jquery.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://cdn.jsdelivr.net`,
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);
  response.headers.set('x-debug-env', 'production-with-csp');
  
  applyOtherSecurityHeaders(response, url);
  return response;
}

function applyOtherSecurityHeaders(response: NextResponse, url: URL) {
  // Supprime les params sensibles de l'URL (CWE-598)
  for (const param of ['email', 'password', 'token', 'secret', 'api_key', 'access_token']) {
    if (url.searchParams.has(param)) {
      const clean = new URL(response.url);
      clean.searchParams.delete(param);
      return NextResponse.redirect(clean, 301);
    }
  }

  // Anti Path Traversal sur /_next/image (CWE-22)
  if (url.pathname.startsWith('/_next/image')) {
    const img = url.searchParams.get('url');
    if (img) {
      const decoded = decodeURIComponent(img);
      if (/\.{2,}/i.test(decoded) || /%2e%2e/i.test(decoded)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
    }
  }
}

// Générateur de nonce compatible Edge Runtime
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
