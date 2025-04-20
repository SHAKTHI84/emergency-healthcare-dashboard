import { supabase } from '../lib/supabaseClient';
import fs from 'fs';
import path from 'path';

// Track if database has been initialized during this session
let isInitialized = false;

// Function to initialize the database structure
export async function initializeDatabase(): Promise<boolean> {
  console.log('Initializing database...');
  
  try {
    const response = await fetch('/api/init');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to initialize database');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Function to check if database tables exist
export async function checkDatabaseTables(): Promise<boolean> {
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
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking database tables:', error);
    return false;
  }
}

// Helper function to ensure database is initialized
export async function ensureDatabaseInitialized(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }

  const tablesExist = await checkDatabaseTables();
  if (tablesExist) {
    isInitialized = true;
    return true;
  }

  return false;
} 