'use client';

import { useState } from 'react';
import { AlertType } from '../../types';
import { createAlert } from '../../services/database';
import { sendSMS } from '../../services/notifications';

interface BroadcastAlertFormProps {
  userFullName: string;
}

export default function BroadcastAlertForm({ userFullName }: BroadcastAlertFormProps) {
  const [alertType, setAlertType] = useState<AlertType>('health');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [targetAreas, setTargetAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [sendSMSAlert, setSendSMSAlert] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alertTypes: { value: AlertType; label: string }[] = [
    { value: 'health', label: 'Health Alert' },
    { value: 'weather', label: 'Weather Alert' },
    { value: 'disaster', label: 'Disaster Alert' },
    { value: 'traffic', label: 'Traffic Alert' },
    { value: 'safety', label: 'Safety Alert' },
    { value: 'other', label: 'Other' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const handleAddArea = () => {
    if (areaInput.trim() && !targetAreas.includes(areaInput.trim())) {
      setTargetAreas([...targetAreas, areaInput.trim()]);
      setAreaInput('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setTargetAreas(targetAreas.filter((a) => a !== area));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title || !description) {
      setError('Title and description are required');
      setIsLoading(false);
      return;
    }

    try {
      const now = new Date().toISOString();
      const alertData = {
        type: alertType,
        title,
        description,
        severity,
        issued_by: userFullName,
        target_areas: targetAreas.length > 0 ? targetAreas : ['All Areas'],
        start_time: startTime || now,
        end_time: endTime || undefined,
        is_active: true,
      };

      // Create alert in the database
      const createdAlert = await createAlert(alertData);

      // Send SMS if requested
      if (sendSMSAlert && phoneNumbers.trim()) {
        const numbers = phoneNumbers
          .split(',')
          .map((num) => num.trim())
          .filter((num) => num);

        // In a real implementation, this would be done in batches and through a secure server endpoint
        for (const number of numbers) {
          try {
            await sendSMS(
              number,
              `ALERT: ${severity.toUpperCase()} - ${title}. ${description}`
            );
          } catch (smsError) {
            console.error(`Error sending SMS to ${number}:`, smsError);
          }
        }
      }

      setSuccess(true);
      // Reset form
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setTargetAreas([]);
      setStartTime('');
      setEndTime('');
      setSendSMSAlert(false);
      setPhoneNumbers('');
    } catch (err: any) {
      setError(err.message || 'Failed to broadcast alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Broadcast Alert</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Create and broadcast emergency alerts to the public. These alerts will appear on the
            dashboard and can be sent via SMS.
          </p>
        </div>

        {success ? (
          <div className="mt-5 rounded-md bg-green-50 p-4">
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
                <h3 className="text-sm font-medium text-green-800">Alert broadcast successfully</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your alert has been broadcast and is now active. {sendSMSAlert && 'SMS notifications have been sent.'}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                  >
                    Create another alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="alert-type" className="block text-sm font-medium text-gray-700">
                  Alert Type
                </label>
                <div className="mt-1">
                  <select
                    id="alert-type"
                    name="alert-type"
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as AlertType)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {alertTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                  Severity Level
                </label>
                <div className="mt-1">
                  <select
                    id="severity"
                    name="severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {severityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Alert Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Brief title for the alert"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Alert Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Detailed description of the alert"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="target-areas" className="block text-sm font-medium text-gray-700">
                  Target Areas
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    name="target-areas"
                    id="target-areas"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    placeholder="Add city, district, or state"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddArea}
                    className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
                {targetAreas.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {targetAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex rounded-full items-center py-0.5 pl-2.5 pr-1 text-sm font-medium bg-blue-100 text-blue-700"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemoveArea(area)}
                          className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                        >
                          <span className="sr-only">Remove {area}</span>
                          <svg
                            className="h-2 w-2"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 8 8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeWidth="1.5"
                              d="M1 1l6 6m0-6L1 7"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to broadcast to all areas
                </p>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    name="start-time"
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to start immediately
                </p>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    name="end-time"
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty for indefinite alert
                </p>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="send-sms"
                      name="send-sms"
                      type="checkbox"
                      checked={sendSMSAlert}
                      onChange={(e) => setSendSMSAlert(e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="send-sms" className="font-medium text-gray-700">
                      Send SMS Alert
                    </label>
                    <p className="text-gray-500">
                      Send this alert via SMS to specified phone numbers
                    </p>
                  </div>
                </div>
              </div>

              {sendSMSAlert && (
                <div className="sm:col-span-6">
                  <label htmlFor="phone-numbers" className="block text-sm font-medium text-gray-700">
                    Phone Numbers (comma separated)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="phone-numbers"
                      name="phone-numbers"
                      rows={3}
                      value={phoneNumbers}
                      onChange={(e) => setPhoneNumbers(e.target.value)}
                      placeholder="e.g., +911234567890, +911234567891"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Broadcasting...' : 'Broadcast Alert'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 