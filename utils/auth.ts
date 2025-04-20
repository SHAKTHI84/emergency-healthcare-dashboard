import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabaseClient';
import { initializeDatabase } from './initDatabase';

// Generate a unique patient ID
export function generatePatientId() {
  // Format: PT-XXXX-XXXX (where X is alphanumeric)
  return `PT-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;
}

// Register a new user with patient details
export async function registerUser({
  email,
  password,
  name,
  phone,
  age,
  gender
}: {
  email: string;
  password: string;
  name: string;
  phone: string;
  age?: number;
  gender?: string;
}) {
  try {
    // First, register the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        }
      }
    });

    if (authError) {
      console.error('Error registering user:', authError);
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, error: 'Failed to create user account' };
    }

    // Generate a unique patient ID
    const patientUniqueId = generatePatientId();

    // Ensure database is initialized
    await initializeDatabase();

    // Create a patient record linked to the user
    const { error: patientError } = await supabase
      .from('patients')
      .insert({
        user_id: userId,
        patient_unique_id: patientUniqueId,
        name,
        email,
        phone,
        age: age || null,
        gender: gender || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (patientError) {
      console.error('Error creating patient record:', patientError);
      // Don't return error here, as the auth account was created successfully
    }

    return { 
      success: true, 
      user: authData.user,
      patientId: patientUniqueId
    };
  } catch (error) {
    console.error('Error in registerUser:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Login user
export async function loginUser({
  email,
  password
}: {
  email: string;
  password: string;
}) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
    }

    // Store authentication data
    if (data.session) {
      localStorage.setItem('auth_token', data.session.access_token);
      const role = data.user?.user_metadata?.role || 'patient';
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_id', data.user?.id || '');
    }

    return { 
      success: true, 
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Error in loginUser:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Login with OTP (magic link)
export async function sendMagicLink(email: string) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Error sending magic link:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendMagicLink:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Update user password
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updatePassword:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get the current user and patient details
export async function getCurrentUserWithPatient() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return { success: false, error: userError?.message || 'User not authenticated' };
    }
    
    // Get patient record associated with user
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (patientError && patientError.code !== 'PGRST116') { // PGRST116 is not found, which is not a critical error
      console.error('Error getting patient data:', patientError);
    }
    
    // If no patient record found but we have user data, try to find by email
    let patient = patientData;
    if (!patient && user.email) {
      const { data: emailPatientData, error: emailError } = await supabase
        .from('patients')
        .select('*')
        .eq('email', user.email)
        .single();
        
      if (emailError && emailError.code !== 'PGRST116') {
        console.error('Error getting patient by email:', emailError);
      }
      
      // If found by email, update the record with user_id for future lookups
      if (emailPatientData) {
        patient = emailPatientData;
        
        // Update the patient record to include user_id
        await supabase
          .from('patients')
          .update({ user_id: user.id })
          .eq('id', emailPatientData.id);
      }
    }
    
    return {
      success: true,
      user,
      patient
    };
  } catch (error) {
    console.error('Error in getCurrentUserWithPatient:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 