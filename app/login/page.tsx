'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check if already logged in on page load - ONCE ONLY
  useEffect(() => {
    // Skip if we've already checked
    if (sessionChecked) return;
    
    const checkSession = async () => {
      try {
        // First check if we have the loop prevention flag
        const params = new URLSearchParams(window.location.search);
        const preventRedirect = params.get('prevent_redirect') === 'true';
        
        if (preventRedirect) {
          console.log("Loop prevention flag detected, skipping auto-redirect");
          setSessionChecked(true);
          return;
        }
        
        // Try to get session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Already logged in, redirecting...");
          const userRole = session.user?.user_metadata?.role || 'patient';
          const dashboardUrl = userRole === 'healthcare' ? '/dashboard/healthcare' : '/dashboard/patient';
          
          // Add prevention flag
          const redirectUrl = new URL(dashboardUrl, window.location.origin);
          redirectUrl.searchParams.set('prevent_redirect', 'true');
          window.location.href = redirectUrl.toString();
        }
        
        // Mark as checked to prevent repeated checks
        setSessionChecked(true);
      } catch (error) {
        console.error("Error checking session:", error);
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, [sessionChecked]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log("Logging in with email:", email);
      
      // Simple direct authentication
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) throw signInError;
      
      console.log("Login successful, saving session data");
      
      // Store the session in localStorage for simplicity
      localStorage.setItem('session', JSON.stringify(data.session));
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Also store some basic user info for quick access
      if (data.user?.user_metadata?.role) {
        localStorage.setItem('user_role', data.user.user_metadata.role);
      }
      
      // Determine dashboard based on user role
      const userRole = data.user?.user_metadata?.role || 'patient';
      const dashboardUrl = userRole === 'healthcare' ? '/dashboard/healthcare' : '/dashboard/patient';
      
      console.log("Redirecting to dashboard:", dashboardUrl);
      setRedirecting(true);
      
      // Create a URL with the prevention flag
      const redirectUrl = new URL(dashboardUrl, window.location.origin);
      redirectUrl.searchParams.set('prevent_redirect', 'true');
      
      // Delay a bit to ensure localStorage is set, then redirect
      setTimeout(() => {
        try {
          window.location.href = redirectUrl.toString();
        } catch (navError) {
          console.error("Navigation error:", navError);
          // Fallback to router if window.location fails
          router.push(redirectUrl.toString());
        }
      }, 800);
      
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-6">Login Successful!</h2>
          <p className="mb-4">Redirecting to your dashboard...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Emergency Healthcare</h2>
        <h3 className="text-xl mb-6 text-center">Sign In</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link href="/signup" className="text-blue-600 hover:underline">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
} 