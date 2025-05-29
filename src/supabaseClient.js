import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnijhslndjpnpqkenssf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduaWpoc2xuZGpwbnBxa2Vuc3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjU2MTcsImV4cCI6MjA2Mzg0MTYxN30.4RDQ6b_HoUfh7wIjNKwtA9C_GDgAr6VP3AQHb15UjaU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
