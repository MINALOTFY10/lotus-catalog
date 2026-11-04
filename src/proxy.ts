import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, STAFF_COOKIE_NAME } from '@/lib/auth/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get(STAFF_COOKIE_NAME);
    const validSession = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;

    if (!validSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in with valid signature and visiting /admin/login, send to /admin/products
  if (pathname === '/admin/login') {
    const sessionCookie = request.cookies.get(STAFF_COOKIE_NAME);
    const validSession = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
    if (validSession) {
      return NextResponse.redirect(new URL('/admin/products', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
