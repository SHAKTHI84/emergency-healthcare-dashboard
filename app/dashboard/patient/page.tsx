'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { getCurrentUserWithPatient } from '../../../utils/auth';
import { clearSessionData } from '../../../utils/sessionStorage';
import EmergencyCrisisButton from '../../../components/emergency/EmergencyCrisisButton';

export default function PatientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(sessionError.message);
        }
        
        if (!session) {
          console.log('No active session found in patient dashboard');
          // Use a more direct navigation method instead of router.push
          window.location.href = '/login';
          return;
        }
        
        console.log('Patient dashboard - Session found:', session.user.id);
        
        // Get user with linked patient data
        const result = await getCurrentUserWithPatient();
        
        if (!result.success) {
          console.error('Could not get patient data:', result.error);
          setUser(session.user);
          // Continue without patient data
        } else {
          setUser(result.user);
          setPatientData(result.patient);
        }
        
      } catch (err) {
        console.error('Initial auth check error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        
        // Handle authentication errors by redirecting
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear all session data
      clearSessionData();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Sign In Required</h2>
          <p className="text-gray-600 mb-6 text-center">
            Please sign in to access your patient dashboard.
          </p>
          <div className="flex justify-center">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Emergency Alert Banner */}
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">In case of emergency, click the button to report immediately.</p>
          </div>
          <button 
            onClick={() => router.push('/report-emergency')}
            className="bg-white text-red-600 hover:bg-gray-100 font-bold py-2 px-4 rounded"
          >
            Report Emergency
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-black text-black-important">Patient Dashboard</h1>
            <p className="text-gray-700 text-black-important font-medium">
              Welcome back, {patientData?.name || user.email}
            </p>
          </div>
          <Link
            href="/dashboard/patient/profile"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions Card */}
          <div className="card bg-white shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-black text-black-important mb-4">Quick Actions</h2>
              
              {/* Emergency Crisis Button (non-floating version) */}
              <div className="mb-4">
                <EmergencyCrisisButton 
                  floating={false} 
                  className="w-full py-3 text-base"
                  buttonText="INSTANT EMERGENCY SOS"
                />
              </div>
              
              <button
                onClick={() => router.push('/report-emergency')}
                className="mb-3 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <span className="text-white">Report Emergency</span>
              </button>
              <button
                onClick={() => router.push('/hospitals')}
                className="mb-3 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="text-white">Find Nearby Hospitals</span>
              </button>
              <button
                onClick={() => router.push('/emergency-contacts')}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <span className="text-white">Emergency Contacts</span>
              </button>
            </div>
          </div>

          {/* Medical Summary Card */}
          <div className="card bg-white shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-black text-black-important mb-4">Medical Summary</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-800 text-black-important">Blood Type</h3>
                  <p className="mt-1 text-lg text-gray-900 text-black-important font-medium">{patientData?.blood_type || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800 text-black-important">Allergies</h3>
                  <p className="mt-1 text-lg text-gray-900 text-black-important font-medium">
                    {patientData?.allergies?.length > 0
                      ? patientData.allergies.join(', ')
                      : 'None recorded'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800 text-black-important">Last Check-up</h3>
                  <p className="mt-1 text-lg text-gray-900 text-black-important font-medium">
                    {patientData?.last_checkup
                      ? new Date(patientData.last_checkup).toLocaleDateString()
                      : 'No date available'}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/dashboard/patient/profile?tab=medical"
                  className="text-sm font-bold text-blue-800 hover:text-blue-900"
                >
                  View full medical history →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="card bg-white shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-black text-black-important mb-4">Recent Activity</h2>
              {patientData?.medical_history?.length > 0 ? (
                <div className="space-y-3">
                  {patientData.medical_history.slice(0, 3).map((entry: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-3 py-1">
                      <p className="text-sm text-gray-800 text-black-important">{entry.date}</p>
                      <p className="font-medium text-black-important">{entry.diagnosis}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-800 text-black-important font-medium">No recent medical activity recorded</p>
              )}
              <div className="mt-6">
                <Link
                  href="/dashboard/patient/profile?tab=medical"
                  className="text-sm font-bold text-blue-800 hover:text-blue-900"
                >
                  View medical history →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Health Metrics Card */}
        <div className="mt-6 card bg-white shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black text-black-important">Health Metrics</h2>
              <Link
                href="/dashboard/patient/profile?tab=metrics"
                className="text-sm font-bold text-blue-800 hover:text-blue-900"
              >
                View metrics →
              </Link>
            </div>
            {patientData?.health_metrics?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {patientData.health_metrics.slice(0, 3).map((metric: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
                    <p className="mt-1 text-xl font-semibold text-black-important">
                      {metric.value} <span className="text-sm text-gray-700 text-black-important">{metric.unit}</span>
                    </p>
                    <p className="text-xs text-gray-700 text-black-important mt-1">
                      Last updated: {metric.date}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-800 text-black-important font-medium mb-4">No health metrics recorded yet</p>
                <Link
                  href="/dashboard/patient/profile?tab=metrics&action=add"
                  className="btn-primary inline-flex items-center px-4 py-2 rounded-md text-white"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add health metrics →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Emergency Button (in addition to the inline one) */}
      <EmergencyCrisisButton />
    </div>
  );
} 