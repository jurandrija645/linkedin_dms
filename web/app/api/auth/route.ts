import { NextResponse } from 'next/server';
import { COOKIE, sessionToken, safeEqual } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const form = await req.formData();
  const given = String(form.get('password') ?? '');
  const next = String(form.get('next') ?? '/') || '/';
  const password = process.env.APP_PASSWORD ?? '';

  if (!password || !safeEqual(given, password)) {
    return NextResponse.redirect(new URL('/login?error=1', req.url), { status: 303 });
  }

  const res = NextResponse.redirect(new URL(next.startsWith('/') ? next : '/', req.url), { status: 303 });
  res.cookies.set(COOKIE, await sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}

export async function DELETE(req: Request) {
  const res = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  res.cookies.delete(COOKIE);
  return res;
}
