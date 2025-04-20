'use client';

import { useState, useEffect } from 'react';
import { PatientData, getPatientById } from '../../services/patients';
import Link from 'next/link';

interface PatientHealthDisplayProps {
  userId: string;
}

export default function PatientHealthDisplay({ userId }: PatientHealthDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientData | null>(null);

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        const patientData = await getPatientById(userId);
        setPatient(patientData);
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError('Failed to load your health information.');
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  // Medical Summary Section
  const renderMedicalSummary = () => {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Summary</h2>
          <div className="space-y-3">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
              {patient?.bloodType ? (
                <p className="mt-1 text-lg text-gray-900">{patient.bloodType}</p>
              ) : (
                <p className="mt-1 text-lg text-gray-400 italic">Not recorded</p>
              )}
            </div>
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
              {patient?.allergies && patient.allergies.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {patient.allergies.map((allergy, index) => (
                    <span key={index} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-lg text-gray-400 italic">No known allergies</p>
              )}
            </div>
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-sm font-medium text-gray-500">Last Check-up</h3>
              {patient?.lastCheckup ? (
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(patient.lastCheckup).toLocaleDateString()}
                </p>
              ) : (
                <p className="mt-1 text-lg text-gray-400 italic">No recent check-ups</p>
              )}
            </div>
            {patient?.medicalHistory && patient.medicalHistory.length > 0 && (
              <div>
                <Link 
                  href="/medical-history" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View full medical history →
                </Link>
              </div>
            )}
            {(!patient?.medicalHistory || patient.medicalHistory.length === 0) && (
              <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-700">
                Your medical history will be updated by healthcare providers during visits.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Recent Activity Section
  const renderRecentActivity = () => {
    // Check if there's any medical history to show as activity
    const hasActivity = patient?.medicalHistory && patient.medicalHistory.length > 0;
    
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          {hasActivity ? (
            <div className="space-y-4">
              {patient!.medicalHistory.slice(0, 3).map((entry, index) => (
                <div key={index} className={`border-l-4 border-blue-400 pl-3 py-1`}>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-900">{entry.diagnosis}</p>
                  {entry.doctor && <p className="text-sm text-gray-600">Dr. {entry.doctor}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No recent medical activity</p>
              <p className="text-sm text-gray-400 mt-2">
                Your activity will appear here after healthcare provider visits
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Health Metrics Section
  const renderHealthMetrics = () => {
    const hasMetrics = patient?.healthMetrics && 
      (patient.healthMetrics.bloodPressure || 
       patient.healthMetrics.heartRate > 0 || 
       patient.healthMetrics.bloodSugar > 0 || 
       patient.healthMetrics.oxygenLevel > 0);
    
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Metrics</h2>
          
          {hasMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Blood Pressure</h3>
                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {patient!.healthMetrics.bloodPressure || 'N/A'}
                </p>
                <p className="text-xs text-blue-700">
                  Last updated: {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Heart Rate</h3>
                <p className="mt-2 text-2xl font-bold text-green-900">
                  {patient!.healthMetrics.heartRate > 0 ? `${patient!.healthMetrics.heartRate} bpm` : 'N/A'}
                </p>
                <p className="text-xs text-green-700">
                  Last updated: {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-800">Blood Sugar</h3>
                <p className="mt-2 text-2xl font-bold text-yellow-900">
                  {patient!.healthMetrics.bloodSugar > 0 ? `${patient!.healthMetrics.bloodSugar} mg/dL` : 'N/A'}
                </p>
                <p className="text-xs text-yellow-700">
                  Last updated: {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800">Oxygen Level</h3>
                <p className="mt-2 text-2xl font-bold text-purple-900">
                  {patient!.healthMetrics.oxygenLevel > 0 ? `${patient!.healthMetrics.oxygenLevel}%` : 'N/A'}
                </p>
                <p className="text-xs text-purple-700">
                  Last updated: {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-600 mb-2">No health metrics available yet</p>
              <p className="text-sm text-gray-500">
                Your health metrics will be recorded during your next check-up.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderMedicalSummary()}
      {renderRecentActivity()}
      {renderHealthMetrics()}
    </div>
  );
} 