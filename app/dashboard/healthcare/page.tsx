'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { initializeDatabase } from '../../../utils/initDatabase';
import { Emergency, getEmergencies, updateEmergencyStatus, deleteEmergency, deleteMultipleEmergencies } from '../../../services/emergency';
import PatientDetails from '../../../components/healthcare/PatientDetails';
import PatientEditor from '../../../components/healthcare/PatientEditor';
import { PatientData, getPatients } from '../../../services/patients';

export default function HealthcareDashboard() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'emergencies' | 'patients'>('emergencies');
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [selectedEmergencies, setSelectedEmergencies] = useState<Record<string, boolean>>({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        setLoading(true);
        
        // First check authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          window.location.href = '/login';
          return;
        }
        
        if (!session) {
          console.log('No active session found in healthcare dashboard');
          window.location.href = '/login';
          return;
        }
        
        console.log('Healthcare dashboard - Session found:', session.user.id);
        
        // Verify user role
        const userRole = session.user.user_metadata?.role || 'patient';
        if (userRole !== 'healthcare' && userRole !== 'Healthcare Provider' && userRole !== 'healthcare_provider') {
          console.log('User does not have healthcare provider role, redirecting');
          window.location.href = '/dashboard/patient';
          return;
        }
        
        // Initialize database if needed
        await initializeDatabase();
        
        // Load emergencies
        const emergencyData = await getEmergencies();
        
        // Apply deduplication logic to handle duplicate reports
        const uniqueEmergencies = removeDuplicateEmergencies(emergencyData);
        setEmergencies(uniqueEmergencies);
        
        // Load patients
        const patientData = await getPatients();
        setPatients(patientData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();

    // Set up real-time subscription for emergencies
    const emergencySubscription = supabase
      .channel('emergency-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'emergencies' },
        async () => {
          // Reload emergencies when there's any change and apply deduplication
          const data = await getEmergencies();
          const uniqueEmergencies = removeDuplicateEmergencies(data);
          setEmergencies(uniqueEmergencies);
        }
      )
      .subscribe();
      
    // Set up real-time subscription for patients
    const patientSubscription = supabase
      .channel('patient-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'patients' },
        async () => {
          // Reload patients when there's any change
          const data = await getPatients();
          setPatients(data);
        }
      )
      .subscribe();

    return () => {
      emergencySubscription.unsubscribe();
      patientSubscription.unsubscribe();
    };
  }, []);

  // Function to remove duplicate emergency reports
  const removeDuplicateEmergencies = (emergencies: Emergency[]): Emergency[] => {
    const seen = new Map<string, Emergency>();
    
    // Sort by created_at descending so we keep the most recent duplicates
    const sorted = [...emergencies].sort((a, b) => {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
    
    // Create a composite key from important fields to identify duplicates
    sorted.forEach(emergency => {
      const timestamp = new Date(emergency.created_at || '').getTime();
      // Only consider reports within 2 minutes of each other as potential duplicates
      const timeWindow = 2 * 60 * 1000; // 2 minutes in milliseconds
      
      // Create a key to detect potential duplicates (excluding id and timestamps)
      const similarityKey = `${emergency.emergency_type}|${emergency.reporter_name}|${emergency.location}|${emergency.description}`;
      const roundedLat = emergency.latitude ? Math.round(emergency.latitude * 1000) / 1000 : null;
      const roundedLng = emergency.longitude ? Math.round(emergency.longitude * 1000) / 1000 : null;
      const locationKey = `${roundedLat}|${roundedLng}`;
      
      // Consider reports with same information and close locations as duplicates
      const existingEntry = [...seen.entries()].find(([key, existing]) => {
        const existingTimestamp = new Date(existing.created_at || '').getTime();
        const timeClose = Math.abs(timestamp - existingTimestamp) < timeWindow;
        
        // Check if it's the same reporter with similar details
        if (similarityKey === key && timeClose) {
          return true;
        }
        
        // Or check if it's at the same location with similar emergency type
        if (emergency.latitude && emergency.longitude && 
            existing.emergency_type === emergency.emergency_type && 
            locationKey === key && timeClose) {
          return true;
        }
        
        return false;
      });
      
      // If no duplicate found, add this emergency to the seen map
      if (!existingEntry) {
        seen.set(similarityKey, emergency);
        // Also track by location if we have coordinates
        if (emergency.latitude && emergency.longitude) {
          seen.set(locationKey, emergency);
        }
      }
    });
    
    // Return unique emergencies
    return Array.from(new Set(seen.values()));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getEmergencyTypeIcon = (type: string) => {
    const typeUpper = type.toUpperCase();
    if (typeUpper.includes('CRISIS')) {
      return '🚨';
    } else if (typeUpper.includes('MEDICAL')) {
      return '🏥';
    } else if (typeUpper.includes('FIRE')) {
      return '🔥';
    } else if (typeUpper.includes('ACCIDENT')) {
      return '🚗';
    } else if (typeUpper.includes('DISASTER')) {
      return '🌪️';
    } else if (typeUpper.includes('CRIME')) {
      return '👮';
    } else {
      return '⚠️';
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const result = await updateEmergencyStatus(id, newStatus);
        
      if (!result.success) {
        console.error('Error updating status:', result.error);
        return;
      }
      
      // Refresh the emergencies data
      const data = await getEmergencies();
      const uniqueEmergencies = removeDuplicateEmergencies(data);
      setEmergencies(uniqueEmergencies);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteEmergency = async (id: string) => {
    if (!confirm('Are you sure you want to delete this emergency report? This action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await deleteEmergency(id);
        
      if (!result.success) {
        console.error('Error deleting emergency:', result.error);
        return;
      }
      
      // Refresh the emergencies data
      const data = await getEmergencies();
      const uniqueEmergencies = removeDuplicateEmergencies(data);
      setEmergencies(uniqueEmergencies);
      
      // Clear the selected emergency from state
      const updatedSelected = {...selectedEmergencies};
      delete updatedSelected[id];
      setSelectedEmergencies(updatedSelected);
    } catch (err) {
      console.error('Error deleting emergency:', err);
    }
  };

  const handleToggleSelect = (emergencyId: string) => {
    setSelectedEmergencies(prev => ({
      ...prev,
      [emergencyId]: !prev[emergencyId]
    }));
    
    // Update selectAll checkbox state
    const updatedSelectedState = {
      ...selectedEmergencies,
      [emergencyId]: !selectedEmergencies[emergencyId]
    };
    
    const allSelected = emergencies.every(emergency => 
      emergency.id ? updatedSelectedState[emergency.id] : false
    );
    
    setSelectAllChecked(allSelected);
  };

  const handleSelectAll = (isSelected: boolean) => {
    setSelectAllChecked(isSelected);
    
    const newSelectedState: Record<string, boolean> = {};
    emergencies.forEach(emergency => {
      if (emergency.id) {
        newSelectedState[emergency.id] = isSelected;
      }
    });
    
    setSelectedEmergencies(newSelectedState);
  };

  const handleDeleteSelectedMultiple = () => {
    const selectedIds = Object.keys(selectedEmergencies).filter(id => selectedEmergencies[id]);
    
    if (selectedIds.length === 0) {
      alert('No emergencies selected');
      return;
    }
    
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const selectedIds = Object.keys(selectedEmergencies).filter(id => selectedEmergencies[id]);
      
      if (selectedIds.length === 0) {
        setIsDeleteModalOpen(false);
        return;
      }
      
      const result = await deleteMultipleEmergencies(selectedIds);
      
      if (result.success) {
        // Successfully deleted, update UI
        const data = await getEmergencies();
        const uniqueEmergencies = removeDuplicateEmergencies(data);
        setEmergencies(uniqueEmergencies);
        setSelectedEmergencies({});
        setSelectAllChecked(false);
      } else {
        throw new Error(result.error || 'Failed to delete emergencies');
      }
    } catch (error) {
      console.error('Error deleting emergencies:', error);
      alert(`Failed to delete emergencies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  // Sort emergencies by creation time, most recent first
  const sortedEmergencies = [...emergencies].sort((a, b) => {
    const aDate = new Date(a.created_at || '').getTime();
    const bDate = new Date(b.created_at || '').getTime();
    return bDate - aDate;
  });

  const selectedCount = Object.values(selectedEmergencies).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Healthcare Dashboard</h1>
      
      {/* Dashboard Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`py-3 px-6 font-medium ${
            activeTab === 'emergencies'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('emergencies')}
        >
          Emergencies
        </button>
        <button
          className={`py-3 px-6 font-medium ${
            activeTab === 'patients'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('patients');
            setSelectedPatient(null);
          }}
        >
          Patients
        </button>
      </div>
      
      {/* Emergency Management View */}
      {activeTab === 'emergencies' && (
        <>
          {/* Enhanced Bulk Actions Toolbar */}
          <div className="mb-6 bg-white rounded-lg shadow-md p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectAllChecked}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="selectAll" className="ml-2 text-sm font-medium text-gray-700">
                    Select All
                  </label>
                </div>
                
                {selectedCount > 0 && (
                  <span className="text-sm font-medium text-blue-600">
                    {selectedCount} emergency report{selectedCount !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                {selectedCount > 0 && (
                  <button
                    onClick={handleDeleteSelectedMultiple}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Selected
                  </button>
                )}
                
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const data = await getEmergencies();
                      const uniqueEmergencies = removeDuplicateEmergencies(data);
                      setEmergencies(uniqueEmergencies);
                    } catch (err) {
                      console.error('Error refreshing data:', err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            
            {selectedCount > 0 && (
              <div className="mt-2 p-2 bg-blue-50 text-sm rounded-md">
                <p className="text-blue-700">
                  {selectedCount} emergency report{selectedCount !== 1 ? 's' : ''} selected. 
                  You can delete multiple reports at once.
                </p>
              </div>
            )}
          </div>
        
          {/* Emergency Cards with Enhanced Selection */}
          <div className="grid gap-6">
            {sortedEmergencies.length > 0 ? (
              sortedEmergencies.map((emergency) => {
                const isCrisis = (emergency.emergency_type?.toUpperCase() || '').includes('CRISIS');
                const isPending = emergency.status === 'pending';
                const isSelected = emergency.id ? selectedEmergencies[emergency.id] || false : false;
                
                return (
                  <div
                    key={emergency.id}
                    className={`
                      bg-white rounded-lg shadow-md p-6 border transition-all duration-200
                      ${isCrisis && isPending ? 'border-red-500 shadow-red-100' : ''}
                      ${isSelected ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200'}
                      ${isCrisis && isPending ? 'animate-pulse' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => emergency.id && handleToggleSelect(emergency.id)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        />
                        <span className="text-2xl mr-2">{getEmergencyTypeIcon(emergency.emergency_type || '')}</span>
                        <div>
                          <h2 className="text-xl font-semibold">{emergency.emergency_type || 'Unknown'}</h2>
                          <p className="text-gray-600">{emergency.location || 'Location unknown'}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(emergency.status || 'pending')}`}>
                        {emergency.status || 'pending'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reporter</p>
                        <p className="text-gray-900">{emergency.reporter_name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact</p>
                        <p className="text-gray-900">{emergency.contact_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Requires Ambulance</p>
                        <p className="text-gray-900">{emergency.requires_ambulance ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created At</p>
                        <p className="text-gray-900">{emergency.created_at ? new Date(emergency.created_at).toLocaleString() : 'Unknown'}</p>
                      </div>
                    </div>

                    {emergency.description && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-gray-900 border-l-4 border-gray-200 pl-3 mt-1">{emergency.description}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <select
                        className="px-4 py-2 border rounded-md bg-white"
                        value={emergency.status || 'pending'}
                        onChange={(e) => emergency.id && handleStatusUpdate(emergency.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      
                      <button
                        onClick={() => emergency.id && handleDeleteEmergency(emergency.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                        title="Delete this emergency report"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No emergency reports</h3>
                <p className="text-gray-500">There are currently no emergency reports in the system.</p>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Patients View */}
      {activeTab === 'patients' && !selectedPatient && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold">Patient List</h2>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => {
                // Create empty patient to open new patient form
                setSelectedPatient({
                  id: '',
                  name: '',
                  email: '',
                  phone: '',
                  bloodType: '',
                  allergies: [],
                  medicalHistory: [],
                  healthMetrics: {
                    bloodPressure: '',
                    heartRate: 0,
                    bloodSugar: 0,
                    oxygenLevel: 0,
                  },
                  lastCheckup: '',
                  createdAt: '',
                  updatedAt: ''
                });
              }}
            >
              Add New Patient
            </button>
          </div>
          
          {patients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:border-blue-500"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <h3 className="text-lg font-semibold mb-2">{patient.name}</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Email: {patient.email}</p>
                    <p>Phone: {patient.phone}</p>
                    <p>Blood Type: {patient.bloodType || 'Not recorded'}</p>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">
                      Last Visit: {patient.lastCheckup ? new Date(patient.lastCheckup).toLocaleDateString() : 'Never'}
                    </span>
                    <button className="text-blue-600 hover:underline">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No patients found. Add your first patient by clicking the 'Add New Patient' button.
            </div>
          )}
        </div>
      )}
      
      {/* Patient Details View */}
      {activeTab === 'patients' && selectedPatient && (
        <PatientEditor 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
          onSave={async (updatedPatient) => {
            try {
              if (updatedPatient.id) {
                // Update existing patient
                await supabase
                  .from('patients')
                  .update({
                    name: updatedPatient.name,
                    email: updatedPatient.email,
                    phone: updatedPatient.phone,
                    bloodType: updatedPatient.bloodType,
                    allergies: updatedPatient.allergies,
                    medicalHistory: updatedPatient.medicalHistory,
                    healthMetrics: updatedPatient.healthMetrics,
                    lastCheckup: updatedPatient.lastCheckup,
                    updatedAt: new Date().toISOString()
                  })
                  .eq('id', updatedPatient.id);
              } else {
                // Create new patient
                await supabase
                  .from('patients')
                  .insert({
                    name: updatedPatient.name,
                    email: updatedPatient.email,
                    phone: updatedPatient.phone,
                    bloodType: updatedPatient.bloodType,
                    allergies: updatedPatient.allergies,
                    medicalHistory: updatedPatient.medicalHistory,
                    healthMetrics: updatedPatient.healthMetrics,
                    lastCheckup: updatedPatient.lastCheckup,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
              }
              
              // Refresh patients list
              const data = await getPatients();
              setPatients(data);
              setSelectedPatient(null);
            } catch (err) {
              console.error('Error saving patient:', err);
            }
          }}
        />
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="mb-4 flex items-center text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-bold">Confirm Deletion</h3>
            </div>
            
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete <span className="font-bold">{Object.keys(selectedEmergencies).filter(id => selectedEmergencies[id]).length}</span> emergency report{Object.keys(selectedEmergencies).filter(id => selectedEmergencies[id]).length !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 