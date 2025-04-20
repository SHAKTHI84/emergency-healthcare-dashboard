'use client';

import { useState, useEffect } from 'react';
import ReportEmergencyForm from '../../components/emergency/ReportEmergencyForm';
import EmergencyCrisisButton from '../../components/emergency/EmergencyCrisisButton';
import GoogleMapComponent from '../../components/maps/GoogleMap';
import { sampleHospitals } from '../../data/sampleHospitals';

export default function ReportEmergencyPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading state for better UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* EmergencyCrisisButton is now fixed at the top of the page */}
      
      <div className="mt-16 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Report an Emergency</h1>
        <p className="text-lg text-gray-600">
          Quick reporting can save lives. Fill out this form to report an emergency situation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Emergency reporting form */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <ReportEmergencyForm />
          </div>
        </div>

        {/* Emergency information and map */}
        <div className="space-y-8">
          {/* Map showing nearby hospitals */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Nearby Hospitals</h2>
              <div className="h-[300px] rounded-lg overflow-hidden">
                <GoogleMapComponent
                  hospitals={sampleHospitals}
                  height="300px"
                />
              </div>
            </div>
          </div>

          {/* Emergency tips */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Tips</h2>
              
              <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Stay Calm</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Try to remain calm and focused during an emergency. Take deep breaths if you feel anxious.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-l-4 border-blue-400 bg-blue-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Provide Clear Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Be as specific as possible about your location and the nature of the emergency.</p>
                    </div>
                  </div>
                </div>
              </div>
                
              <div className="border-l-4 border-red-400 bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Don't Hang Up</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>If you call emergency services, don't hang up until instructed to do so.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 