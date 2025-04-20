'use client';

import { useState, useEffect } from 'react';
import { Hospital, HospitalStatus } from '../../types';
import { updateHospitalStatus } from '../../services/database';
import { formatDate } from '../../utils/helpers';

interface UpdateHospitalStatusFormProps {
  hospital: Hospital;
  initialStatus?: HospitalStatus;
}

export default function UpdateHospitalStatusForm({
  hospital,
  initialStatus,
}: UpdateHospitalStatusFormProps) {
  const [totalBeds, setTotalBeds] = useState(initialStatus?.total_beds || 0);
  const [availableBeds, setAvailableBeds] = useState(initialStatus?.available_beds || 0);
  const [icuTotal, setIcuTotal] = useState(initialStatus?.icu_total || 0);
  const [icuAvailable, setIcuAvailable] = useState(initialStatus?.icu_available || 0);
  const [oxygenAvailability, setOxygenAvailability] = useState<'high' | 'medium' | 'low' | 'critical'>(
    initialStatus?.oxygen_availability || 'medium'
  );
  const [ventilatorsTotal, setVentilatorsTotal] = useState(initialStatus?.ventilators_total || 0);
  const [ventilatorsAvailable, setVentilatorsAvailable] = useState(initialStatus?.ventilators_available || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialStatus?.updated_at || null);

  // Update form when initialStatus changes
  useEffect(() => {
    if (initialStatus) {
      setTotalBeds(initialStatus.total_beds);
      setAvailableBeds(initialStatus.available_beds);
      setIcuTotal(initialStatus.icu_total);
      setIcuAvailable(initialStatus.icu_available);
      setOxygenAvailability(initialStatus.oxygen_availability);
      setVentilatorsTotal(initialStatus.ventilators_total);
      setVentilatorsAvailable(initialStatus.ventilators_available);
      setLastUpdated(initialStatus.updated_at);
    }
  }, [initialStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Validate input
    if (availableBeds > totalBeds) {
      setError('Available beds cannot exceed total beds');
      setIsLoading(false);
      return;
    }

    if (icuAvailable > icuTotal) {
      setError('Available ICU beds cannot exceed total ICU beds');
      setIsLoading(false);
      return;
    }

    if (ventilatorsAvailable > ventilatorsTotal) {
      setError('Available ventilators cannot exceed total ventilators');
      setIsLoading(false);
      return;
    }

    try {
      const statusData = {
        hospital_id: hospital.id,
        total_beds: totalBeds,
        available_beds: availableBeds,
        icu_total: icuTotal,
        icu_available: icuAvailable,
        oxygen_availability: oxygenAvailability,
        ventilators_total: ventilatorsTotal,
        ventilators_available: ventilatorsAvailable,
      };

      const updatedStatus = await updateHospitalStatus(statusData);
      setSuccess(true);
      setLastUpdated(updatedStatus.updated_at);
    } catch (err: any) {
      setError(err.message || 'Failed to update hospital status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Update Hospital Status</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Update the current status of {hospital.name} to reflect bed availability and resources.</p>
          {lastUpdated && (
            <p className="mt-1">
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Status updated successfully</h3>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="total-beds" className="block text-sm font-medium text-gray-700">
                Total Beds
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="total-beds"
                  id="total-beds"
                  min="0"
                  value={totalBeds}
                  onChange={(e) => setTotalBeds(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="available-beds" className="block text-sm font-medium text-gray-700">
                Available Beds
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="available-beds"
                  id="available-beds"
                  min="0"
                  max={totalBeds}
                  value={availableBeds}
                  onChange={(e) => setAvailableBeds(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="icu-total" className="block text-sm font-medium text-gray-700">
                Total ICU Beds
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="icu-total"
                  id="icu-total"
                  min="0"
                  value={icuTotal}
                  onChange={(e) => setIcuTotal(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="icu-available" className="block text-sm font-medium text-gray-700">
                Available ICU Beds
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="icu-available"
                  id="icu-available"
                  min="0"
                  max={icuTotal}
                  value={icuAvailable}
                  onChange={(e) => setIcuAvailable(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="ventilators-total" className="block text-sm font-medium text-gray-700">
                Total Ventilators
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="ventilators-total"
                  id="ventilators-total"
                  min="0"
                  value={ventilatorsTotal}
                  onChange={(e) => setVentilatorsTotal(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="ventilators-available" className="block text-sm font-medium text-gray-700">
                Available Ventilators
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="ventilators-available"
                  id="ventilators-available"
                  min="0"
                  max={ventilatorsTotal}
                  value={ventilatorsAvailable}
                  onChange={(e) => setVentilatorsAvailable(parseInt(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="oxygen-availability" className="block text-sm font-medium text-gray-700">
                Oxygen Availability
              </label>
              <div className="mt-1">
                <select
                  id="oxygen-availability"
                  name="oxygen-availability"
                  value={oxygenAvailability}
                  onChange={(e) => setOxygenAvailability(e.target.value as 'high' | 'medium' | 'low' | 'critical')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 