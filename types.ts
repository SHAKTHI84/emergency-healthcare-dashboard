// Alert type for emergency alerts
export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Emergency type 
export interface Emergency {
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