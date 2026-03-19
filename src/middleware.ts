import { NextRequest, NextResponse } from 'next/server';
import { validateImageRequest } from './middleware/validateImageParams';

export function middleware(request: NextRequest) {
  const imgError = validateImageRequest(request);
  if (imgError) return imgError;

  if (request.nextUrl.pathname.endsWith('/') &&
      request.nextUrl.pathname.startsWith('/_next/static/'))
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  for (const param of ['email', 'password', 'token', 'secret', 'api_key']) {
    if (request.nextUrl.searchParams.has(param)) {
      const clean = new URL(request.url);
      clean.searchParams.delete(param);
      return NextResponse.redirect(clean, { status: 301 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/_next/image'],
};
