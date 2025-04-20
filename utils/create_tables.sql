-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  blood_type TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  medical_history JSONB DEFAULT '[]'::jsonb,
  health_metrics JSONB DEFAULT '{}'::jsonb,
  last_checkup TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security for patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create patients access policy
CREATE POLICY patients_access_policy ON public.patients
  USING (true) 
  WITH CHECK (true);

-- Create emergencies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_type TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  description TEXT,
  reporter_name TEXT NOT NULL,
  contact_number TEXT,
  requires_ambulance BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security for emergencies
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

-- Create emergencies access policy
CREATE POLICY emergencies_access_policy ON public.emergencies
  USING (true) 
  WITH CHECK (true);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS emergencies_status_idx ON public.emergencies (status);
CREATE INDEX IF NOT EXISTS emergencies_created_at_idx ON public.emergencies (created_at);
CREATE INDEX IF NOT EXISTS emergencies_emergency_type_idx ON public.emergencies (emergency_type);
CREATE INDEX IF NOT EXISTS emergencies_user_id_idx ON public.emergencies (user_id);

CREATE INDEX IF NOT EXISTS patients_email_idx ON public.patients (email);
CREATE INDEX IF NOT EXISTS patients_phone_idx ON public.patients (phone);
CREATE INDEX IF NOT EXISTS patients_created_at_idx ON public.patients (created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on patients table
DROP TRIGGER IF EXISTS set_patients_updated_at ON public.patients;
CREATE TRIGGER set_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create trigger on emergencies table
DROP TRIGGER IF EXISTS set_emergencies_updated_at ON public.emergencies;
CREATE TRIGGER set_emergencies_updated_at
BEFORE UPDATE ON public.emergencies
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 