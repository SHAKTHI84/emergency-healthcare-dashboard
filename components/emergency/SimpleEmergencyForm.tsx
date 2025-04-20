'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function SimpleEmergencyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    emergency_type: 'Medical Emergency',
    location: 'Test Location',
    description: 'Test Emergency',
    reporter_name: 'Test User',
    contact_number: '1234567890',
    requires_ambulance: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting data directly to Supabase:', formData);

      // Submit the emergency directly - Supabase will create the table if it doesn't exist
      const { data, error: insertError } = await supabase
        .from('emergencies')
        .insert([
          { 
            ...formData,
            // Add latitude and longitude for completeness
            latitude: 0,
            longitude: 0,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (insertError) {
        console.error('Error inserting data:', insertError);
        setError(`Failed to submit: ${insertError.message}`);
      } else {
        console.log('Submission successful:', data);
        router.push('/emergency-reported');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Simple Emergency Form (Test)</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Emergency Type</label>
          <select 
            name="emergency_type" 
            value={formData.emergency_type} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Medical Emergency">Medical Emergency</option>
            <option value="Traffic Accident">Traffic Accident</option>
            <option value="Fire">Fire</option>
            <option value="Natural Disaster">Natural Disaster</option>
            <option value="Crime/Violence">Crime/Violence</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-1">Location</label>
          <input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block mb-1">Your Name</label>
          <input 
            type="text" 
            name="reporter_name" 
            value={formData.reporter_name} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Contact Number</label>
          <input 
            type="text" 
            name="contact_number" 
            value={formData.contact_number} 
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            name="requires_ambulance" 
            checked={formData.requires_ambulance} 
            onChange={handleChange}
            id="requires_ambulance"
            className="mr-2"
          />
          <label htmlFor="requires_ambulance">Requires Ambulance</label>
        </div>
        
        <button 
          type="submit" 
          className={`w-full p-2 text-white rounded ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Emergency (Test)'}
        </button>
      </form>
    </div>
  );
} 