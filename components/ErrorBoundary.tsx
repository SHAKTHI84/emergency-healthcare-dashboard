'use client';

import React, { useEffect, useState } from 'react';

export default function ErrorBoundary() {
  const [error, setError] = useState<string | null>(null);
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check for initialization status
    const checkInitialization = async () => {
      try {
        const response = await fetch('/api/init');
        const data = await response.json();
        
        if (data.success) {
          setError(null);
        } else {
          setError(data.error || 'Failed to initialize database');
        }
      } catch (err) {
        console.error('Error checking initialization:', err);
        setError('Failed to connect to server');
      }
    };

    checkInitialization();

    // Check initialization every 10 seconds
    const interval = setInterval(checkInitialization, 10000);
    return () => clearInterval(interval);
  }, []);

  const dismissError = () => {
    if (error) {
      const newDismissed = new Set(dismissedErrors);
      newDismissed.add(error);
      setDismissedErrors(newDismissed);
      setError(null);
    }
  };

  // If there's no error or it has been dismissed, don't render anything
  if (!error || dismissedErrors.has(error)) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 mx-4 my-4 relative">
      <h2 className="font-bold">Error</h2>
      <p>{error}</p>
      <button 
        onClick={dismissError}
        className="absolute top-2 right-2 text-red-700 hover:text-red-900"
        aria-label="Dismiss error"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path 
            fillRule="evenodd" 
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
} 