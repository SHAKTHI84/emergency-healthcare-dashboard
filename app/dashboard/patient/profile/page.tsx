'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../../../services/auth';
import { PatientData, getPatientById } from '../../../../services/patients';
import { User } from '../../../../types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PersonalDetailsForm from '../../../../components/patients/PersonalDetailsForm';
import MedicalHistoryForm from '../../../../components/patients/MedicalHistoryForm';
import HealthMetricsForm from '../../../../components/patients/HealthMetricsForm';

export default function PatientProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'metrics'>('personal');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
  }, []);
  
  useEffect(() => {
    // Handle tab selection from URL query parameter
    const tab = searchParams.get('tab');
    if (tab === 'medical') {
      setActiveTab('medical');
    } else if (tab === 'metrics') {
      setActiveTab('metrics');
    } else {
      setActiveTab('personal');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Not authenticated</h2>
        <p className="mt-2 text-gray-600">Please sign in to access your profile.</p>
        <div className="mt-6">
          <Link 
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Link
            href="/dashboard/patient"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <p className="mt-2 text-gray-600">Manage your personal information and health records</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200">
          <Link
            href="/dashboard/patient/profile?tab=personal"
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'personal'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('personal');
            }}
          >
            Personal Details
          </Link>
          <Link
            href="/dashboard/patient/profile?tab=medical"
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'medical'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('medical');
            }}
          >
            Medical History
          </Link>
          <Link
            href="/dashboard/patient/profile?tab=metrics"
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'metrics'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('metrics');
            }}
          >
            Health Metrics
          </Link>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'personal' && (
            <PersonalDetailsForm userId={user.id} />
          )}

          {activeTab === 'medical' && (
            <MedicalHistoryForm userId={user.id} isHealthcareProvider={false} />
          )}

          {activeTab === 'metrics' && (
            <HealthMetricsForm userId={user.id} isHealthcareProvider={false} />
          )}
        </div>
      </div>
    </div>
  );
} 