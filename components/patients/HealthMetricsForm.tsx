'use client';

import { useState, useEffect } from 'react';
import { PatientData, HealthMetrics, getPatientById, updatePatient } from '../../services/patients';

interface HealthMetricsFormProps {
  userId: string;
  onUpdate?: (patient: PatientData) => void;
  isHealthcareProvider?: boolean;
}

export default function HealthMetricsForm({ userId, onUpdate, isHealthcareProvider = false }: HealthMetricsFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [metricsData, setMetricsData] = useState<HealthMetrics>({
    bloodPressure: '',
    heartRate: 0,
    bloodSugar: 0,
    oxygenLevel: 0
  });
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        const patientData = await getPatientById(userId);
        
        if (patientData) {
          setPatient(patientData);
          setMetricsData({
            bloodPressure: patientData.healthMetrics?.bloodPressure || '',
            heartRate: patientData.healthMetrics?.heartRate || 0,
            bloodSugar: patientData.healthMetrics?.bloodSugar || 0,
            oxygenLevel: patientData.healthMetrics?.oxygenLevel || 0
          });
        }
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError('Failed to load health metrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetricsData(prev => ({
      ...prev,
      [name]: name === 'bloodPressure' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient) {
      setError('Patient data not found');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const updatedPatient = {
        ...patient,
        healthMetrics: metricsData,
        updatedAt: new Date().toISOString()
      };
      
      const result = await updatePatient(updatedPatient);
      if (result.success) {
        // Refresh patient data
        const refreshedPatient = await getPatientById(userId);
        setPatient(refreshedPatient);
        
        if (refreshedPatient) {
          setMetricsData({
            bloodPressure: refreshedPatient.healthMetrics?.bloodPressure || '',
            heartRate: refreshedPatient.healthMetrics?.heartRate || 0,
            bloodSugar: refreshedPatient.healthMetrics?.bloodSugar || 0,
            oxygenLevel: refreshedPatient.healthMetrics?.oxygenLevel || 0
          });
        }
        
        setReadOnly(true);
        setSuccess('Health metrics updated successfully!');
        
        if (onUpdate && refreshedPatient) {
          onUpdate(refreshedPatient);
        }
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to update health metrics');
      }
    } catch (err) {
      console.error('Error updating health metrics:', err);
      setError('An error occurred while saving the health metrics');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const hasAnyMetric = metricsData.bloodPressure || 
                       metricsData.heartRate > 0 || 
                       metricsData.bloodSugar > 0 || 
                       metricsData.oxygenLevel > 0;

  return (
    <div>
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Health Metrics</h2>
        {isHealthcareProvider ? (
          <div>
            {!readOnly && (
              <button
                onClick={() => setReadOnly(true)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
              >
                Cancel
              </button>
            )}
            {readOnly ? (
              <button
                onClick={() => setReadOnly(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Metrics
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">Healthcare providers only</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-6">
        {isHealthcareProvider 
          ? "Update the patient's health metrics to keep their medical record current."
          : "Your health metrics are updated by your healthcare provider during visits. These measurements help track your overall health status."
        }
      </p>

      {!hasAnyMetric && readOnly ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No health metrics recorded yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            {isHealthcareProvider 
              ? "Click 'Edit Metrics' to add the patient's health measurements."
              : "Your healthcare provider will update these during your next visit."
            }
          </p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${readOnly ? 'bg-blue-50' : 'bg-white border border-gray-200'}`}>
              <label htmlFor="bloodPressure" className="block text-sm font-medium text-blue-800 mb-2">
                Blood Pressure
              </label>
              {readOnly ? (
                <p className="mt-2 text-2xl font-bold text-blue-900">
                  {metricsData.bloodPressure || 'N/A'}
                </p>
              ) : (
                <input
                  type="text"
                  id="bloodPressure"
                  name="bloodPressure"
                  value={metricsData.bloodPressure}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                  placeholder="e.g. 120/80"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg font-medium"
                />
              )}
              <p className="text-xs text-blue-700 mt-2">
                Last updated: {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${readOnly ? 'bg-green-50' : 'bg-white border border-gray-200'}`}>
              <label htmlFor="heartRate" className="block text-sm font-medium text-green-800 mb-2">
                Heart Rate (bpm)
              </label>
              {readOnly ? (
                <p className="mt-2 text-2xl font-bold text-green-900">
                  {metricsData.heartRate > 0 ? `${metricsData.heartRate} bpm` : 'N/A'}
                </p>
              ) : (
                <input
                  type="number"
                  id="heartRate"
                  name="heartRate"
                  value={metricsData.heartRate || ''}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                  placeholder="0"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-lg font-medium"
                />
              )}
              <p className="text-xs text-green-700 mt-2">
                Last updated: {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${readOnly ? 'bg-yellow-50' : 'bg-white border border-gray-200'}`}>
              <label htmlFor="bloodSugar" className="block text-sm font-medium text-yellow-800 mb-2">
                Blood Sugar (mg/dL)
              </label>
              {readOnly ? (
                <p className="mt-2 text-2xl font-bold text-yellow-900">
                  {metricsData.bloodSugar > 0 ? `${metricsData.bloodSugar} mg/dL` : 'N/A'}
                </p>
              ) : (
                <input
                  type="number"
                  id="bloodSugar"
                  name="bloodSugar"
                  value={metricsData.bloodSugar || ''}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                  placeholder="0"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-lg font-medium"
                />
              )}
              <p className="text-xs text-yellow-700 mt-2">
                Last updated: {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${readOnly ? 'bg-purple-50' : 'bg-white border border-gray-200'}`}>
              <label htmlFor="oxygenLevel" className="block text-sm font-medium text-purple-800 mb-2">
                Oxygen Level (%)
              </label>
              {readOnly ? (
                <p className="mt-2 text-2xl font-bold text-purple-900">
                  {metricsData.oxygenLevel > 0 ? `${metricsData.oxygenLevel}%` : 'N/A'}
                </p>
              ) : (
                <input
                  type="number"
                  id="oxygenLevel"
                  name="oxygenLevel"
                  min="0"
                  max="100"
                  value={metricsData.oxygenLevel || ''}
                  onChange={handleInputChange}
                  readOnly={readOnly}
                  placeholder="0"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-lg font-medium"
                />
              )}
              <p className="text-xs text-purple-700 mt-2">
                Last updated: {patient?.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
          
          {!readOnly && isHealthcareProvider && (
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {saving ? 'Saving...' : 'Save Metrics'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
} 