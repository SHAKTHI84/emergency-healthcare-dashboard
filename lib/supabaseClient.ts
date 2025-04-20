import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://bzkftaafvapnqarqzxzr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6a2Z0YWFmdmFwbnFhcnF6eHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzAxNjQsImV4cCI6MjA2MDY0NjE2NH0.EYJhCVio_rviKqTbD9FWhRMji8lEHVu6dla9EjnafLs';

// Log configuration for debugging
console.log('Initializing Supabase client with URL:', supabaseUrl);

// Create client with optimized auth settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'emergency-healthcare-auth',
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Debug auth state changes
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, 'Session exists:', !!session);
    if (session) {
      // Store session data consistently
      localStorage.setItem('auth_token', session.access_token);
      localStorage.setItem('user_id', session.user.id);
      
      // Get user role from metadata
      const role = session.user.user_metadata?.role || 'patient';
      localStorage.setItem('user_role', role);
      
      console.log('User signed in with role:', role);
    } else if (event === 'SIGNED_OUT') {
      // Clear all auth data on sign out
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
      console.log('User signed out, auth data cleared');
    }
  });
}

// Helper to check if Supabase connection is working
export async function checkSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // First, check if we can connect at all
    const { data, error } = await supabase.from('patients').select('id').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('Connected to Supabase, but tables not created yet. This is normal for first run.');
        return { success: true, message: 'Connected to Supabase, but tables not created yet' };
      } else if (error.code === 'PGRST301') {
        console.log('Supabase connection successful but permission denied. Check RLS policies.');
        return { success: true, message: 'Connected but permission denied - check RLS policies' };
      } else {
        console.error('Error connecting to Supabase:', error);
        return { success: false, message: `Error connecting to Supabase: ${error.message}` };
      }
    }
    
    console.log('Successfully connected to Supabase and queried patients table');
    return { success: true, message: 'Successfully connected to Supabase' };
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return { 
      success: false, 
      message: `Failed to connect to Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 