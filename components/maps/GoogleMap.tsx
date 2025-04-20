'use client';

import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { getUserLocation } from '../../services/maps';
import { Hospital } from '../../types';

interface MapProps {
  hospitals?: Hospital[];
  emergencyLocation?: { lat: number; lng: number };
  height?: string;
  zoom?: number;
  onHospitalSelect?: (hospital: Hospital) => void;
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

// New Delhi coordinates as default center
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

export default function GoogleMapComponent({
  hospitals = [],
  emergencyLocation,
  height = '400px',
  zoom = 12,
  onHospitalSelect,
}: MapProps) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    // Get user's location
    const fetchUserLocation = async () => {
      try {
        const location = await getUserLocation();
        if (location) {
          setUserLocation(location);
          setMapCenter(location);
        }
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    };

    fetchUserLocation();
  }, []);

  useEffect(() => {
    // If emergency location is provided, center the map on it
    if (emergencyLocation) {
      setMapCenter(emergencyLocation);
    }
  }, [emergencyLocation]);

  const onLoad = (map: google.maps.Map) => {
    setMapRef(map);
  };

  const onUnmount = () => {
    setMapRef(null);
  };

  const handleMarkerClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    if (onHospitalSelect) {
      onHospitalSelect(hospital);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="h-full w-full flex items-center justify-center">Loading maps...</div>;
  }

  return (
    <div style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height }}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          zoomControl: true,
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
            title="Your Location"
          />
        )}

        {/* Emergency location marker */}
        {emergencyLocation && (
          <Marker
            position={emergencyLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
            title="Emergency Location"
          />
        )}

        {/* Hospital markers */}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={{
              lat: hospital.location.latitude,
              lng: hospital.location.longitude,
            }}
            onClick={() => handleMarkerClick(hospital)}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/hospital.png',
            }}
            title={hospital.name}
          />
        ))}

        {/* Info window for selected hospital */}
        {selectedHospital && (
          <InfoWindow
            position={{
              lat: selectedHospital.location.latitude,
              lng: selectedHospital.location.longitude,
            }}
            onCloseClick={() => setSelectedHospital(null)}
          >
            <div className="p-2 max-w-sm">
              <h3 className="font-bold text-gray-900">{selectedHospital.name}</h3>
              <p className="text-sm text-gray-600">{selectedHospital.address}</p>
              <p className="text-sm text-gray-600">{selectedHospital.phone}</p>
              <p className="text-xs mt-1 text-gray-500">
                {selectedHospital.hospital_type} Hospital
              </p>
              <button
                onClick={() => {
                  if (onHospitalSelect) {
                    onHospitalSelect(selectedHospital);
                  }
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                View Details
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
} 