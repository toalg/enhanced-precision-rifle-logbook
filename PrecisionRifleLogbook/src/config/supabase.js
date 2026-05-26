/**
 * Supabase Configuration
 * Reads SUPABASE_URL and SUPABASE_ANON_KEY from .env via react-native-config.
 * See .env.example for the schema and .env.development / .env.production
 * for environment-specific values (neither committed).
 */

import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';
import { createSafeFetch, createSafeWebSocket } from '../utils/RealtimeClientPatch.js';

const supabaseUrl = Config.SUPABASE_URL;
const supabaseAnonKey = Config.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loud in dev; in production builds, missing env values are a build-config bug
  // that should never reach the user.
  throw new Error(
    'Supabase config missing. SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env. ' +
      'Copy .env.example to .env.development (or .env.production) and fill in values.'
  );
}

// Create Supabase client with React Native specific options and safe utilities
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    debug: __DEV__,
  },
  realtime: {
    transport: 'websocket',
    timeout: 20000,
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
      apikey: supabaseAnonKey,
    },
    fetch: createSafeFetch(),
    WebSocket: createSafeWebSocket,
  },
  db: {
    schema: 'public',
  },
});

// Supabase table names (kept in sync with supabase/migrations/0001_init.sql).
// Note: `daily_notes` was removed in the v1 prod schema as unused.
export const SUPABASE_TABLES = {
  USERS: 'users',
  SESSIONS: 'shooting_sessions',
  LADDER_TESTS: 'ladder_tests',
  LADDER_CHARGES: 'ladder_charges',
  RIFLE_PROFILES: 'rifle_profiles',
  SETTINGS: 'user_settings',
  ANALYTICS: 'analytics_events',
};

// Supabase storage buckets (kept in sync with the migration).
// Note: `temp` bucket was removed in the v1 prod schema as unused.
export const STORAGE_BUCKETS = {
  TARGET_PHOTOS: 'target-photos',
  USER_AVATARS: 'user-avatars',
  EXPORTS: 'exports',
};

// Initialize Supabase (no-op marker for app startup logging)
export const initializeSupabase = () => {
  if (__DEV__) {
    console.warn(`Supabase initialized: ${supabaseUrl}`);
  }
  return supabase;
};
