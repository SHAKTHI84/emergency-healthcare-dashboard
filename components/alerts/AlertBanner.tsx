'use client';

import { useState } from 'react';
import { Alert } from '../../types';
import { formatDate } from '../../utils/helpers';

interface AlertBannerProps {
  alerts: Alert[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
  
  if (activeAlerts.length === 0) {
    return null;
  }

  const currentAlert = activeAlerts[currentAlertIndex];

  // Get background color based on alert type
  const getBgColor = (type: string) => {
    switch (type) {
      case 'danger':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'info':
      default:
        return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  // Dismiss current alert
  const dismissAlert = () => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(currentAlert.id);
    setDismissedAlerts(newDismissed);
    
    // Reset to first alert if we dismissed the last one
    if (currentAlertIndex >= activeAlerts.length - 1) {
      setCurrentAlertIndex(0);
    }
  };

  // Navigate to next alert
  const nextAlert = () => {
    setCurrentAlertIndex((prevIndex) => 
      prevIndex >= activeAlerts.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Navigate to previous alert
  const prevAlert = () => {
    setCurrentAlertIndex((prevIndex) => 
      prevIndex <= 0 ? activeAlerts.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className={`px-4 py-3 border-l-4 relative ${getBgColor(currentAlert.type)}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-bold">{currentAlert.title}</p>
          <p className="text-sm">{currentAlert.message}</p>
        </div>
        
        {activeAlerts.length > 1 && (
          <div className="flex items-center space-x-2 mr-8">
            <button
              onClick={prevAlert}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Previous alert"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-sm">
              {currentAlertIndex + 1} / {activeAlerts.length}
            </span>
            <button
              onClick={nextAlert}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Next alert"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        <button 
          onClick={dismissAlert}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          aria-label="Dismiss alert"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
} 