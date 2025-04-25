'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { usePathname } from 'next/navigation';
import EmergencyCrisisButton from '../components/emergency/EmergencyCrisisButton';
import { supabase } from '../lib/supabaseClient';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showCrisisButton, setShowCrisisButton] = useState(false); // Default to false until we check user role
  
  // Check user role and path to determine if crisis button should be shown
  useEffect(() => {
    const checkUserRoleAndPath = async () => {
      try {
        // Hide on confirmation page, login/signup pages, and healthcare dashboard
        const excludedPaths = [
          '/emergency-confirmation', 
          '/login', 
          '/signup'
        ];
        
        // Check if current path is excluded
        const isExcludedPath = excludedPaths.some(path => pathname?.startsWith(path));
        
        if (isExcludedPath) {
          setShowCrisisButton(false);
          return;
        }
        
        // Check user role from session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If no logged in user, don't show the button
          setShowCrisisButton(false);
          return;
        }
        
        // Get user role from session metadata or localStorage
        const userRole = session.user.user_metadata?.role || localStorage.getItem('user_role');
        
        // Only show crisis button for patients, never for healthcare providers
        const isPatient = userRole === 'patient' || userRole === 'Patient';
        
        setShowCrisisButton(isPatient);
      } catch (error) {
        console.error('Error checking user role:', error);
        // On error, default to not showing the button
        setShowCrisisButton(false);
      }
    };
    
    checkUserRoleAndPath();
  }, [pathname]);

  return (
    <>
      <Header />
      {showCrisisButton && <EmergencyCrisisButton />}
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
} 