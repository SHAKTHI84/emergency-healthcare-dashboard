-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  blood_type VARCHAR(10),
  allergies JSONB DEFAULT '[]'::jsonb,
  medical_history JSONB DEFAULT '[]'::jsonb,
  health_metrics JSONB DEFAULT '{}'::jsonb,
  last_checkup TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on patients table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policy for patients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Allow patients access'
  ) THEN
    CREATE POLICY "Allow patients access" ON public.patients USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- Verify emergencies table and create if it doesn't exist
CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_type VARCHAR(255),
  reporter_name VARCHAR(255),
  contact_number VARCHAR(20),
  description TEXT,
  location TEXT,
  latitude FLOAT,
  longitude FLOAT,
  requires_ambulance BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on emergencies table
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

-- Create policy for emergencies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'emergencies' AND policyname = 'Allow emergencies access'
  ) THEN
    CREATE POLICY "Allow emergencies access" ON public.emergencies USING (true) WITH CHECK (true);
  END IF;
END
$$; 