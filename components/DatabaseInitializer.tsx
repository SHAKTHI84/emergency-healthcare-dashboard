'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function DatabaseInitializer() {
  useEffect(() => {
    async function checkConnection() {
      try {
        console.log("Checking database connection...");
        
        // Just check if the auth functionality is working
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Database auth check error:", error.message);
        } else {
          console.log("Database auth connection OK:", !!data.session ? "User is logged in" : "No active session");
        }
      } catch (err) {
        console.error("Error checking database:", err);
      }
    }

    // Only run once on component mount
    checkConnection();
  }, []);

  // This component doesn't render anything visible
  return null;
} 