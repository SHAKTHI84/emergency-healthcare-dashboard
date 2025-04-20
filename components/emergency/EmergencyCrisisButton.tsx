'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';

interface EmergencyCrisisButtonProps {
  floating?: boolean;
  className?: string;
  buttonText?: string;
}

export default function EmergencyCrisisButton({
  floating = true,
  className = '',
  buttonText = 'EMERGENCY CRISIS'
}: EmergencyCrisisButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle emergency crisis button click
  const handleCrisisClick = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Try to get address from coordinates
      let location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          location = data.results[0].formatted_address;
        }
      } catch (error) {
        console.error('Error getting address:', error);
        // Continue with coordinates if address lookup fails
      }
      
      // Submit emergency with minimal information
      const response = await fetch('/api/emergencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergency_type: 'CRISIS',
          reporter_name: 'EMERGENCY USER',
          contact_number: 'UNKNOWN',
          description: 'EMERGENCY CRISIS BUTTON ACTIVATED',
          location,
          latitude,
          longitude,
          requires_ambulance: true,
          status: 'pending',
          is_crisis: true
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to report emergency crisis');
      }
      
      toast.success('Emergency crisis reported. Help is on the way!');
      router.push('/emergency-confirmation');
    } catch (error) {
      console.error('Error reporting crisis:', error);
      toast.error('Failed to report emergency. Please try again or call emergency services directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not floating, return a regular button
  if (!floating) {
    return (
      <button
        onClick={handleCrisisClick}
        className={`flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md shadow-md transition-all ${className}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoadingSpinner size="sm" />
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
        {buttonText}
      </button>
    );
  }

  // Floating button (default)
  return (
    <div className="fixed top-28 left-0 right-0 z-50 flex justify-center p-2">
      <button
        onClick={handleCrisisClick}
        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 animate-pulse text-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoadingSpinner size="sm" />
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
        {buttonText}
      </button>
    </div>
  );
} 