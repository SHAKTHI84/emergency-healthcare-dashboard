import { supabase } from '../lib/supabaseClient';

export interface EmergencyData {
  id?: string;
  emergency_type: string;
  reporter_name: string;
  contact_number: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  requires_ambulance: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export const createEmergency = async (data: Omit<EmergencyData, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data: emergency, error } = await supabase
      .from('emergencies')
      .insert([
        {
          ...data,
          status: data.status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return emergency;
  } catch (error) {
    console.error('Error creating emergency:', error);
    throw error;
  }
};

export const updateEmergencyStatus = async (id: string, status: EmergencyData['status']) => {
  try {
    const { data, error } = await supabase
      .from('emergencies')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating emergency status:', error);
    throw error;
  }
};

export const deleteEmergency = async (id: string) => {
  try {
    const { error } = await supabase
      .from('emergencies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting emergency:', error);
    throw error;
  }
};

export const getEmergencies = async () => {
  try {
    const { data, error } = await supabase
      .from('emergencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    throw error;
  }
}; 