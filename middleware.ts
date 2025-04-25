import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Very simple public paths list
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/emergency-contacts',
  '/report-emergency',
  '/auth/callback',
  '/auth/reset-password'
];

export async function middleware(request: NextRequest) {
  // Skip static files and API routes entirely
  const { pathname, searchParams } = new URL(request.url);
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // CHECK FOR LOOP PREVENTION FLAG - this is critical
  // If the request has this flag, let it through without any redirects
  if (searchParams.get('prevent_redirect') === 'true') {
    console.log('Prevent redirect flag detected, skipping auth check');
    return NextResponse.next();
  }

  // Setup response and supabase client
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Check for session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Only apply auth check to dashboard routes
    if (pathname.startsWith('/dashboard')) {
      // If no session, redirect to login page with loop prevention
      if (!session) {
        const url = new URL('/login', request.url);
        url.searchParams.set('prevent_redirect', 'true');
        return NextResponse.redirect(url);
      }
      
      // If at base dashboard, redirect to role-specific dashboard
      if (pathname === '/dashboard') {
        const userRole = session.user?.user_metadata?.role || 'patient';
        const dashboardPath = userRole === 'healthcare' ? 
          '/dashboard/healthcare' : '/dashboard/patient';
        
        const redirectUrl = new URL(dashboardPath, request.url);
        redirectUrl.searchParams.set('prevent_redirect', 'true');
        return NextResponse.redirect(redirectUrl);
      }
    }
    
    // If on login/signup and already logged in, go to appropriate dashboard
    if ((pathname === '/login' || pathname === '/signup') && session) {
      const userRole = session.user?.user_metadata?.role || 'patient';
      const dashboardPath = userRole === 'healthcare' ? 
        '/dashboard/healthcare' : '/dashboard/patient';
      
      const redirectUrl = new URL(dashboardPath, request.url);
      redirectUrl.searchParams.set('prevent_redirect', 'true');
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, just proceed without redirects
    return NextResponse.next();
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 