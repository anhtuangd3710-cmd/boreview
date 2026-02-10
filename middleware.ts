import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isLoginPage = req.nextUrl.pathname === '/admin/login';
    const isApiAdminRoute = req.nextUrl.pathname.startsWith('/api/posts');

    // If trying to access admin routes without being admin
    if (isAdminRoute && !isLoginPage) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    // If trying to access protected API routes
    if (isApiAdminRoute && req.method !== 'GET') {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isLoginPage = req.nextUrl.pathname === '/admin/login';
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
        
        // Allow access to login page
        if (isLoginPage) return true;
        
        // For other admin routes, require token
        if (isAdminRoute) {
          return !!token;
        }
        
        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/posts/:path*',
  ],
};

