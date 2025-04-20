import { supabase } from '../lib/supabaseClient';
import { initializeDatabase } from '../utils/initDatabase';

export interface HealthMetrics {
  bloodPressure: string;
  heartRate: number;
  bloodSugar: number;
  oxygenLevel: number;
}

export interface MedicalHistoryEntry {
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
}

export interface PatientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  allergies: string[];
  medicalHistory: MedicalHistoryEntry[];
  healthMetrics: HealthMetrics;
  lastCheckup: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to ensure database is initialized
async function ensureDatabaseInitialized() {
  const result = await initializeDatabase();
  if (!result.success) {
    console.error('Failed to initialize database:', result.error);
    return false;
  }
  return true;
}

// Get a patient by email or phone - used for duplicate checking
export async function getPatientByEmailOrPhone(email: string, phone: string): Promise<PatientData | null> {
  try {
    await ensureDatabaseInitialized();
    
    // First check by email if provided
    if (email) {
      const { data: emailData, error: emailError } = await supabase
        .from('patients')
        .select('*')
        .eq('email', email)
        .single();
        
      if (emailData && !emailError) {
        return transformPatientData(emailData);
      }
    }
    
    // Then check by phone if provided
    if (phone) {
      const { data: phoneData, error: phoneError } = await supabase
        .from('patients')
        .select('*')
        .eq('phone', phone)
        .single();
        
      if (phoneData && !phoneError) {
        return transformPatientData(phoneData);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in getPatientByEmailOrPhone:', error);
    return null;
  }
}

// Transform database record to PatientData object
function transformPatientData(data: any): PatientData {
  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    bloodType: data.blood_type || '',
    allergies: data.allergies || [],
    medicalHistory: data.medical_history || [],
    healthMetrics: data.health_metrics || {
      bloodPressure: '',
      heartRate: 0,
      bloodSugar: 0,
      oxygenLevel: 0
    },
    lastCheckup: data.last_checkup || '',
    createdAt: data.created_at || '',
    updatedAt: data.updated_at || ''
  };
}

export async function getPatients(): Promise<PatientData[]> {
  try {
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with getPatients despite database initialization failure.');
    }
    
    // Get all patients
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
    
    // Transform data to match our interface
    return (data || []).map(transformPatientData);
  } catch (error) {
    console.error('Error in getPatients:', error);
    return [];
  }
}

export async function getPatientById(id: string): Promise<PatientData | null> {
  try {
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with getPatientById despite database initialization failure.');
    }
    
    if (!id) {
      console.error('getPatientById called with empty ID');
      return null;
    }
    
    console.log('Fetching patient data for ID:', id);
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      // If the error indicates no rows were returned, that's not a critical error
      if (error.code === 'PGRST116') {
        console.log(`No patient found with ID: ${id}`);
        return null;
      }
      
      console.error('Error fetching patient:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    const patientData = transformPatientData(data);
    console.log('Retrieved patient data:', patientData);
    return patientData;
  } catch (error) {
    console.error('Error in getPatientById:', error);
    return null;
  }
}

export async function createPatient(patient: Omit<PatientData, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: any }> {
  try {
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with createPatient despite database initialization failure.');
    }
    
    if (!patient.name) {
      return { success: false, error: 'Patient name is required' };
    }
    
    // Check for duplicate email or phone
    if (patient.email || patient.phone) {
      const existingPatient = await getPatientByEmailOrPhone(patient.email, patient.phone);
      if (existingPatient) {
        return { 
          success: false, 
          error: `A patient with this ${patient.email ? 'email' : 'phone number'} already exists.` 
        };
      }
    }
    
    // Prepare data for insertion
    const patientData = {
      name: patient.name,
      email: patient.email || '',
      phone: patient.phone || '',
      blood_type: patient.bloodType || '',
      allergies: patient.allergies || [],
      medical_history: patient.medicalHistory || [],
      health_metrics: patient.healthMetrics || {
        bloodPressure: '',
        heartRate: 0,
        bloodSugar: 0,
        oxygenLevel: 0
      },
      last_checkup: patient.lastCheckup || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating patient:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Error in createPatient:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updatePatient(
  patientOrUserId: PatientData | string,
  patientUpdate?: Partial<PatientData>
): Promise<{ success: boolean; error?: any } | PatientData | null> {
  try {
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with updatePatient despite database initialization failure.');
    }
    
    // Case 1: Called with full patient object (original implementation)
    if (typeof patientOrUserId !== 'string') {
      const patient = patientOrUserId;
      if (!patient.id) {
        return { success: false, error: 'Patient ID is required for update' };
      }
      
      console.log('Updating patient with ID:', patient.id);
      
      // Ensure healthMetrics is properly formatted with defaults for missing values
      const healthMetrics = {
        bloodPressure: patient.healthMetrics?.bloodPressure || '',
        heartRate: patient.healthMetrics?.heartRate || 0,
        bloodSugar: patient.healthMetrics?.bloodSugar || 0,
        oxygenLevel: patient.healthMetrics?.oxygenLevel || 0
      };
      
      // Prepare data for update
      const patientData = {
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        blood_type: patient.bloodType || '',
        allergies: patient.allergies || [],
        medical_history: patient.medicalHistory || [],
        health_metrics: healthMetrics,
        last_checkup: patient.lastCheckup || null,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating patient with data:', patientData);
      
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patient.id)
        .select();
        
      if (error) {
        console.error('Error updating patient:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Patient updated successfully:', data);
      return { success: true };
    } 
    // Case 2: Called with userId and partial patient data
    else if (patientUpdate) {
      const userId = patientOrUserId;
      
      if (!userId) {
        return null;
      }
      
      console.log('Updating patient with user ID:', userId);
      
      // First check if the patient exists
      const existingPatient = await getPatientById(userId);
      
      if (!existingPatient) {
        console.log('No existing patient found, creating new patient record');
        // Create a new patient record
        
        // Ensure healthMetrics is properly formatted
        const healthMetrics = {
          bloodPressure: patientUpdate.healthMetrics?.bloodPressure || '',
          heartRate: patientUpdate.healthMetrics?.heartRate || 0,
          bloodSugar: patientUpdate.healthMetrics?.bloodSugar || 0,
          oxygenLevel: patientUpdate.healthMetrics?.oxygenLevel || 0
        };
        
        const newPatient = {
          name: patientUpdate.name || 'New Patient',
          email: patientUpdate.email || '',
          phone: patientUpdate.phone || '',
          bloodType: patientUpdate.bloodType || '',
          allergies: patientUpdate.allergies || [],
          medicalHistory: patientUpdate.medicalHistory || [],
          healthMetrics: healthMetrics,
          lastCheckup: patientUpdate.lastCheckup || ''
        };
        
        // Create the patient
        const createResult = await createPatient(newPatient);
        if (!createResult.success) {
          console.error('Failed to create new patient record:', createResult.error);
          return null;
        }
        
        // Fetch the newly created patient
        const newlyCreatedPatient = createResult.id ? await getPatientById(createResult.id) : null;
        return newlyCreatedPatient;
      } else {
        console.log('Existing patient found, updating record');
        // We already have a patient record, update it with the new data
        
        // Create a merged healthMetrics object that preserves existing values
        const healthMetrics = {
          bloodPressure: patientUpdate.healthMetrics?.bloodPressure ?? existingPatient.healthMetrics?.bloodPressure ?? '',
          heartRate: patientUpdate.healthMetrics?.heartRate ?? existingPatient.healthMetrics?.heartRate ?? 0,
          bloodSugar: patientUpdate.healthMetrics?.bloodSugar ?? existingPatient.healthMetrics?.bloodSugar ?? 0,
          oxygenLevel: patientUpdate.healthMetrics?.oxygenLevel ?? existingPatient.healthMetrics?.oxygenLevel ?? 0
        };
        
        // Start with existing patient data
        const updatedPatientData: PatientData = {
          ...existingPatient,
          // Selectively override with update data
          name: patientUpdate.name ?? existingPatient.name,
          email: patientUpdate.email ?? existingPatient.email,
          phone: patientUpdate.phone ?? existingPatient.phone,
          bloodType: patientUpdate.bloodType ?? existingPatient.bloodType,
          // For arrays, use update if provided, otherwise keep existing
          allergies: patientUpdate.allergies ?? existingPatient.allergies,
          medicalHistory: patientUpdate.medicalHistory ?? existingPatient.medicalHistory,
          // Use merged health metrics
          healthMetrics: healthMetrics,
          lastCheckup: patientUpdate.lastCheckup ?? existingPatient.lastCheckup,
          updatedAt: new Date().toISOString()
        };
        
        // Convert from our API format to database format
        const dbFormatData = {
          name: updatedPatientData.name || '',
          email: updatedPatientData.email || '',
          phone: updatedPatientData.phone || '',
          blood_type: updatedPatientData.bloodType || '',
          allergies: updatedPatientData.allergies || [],
          medical_history: updatedPatientData.medicalHistory || [],
          health_metrics: updatedPatientData.healthMetrics || {
            bloodPressure: '',
            heartRate: 0,
            bloodSugar: 0,
            oxygenLevel: 0
          },
          last_checkup: updatedPatientData.lastCheckup || null,
          updated_at: new Date().toISOString()
        };
        
        console.log('Updating with database format:', dbFormatData);
        
        // Update the patient directly
        const { data, error } = await supabase
          .from('patients')
          .update(dbFormatData)
          .eq('id', existingPatient.id)
          .select();
          
        if (error) {
          console.error('Error updating patient:', error);
          return null;
        }
        
        console.log('Patient updated successfully:', data);
        
        // Fetch the fresh data to ensure we have the latest
        return await getPatientById(existingPatient.id);
      }
    }
    
    return null; // Fallback for unexpected case
  } catch (error) {
    console.error('Error in updatePatient:', error);
    if (typeof patientOrUserId !== 'string') {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
    return null;
  }
}

export async function deletePatient(id: string): Promise<{ success: boolean; error?: any }> {
  try {
    if (!id) {
      return { success: false, error: 'Patient ID is required for deletion' };
    }
    
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting patient:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deletePatient:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 