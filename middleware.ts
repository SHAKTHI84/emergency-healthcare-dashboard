import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that are publicly accessible
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/emergency-contacts',
  '/report-emergency',
  '/auth/callback',
  '/auth/reset-password'
];

// Check if a path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`) ||
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.includes('.') // Static files
  );
};

// Check if path is a dashboard path
const isDashboardPath = (path: string) => {
  return path === '/dashboard' || 
    path.startsWith('/dashboard/') || 
    path.includes('/dashboard/');
};

export async function middleware(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const path = requestUrl.pathname;
    
    // Create a Supabase client configured to use cookies
    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });
    
    // Always attempt to refresh session to maximize session validity
    const { data: { session } } = await supabase.auth.getSession();
    
    // Log session state for debugging
    console.log('Middleware - Path:', path, 'Session exists:', !!session);
    
    // If not logged in and trying to access protected route, redirect to login
    if (!session && !isPublicPath(path)) {
      console.log('Redirecting to login: No active session for protected path', path);
      const redirectUrl = new URL('/login', requestUrl.origin);
      redirectUrl.searchParams.set('from', path);
      return NextResponse.redirect(redirectUrl);
    }

    // If logged in and trying to access login/signup pages, redirect to dashboard
    if (session && (path === '/login' || path === '/signup')) {
      console.log('Redirecting to dashboard: User already logged in');
      
      // Get user role from session to determine correct dashboard
      const userRole = session.user?.user_metadata?.role || 'patient';
      const dashboardPath = userRole === 'healthcare' || userRole === 'Healthcare Provider' || userRole === 'healthcare_provider'
        ? '/dashboard/healthcare'
        : '/dashboard/patient';
        
      // Check if we're already in a redirect loop
      const fromParam = requestUrl.searchParams.get('from');
      if (fromParam && (fromParam === dashboardPath || isDashboardPath(fromParam))) {
        // We're in a potential redirect loop, just go to the homepage
        console.log('Potential redirect loop detected, redirecting to homepage');
        return NextResponse.redirect(new URL('/', requestUrl.origin));
      }
        
      const redirectUrl = new URL(dashboardPath, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    // If logged in and at base dashboard path, redirect to role-specific dashboard
    if (session && path === '/dashboard') {
      const userRole = session.user?.user_metadata?.role || 'patient';
      const dashboardPath = userRole === 'healthcare' || userRole === 'Healthcare Provider' || userRole === 'healthcare_provider'
        ? '/dashboard/healthcare'
        : '/dashboard/patient';
      
      const redirectUrl = new URL(dashboardPath, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    // Update the response to refresh the session
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Allow the request to continue in case of unexpected errors
    return NextResponse.next();
  }
}

// Configuration to specify which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 