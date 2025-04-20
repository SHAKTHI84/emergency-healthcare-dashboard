'use client';

import { useState, useEffect } from 'react';
import { PatientData, getPatientById, updatePatient } from '../../services/patients';
import { getSession } from '../../services/auth';

interface PersonalDetailsFormProps {
  userId: string;
  onUpdate?: (patient: PatientData) => void;
}

export default function PersonalDetailsForm({ userId, onUpdate }: PersonalDetailsFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: '',
    allergies: [''] as string[],
  });
  const [newAllergy, setNewAllergy] = useState('');

  // Blood type options
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        console.log("Loading patient data for userId:", userId);
        const patientData = await getPatientById(userId);
        console.log("Patient data loaded:", patientData);
        
        if (patientData) {
          setPatient(patientData);
          setFormData({
            name: patientData.name || '',
            email: patientData.email || '',
            phone: patientData.phone || '',
            bloodType: patientData.bloodType || '',
            allergies: patientData.allergies && patientData.allergies.length > 0 
              ? [...patientData.allergies] 
              : [''],
          });
          console.log("Form data set:", {
            name: patientData.name || '',
            email: patientData.email || '',
            phone: patientData.phone || '',
            bloodType: patientData.bloodType || '',
            allergies: patientData.allergies
          });
        } else {
          // If no patient data exists, keep form empty but ready for input
          setFormData({
            name: '',
            email: '',
            phone: '',
            bloodType: '',
            allergies: [''],
          });
          console.log("No patient data found, form is empty");
        }
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError('Failed to load your information. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadPatient();
    } else {
      console.error("No userId provided to PersonalDetailsForm");
      setLoading(false);
    }
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAllergyChange = (index: number, value: string) => {
    const updatedAllergies = [...formData.allergies];
    updatedAllergies[index] = value;
    setFormData(prev => ({
      ...prev,
      allergies: updatedAllergies
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies.filter(a => a.trim()), newAllergy]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    if (formData.allergies.length > 1) {
      const updatedAllergies = formData.allergies.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        allergies: updatedAllergies.length ? updatedAllergies : ['']
      }));
    } else {
      // If only one allergy is left, just clear it instead of removing
      setFormData(prev => ({
        ...prev,
        allergies: ['']
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Use the provided userId instead of getting it from session
      if (!userId) {
        setError('User ID not provided');
        setSaving(false);
        return;
      }

      // Filter out empty allergy entries
      const filteredAllergies = formData.allergies.filter(allergy => allergy.trim() !== '');

      // Start with an existing patient if we have one
      const existingPatient = patient || {};
      
      const patientData: Partial<PatientData> = {
        ...existingPatient, // Include existing data to preserve it
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bloodType: formData.bloodType,
        allergies: filteredAllergies,
      };

      console.log("Saving patient data:", patientData);
      
      // We're directly using the userId parameter 
      const updatedPatient = await updatePatient(userId, patientData);
      console.log("Update result:", updatedPatient);
      
      if (updatedPatient) {
        setPatient(updatedPatient as PatientData);
        setFormData({
          name: updatedPatient.name || '',
          email: updatedPatient.email || '',
          phone: updatedPatient.phone || '',
          bloodType: updatedPatient.bloodType || '',
          allergies: updatedPatient.allergies && updatedPatient.allergies.length > 0 
            ? [...updatedPatient.allergies] 
            : [''],
        });
        
        setSuccess('Personal details updated successfully!');
        
        if (onUpdate) {
          onUpdate(updatedPatient as PatientData);
        }
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError('Failed to update personal details');
      }
    } catch (err) {
      console.error('Error updating patient data:', err);
      setError('An error occurred while saving your details');
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Details</h2>
        
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
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Your contact number"
              />
            </div>
            
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Type
              </label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select blood type</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergies
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Please list any allergies you have. This information is important for emergency situations.
              </p>
              
              {formData.allergies.map((allergy, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={allergy}
                    onChange={(e) => handleAllergyChange(index, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter allergy"
                  />
                  <button
                    type="button"
                    onClick={() => removeAllergy(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              
              <div className="flex items-center mt-3">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add new allergy"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllergy();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="pt-5">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 