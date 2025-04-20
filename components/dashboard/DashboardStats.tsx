'use client';

import { useState } from 'react';
import { Hospital, HospitalStatus, Emergency } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStatsProps {
  hospitals: Hospital[];
  hospitalStatuses: HospitalStatus[];
  emergencies: Emergency[];
}

export default function DashboardStats({
  hospitals,
  hospitalStatuses,
  emergencies,
}: DashboardStatsProps) {
  const [chartView, setChartView] = useState<'beds' | 'emergencies'>('beds');

  // Calculate bed availability data
  const bedAvailabilityData = hospitalStatuses.map((status) => {
    const hospital = hospitals.find((h) => h.id === status.hospital_id);
    return {
      name: hospital?.name || status.hospital_id,
      totalBeds: status.total_beds,
      availableBeds: status.available_beds,
      icuTotal: status.icu_total,
      icuAvailable: status.icu_available,
    };
  });

  // Calculate emergency type distribution
  const emergencyTypeDistribution = emergencies.reduce((acc: { [key: string]: number }, emergency) => {
    acc[emergency.type] = (acc[emergency.type] || 0) + 1;
    return acc;
  }, {});

  const emergencyTypeData = Object.entries(emergencyTypeDistribution).map(([type, count]) => ({
    name: type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    value: count,
  }));

  // Calculate emergency status distribution
  const emergencyStatusDistribution = emergencies.reduce((acc: { [key: string]: number }, emergency) => {
    acc[emergency.status] = (acc[emergency.status] || 0) + 1;
    return acc;
  }, {});

  const emergencyStatusData = Object.entries(emergencyStatusDistribution).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#8DD1E1'];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Statistics</h2>
        <div className="mt-3 sm:mt-0">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setChartView('beds')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium ${
                chartView === 'beds'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Bed Availability
            </button>
            <button
              type="button"
              onClick={() => setChartView('emergencies')}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium ${
                chartView === 'emergencies'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Emergencies
            </button>
          </div>
        </div>
      </div>

      {chartView === 'beds' ? (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Hospital Bed Availability</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bedAvailabilityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalBeds" name="Total Beds" fill="#8884d8" />
                  <Bar dataKey="availableBeds" name="Available Beds" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">ICU Bed Availability</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bedAvailabilityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="icuTotal" name="Total ICU Beds" fill="#8884d8" />
                  <Bar dataKey="icuAvailable" name="Available ICU Beds" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Types</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emergencyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emergencyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emergencyStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emergencyStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Reported'
                            ? '#FF8042'
                            : entry.name === 'Responding'
                            ? '#FFBB28'
                            : '#00C49F'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} cases`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-blue-800 truncate">Total Hospitals</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-900">{hospitals.length}</dd>
            </dl>
          </div>
        </div>

        <div className="bg-green-50 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-green-800 truncate">Available Beds</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-900">
                {hospitalStatuses.reduce((sum, status) => sum + status.available_beds, 0)}
              </dd>
            </dl>
          </div>
        </div>

        <div className="bg-red-50 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-red-800 truncate">Active Emergencies</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-900">
                {emergencies.filter((e) => e.status !== 'resolved').length}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 