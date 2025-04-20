-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  patient_id TEXT,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  age INTEGER,
  gender TEXT,
  blood_type TEXT,
  allergies TEXT[],
  medical_history JSONB DEFAULT '[]'::jsonb,
  health_metrics JSONB DEFAULT '{}'::jsonb,
  last_checkup TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create emergencies table
CREATE TABLE IF NOT EXISTS emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_type TEXT NOT NULL,
  reporter_name TEXT,
  contact_number TEXT,
  description TEXT,
  location TEXT,
  latitude FLOAT,
  longitude FLOAT,
  requires_ambulance BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table that works with auth
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'patient',
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Setup Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Patients table policies
CREATE POLICY "Allow users to read their own data" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow healthcare providers to read all patient data" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (role = 'healthcare' OR role = 'Healthcare Provider')
    )
  );

CREATE POLICY "Allow patients to update their own data" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow healthcare providers to update any patient data" ON patients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (role = 'healthcare' OR role = 'Healthcare Provider')
    )
  );

-- Emergencies table policies
CREATE POLICY "Allow public insertion of emergencies" ON emergencies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read emergencies" ON emergencies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow healthcare providers to update emergencies" ON emergencies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (role = 'healthcare' OR role = 'Healthcare Provider')
    )
  );

CREATE POLICY "Allow healthcare providers to delete emergencies" ON emergencies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (role = 'healthcare' OR role = 'Healthcare Provider')
    )
  );

-- Users table policies
CREATE POLICY "Allow users to read their own user profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow healthcare providers to read all user profiles" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (role = 'healthcare' OR role = 'Healthcare Provider')
    )
  );

CREATE POLICY "Allow users to update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_modified
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_emergencies_modified
BEFORE UPDATE ON emergencies
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_users_modified
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create a function to handle user creation on auth registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, role, name)
  VALUES (NEW.id, NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = COALESCE(EXCLUDED.role, users.role),
    name = COALESCE(EXCLUDED.name, users.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically add users to our users table
CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 