import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'supersecret123' });

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  if (isAuthPage) {
    if (token) {
      if (token.role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return null;
  }

  if (!token) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, request.url));
  }

  const role = token.role as string;

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect Owner specific routes
  const ownerOnlyRoutes = ['/dashboard', '/inventori', '/laporan', '/storefront/setting'];
  const isOwnerRoute = ownerOnlyRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  
  if (isOwnerRoute) {
    if (role === 'KASIR') {
      return NextResponse.redirect(new URL('/kasir', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/kasir/:path*',
    '/inventori/:path*',
    '/laporan/:path*',
    '/storefront/:path*',
    '/login'
  ]
};
