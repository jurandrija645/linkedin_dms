import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, sessionToken, safeEqual } from './lib/auth';

export async function middleware(req: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    return new NextResponse('APP_PASSWORD nije postavljen.', { status: 500 });
  }

  const cookie = req.cookies.get(COOKIE)?.value ?? '';
  const expected = await sessionToken(password);
  if (cookie && safeEqual(cookie, expected)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = req.nextUrl.pathname === '/' ? '' : `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)'],
};
