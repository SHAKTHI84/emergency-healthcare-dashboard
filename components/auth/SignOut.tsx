'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { clearSessionData } from '../../utils/sessionStorage';

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  
  async function handleSignOut() {
    try {
      setLoading(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      clearSessionData();
      
      // Redirect to home page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-red-400"
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
} 