import { supabase } from '../lib/supabaseClient';
import { 
  User, 
  Hospital, 
  HospitalStatus, 
  Emergency, 
  Alert, 
  EmergencyContact 
} from '../types';

// ===== User Functions =====
export const createUser = async (userData: Omit<User, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// ===== Hospital Functions =====
export const getHospitals = async () => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('is_active', true);
  
  if (error) throw error;
  return data as Hospital[];
};

export const getHospitalById = async (id: string) => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*, hospital_status(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateHospitalStatus = async (statusData: Omit<HospitalStatus, 'updated_at'>) => {
  const { data, error } = await supabase
    .from('hospital_status')
    .upsert({
      ...statusData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ===== Emergency Functions =====
export const reportEmergency = async (emergencyData: Omit<Emergency, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
  const { data, error } = await supabase
    .from('emergencies')
    .insert({
      ...emergencyData,
      status: 'reported',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getEmergencies = async (status?: 'reported' | 'responding' | 'resolved') => {
  let query = supabase.from('emergencies').select('*');
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Emergency[];
};

export const updateEmergencyStatus = async (id: string, status: 'reported' | 'responding' | 'resolved') => {
  const { data, error } = await supabase
    .from('emergencies')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ===== Alert Functions =====
export const createAlert = async (alertData: Omit<Alert, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      ...alertData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export async function getActiveAlerts(): Promise<Alert[]> {
  try {
    // For now, return an empty array as we don't have a specific alerts table yet
    // This can be expanded later when we implement a proper alerts system
    return [];
    
    // When you have an alerts table, you can use this code:
    /*
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
    */
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    return [];
  }
}

// ===== Emergency Contact Functions =====
export const getEmergencyContacts = async (state?: string) => {
  let query = supabase.from('emergency_contacts').select('*');
  
  if (state) {
    query = query.eq('state', state);
  }
  
  const { data, error } = await query.order('is_national', { ascending: false });
  
  if (error) throw error;
  return data as EmergencyContact[];
}; 