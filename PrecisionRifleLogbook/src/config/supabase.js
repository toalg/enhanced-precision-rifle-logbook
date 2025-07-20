/**
 * Supabase Configuration
 * Replace these placeholder values with your actual Supabase project credentials
 */

import { createClient } from '@supabase/supabase-js';
import { createSafeFetch, createSafeWebSocket } from '../utils/RealtimeClientPatch';

// Your Supabase project configuration
// Get these values from your Supabase Dashboard
const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

// Create Supabase client with React Native specific options and safe utilities
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    debug: __DEV__
  },
  realtime: {
    transport: 'websocket',
    timeout: 20000,
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
      'apikey': supabaseAnonKey
    },
    fetch: createSafeFetch(),
    WebSocket: createSafeWebSocket
  },
  db: {
    schema: 'public'
  }
});

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