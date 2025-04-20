'use client';

import { useState } from 'react';

export default function DatabaseSetup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const setupDatabase = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/setup-db');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Error setting up database',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto my-4">
      <h2 className="text-xl font-semibold mb-4">Database Setup</h2>
      
      <p className="text-gray-700 mb-4">
        If you're having issues with login, you may need to set up the database tables.
        Click the button below to create the necessary tables in your Supabase database.
      </p>
      
      <button
        onClick={setupDatabase}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 mb-4"
      >
        {loading ? 'Setting up database...' : 'Setup Database Tables'}
      </button>
      
      {result && (
        <div className={`p-3 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'} mb-3`}>
          <p className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>
          
          {result.success && result.totalStatements && (
            <p className="text-sm text-gray-600 mt-2">
              Successfully executed {result.successfulStatements} of {result.totalStatements} SQL statements.
            </p>
          )}
          
          {!result.success && result.error && (
            <p className="text-sm text-red-600 mt-2">
              Error: {result.error}
            </p>
          )}
          
          {result.details && result.details.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Failed statements:</p>
              <ul className="text-xs text-red-600 list-disc list-inside mt-1">
                {result.details.slice(0, 3).map((detail: any, index: number) => (
                  <li key={index} className="mt-1">
                    {detail.statement} - {detail.error}
                  </li>
                ))}
                {result.details.length > 3 && (
                  <li className="mt-1">...and {result.details.length - 3} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        Note: This action requires appropriate database permissions.
        For production environments, you should run the SQL directly through the Supabase dashboard.
      </p>
    </div>
  );
} 