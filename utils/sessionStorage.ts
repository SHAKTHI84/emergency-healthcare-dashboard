/**
 * Simple utilities for storing and retrieving session data
 */

export function storeSessionData(session: any, user: any) {
  try {
    // Store session in localStorage
    localStorage.setItem('session', JSON.stringify(session));
    localStorage.setItem('user', JSON.stringify(user));
    
    // Also store some basic user info for quick access
    if (user?.user_metadata?.role) {
      localStorage.setItem('user_role', user.user_metadata.role);
    }
    
    return true;
  } catch (error) {
    console.error('Error storing session data:', error);
    return false;
  }
}

export function getSessionData() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    return { session, user };
  } catch (error) {
    console.error('Error retrieving session data:', error);
    return { session: null, user: null };
  }
}

export function clearSessionData() {
  try {
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    
    return true;
  } catch (error) {
    console.error('Error clearing session data:', error);
    return false;
  }
}

export function getUserRole() {
  try {
    return localStorage.getItem('user_role') || null;
  } catch (error) {
    return null;
  }
} 