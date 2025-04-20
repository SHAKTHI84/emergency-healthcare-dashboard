'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  onClose: (id: number) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for transition out
  };

  // Define toast styles based on type
  let bgColor, textColor, icon;
  
  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      textColor = 'text-white';
      icon = '✓';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      icon = '✕';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      textColor = 'text-white';
      icon = '⚠';
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-500';
      textColor = 'text-white';
      icon = 'ℹ';
      break;
  }

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } rounded-md shadow-md ${bgColor} ${textColor} p-4 mb-4 flex items-center max-w-sm`}
      role="alert"
    >
      <div className="mr-3 font-bold">{icon}</div>
      <div className="flex-1">{message}</div>
      <button
        onClick={handleClose}
        className="ml-4 text-white focus:outline-none"
        aria-label="Close"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
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