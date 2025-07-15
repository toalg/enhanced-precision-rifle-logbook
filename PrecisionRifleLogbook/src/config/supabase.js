/**
 * Supabase Configuration
 * Replace these placeholder values with your actual Supabase project credentials
 */

import { createClient } from '@supabase/supabase-js';

// Your Supabase project configuration
// Get these values from your Supabase Dashboard
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase table names
export const SUPABASE_TABLES = {
  USERS: 'users',
  SESSIONS: 'shooting_sessions',
  LADDER_TESTS: 'ladder_tests',
  LADDER_CHARGES: 'ladder_charges',
  RIFLE_PROFILES: 'rifle_profiles',
  SETTINGS: 'user_settings',
  DAILY_NOTES: 'daily_notes',
  ANALYTICS: 'analytics_events'
};

// Supabase storage buckets
export const STORAGE_BUCKETS = {
  TARGET_PHOTOS: 'target-photos',
  USER_AVATARS: 'user-avatars',
  EXPORTS: 'exports',
  TEMP: 'temp'
};

// Initialize Supabase
export const initializeSupabase = () => {
  console.log('Supabase initialized');
  return supabase;
};

// Database schema helpers
export const createTables = async () => {
  // This would typically be done via Supabase migrations
  // For now, we'll define the schema structure
  console.log('Database schema defined');
};

// Row Level Security (RLS) policies
export const RLS_POLICIES = {
  // Users can only access their own data
  USERS_OWN_DATA: 'users can only access their own data',
  SESSIONS_OWN_DATA: 'users can only access their own sessions',
  LADDER_TESTS_OWN_DATA: 'users can only access their own ladder tests'
}; 