// User Types
export type UserRole = 'public' | 'patient' | 'healthcare_provider' | 'hospital_admin' | 'government_official';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
}

// Hospital Types
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hospital_type: string;
  location: {
    latitude: number;
    longitude: number;
  };
  updated_at: string;
  updated_by: string;
  services: string[];
  is_active: boolean;
}

export interface HospitalStatus {
  hospital_id: string;
  total_beds: number;
  available_beds: number;
  icu_total: number;
  icu_available: number;
  oxygen_availability: 'high' | 'medium' | 'low' | 'critical';
  ventilators_total: number;
  ventilators_available: number;
  updated_at: string;
}

// Emergency Types
export type EmergencyType = 
  | 'medical' 
  | 'accident' 
  | 'fire' 
  | 'natural_disaster' 
  | 'crime' 
  | 'other';

export interface Emergency {
  id: string;
  type: EmergencyType;
  description: string;
  reporter_id?: string;
  reporter_name?: string;
  reporter_phone: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'reported' | 'responding' | 'resolved';
  created_at: string;
  updated_at: string;
  responding_agencies?: string[];
}

// Alert Types
export type AlertType = 
  | 'health' 
  | 'weather' 
  | 'disaster' 
  | 'traffic' 
  | 'safety' 
  | 'other';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issued_by: string;
  target_areas: string[];
  start_time: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Emergency Contact Types
export interface EmergencyContact {
  id: string;
  name: string;
  category: string;
  phone_numbers: string[];
  description?: string;
  state?: string;
  city?: string;
  is_national: boolean;
} 