#!/usr/bin/env node

// Set up environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Load required modules
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

// Initialize the Supabase client
console.log(`Connecting to Supabase at ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'utils', 'database.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`SQL file not found at ${sqlFilePath}`);
      process.exit(1);
    }
    
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8').toString();
    
    // Split SQL commands by semicolon
    const commands = sqlCommands
      .split(';')
      .filter(cmd => cmd.trim() !== '')
      .map(cmd => `${cmd.trim()};`);
    
    console.log(`Found ${commands.length} SQL commands to execute`);
    
    // Enable UUID extension first (this needs to be done separately)
    const uuidCommand = 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";';
    try {
      console.log('Creating UUID extension...');
      await supabase.rpc('exec_sql', { sql: uuidCommand }).catch(async () => {
        // If RPC fails, try direct REST API call
        await supabase.from('_exec_sql').insert({ sql: uuidCommand });
      });
    } catch (err) {
      console.warn('Could not create UUID extension:', err.message);
      console.log('Continuing anyway as it might already be installed');
    }
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      
      // Skip empty commands or just comments
      if (!command || command === ';' || command.startsWith('--')) {
        continue;
      }
      
      try {
        console.log(`Executing command ${i + 1}/${commands.length}: ${command.substring(0, 40)}...`);
        
        // Try to execute the command
        const { error } = await supabase.rpc('exec_sql', { sql: command }).catch(async () => {
          // If RPC fails, try direct REST API call
          return await supabase.from('_exec_sql').insert({ sql: command });
        });
        
        if (error) {
          // Skip errors for "already exists" cases
          if (error.message && error.message.includes('already exists')) {
            console.log(`  - Skipped: Object already exists`);
          } else {
            console.error(`  - Error: ${error.message}`);
          }
        } else {
          console.log(`  - Success`);
        }
      } catch (err) {
        console.error(`  - Error executing command ${i + 1}: ${err.message || err}`);
      }
    }
    
    // Verify tables were created
    console.log('Verifying tables...');
    
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
      
    if (patientsError) {
      console.error('Failed to verify patients table:', patientsError.message);
    } else {
      console.log('Patients table verified successfully');
    }
    
    const { data: emergenciesData, error: emergenciesError } = await supabase
      .from('emergencies')
      .select('count')
      .limit(1);
      
    if (emergenciesError) {
      console.error('Failed to verify emergencies table:', emergenciesError.message);
    } else {
      console.log('Emergencies table verified successfully');
    }
    
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 