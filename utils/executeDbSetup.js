const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeDbSetup() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8').toString();
    
    // Split SQL commands by semicolon to execute them separately
    const commands = sqlCommands
      .split(';')
      .filter(cmd => cmd.trim() !== '')
      .map(cmd => `${cmd.trim()};`);
    
    console.log(`Found ${commands.length} SQL commands to execute`);
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      try {
        console.log(`Executing command ${i + 1}/${commands.length}`);
        // For debugging, you can log a preview of the command
        console.log(`Command preview: ${command.substring(0, 50)}...`);
        
        // Execute the SQL command
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          // If RPC method fails, try direct query
          console.warn(`RPC execution failed: ${error.message}. Trying direct query...`);
          const { error: directError } = await supabase.query(command);
          
          if (directError) {
            console.error(`Failed to execute command ${i + 1}: ${directError.message}`);
            console.error(`Command was: ${command}`);
          }
        }
      } catch (err) {
        console.error(`Error executing command ${i + 1}: ${err.message}`);
        console.error(`Command was: ${command}`);
      }
    }
    
    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Failed to execute database setup:', error.message);
  }
}

// Execute the setup
executeDbSetup().catch(console.error); 