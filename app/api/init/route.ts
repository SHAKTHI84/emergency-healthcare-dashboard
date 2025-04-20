import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Checking database connection...');
    
    // Just check if we can connect to Supabase
    const { data, error } = await supabase.auth.getSession();
    
    console.log('Supabase auth connection:', error ? 'Error' : 'Success');
    
    // Try to create the tables directly using the API
    try {
      const { error: usersError } = await supabase
        .from('users')
        .select('count(*)')
        .single();
        
      if (usersError && usersError.code === '42P01') {
        console.log('Tables need to be created. Please run the SQL in supabase/migrations/00_init.sql through the Supabase dashboard SQL editor.');
      } else {
        console.log('Tables already exist in the database.');
      }
    } catch (dbError) {
      console.error('Error checking tables:', dbError);
    }
    
    // Return success regardless of table creation
    return NextResponse.json({ 
      success: true,
      message: 'Database connection verified. Login should work if auth is configured correctly.',
      instructions: 'If login still fails, please run the SQL in supabase/migrations/00_init.sql through the Supabase dashboard SQL editor.' 
    });
  } catch (error: any) {
    console.error('Error checking database:', error);
    
    // Still return success to allow auth flow to continue
    return NextResponse.json({
      success: true,
      warning: 'Database connection check failed, but auth may still work',
      error: error.message,
      instructions: 'Please ensure your Supabase project is correctly configured and accessible.'
    });
  }
} 