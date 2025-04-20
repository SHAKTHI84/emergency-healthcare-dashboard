'use client';

import { useState, useEffect } from 'react';
import { getHospitals } from '../../services/database';
import { getUserLocation } from '../../services/maps';
import { sortHospitalsByDistance, calculateDistance } from '../../utils/helpers';
import { Hospital, HospitalStatus } from '../../types';
import GoogleMapComponent from '../../components/maps/GoogleMap';
import HospitalCard from '../../components/hospitals/HospitalCard';
import { sampleHospitals, sampleHospitalStatus } from '../../data/sampleHospitals';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'government' | 'private'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hospitals on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would fetch from the API
        // For now, we'll use sample data
        // const hospitalData = await getHospitals();
        const hospitalData = sampleHospitals;
        setHospitals(hospitalData);
        setFilteredHospitals(hospitalData);

        // Get user location
        const location = await getUserLocation();
        if (location) {
          setUserLocation(location);
          // Sort hospitals by distance from user
          setFilteredHospitals(sortHospitalsByDistance(
            hospitalData,
            location.lat,
            location.lng
          ));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hospitals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter hospitals based on search term and filter type
  useEffect(() => {
    let filtered = hospitals;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(hospital => 
        hospital.hospital_type.toLowerCase() === filterType
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(hospital => 
        hospital.name.toLowerCase().includes(term) ||
        hospital.address.toLowerCase().includes(term) ||
        hospital.services.some(service => service.toLowerCase().includes(term))
      );
    }
    
    // Sort by distance if user location is available
    if (userLocation) {
      filtered = sortHospitalsByDistance(
        filtered,
        userLocation.lat,
        userLocation.lng
      );
    }
    
    setFilteredHospitals(filtered);
  }, [hospitals, searchTerm, filterType, userLocation]);

  // Get hospital status for a given hospital
  const getHospitalStatus = (hospitalId: string) => {
    return sampleHospitalStatus[hospitalId];
  };

  // Get distance from user to hospital
  const getDistanceToHospital = (hospital: Hospital) => {
    if (!userLocation) return null;
    
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      hospital.location.latitude,
      hospital.location.longitude
    );
  };

  // Handle hospital selection from map
  const handleHospitalSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    
    // Scroll to selected hospital card
    const element = document.getElementById(`hospital-${hospital.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Hospitals</h1>
        <p className="text-lg text-gray-600">
          Search for hospitals based on location, services, and availability.
        </p>
      </div>

      {/* Search and filter section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Hospitals
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, address, or services"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Type
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'government' | 'private')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Hospitals</option>
                <option value="government">Government Hospitals</option>
                <option value="private">Private Hospitals</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Map and hospital listing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hospital Map</h2>
            <div className="h-[500px] rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <p>Loading map...</p>
                </div>
              ) : (
                <GoogleMapComponent
                  hospitals={filteredHospitals}
                  height="500px"
                  onHospitalSelect={handleHospitalSelect}
                />
              )}
            </div>
          </div>
        </div>

        {/* Hospital listing */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hospitals</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <p>Loading hospitals...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">No hospitals found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredHospitals.map((hospital) => (
                  <div 
                    key={hospital.id} 
                    id={`hospital-${hospital.id}`}
                    className={`transition-all duration-300 ${
                      selectedHospital?.id === hospital.id
                        ? 'ring-2 ring-blue-500 transform scale-[1.02]'
                        : ''
                    }`}
                  >
                    <HospitalCard
                      hospital={hospital}
                      status={getHospitalStatus(hospital.id)}
                      distance={getDistanceToHospital(hospital) || undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 