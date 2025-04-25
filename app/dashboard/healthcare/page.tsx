'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { initializeDatabase } from '../../../utils/initDatabase';
import { Emergency, getEmergencies, updateEmergencyStatus, deleteEmergency, deleteMultipleEmergencies } from '../../../services/emergency';
import PatientDetails from '../../../components/healthcare/PatientDetails';
import PatientEditor from '../../../components/healthcare/PatientEditor';
import { PatientData, getPatients } from '../../../services/patients';

// This component helps us prevent the emergency crisis button from rendering
// by setting a specific data attribute that can be detected by the crisis button component
function HealthcareLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add a class to the document body to identify this as a healthcare dashboard
    document.body.setAttribute('data-dashboard-type', 'healthcare');
    
    // Clean up on unmount
    return () => {
      document.body.removeAttribute('data-dashboard-type');
    };
  }, []);
  
  return <>{children}</>;
}

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
        return 'badge badge-pending';
      case 'in_progress':
        return 'badge badge-in-progress';
      case 'completed':
        return 'badge badge-completed';
      case 'cancelled':
        return 'badge badge-critical';
      default:
        return 'badge bg-gray-100 text-gray-800 border border-gray-300';
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

  // Add new function to handle patient deletion
  const handleDeletePatient = async (id: string, event: React.MouseEvent) => {
    // Stop propagation to prevent opening the patient details when clicking delete
    event.stopPropagation();
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete the patient from the database
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Refresh patients list
      const data = await getPatients();
      setPatients(data);
      
      // Show success message
      alert('Patient deleted successfully');
    } catch (err) {
      console.error('Error deleting patient:', err);
      alert('Failed to delete patient. Please try again.');
    }
  };

  // Add function to handle editing a patient
  const handleEditPatient = (patient: PatientData, event: React.MouseEvent) => {
    // Stop propagation to prevent opening the patient details when clicking edit
    event.stopPropagation();
    
    // Set the selected patient to open the editor
    setSelectedPatient(patient);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-secondary-light text-secondary-dark rounded-md">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <HealthcareLayout>
      <div className="page-container">
        <h1 className="text-2xl font-bold mb-8 text-black text-black-important">
          <span className="text-primary">MedEmergency</span> Healthcare Dashboard
        </h1>
        
        {/* Dashboard Tabs */}
        <div className="tabs mb-8">
          <button
            className={`tab ${activeTab === 'emergencies' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergencies')}
          >
            Emergencies
          </button>
          <button
            className={`tab ${activeTab === 'patients' ? 'active' : ''}`}
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
            <div className="card mb-6 sticky top-0 z-10">
              <div className="card-header">
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={selectAllChecked}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-5 w-5 text-primary focus:ring-primary-light border-gray-300 rounded"
                    />
                    <label htmlFor="selectAll" className="ml-2 text-sm font-medium text-gray-700">
                      Select All
                    </label>
                  </div>
                  
                  {selectedCount > 0 && (
                    <span className="text-sm font-medium text-primary">
                      {selectedCount} emergency report{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {selectedCount > 0 && (
                    <button
                      onClick={handleDeleteSelectedMultiple}
                      className="btn btn-danger btn-icon"
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
                    className="btn btn-outline-primary btn-icon"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
              
              {selectedCount > 0 && (
                <div className="card-footer bg-primary-light">
                  <p className="text-primary-dark text-sm font-medium">
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
                      className={`emergency-card 
                        ${isCrisis ? 'is-crisis' : ''}
                        ${isPending ? 'status-pending' : ''}
                        ${emergency.status === 'in_progress' ? 'status-in-progress' : ''}
                        ${emergency.status === 'completed' ? 'status-completed' : ''}
                        ${isSelected ? 'bg-primary-light border border-primary' : ''}
                        ${isCrisis && isPending ? 'is-pending' : ''}
                      `}
                    >
                      <div className="emergency-card-header">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => emergency.id && handleToggleSelect(emergency.id)}
                            className="h-5 w-5 text-primary focus:ring-primary-light border-gray-300 rounded mr-3"
                          />
                          <span className="text-2xl mr-2">{getEmergencyTypeIcon(emergency.emergency_type || '')}</span>
                          <div>
                            <div className="emergency-type text-black-important">{emergency.emergency_type || 'Unknown'}</div>
                            <div className="emergency-location text-black-important">{emergency.location || 'Location unknown'}</div>
                          </div>
                        </div>
                        <span className={getStatusColor(emergency.status || 'pending')}>
                          {emergency.status || 'pending'}
                        </span>
                      </div>
                      
                      <div className="emergency-card-body">
                        <div className="emergency-grid">
                          <div className="emergency-grid-item">
                            <div className="emergency-grid-label">Reporter</div>
                            <div className="emergency-grid-value text-black-important">{emergency.reporter_name || 'Unknown'}</div>
                          </div>
                          <div className="emergency-grid-item">
                            <div className="emergency-grid-label">Contact</div>
                            <div className="emergency-grid-value text-black-important">{emergency.contact_number || 'N/A'}</div>
                          </div>
                          <div className="emergency-grid-item">
                            <div className="emergency-grid-label">Requires Ambulance</div>
                            <div className="emergency-grid-value text-black-important">{emergency.requires_ambulance ? 'Yes' : 'No'}</div>
                          </div>
                          <div className="emergency-grid-item">
                            <div className="emergency-grid-label">Created At</div>
                            <div className="emergency-grid-value text-black-important">{emergency.created_at ? new Date(emergency.created_at).toLocaleString() : 'Unknown'}</div>
                          </div>
                        </div>

                        {emergency.description && (
                          <div className="emergency-description">
                            <div className="emergency-description-label">Description</div>
                            <div className="emergency-description-value text-black-important">{emergency.description}</div>
                          </div>
                        )}
                      </div>

                      <div className="emergency-card-footer">
                        <select
                          className="form-control w-auto text-black-important"
                          value={emergency.status || 'pending'}
                          onChange={(e) => emergency.id && handleStatusUpdate(emergency.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        
                        <button
                          onClick={() => emergency.id && handleDeleteEmergency(emergency.id)}
                          className="btn btn-danger btn-icon"
                          title="Delete this emergency report"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="card p-6 text-center">
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
              <h2 className="text-xl font-bold text-black-important">Patient Registry</h2>
              <button 
                className="btn btn-primary"
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
                    className="patient-card"
                  >
                    <div className="patient-card-header">
                      <h3 className="patient-name text-black-important">{patient.name}</h3>
                      <div className="text-sm text-gray-600">
                        ID: {patient.id.substring(0, 8)}...
                      </div>
                    </div>
                    
                    <div className="patient-details">
                      <div className="patient-info-item">
                        <span className="patient-info-label">Email:</span>
                        <span className="patient-info-value text-black-important">{patient.email}</span>
                      </div>
                      <div className="patient-info-item">
                        <span className="patient-info-label">Phone:</span>
                        <span className="patient-info-value text-black-important">{patient.phone}</span>
                      </div>
                      <div className="patient-info-item">
                        <span className="patient-info-label">Blood Type:</span>
                        <span className="patient-info-value text-black-important">{patient.bloodType || 'Not recorded'}</span>
                      </div>
                      <div className="patient-info-item">
                        <span className="patient-info-label">Last Visit:</span>
                        <span className="patient-info-value text-primary">{patient.lastCheckup ? new Date(patient.lastCheckup).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                    
                    <div className="patient-actions">
                      <button 
                        onClick={() => setSelectedPatient(patient)}
                        className="btn btn-sm btn-outline-primary btn-icon"
                        title="View patient details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        View
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPatient(patient, e);
                        }}
                        className="btn btn-sm btn-primary btn-icon"
                        title="Edit patient"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient.id, e);
                        }}
                        className="btn btn-sm btn-danger btn-icon"
                        title="Delete patient"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
                <p className="text-gray-500">Add your first patient by clicking the 'Add New Patient' button.</p>
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
              <div className="mb-4 flex items-center text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-bold text-black-important">Confirm Deletion</h3>
              </div>
              
              <p className="mb-6 text-gray-700 text-black-important">
                Are you sure you want to delete <span className="font-bold">{Object.keys(selectedEmergencies).filter(id => selectedEmergencies[id]).length}</span> emergency report{Object.keys(selectedEmergencies).filter(id => selectedEmergencies[id]).length !== 1 ? 's' : ''}? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={cancelDelete}
                  className="btn btn-outline-primary"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="btn btn-danger"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </HealthcareLayout>
  );
} 