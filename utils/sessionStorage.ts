/**
 * Utility functions for handling session storage
 */

// Store session data after successful authentication
export const storeSessionData = (session: any, userData: any) => {
  if (!session || !userData) return;
  
  try {
    // Store auth token securely
    localStorage.setItem('auth_token', session.access_token);
    localStorage.setItem('user_id', userData.id);
    
    // Store user role from metadata or default to patient
    const userRole = userData.user_metadata?.role || 'patient';
    localStorage.setItem('user_role', userRole);
    
    // Store refresh token if available
    if (session.refresh_token) {
      localStorage.setItem('refresh_token', session.refresh_token);
    }
    
    // Store session expiry
    if (session.expires_at) {
      localStorage.setItem('session_expires_at', session.expires_at.toString());
    }
    
    console.log('Session data stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing session data:', error);
    return false;
  }
};

// Check if a valid session exists in local storage
export const hasValidSession = () => {
  try {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('session_expires_at');
    
    if (!token) return false;
    
    // If we have an expiry time, check if it's still valid
    if (expiresAt) {
      const expiryTime = parseInt(expiresAt, 10) * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (now >= expiryTime) {
        // Session has expired
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

// Clear session data on logout
export const clearSessionData = () => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_expires_at');
    
    console.log('Session data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing session data:', error);
    return false;
  }
};

// Get user role from session data
export const getUserRole = () => {
  try {
    return localStorage.getItem('user_role') || 'patient';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'patient';
  }
}; 