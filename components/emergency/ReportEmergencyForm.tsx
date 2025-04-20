'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createEmergency } from '@/services/emergencies';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '../ui/LoadingSpinner';
import { CheckIcon } from '@heroicons/react/24/outline';

interface EmergencyFormData {
  emergency_type: string;
  reporter_name: string;
  contact_number: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  requires_ambulance: boolean;
  is_crisis: boolean;
}

const EMERGENCY_TYPES = [
  'Medical Emergency',
  'Accident',
  'Fire',
  'Natural Disaster',
  'Crime',
  'Other'
];

export default function ReportEmergencyForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<EmergencyFormData>({
    emergency_type: '',
    reporter_name: '',
    contact_number: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    requires_ambulance: false,
    is_crisis: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });

  useEffect(() => {
    // Clear location success after 3 seconds
    if (locationSuccess) {
      const timer = setTimeout(() => {
        setLocationSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [locationSuccess]);

  const getUserLocation = async () => {
    setLocationLoading(true);
    setErrors((prev) => ({ ...prev, location: '' }));
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      try {
        // Try to get address from coordinates
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          setFormData((prev) => ({
            ...prev,
            location: address,
            latitude,
            longitude
          }));
        } else {
          // If geocoding fails, just use the coordinates
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            latitude,
            longitude
          }));
        }
        
        setLocationSuccess(true);
      } catch (error) {
        // If geocoding fails, still use the coordinates
        setFormData((prev) => ({
          ...prev,
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          latitude,
          longitude
        }));
        setLocationSuccess(true);
      }
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      if (error.code === 1) {
        setErrors((prev) => ({
          ...prev,
          location: 'Location access denied. Please enable location services in your browser settings or enter coordinates manually.'
        }));
      } else if (error.code === 2) {
        setErrors((prev) => ({
          ...prev,
          location: 'Unable to determine your location. Please enter coordinates manually.'
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          location: 'Error getting location. Please enter coordinates manually.'
        }));
      }
      
      setShowManualCoordinates(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleManualCoordinates = () => {
    if (!manualCoords.lat || !manualCoords.lng) {
      setErrors((prev) => ({
        ...prev,
        location: 'Please enter both latitude and longitude values.'
      }));
      return;
    }
    
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErrors((prev) => ({
        ...prev,
        location: 'Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.'
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      latitude: lat,
      longitude: lng
    }));
    
    setLocationSuccess(true);
    setErrors((prev) => ({ ...prev, location: '' }));
    setShowManualCoordinates(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.emergency_type) {
      newErrors.emergency_type = 'Emergency type is required';
    }
    
    if (!formData.reporter_name) {
      newErrors.reporter_name = 'Your name is required';
    }
    
    if (!formData.contact_number) {
      newErrors.contact_number = 'Contact number is required';
    }
    
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Location coordinates are missing. Please try again or enter coordinates manually.';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the API route directly instead of the service
      const response = await fetch('/api/emergencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'pending'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to report emergency');
      }
      
      toast.success('Emergency reported successfully');
      // Redirect to confirmation page instead of dashboard
      router.push('/emergency-confirmation');
    } catch (error) {
      console.error('Error reporting emergency:', error);
      toast.error('Failed to report emergency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">Report Emergency</h2>
      
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {Object.values(errors).map((error, index) => (
            <p key={index} className="text-sm">{error}</p>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emergency_type">
            Emergency Type*
          </label>
          <select
            id="emergency_type"
            name="emergency_type"
            value={formData.emergency_type}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.emergency_type ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="">Select emergency type</option>
            {EMERGENCY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reporter_name">
            Your Name*
          </label>
          <input
            type="text"
            id="reporter_name"
            name="reporter_name"
            value={formData.reporter_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.reporter_name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contact_number">
            Contact Number*
          </label>
          <input
            type="text"
            id="contact_number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.contact_number ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="Enter your contact number"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the emergency situation"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Location*
          </label>
          
          <div className="flex items-center mb-2">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled
              className={`w-full px-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50`}
              placeholder="Your location will appear here"
            />
            
            <button
              type="button"
              onClick={getUserLocation}
              disabled={locationLoading}
              className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {locationLoading ? (
                <LoadingSpinner size="sm" />
              ) : locationSuccess ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                'Get Location'
              )}
            </button>
          </div>
          
          {errors.location && (
            <p className="text-red-500 text-xs italic">{errors.location}</p>
          )}
          
          {locationSuccess && (
            <p className="text-green-500 text-xs italic">Location successfully retrieved!</p>
          )}
          
          {!showManualCoordinates ? (
            <button
              type="button"
              onClick={() => setShowManualCoordinates(true)}
              className="text-indigo-600 text-sm hover:underline focus:outline-none"
            >
              Enter coordinates manually
            </button>
          ) : (
            <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50">
              <p className="text-sm text-gray-700 mb-2">Enter your coordinates manually:</p>
              <div className="flex space-x-2 mb-2">
                <div>
                  <label className="block text-gray-700 text-xs mb-1" htmlFor="manual-lat">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="manual-lat"
                    value={manualCoords.lat}
                    onChange={(e) => setManualCoords((prev) => ({ ...prev, lat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 40.7128"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1" htmlFor="manual-lng">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="manual-lng"
                    value={manualCoords.lng}
                    onChange={(e) => setManualCoords((prev) => ({ ...prev, lng: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. -74.0060"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleManualCoordinates}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Save Coordinates
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualCoordinates(false)}
                  className="text-gray-600 px-3 py-1 rounded-md text-sm hover:bg-gray-100 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requires_ambulance"
              name="requires_ambulance"
              checked={formData.requires_ambulance}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-gray-700" htmlFor="requires_ambulance">
              Requires Ambulance
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Report Emergency'}
          </button>
        </div>
      </form>
    </div>
  );
} 