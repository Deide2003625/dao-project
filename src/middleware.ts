import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Supprime les params sensibles de l'URL (CWE-598)
  for (const param of ['email', 'password', 'token', 'secret', 'api_key', 'access_token']) {
    if (url.searchParams.has(param)) {
      const clean = new URL(request.url);
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/_next/image'],
};
