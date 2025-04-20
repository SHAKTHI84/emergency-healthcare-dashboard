import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  try {
    const code = requestUrl.searchParams.get('code');
    
    if (code) {
      try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Exchange the code for a session
        await supabase.auth.exchangeCodeForSession(code);
        
        // Get user data
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          console.error('Auth callback: Error getting user after code exchange:', error?.message || 'No user found');
          return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`);
        }
        
        console.log('Auth callback successful for user:', data.user.id);
        
        // Get role from metadata (default to patient if not set)
        const role = data.user.user_metadata?.role || 'patient';
        
        // Redirect based on role
        if (role.toLowerCase().includes('health')) {
          return NextResponse.redirect(`${requestUrl.origin}/dashboard/healthcare`);
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/dashboard/patient`);
        }
      } catch (sessionError) {
        console.error('Auth callback: Session error:', sessionError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=session_error`);
      }
    }
    
    // Fallback to login if no code
    return NextResponse.redirect(`${requestUrl.origin}/login?error=missing_code`);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_error`);
  }
} 