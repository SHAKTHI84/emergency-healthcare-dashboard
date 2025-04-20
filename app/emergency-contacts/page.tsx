'use client';

import { useState } from 'react';
import { EmergencyContact } from '../../types';
import EmergencyContactList from '../../components/emergency/EmergencyContactList';
import { getAllEmergencyContacts } from '../../data/emergencyContacts';

export default function EmergencyContactsPage() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  // States in India (simplified list)
  const states = [
    'Andhra Pradesh',
    'Delhi',
    'Gujarat',
    'Karnataka',
    'Maharashtra',
    'Tamil Nadu',
    'Uttar Pradesh',
    'West Bengal',
  ];

  // Get contacts based on selected state
  const emergencyContacts = getAllEmergencyContacts(selectedState || undefined);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Emergency Contacts</h1>
        <p className="text-lg text-gray-600">
          Important emergency contact numbers for various services across India. 
          Filter by state to find local emergency services.
        </p>
      </div>

      <div className="mb-8">
        <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by State
        </label>
        <div className="max-w-xs">
          <select
            id="state-filter"
            value={selectedState || ''}
            onChange={(e) => setSelectedState(e.target.value || null)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All India (National)</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <EmergencyContactList 
            contacts={emergencyContacts}
            title={selectedState ? `Emergency Contacts - ${selectedState}` : 'National Emergency Contacts'}
          />
        </div>
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Emergency Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-blue-700 mb-2">During Medical Emergencies</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Stay calm and call the emergency number (102/108/112)</li>
              <li>Provide clear information about your location and the situation</li>
              <li>If trained, administer basic first aid until help arrives</li>
              <li>Keep emergency contact numbers saved on your phone</li>
              <li>Know the location of the nearest hospital</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-blue-700 mb-2">During Natural Disasters</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Follow evacuation orders from local authorities</li>
              <li>Have an emergency kit ready with essentials</li>
              <li>Stay updated with official alerts and warnings</li>
              <li>If possible, help vulnerable people around you</li>
              <li>Contact disaster management services (108/1078)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 