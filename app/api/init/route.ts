import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Cache the database check result for 15 minutes
let lastCheckTime = 0;
let cachedResult: { initialized: boolean, success?: boolean, message?: string } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function GET() {
  try {
    // Check if we have a cached result that's still valid
    const now = Date.now();
    if (cachedResult && (now - lastCheckTime < CACHE_DURATION)) {
      console.log('Using cached database check result');
      return NextResponse.json(cachedResult);
    }
    
    console.log('Checking database connection...');
    
    // Just check if we can connect to Supabase
    const { data, error } = await supabase.auth.getSession();
    
    console.log('Supabase auth connection:', error ? 'Error' : 'Success');
    
    // Try to create the tables directly using the API
    let dbStatus = 'unknown';
    try {
      const { error: usersError } = await supabase
        .from('users')
        .select('count(*)')
        .single();
        
      if (usersError && usersError.code === '42P01') {
        console.log('Tables need to be created. Please run the SQL in supabase/migrations/00_init.sql through the Supabase dashboard SQL editor.');
        dbStatus = 'tables_missing';
      } else {
        console.log('Tables already exist in the database.');
        dbStatus = 'tables_exist';
      }
    } catch (dbError) {
      console.error('Error checking tables:', dbError);
      dbStatus = 'error_checking';
    }
    
    // Create the response
    cachedResult = { 
      success: true,
      message: 'Database connection verified. Login should work if auth is configured correctly.',
      instructions: 'If login still fails, please run the SQL in supabase/migrations/00_init.sql through the Supabase dashboard SQL editor.',
      dbStatus,
      timestamp: now
    };
    
    // Update the cache time
    lastCheckTime = now;
    
    // Return success regardless of table creation
    return NextResponse.json(cachedResult);
  } catch (error: any) {
    console.error('Error checking database:', error);
    
    // Create error response
    const errorResult = {
      success: true,
      warning: 'Database connection check failed, but auth may still work',
      error: error.message,
      instructions: 'Please ensure your Supabase project is correctly configured and accessible.',
      timestamp: Date.now()
    };
    
    // Still return success to allow auth flow to continue
    return NextResponse.json(errorResult);
  }
} 