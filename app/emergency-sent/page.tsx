'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function EmergencyReportedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(15);
  const emergencyType = searchParams?.get('type') || 'regular';
  const isCrisis = emergencyType === 'crisis';

  useEffect(() => {
    // Auto redirect to dashboard after 15 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard/patient');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isCrisis 
                ? 'Emergency Alert Sent!' 
                : 'Emergency Report Submitted!'}
            </h1>
            <p className="text-gray-600">
              {isCrisis
                ? 'Your EMERGENCY CRISIS alert has been sent to emergency services with your location information.'
                : 'Your emergency report has been successfully submitted and will be processed immediately.'}
            </p>
          </div>
          
          <div className={`p-4 mb-6 rounded-md ${isCrisis ? 'bg-red-50' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isCrisis ? 'text-red-800' : 'text-blue-800'}`}>
              {isCrisis 
                ? 'Emergency services have been notified of your situation. Please stay at your current location if possible and wait for assistance to arrive.' 
                : 'Emergency personnel will review your report and respond as quickly as possible.'}
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">What to do next:</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Stay calm and find a safe location if you're not already in one</li>
              <li>Keep your phone accessible for potential callback from emergency services</li>
              <li>If your situation changes, submit a new report with updated information</li>
              {isCrisis && (
                <li className="font-medium text-red-600">If possible, have someone meet emergency responders to guide them to your exact location</li>
              )}
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link 
              href="/dashboard/patient" 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700"
            >
              Return to Dashboard
            </Link>
            <Link 
              href="/report-emergency" 
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-center hover:bg-gray-50"
            >
              Submit Another Report
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-4 text-center">
            Auto-redirecting to dashboard in {countdown} seconds...
          </p>
        </div>
      </main>
    </div>
  );
}

export default function EmergencyReportedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we process your submission.</p>
        </div>
      </div>
    }>
      <EmergencyReportedContent />
    </Suspense>
  );
} 