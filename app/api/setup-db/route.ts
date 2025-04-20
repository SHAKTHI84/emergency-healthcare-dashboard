import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Security check - only allow this in development or with a specific header
  const url = new URL(req.url);
  const authKey = url.searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && authKey !== process.env.SETUP_SECRET_KEY) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    // Create a Supabase client with the service role key for admin privileges
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    if (!supabaseAdmin) {
      throw new Error('Failed to create Supabase admin client');
    }
    
    // Read SQL script content
    const sqlFilePath = path.join(process.cwd(), 'supabase', 'migrations', '00_init.sql');
    let sqlContent: string;
    
    try {
      sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    } catch (readError) {
      console.error('Error reading SQL file:', readError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error reading SQL file',
          error: readError instanceof Error ? readError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    // Split SQL into separate statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    const results = [];
    
    // Execute each SQL statement
    for (const statement of statements) {
      try {
        const { error } = await supabaseAdmin.rpc('pgmoon.rpc_query', { query: statement });
        
        if (error) {
          console.warn(`Error executing statement: ${statement.slice(0, 50)}...`, error);
          results.push({ 
            success: false, 
            statement: statement.slice(0, 50) + '...',
            error: error.message
          });
        } else {
          results.push({ 
            success: true, 
            statement: statement.slice(0, 50) + '...'
          });
        }
      } catch (statementError) {
        console.error(`Error executing statement: ${statement.slice(0, 50)}...`, statementError);
        results.push({ 
          success: false, 
          statement: statement.slice(0, 50) + '...',
          error: statementError instanceof Error ? statementError.message : 'Unknown error'
        });
      }
    }
    
    const failures = results.filter(r => !r.success);
    
    return NextResponse.json({
      success: failures.length === 0,
      message: failures.length === 0 
        ? 'Database setup completed successfully' 
        : `Database setup completed with ${failures.length} errors`,
      totalStatements: statements.length,
      successfulStatements: statements.length - failures.length,
      failedStatements: failures.length,
      details: failures.length > 0 ? failures : undefined
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error setting up database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 