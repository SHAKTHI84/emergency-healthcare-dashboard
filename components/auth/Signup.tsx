'use client';

import { useState, useEffect } from 'react';
import { getSession } from '../../services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Patient' | 'Healthcare Provider'>('Patient');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("User already logged in, redirecting to dashboard");
          // User is already logged in, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, [router]);

  // Function to generate patient ID
  const generatePatientId = async () => {
    // Get the latest patient ID from the database
    const { data, error } = await supabase
      .from('patients')
      .select('patient_id')
      .order('created_at', { ascending: false })
      .limit(1);
    
    // If no patients exist yet, start with 001
    if (error || !data || data.length === 0) {
      return 'PATIENT-001';
    }
    
    // If we have existing patients, increment the highest ID
    try {
      // Extract the numeric part from the latest ID
      const latestId = data[0].patient_id || 'PATIENT-000';
      const numericPart = parseInt(latestId.split('-')[1], 10);
      const newNumericPart = numericPart + 1;
      // Format with leading zeros (e.g., 001, 042, 999)
      return `PATIENT-${newNumericPart.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating patient ID:', error);
      return 'PATIENT-001'; // Fallback
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error states
    setErrors({});
    
    // Validate inputs
    let newErrors: Record<string, string> = {};
    
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!role) newErrors.role = 'Please select an account type';
    if (!name) newErrors.name = 'Full name is required';
    
    // Validate the new required fields
    if (role === 'Patient') {
      if (!age) newErrors.age = 'Age is required';
      if (!sex) newErrors.sex = 'Sex is required';
      if (!phone) newErrors.phone = 'Phone number is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Attempting signup with email:", email);

      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role === 'Healthcare Provider' ? 'healthcare' : 'patient',
            name: name
          },
        },
      });
      
      if (error) throw error;
      
      console.log("Signup successful, user created:", !!data.user);
      
      // Create user profile with role
      if (data?.user) {
        // Map UI role to database role
        const dbRole = role === 'Healthcare Provider' ? 'healthcare' : 'patient';
        
        // Generate patient ID for patient users
        let patientId = null;
        if (dbRole === 'patient') {
          patientId = await generatePatientId();
        }
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{ 
            user_id: data.user.id,
            role: dbRole,
            email: email,
            name: name,
            patient_id: patientId
          }]);
        
        if (profileError) {
          console.error("Error creating user profile:", profileError);
        } else {
          console.log("User profile created successfully");
        }
        
        // For patients, also create a patient record
        if (dbRole === 'patient') {
          const { error: patientError } = await supabase
            .from('patients')
            .insert([{
              user_id: data.user.id,
              name: name,
              email: email,
              phone: phone,
              age: parseInt(age),
              sex: sex,
              patient_id: patientId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);
            
          if (patientError) {
            console.error("Error creating patient record:", patientError);
          } else {
            console.log("Patient record created successfully");
          }
        }
        
        // Store authentication data if session exists
        if (data.session) {
          localStorage.setItem('auth_token', data.session.access_token);
          localStorage.setItem('user_role', dbRole);
          localStorage.setItem('user_id', data.user.id);
          
          console.log("Session created, redirecting to dashboard...");
          
          // Redirect based on role with a delay to ensure storage is set
          setTimeout(() => {
            if (role === 'Healthcare Provider') {
              router.push('/dashboard/healthcare');
            } else {
              router.push('/dashboard/patient');
            }
          }, 500);
        } else {
          console.log("Signup successful but no session created - email confirmation may be required");
          setSuccess(true);
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message.includes('email')) {
        setErrors({ email: error.message });
      } else {
        setErrors({ form: error.message || 'Failed to sign up. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link 
            href="/login" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Registration successful</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your account has been created. You can now sign in.</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSignup}>
              {Object.keys(errors).map((key) => (
                <div key={key} className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{errors[key]}</div>
                </div>
              ))}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'Patient' | 'Healthcare Provider')}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Healthcare Provider">Healthcare Provider</option>
                  </select>
                </div>
              </div>

              {/* Only show patient-specific fields if Patient is selected */}
              {role === 'Patient' && (
                <>
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <div className="mt-1">
                      <input
                        id="age"
                        name="age"
                        type="number"
                        required
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                      Sex
                    </label>
                    <div className="mt-1">
                      <select
                        id="sex"
                        name="sex"
                        required
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Signing up...' : 'Sign up'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 