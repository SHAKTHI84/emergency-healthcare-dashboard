'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;
    
    async function redirectBasedOnRole() {
      try {
        // Get session data directly from supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          window.location.href = '/login';
          return;
        }
        
        if (!session) {
          console.log('No active session found');
          window.location.href = '/login';
          return;
        }
        
        // Get user role from session data or local storage as fallback
        const storedRole = localStorage.getItem('user_role');
        const role = session.user.user_metadata?.role || storedRole || 'patient';
        
        // Redirect based on user role
        console.log('Redirecting based on role:', role);
        
        // Normalize role for comparison
        const normalizedRole = role.toLowerCase();
        
        // Set a 50ms timeout to handle any potential race conditions
        redirectTimeout = setTimeout(() => {
          // Use window.location for more reliable navigation
          if (normalizedRole.includes('healthcare') || normalizedRole.includes('provider')) {
            console.log('Detected as healthcare provider, redirecting to healthcare dashboard');
            window.location.href = '/dashboard/healthcare';
          } else {
            console.log('Detected as patient, redirecting to patient dashboard');
            window.location.href = '/dashboard/patient';
          }
        }, 50);
      } catch (error) {
        console.error('Error getting current user:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
    
    redirectBasedOnRole();
    
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-3 text-gray-600">Redirecting to your dashboard...</p>
    </div>
  );
} 