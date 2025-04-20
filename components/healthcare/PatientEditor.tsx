'use client';

import { useState } from 'react';
import { PatientData, updatePatient } from '../../services/patients';
import PersonalDetailsForm from '../patients/PersonalDetailsForm';
import MedicalHistoryForm from '../patients/MedicalHistoryForm';
import HealthMetricsForm from '../patients/HealthMetricsForm';

interface PatientEditorProps {
  patient: PatientData;
  onClose: () => void;
  onSave: (patient: PatientData) => void;
}

export default function PatientEditor({ patient, onClose, onSave }: PatientEditorProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'medical' | 'health'>('details');
  const [updatedPatient, setUpdatedPatient] = useState<PatientData>(patient);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleUpdate = (partialPatient: Partial<PatientData>) => {
    setUpdatedPatient(prev => ({
      ...prev,
      ...partialPatient
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await updatePatient(updatedPatient);
      if (result.success) {
        setSaveSuccess('Patient information updated successfully');
        onSave(updatedPatient);
        setTimeout(() => {
          setSaveSuccess(null);
        }, 3000);
      } else {
        setSaveError('Failed to update patient information');
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      setSaveError('An error occurred while saving patient information');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {patient.id ? `Patient: ${patient.name}` : 'Add New Patient'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {saveSuccess && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {saveSuccess}
        </div>
      )}
      
      {saveError && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {saveError}
        </div>
      )}

      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-4 px-4 text-center font-medium ${
            activeTab === 'details'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('details')}
        >
          Personal Details
        </button>
        <button
          className={`flex-1 py-4 px-4 text-center font-medium ${
            activeTab === 'medical'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('medical')}
        >
          Medical History
        </button>
        <button
          className={`flex-1 py-4 px-4 text-center font-medium ${
            activeTab === 'health'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('health')}
        >
          Health Metrics
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'details' && (
          <PersonalDetailsForm 
            userId={patient.id} 
            onUpdate={(updatedData) => handleUpdate(updatedData)}
          />
        )}

        {activeTab === 'medical' && (
          <MedicalHistoryForm 
            userId={patient.id} 
            isHealthcareProvider={true}
            onUpdate={(updatedData) => handleUpdate(updatedData)}
          />
        )}

        {activeTab === 'health' && (
          <HealthMetricsForm 
            userId={patient.id} 
            isHealthcareProvider={true}
            onUpdate={(updatedData) => handleUpdate(updatedData)}
          />
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            isSaving ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
} 