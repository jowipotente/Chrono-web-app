-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create new users table
CREATE TABLE public.users (
  email text PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  phone_number text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create profiles table linked to users
CREATE TABLE public.profiles (
  id serial PRIMARY KEY,
  user_email text NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
  profile_name text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_email, profile_name)
);

-- Create events table linked to profiles
CREATE TABLE public.events (
  id serial PRIMARY KEY,
  profile_id int NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  time_from time WITHOUT time zone,
  time_to time WITHOUT time zone,
  date date NOT NULL,
  location text,
  comments text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_events_profile_id ON public.events(profile_id);
CREATE INDEX idx_events_date ON public.events(date);
