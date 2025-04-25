import { supabase } from '../lib/supabaseClient';
import fs from 'fs';
import path from 'path';

// Track if database has been initialized during this session
let isInitialized = false;

interface InitResult {
  success: boolean;
  error?: string;
}

// Function to initialize the database structure
export async function initializeDatabase(): Promise<InitResult> {
  console.log('Initializing database...');
  
  try {
    const response = await fetch('/api/init');
    const data = await response.json();
    
    if (!data.success) {
      return { 
        success: false, 
        error: data.error || 'Failed to initialize database' 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error initializing database' 
    };
  }
}

// Function to check if database tables exist
export async function checkDatabaseTables(): Promise<InitResult> {
  try {
    // Check if tables exist
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
      
    const { data: emergencyData, error: emergencyError } = await supabase
      .from('emergencies')
      .select('id')
      .limit(1);
      
    // If any errors occurred, tables might not exist
    if (patientError?.code === '42P01' || emergencyError?.code === '42P01') {
      console.error('Database tables not found');
      return { success: false, error: 'Database tables not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error checking database tables:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error checking database tables' 
    };
  }
}

// Helper function to ensure database is initialized
export async function ensureDatabaseInitialized(): Promise<InitResult> {
  if (isInitialized) {
    return { success: true };
  }

  const tablesExist = await checkDatabaseTables();
  if (tablesExist.success) {
    isInitialized = true;
    return { success: true };
  }

  return { success: false, error: tablesExist.error || 'Database not initialized' };
} 