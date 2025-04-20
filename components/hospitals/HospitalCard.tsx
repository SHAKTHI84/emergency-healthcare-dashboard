'use client';

import { Hospital, HospitalStatus } from '../../types';
import { formatDate } from '../../utils/helpers';
import Link from 'next/link';

interface HospitalCardProps {
  hospital: Hospital;
  status?: HospitalStatus;
  showDetailsLink?: boolean;
  distance?: number;
}

export default function HospitalCard({
  hospital,
  status,
  showDetailsLink = true,
  distance,
}: HospitalCardProps) {
  // Function to determine status color
  const getStatusColor = (availability: 'high' | 'medium' | 'low' | 'critical') => {
    switch (availability) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{hospital.name}</h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              hospital.hospital_type === 'Government'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {hospital.hospital_type}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-500">{hospital.address}</div>

        {distance !== undefined && (
          <div className="mt-1 text-sm text-gray-500">
            Distance: {distance.toFixed(1)} km away
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Phone: </span>
            <a href={`tel:${hospital.phone}`} className="text-blue-600 hover:text-blue-800">
              {hospital.phone}
            </a>
          </div>
          <div>
            <span className="text-gray-500">Email: </span>
            <a href={`mailto:${hospital.email}`} className="text-blue-600 hover:text-blue-800">
              {hospital.email}
            </a>
          </div>
        </div>

        {status && (
          <>
            <div className="mt-4 border-t pt-3">
              <h4 className="text-sm font-medium text-gray-900">Current Status</h4>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Beds: </span>
                  <span className="font-medium">
                    {status.available_beds} / {status.total_beds}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">ICU: </span>
                  <span className="font-medium">
                    {status.icu_available} / {status.icu_total}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Ventilators: </span>
                  <span className="font-medium">
                    {status.ventilators_available} / {status.ventilators_total}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Oxygen: </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      status.oxygen_availability
                    )}`}
                  >
                    {status.oxygen_availability.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Last updated: {formatDate(status.updated_at)}
              </div>
            </div>
          </>
        )}

        <div className="mt-4 flex justify-between">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.latitude},${hospital.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Directions
          </a>
          {showDetailsLink && (
            <Link
              href={`/hospitals/${hospital.id}`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 