import { supabase } from '../lib/supabaseClient';
import { getUserByEmail } from './database';
import { User, UserRole } from '../types';
import { clearSessionData } from '../utils/sessionStorage';

// For debugging purposes - check if we're authenticated on startup
(async () => {
  try {
    const { data } = await supabase.auth.getSession();
    console.log('Initial auth check - Session exists:', !!data.session);
  } catch (e) {
    console.error('Error during initial auth check:', e);
  }
})();

// Sign up a new user
export const signUp = async (email: string, password: string, role: UserRole = 'public') => {
  try {
    // First check if the user already exists
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (existingUser && existingUser.user) {
      throw new Error('User with this email already exists');
    }
  } catch (error: any) {
    // If error is not related to existing user, continue
    if (!error.message.includes('Invalid login credentials')) {
      throw error;
    }
  }

  // Create new user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role
      }
    }
  });

  if (error) throw error;

  // Create a user record in our users table with the role
  if (data.user) {
    try {
      await createUserProfile({
        id: data.user.id,
        email,
        role,
        created_at: new Date().toISOString(),
      });
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
      // Continue with sign up even if profile creation fails
      // The getCurrentUser function will create a profile if missing
    }
  }

  // Log auth state after sign up
  console.log('Sign up - session created:', !!data.session);
  
  return data;
};

// Sign in a user
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // Refresh the session to ensure it's properly stored
  await supabase.auth.refreshSession();
  
  // Log auth state after sign in
  const { data: sessionData } = await supabase.auth.getSession();
  console.log('Sign in - session exists:', !!sessionData.session);
  
  return data;
};

// Sign out the current user
export const signOut = async () => {
  console.log('Sign out - attempting to sign out');
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
  
  // Verify the sign out was successful
  const { data } = await supabase.auth.getSession();
  console.log('Sign out - session cleared:', !data.session);
  
  // Clear all session data from localStorage
  clearSessionData();
  
  return true;
};

// Get the current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Get session error:', error);
    throw error;
  }
  
  console.log('Get session - has session:', !!data.session);
  return data.session;
};

// Get the current user with their role and profile information
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) throw error;
  if (!session) return null;
  if (!session.user.email) throw new Error('User email is missing');
  
  // Try to get user profile from the users table
  try {
    const userProfile = await getUserByEmail(session.user.email);
    
    if (userProfile) {
      return userProfile;
    }
    
    // If no profile exists, create one using the user metadata
    return await createUserProfile({
      id: session.user.id,
      email: session.user.email,
      role: (session.user.user_metadata?.role as UserRole) || 'public',
      created_at: new Date().toISOString(),
    });
  } catch (profileError) {
    console.error('Error getting or creating user profile:', profileError);
    
    // Return a minimal user object based on session data
    return {
      id: session.user.id,
      email: session.user.email,
      role: (session.user.user_metadata?.role as UserRole) || 'public',
      created_at: session.user.created_at || new Date().toISOString(),
    };
  }
};

// Create a user profile in our users table
const createUserProfile = async (userData: User) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    // Check if it's a duplicate key error
    if (error.code === '23505') {
      // Profile already exists, fetch it instead
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      if (fetchError) throw fetchError;
      return data;
    }
    throw error;
  }
}; 