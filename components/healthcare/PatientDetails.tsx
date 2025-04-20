'use client';

import { useState } from 'react';
import { PatientData, MedicalHistoryEntry } from '../../services/patients';

interface PatientDetailsProps {
  patient: PatientData;
  onClose: () => void;
  onSave: (patient: PatientData) => void;
}

export default function PatientDetails({ patient, onClose, onSave }: PatientDetailsProps) {
  const [editedPatient, setEditedPatient] = useState<PatientData>({ ...patient });
  const [activeTab, setActiveTab] = useState<'details' | 'health' | 'history'>('details');
  const [newAllergy, setNewAllergy] = useState('');
  const [newHistoryEntry, setNewHistoryEntry] = useState<MedicalHistoryEntry>({
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    doctor: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMetricsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({
      ...prev,
      healthMetrics: {
        ...prev.healthMetrics,
        [name]: name === 'bloodPressure' ? value : Number(value)
      }
    }));
  };
  
  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setEditedPatient(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };
  
  const handleRemoveAllergy = (index: number) => {
    setEditedPatient(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };
  
  const handleHistoryEntryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewHistoryEntry(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddHistoryEntry = () => {
    if (newHistoryEntry.diagnosis && newHistoryEntry.treatment) {
      setEditedPatient(prev => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, { ...newHistoryEntry }]
      }));
      setNewHistoryEntry({
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: '',
        doctor: ''
      });
    }
  };
  
  const handleRemoveHistoryEntry = (index: number) => {
    setEditedPatient(prev => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index)
    }));
  };
  
  const handleSave = () => {
    onSave(editedPatient);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {patient.id ? `Patient: ${patient.name}` : 'Add New Patient'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'details'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('details')}
        >
          Personal Details
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'health'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('health')}
        >
          Health Metrics
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Medical History
        </button>
      </div>
      
      {/* Personal Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name*
            </label>
            <input
              type="text"
              name="name"
              value={editedPatient.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={editedPatient.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={editedPatient.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Type
            </label>
            <select
              name="bloodType"
              value={editedPatient.bloodType}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Check-up Date
            </label>
            <input
              type="date"
              name="lastCheckup"
              value={editedPatient.lastCheckup ? new Date(editedPatient.lastCheckup).toISOString().split('T')[0] : ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedPatient.allergies.map((allergy, index) => (
                <div key={index} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                  <span>{allergy}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(index)}
                    className="ml-2 text-blue-700 hover:text-blue-900"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newAllergy}
                onChange={e => setNewAllergy(e.target.value)}
                className="flex-1 p-2 border rounded-l-md"
                placeholder="Add allergy"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Health Metrics Tab */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Pressure
              </label>
              <input
                type="text"
                name="bloodPressure"
                value={editedPatient.healthMetrics.bloodPressure}
                onChange={handleMetricsChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g. 120/80"
              />
              <p className="text-xs text-gray-500 mt-1">Format: systolic/diastolic</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heart Rate
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="heartRate"
                  value={editedPatient.healthMetrics.heartRate}
                  onChange={handleMetricsChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  max="300"
                />
                <span className="ml-2">BPM</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Sugar
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="bloodSugar"
                  value={editedPatient.healthMetrics.bloodSugar}
                  onChange={handleMetricsChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  max="1000"
                />
                <span className="ml-2">mg/dL</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oxygen Level
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="oxygenLevel"
                  value={editedPatient.healthMetrics.oxygenLevel}
                  onChange={handleMetricsChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  max="100"
                />
                <span className="ml-2">%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">About Health Metrics</h3>
            <p className="text-sm text-yellow-700">
              These metrics should be updated during each check-up. Normal ranges:
            </p>
            <ul className="text-sm text-yellow-700 list-disc pl-5 mt-2">
              <li>Blood Pressure: Below 120/80 mmHg is considered normal</li>
              <li>Heart Rate: 60-100 beats per minute for adults</li>
              <li>Blood Sugar: 70-140 mg/dL (fasting: 70-100 mg/dL)</li>
              <li>Oxygen Level: 95-100% is normal for most people</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Medical History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Add New Medical Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={newHistoryEntry.date}
                  onChange={handleHistoryEntryChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <input
                  type="text"
                  name="doctor"
                  value={newHistoryEntry.doctor}
                  onChange={handleHistoryEntryChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Doctor's name"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={newHistoryEntry.diagnosis}
                onChange={handleHistoryEntryChange}
                className="w-full p-2 border rounded-md"
                placeholder="Diagnosis"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment
              </label>
              <textarea
                name="treatment"
                value={newHistoryEntry.treatment}
                onChange={handleHistoryEntryChange}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Treatment details"
              />
            </div>
            
            <button
              type="button"
              onClick={handleAddHistoryEntry}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              disabled={!newHistoryEntry.diagnosis || !newHistoryEntry.treatment}
            >
              Add Record
            </button>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Medical History</h3>
            {editedPatient.medicalHistory.length > 0 ? (
              <div className="space-y-4">
                {editedPatient.medicalHistory.map((entry, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{entry.diagnosis}</p>
                        <div className="flex text-sm text-gray-500 mt-1">
                          <p>{new Date(entry.date).toLocaleDateString()}</p>
                          {entry.doctor && <p className="ml-4">Dr. {entry.doctor}</p>}
                        </div>
                        <p className="mt-2 text-gray-700">{entry.treatment}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHistoryEntry(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove record"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No medical history records.</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-3 mt-8 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={!editedPatient.name}
        >
          Save
        </button>
      </div>
    </div>
  );
} 