import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // EMERGENCY BYPASS: Always allow setup routes
    if (path.includes('setup') || path.includes('setup-db')) {
        return NextResponse.next();
    }

    // 1. Define public paths that don't need auth
    const isPublicPath =
        path === '/login' ||
        path.startsWith('/api/auth') || // Allow login API
        path.startsWith('/_next') ||    // Next.js internals
        path.startsWith('/static') ||   // Static assets
        path.includes('.') ||           // Files with extensions (images, favicon, etc)
        path.startsWith('/api/send-reminder') ||     // Allow Cron Jobs
        path.startsWith('/api/send-team-status') ||  // Allow Cron Jobs
        path.startsWith('/api/setup-db') ||          // Allow DB Setup API
        path.startsWith('/setup');                   // Allow DB Setup Page

    if (isPublicPath) {
        return NextResponse.next();
    }

    // 2. Check for auth cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Allow request
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes need to be explicitly handled if we want to protect them)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
