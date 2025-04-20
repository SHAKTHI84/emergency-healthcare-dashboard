'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { clearSessionData } from '../../utils/sessionStorage';

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          setIsLoggedIn(false);
          return;
        }
        
        // Update state based on session
        setIsLoggedIn(!!session);
        
        if (session) {
          // Try to get role from local storage first (faster)
          const storedRole = localStorage.getItem('user_role');
          if (storedRole) {
            setRole(storedRole);
          } else {
            // Fallback to user metadata
            setRole(session.user.user_metadata?.role || 'patient');
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
      }
    };
    
    checkAuth();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all session data
      clearSessionData();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDashboardLink = () => {
    console.log("Current user role:", role);
    if (role === 'healthcare' || role === 'Healthcare Provider') {
      return '/dashboard/healthcare';
    }
    return '/dashboard/patient';
  };

  // Determine active link for styling
  const isActiveLink = (path: string) => {
    return pathname === path ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-blue-600 text-xl font-bold">
                Emergency Healthcare
              </Link>
            </div>
            <div className="ml-6 flex space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActiveLink('/')}`}
              >
                Home
              </Link>
              <Link
                href="/emergency-contacts"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActiveLink('/emergency-contacts')}`}
              >
                Emergency Contacts
              </Link>
              <Link
                href="/report-emergency"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActiveLink('/report-emergency')}`}
              >
                Report Emergency
              </Link>
              {isLoggedIn && (
                <Link
                  href={getDashboardLink()}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActiveLink('/dashboard') || isActiveLink('/dashboard/healthcare') || isActiveLink('/dashboard/patient') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="text-sm font-medium bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md shadow-sm"
              >
                Sign out
              </button>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 