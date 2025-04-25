'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { clearSessionData } from '../../utils/sessionStorage';

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // First, ensure we only run client-side code after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    if (!isClient) return;

    const checkAuth = async () => {
      try {
        // Check localStorage first (faster)
        const sessionStr = localStorage.getItem('session');
        const userRoleStr = localStorage.getItem('user_role');
        
        if (sessionStr) {
          console.log("Found session in localStorage");
          setIsLoggedIn(true);
          setRole(userRoleStr);
          return;
        }
        
        // Fallback to Supabase session check
        console.log("Checking Supabase session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          setIsLoggedIn(false);
          return;
        }
        
        // Update state based on session
        setIsLoggedIn(!!session);
        
        if (session) {
          // Get role from user metadata
          const userRole = session.user.user_metadata?.role || 'patient';
          setRole(userRole);
          
          // Update localStorage as a backup
          localStorage.setItem('session', JSON.stringify(session));
          localStorage.setItem('user', JSON.stringify(session.user));
          localStorage.setItem('user_role', userRole);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
      }
    };
    
    checkAuth();
  }, [pathname, isClient]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all session data
      clearSessionData();
      
      // Redirect to login page
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDashboardLink = () => {
    console.log("Getting dashboard link for role:", role);
    if (role === 'healthcare' || role === 'Healthcare Provider') {
      return '/dashboard/healthcare';
    }
    return '/dashboard/patient';
  };

  // Determine active link for styling
  const isActiveLink = (path: string) => {
    return pathname === path ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';
  };

  // Function to handle dashboard navigation with role checking
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Get dashboardLink with role check
    const dashboardUrl = getDashboardLink();
    console.log("Dashboard clicked, navigating to:", dashboardUrl);
    
    // Create URL with loop prevention flag
    const redirectUrl = new URL(dashboardUrl, window.location.origin);
    redirectUrl.searchParams.set('prevent_redirect', 'true');
    
    // Use direct navigation
    window.location.href = redirectUrl.toString();
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
                <a
                  href="#"
                  onClick={handleDashboardClick}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer border-blue-500 text-gray-900`}
                >
                  Dashboard
                </a>
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