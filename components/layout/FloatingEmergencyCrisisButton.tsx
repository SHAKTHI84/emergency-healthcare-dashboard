'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmergency } from '../../services/emergency';
import { useToastContext } from '../../contexts/ToastContext';

export default function FloatingEmergencyCrisisButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();

  const handleEmergencyCrisis = async () => {
    setIsLoading(true);
    
    try {
      // Try to get current location
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'error');
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Send emergency crisis alert with position data
            const result = await createEmergency({
              emergency_type: 'EMERGENCY CRISIS',
              location: 'Emergency location - coordinates only',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              description: 'URGENT CRISIS ALERT - Immediate assistance required',
              reporter_name: 'Emergency User',
              contact_number: '',
              requires_ambulance: true
            });

            if (result.success) {
              showToast('Emergency alert sent successfully!', 'success');
              // Redirect to confirmation page
              router.push('/emergency-sent?type=crisis');
            } else {
              throw new Error(result.error || 'Failed to send emergency alert');
            }
          } catch (error) {
            console.error('Error sending crisis alert:', error);
            showToast('Failed to send emergency alert. Please try again.', 'error');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            showToast('Location access denied. Please enable location services in browser settings to send emergency alerts.', 'error');
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            showToast('Cannot determine your location. Please try again or call emergency services directly.', 'error');
          } else if (error.code === error.TIMEOUT) {
            showToast('Location request timed out. Please try again or call emergency services directly.', 'error');
          } else {
            showToast('Error getting your location. Please try again or call emergency services directly.', 'error');
          }
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 15000,  // Increased timeout
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Error in emergency crisis flow:', error);
      showToast('An unexpected error occurred. Please call emergency services directly.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEmergencyCrisis}
      disabled={isLoading}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 active:scale-95 animate-pulse"
      aria-label="Emergency Crisis Button"
      title="Click for immediate emergency help"
    >
      {isLoading ? (
        <div className="h-8 w-8 border-4 border-t-4 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <div className="flex flex-col items-center justify-center text-xs font-bold">
          <span className="text-lg">⚠️</span>
          <span className="mt-1">CRISIS</span>
        </div>
      )}
    </button>
  );
} 