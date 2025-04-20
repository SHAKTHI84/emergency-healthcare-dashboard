import { supabase } from '../lib/supabaseClient';
import { initializeDatabase } from '../utils/initDatabase';

export interface Emergency {
  id?: string;
  emergency_type: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  reporter_name: string;
  contact_number: string;
  requires_ambulance: boolean;
  status?: string;
  user_id?: string;
  patient_unique_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Function to check if database is initialized
async function ensureDatabaseInitialized(): Promise<boolean> {
  try {
    await initializeDatabase();
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

export async function createEmergency(data: Omit<Emergency, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<{ success: boolean; error?: any }> {
  try {
    console.log('Attempting to create emergency with data:', data);
    
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with createEmergency despite database initialization failure.');
    }
    
    // Validate data to prevent test reports
    const isTestReport = 
      data.location?.toLowerCase().includes('test') || 
      data.description?.toLowerCase().includes('test') ||
      data.reporter_name?.toLowerCase().includes('test') ||
      data.emergency_type?.toLowerCase().includes('test');
      
    if (isTestReport && data.reporter_name?.toLowerCase() !== 'emergency user') {
      return {
        success: false,
        error: 'Test reports are not allowed. Please submit real emergency information.'
      };
    }
    
    // Validate required fields
    if (!data.emergency_type || !data.location || !data.reporter_name) {
      return {
        success: false,
        error: 'Emergency type, location, and reporter name are required fields.'
      };
    }
    
    // Now try to insert the data
    const { error } = await supabase
      .from('emergencies')
      .insert([{
        emergency_type: data.emergency_type,
        location: data.location,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        description: data.description || '',
        reporter_name: data.reporter_name,
        contact_number: data.contact_number || '',
        requires_ambulance: !!data.requires_ambulance,
        status: 'pending',
        user_id: data.user_id || null,
        patient_unique_id: data.patient_unique_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creating emergency:', error);
      return { 
        success: false, 
        error: `Failed to submit: ${error.message}. Please try again.` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in createEmergency:', error);
    return { 
      success: false, 
      error: `System error: ${error.message || 'Unknown error'}. Please try again.` 
    };
  }
}

export async function getEmergencies(): Promise<Emergency[]> {
  try {
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with getEmergencies despite database initialization failure.');
    }
    
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching emergencies:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getEmergencies:', error);
    return [];
  }
}

export const getUserEmergencies = async (userId: string): Promise<Emergency[]> => {
  try {
    if (!userId) {
      console.error('getUserEmergencies called with empty userId');
      return [];
    }
    
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with getUserEmergencies despite database initialization failure.');
    }
    
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user emergencies:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserEmergencies:', error);
    return [];
  }
};

export const getPatientEmergencies = async (patientId: string): Promise<Emergency[]> => {
  try {
    if (!patientId) {
      console.error('getPatientEmergencies called with empty patientId');
      return [];
    }
    
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with getPatientEmergencies despite database initialization failure.');
    }
    
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .eq('patient_unique_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patient emergencies:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPatientEmergencies:', error);
    return [];
  }
};

export async function updateEmergencyStatus(id: string, status: string): Promise<{ success: boolean; error?: any }> {
  try {
    if (!id) {
      return { success: false, error: 'Emergency ID is required' };
    }
    
    if (!status) {
      return { success: false, error: 'Status is required' };
    }
    
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with updateEmergencyStatus despite database initialization failure.');
    }
    
    const { error } = await supabase
      .from('emergencies')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating emergency status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateEmergencyStatus:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteEmergency(id: string): Promise<{ success: boolean; error?: any }> {
  try {
    if (!id) {
      return { success: false, error: 'Emergency ID is required' };
    }
    
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with deleteEmergency despite database initialization failure.');
    }
    
    const { error } = await supabase
      .from('emergencies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting emergency:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteEmergency:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteMultipleEmergencies(ids: string[]): Promise<{ success: boolean; error?: any }> {
  try {
    if (!ids || ids.length === 0) {
      return { success: false, error: 'No emergency IDs provided' };
    }
    
    console.log(`Attempting to delete ${ids.length} emergency records with IDs:`, ids);
    
    // Ensure database is initialized
    const dbInitialized = await ensureDatabaseInitialized();
    if (!dbInitialized) {
      console.warn('Proceeding with deleteMultipleEmergencies despite database initialization failure.');
    }
    
    // For large batches, split into smaller chunks to avoid query size limitations
    const chunkSize = 50; // Adjust based on your database limitations
    let failedIds: string[] = [];
    let successCount = 0;
    
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      console.log(`Processing deletion chunk ${i/chunkSize + 1}, with ${chunk.length} IDs`);
      
      const { error, count } = await supabase
        .from('emergencies')
        .delete()
        .in('id', chunk)
        .select('id');
      
      if (error) {
        console.error(`Error deleting chunk ${i/chunkSize + 1}:`, error);
        failedIds = [...failedIds, ...chunk];
      } else {
        console.log(`Successfully deleted ${count} records in chunk ${i/chunkSize + 1}`);
        successCount += count || 0;
      }
    }
    
    if (failedIds.length > 0) {
      console.error(`Failed to delete ${failedIds.length} emergency records`);
      return { 
        success: successCount > 0, 
        error: `Failed to delete ${failedIds.length} emergency records. ${successCount} records were deleted successfully.` 
      };
    }

    console.log(`Successfully deleted all ${successCount} emergency records`);
    return { success: true };
  } catch (error) {
    console.error('Error in deleteMultipleEmergencies:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 