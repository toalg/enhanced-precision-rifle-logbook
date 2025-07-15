/**
 * Supabase Service - Database Operations and Real-time Features
 * Handles Supabase-specific operations for the app
 */

import { supabase, SUPABASE_TABLES, STORAGE_BUCKETS } from '../config/supabase';

class SupabaseService {
  constructor() {
    this.currentUser = null;
    this.listeners = new Map();
    this.subscriptions = new Map();
  }

  // Authentication Methods (using Supabase Auth)
  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      this.emit('authStateChanged', { user: this.currentUser });
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Supabase sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      
      // Create user profile
      if (this.currentUser) {
        await this.createUserProfile({
          id: this.currentUser.id,
          email: this.currentUser.email,
          created_at: new Date().toISOString()
        });
      }
      
      this.emit('authStateChanged', { user: this.currentUser });
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Supabase sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.emit('authStateChanged', { user: null });
      return { success: true };
    } catch (error) {
      console.error('Supabase sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Database Methods
  async createUserProfile(userData) {
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.USERS)
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, user: data };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  async saveShootingSession(sessionData) {
    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.SESSIONS)
        .insert([{
          ...sessionData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      this.emit('sessionSaved', { sessionId: data.id, session: data });
      return { success: true, sessionId: data.id, session: data };
    } catch (error) {
      console.error('Error saving session to Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  async getShootingSessions(limit = 50, offset = 0) {
    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, sessions: data };
    } catch (error) {
      console.error('Error fetching sessions from Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  async saveLadderTest(ladderData) {
    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.LADDER_TESTS)
        .insert([{
          ...ladderData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      this.emit('ladderTestSaved', { testId: data.id, test: data });
      return { success: true, testId: data.id, test: data };
    } catch (error) {
      console.error('Error saving ladder test to Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  async getLadderTests(limit = 20, offset = 0) {
    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.LADDER_TESTS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, tests: data };
    } catch (error) {
      console.error('Error fetching ladder tests from Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  // Daily Notes (for the journaling feature)
  async saveDailyNote(noteData) {
    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.DAILY_NOTES)
        .upsert([{
          ...noteData,
          user_id: userId,
          updated_at: new Date().toISOString()
        }], { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;

      this.emit('dailyNoteSaved', { noteId: data.id, note: data });
      return { success: true, noteId: data.id, note: data };
    } catch (error) {
      console.error('Error saving daily note to Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  async getDailyNote(date) {
    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.DAILY_NOTES)
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return { success: true, note: data };
    } catch (error) {
      console.error('Error fetching daily note from Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time Subscriptions
  subscribeToSessions(callback) {
    const userId = this.getCurrentUser()?.id;
    if (!userId) return null;

    const subscription = supabase
      .channel('sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: SUPABASE_TABLES.SESSIONS,
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();

    this.subscriptions.set('sessions', subscription);
    return subscription;
  }

  subscribeToLadderTests(callback) {
    const userId = this.getCurrentUser()?.id;
    if (!userId) return null;

    const subscription = supabase
      .channel('ladder_tests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: SUPABASE_TABLES.LADDER_TESTS,
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();

    this.subscriptions.set('ladder_tests', subscription);
    return subscription;
  }

  // Storage Methods
  async uploadTargetPhoto(uri, sessionId) {
    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const filename = `target-${sessionId}-${Date.now()}.jpg`;
      const filePath = `${userId}/${filename}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.TARGET_PHOTOS)
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.TARGET_PHOTOS)
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Error uploading target photo to Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadExportFile(fileUri, filename) {
    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) throw new Error('User not authenticated');

      const filePath = `${userId}/${filename}`;

      const response = await fetch(fileUri);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'application/octet-stream' });

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.EXPORTS)
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.EXPORTS)
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Error uploading export file to Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  // Event System
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in Supabase event listener:', error);
        }
      });
    }
  }

  // Initialize Supabase service
  async initialize() {
    try {
      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        this.currentUser = session?.user || null;
        this.emit('authStateChanged', { user: this.currentUser });
      });

      console.log('Supabase service initialized');
      return { success: true };
    } catch (error) {
      console.error('Error initializing Supabase service:', error);
      return { success: false, error: error.message };
    }
  }

  // Cleanup subscriptions
  cleanup() {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

export default new SupabaseService(); 