'use client';

import { useState, useEffect } from 'react';
import { PatientData, MedicalHistoryEntry, getPatientById, updatePatient } from '../../services/patients';

interface MedicalHistoryFormProps {
  userId: string;
  onUpdate?: (patient: PatientData) => void;
  isHealthcareProvider?: boolean;
}

export default function MedicalHistoryForm({ userId, onUpdate, isHealthcareProvider = false }: MedicalHistoryFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [newEntry, setNewEntry] = useState<MedicalHistoryEntry>({
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    doctor: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        const patientData = await getPatientById(userId);
        setPatient(patientData);
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError('Failed to load medical history. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEntry = async () => {
    if (!newEntry.diagnosis || !newEntry.treatment) {
      setError('Diagnosis and treatment are required');
      return;
    }

    setSaving(true);
    try {
      if (!patient) {
        throw new Error('Patient data not loaded');
      }

      const updatedPatient = { 
        ...patient,
        medicalHistory: [...(patient.medicalHistory || []), newEntry]
      };

      const result = await updatePatient(updatedPatient);
      
      if (result.success) {
        // Refresh patient data
        const refreshedPatient = await getPatientById(userId);
        setPatient(refreshedPatient);
        
        // Reset form
        setNewEntry({
          date: new Date().toISOString().split('T')[0],
          diagnosis: '',
          treatment: '',
          doctor: ''
        });
        
        setShowAddForm(false);
        setSuccess('Medical history updated successfully!');
        
        if (onUpdate && refreshedPatient) {
          onUpdate(refreshedPatient);
        }
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to update medical history');
      }
    } catch (err) {
      console.error('Error updating medical history:', err);
      setError('An error occurred while saving the medical history');
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
        <h2 className="text-xl font-semibold text-gray-900">Medical History</h2>
        {isHealthcareProvider ? (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            {showAddForm ? 'Cancel' : 'Add Entry'}
          </button>
        ) : (
          <div className="text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">Healthcare providers only</span>
          </div>
        )}
      </div>

      {/* Add new entry form - only shown for healthcare providers */}
      {isHealthcareProvider && showAddForm && (
        <div className="bg-blue-50 p-6 rounded-md mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-4">Add New Medical Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={newEntry.date}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <input
                type="text"
                id="doctor"
                name="doctor"
                value={newEntry.doctor}
                onChange={handleInputChange}
                placeholder="Doctor's name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              rows={2}
              value={newEntry.diagnosis}
              onChange={handleInputChange}
              placeholder="Enter diagnosis details"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
              Treatment *
            </label>
            <textarea
              id="treatment"
              name="treatment"
              rows={2}
              value={newEntry.treatment}
              onChange={handleInputChange}
              placeholder="Enter treatment details"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleAddEntry}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}

      {/* Medical history list */}
      <div>
        {patient?.medicalHistory && patient.medicalHistory.length > 0 ? (
          <div className="space-y-4">
            {patient.medicalHistory
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
              .map((entry, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm font-medium text-blue-600">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    {entry.doctor && (
                      <div className="text-sm text-gray-500">Dr. {entry.doctor}</div>
                    )}
                  </div>
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-500">Diagnosis</h4>
                    <p className="text-gray-900">{entry.diagnosis}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Treatment</h4>
                    <p className="text-gray-900">{entry.treatment}</p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No medical history records found.</p>
            <p className="text-sm text-gray-400 mt-1">
              {isHealthcareProvider 
                ? "You can add medical records using the 'Add Entry' button above."
                : "Medical records will be added by your healthcare provider during visits."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 