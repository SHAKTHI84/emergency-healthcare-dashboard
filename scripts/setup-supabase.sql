-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create emergencies table
CREATE TABLE IF NOT EXISTS public.emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_type VARCHAR(100) NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT NOT NULL,
  reporter_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  requires_ambulance BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- First disable RLS, then re-enable it with proper policies
ALTER TABLE public.emergencies DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.emergencies;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.emergencies;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.emergencies;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.emergencies;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.emergencies;

-- Re-enable RLS
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for everyone (development mode)
CREATE POLICY "Allow all operations" ON public.emergencies
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- Make sure the table is accessible
GRANT ALL ON public.emergencies TO anon, authenticated;

-- Create a sample emergency only if the table is empty
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.emergencies LIMIT 1) THEN
    INSERT INTO public.emergencies (
      emergency_type,
      location,
      latitude,
      longitude,
      description,
      reporter_name,
      contact_number,
      requires_ambulance,
      status
    ) VALUES (
      'Test Emergency',
      '123 Test Street, Test City',
      37.7749,
      -122.4194,
      'This is a test emergency for initialization',
      'System',
      '1234567890',
      FALSE,
      'pending'
    );
  END IF;
END $$;

-- Verify the data was inserted correctly
SELECT * FROM public.emergencies; 