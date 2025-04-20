'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EmergencyConfirmationPage() {
  const router = useRouter();

  // Redirect to home after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-800">Emergency Reported Successfully</h1>
        </div>
        
        <p className="text-lg mb-6 text-gray-700">
          Your emergency has been successfully reported. Our team has been notified and will respond as quickly as possible.
        </p>
        
        <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">What happens next?</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Emergency services have been notified of your situation</li>
            <li>Based on your location, the nearest response team will be dispatched</li>
            <li>If you provided a phone number, you may receive a call for additional information</li>
            <li>You can check the status of your emergency report in your dashboard</li>
          </ul>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
            Return to Home
          </Link>
          <Link href="/dashboard/patient" className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition">
            Go to Dashboard
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>You will be redirected to the home page in 10 seconds.</p>
        </div>
      </div>
    </div>
  );
} 