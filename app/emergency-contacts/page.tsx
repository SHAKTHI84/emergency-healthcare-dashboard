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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Emergency Contacts</h1>
      <p className="mb-6">
        Important emergency contact numbers for various services across India. Filter by state to find local emergency services.
      </p>

      <div className="mb-6">
        <label htmlFor="state" className="block mb-2 font-semibold">Filter by State</label>
        <select
          id="state"
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
          defaultValue="national"
        >
          <option value="national">All India (National)</option>
          {/* Add more states as needed */}
        </select>
      </div>

      <div className="emergency-numbers">
        <h2>National Emergency Contacts</h2>
        
        {/* Search Filter */}
        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="text"
            placeholder="Search contacts by name, phone number, or description"
            className="flex-grow p-3 border border-gray-300 rounded"
          />
          <select className="p-3 border border-gray-300 rounded">
            <option>All Categories</option>
            <option>Police</option>
            <option>Medical</option>
            <option>Fire</option>
            <option>Women & Child</option>
            <option>Disaster</option>
          </select>
        </div>

        {/* Emergency Number Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="emergency-category-card category-general">
            <h3 className="emergency-category-title">All-in-one Emergency Number</h3>
            <p className="emergency-service-description">Unified emergency response number for all emergencies</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-general">National</span>
              <span className="service-category-badge badge-general">General</span>
            </div>
            <a href="tel:112" className="emergency-phone-number">112</a>
          </div>

          <div className="emergency-category-card category-police">
            <h3 className="emergency-category-title">Police</h3>
            <p className="emergency-service-description">National police emergency contact</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-law">National</span>
              <span className="service-category-badge badge-law">Law Enforcement</span>
            </div>
            <a href="tel:100" className="emergency-phone-number">100</a>
          </div>

          <div className="emergency-category-card category-medical">
            <h3 className="emergency-category-title">Ambulance</h3>
            <p className="emergency-service-description">National ambulance emergency services</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-medical">National</span>
              <span className="service-category-badge badge-medical">Medical</span>
            </div>
            <a href="tel:102" className="emergency-phone-number">102</a>
            <a href="tel:108" className="emergency-phone-number">108</a>
          </div>

          <div className="emergency-category-card category-fire">
            <h3 className="emergency-category-title">Fire Brigade</h3>
            <p className="emergency-service-description">National fire emergency services</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-fire">National</span>
              <span className="service-category-badge badge-fire">Fire</span>
            </div>
            <a href="tel:101" className="emergency-phone-number">101</a>
          </div>

          <div className="emergency-category-card category-women">
            <h3 className="emergency-category-title">Women Helpline</h3>
            <p className="emergency-service-description">National women helpline for women in distress</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-women">National</span>
              <span className="service-category-badge badge-women">Women Safety</span>
            </div>
            <a href="tel:1091" className="emergency-phone-number">1091</a>
            <a href="tel:181" className="emergency-phone-number">181</a>
          </div>

          <div className="emergency-category-card category-child">
            <h3 className="emergency-category-title">Child Helpline</h3>
            <p className="emergency-service-description">National child helpline for children in distress</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-child">National</span>
              <span className="service-category-badge badge-child">Child Safety</span>
            </div>
            <a href="tel:1098" className="emergency-phone-number">1098</a>
          </div>

          <div className="emergency-category-card category-covid">
            <h3 className="emergency-category-title">COVID-19 Helpline</h3>
            <p className="emergency-service-description">National COVID-19 helpline for information and assistance</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-health">National</span>
              <span className="service-category-badge badge-health">Health</span>
            </div>
            <a href="tel:1075" className="emergency-phone-number">1075</a>
          </div>

          <div className="emergency-category-card category-disaster">
            <h3 className="emergency-category-title">Disaster Management</h3>
            <p className="emergency-service-description">National Disaster Management Authority helpline</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-disaster">National</span>
              <span className="service-category-badge badge-disaster">Disaster</span>
            </div>
            <a href="tel:1078" className="emergency-phone-number">1078</a>
          </div>

          <div className="emergency-category-card category-senior">
            <h3 className="emergency-category-title">Senior Citizen Helpline</h3>
            <p className="emergency-service-description">National helpline for senior citizens</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-senior">National</span>
              <span className="service-category-badge badge-senior">Senior Citizens</span>
            </div>
            <a href="tel:14567" className="emergency-phone-number">14567</a>
          </div>

          <div className="emergency-category-card category-railway">
            <h3 className="emergency-category-title">Railway Protection</h3>
            <p className="emergency-service-description">Railway Protection Force helpline</p>
            <div className="flex items-center mb-2">
              <span className="service-category-badge badge-railway">National</span>
              <span className="service-category-badge badge-railway">Railway</span>
            </div>
            <a href="tel:1512" className="emergency-phone-number">1512</a>
          </div>
        </div>
      </div>

      <div className="mt-10 mb-6">
        <h2 className="text-2xl font-bold mb-4">Emergency Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Stay Calm</h3>
            <p>Try to remain calm and focused during an emergency. Take deep breaths if you feel anxious.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Provide Clear Information</h3>
            <p>Be as specific as possible about your location and the nature of the emergency.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Don't Hang Up</h3>
            <p>If you call emergency services, don't hang up until instructed to do so.</p>
          </div>
        </div>
      </div>

      {/* SOS Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="instant-emergency-sos">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          INSTANT EMERGENCY SOS
        </button>
      </div>
    </div>
  );
} 