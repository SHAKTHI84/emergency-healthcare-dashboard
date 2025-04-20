'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { usePathname } from 'next/navigation';
import EmergencyCrisisButton from '../components/emergency/EmergencyCrisisButton';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showCrisisButton, setShowCrisisButton] = useState(true);
  
  // Don't show the emergency button on certain pages
  useEffect(() => {
    // Hide on confirmation page and login/signup pages
    const excludedPaths = ['/emergency-confirmation', '/login', '/signup'];
    setShowCrisisButton(!excludedPaths.some(path => pathname?.startsWith(path)));
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