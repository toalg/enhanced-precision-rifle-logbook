/**
 * Gun Profile Service - Rifle Profile Management with Supabase
 * Handles rifle profiles, round counting, and cleaning reminders
 */

import { supabase, SUPABASE_TABLES } from '../config/supabase';

class GunProfileService {
  constructor() {
    this.currentUser = null;
    this.listeners = new Map();
  }

  // Initialize the service
  async initialize() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.currentUser = user;
      
      if (user) {
        console.log('GunProfileService initialized for user:', user.id);
      }
      
      return { success: true };
    } catch (error) {
      console.error('GunProfileService initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Fetch all rifle profiles for current user
  async getRifleProfiles() {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.RIFLE_PROFILES)
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add computed properties
      const profiles = data.map(profile => ({
        ...profile,
        roundsSinceCleaning: profile.total_rounds - profile.last_cleaned_at,
        needsCleaning: (profile.total_rounds - profile.last_cleaned_at) >= profile.cleaning_interval
      }));

      return { success: true, profiles };
    } catch (error) {
      console.error('Error fetching rifle profiles:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a new rifle profile
  async createRifleProfile(profileData) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const newProfile = {
        ...profileData,
        user_id: this.currentUser.id,
        total_rounds: 0,
        last_cleaned_at: 0,
        cleaning_interval: profileData.cleaning_interval || 200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.RIFLE_PROFILES)
        .insert([newProfile])
        .select()
        .single();

      if (error) throw error;

      this.emit('profileCreated', { profile: data });
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error creating rifle profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Update an existing rifle profile
  async updateRifleProfile(profileId, updates) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.RIFLE_PROFILES)
        .update(updateData)
        .eq('id', profileId)
        .eq('user_id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      this.emit('profileUpdated', { profile: data });
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error updating rifle profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a rifle profile
  async deleteRifleProfile(profileId) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from(SUPABASE_TABLES.RIFLE_PROFILES)
        .delete()
        .eq('id', profileId)
        .eq('user_id', this.currentUser.id);

      if (error) throw error;

      this.emit('profileDeleted', { profileId });
      return { success: true };
    } catch (error) {
      console.error('Error deleting rifle profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark rifle as cleaned
  async markAsCleaned(profileId) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      // Get current profile to get total rounds
      const { data: profile, error: fetchError } = await supabase
        .from(SUPABASE_TABLES.RIFLE_PROFILES)
        .select('total_rounds')
        .eq('id', profileId)
        .eq('user_id', this.currentUser.id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.RIFLE_PROFILES)
        .update({
          last_cleaned_at: profile.total_rounds,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .eq('user_id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      this.emit('profileCleaned', { profile: data });
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error marking rifle as cleaned:', error);
      return { success: false, error: error.message };
    }
  }

  // Get profiles that need cleaning
  async getProfilesNeedingCleaning() {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.RIFLE_PROFILES)
        .select('*')
        .eq('user_id', this.currentUser.id)
        .gte('total_rounds', supabase.raw('last_cleaned_at + cleaning_interval'))
        .order('name');

      if (error) throw error;

      return { success: true, profiles: data };
    } catch (error) {
      console.error('Error fetching profiles needing cleaning:', error);
      return { success: false, error: error.message };
    }
  }

  // Add rounds to a rifle profile (called when session is saved)
  async addRounds(profileName, rounds = 1) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.RIFLE_PROFILES)
        .update({
          total_rounds: supabase.raw('total_rounds + ?', [rounds]),
          updated_at: new Date().toISOString()
        })
        .eq('name', profileName)
        .eq('user_id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      this.emit('roundsAdded', { profile: data, rounds });
      return { success: true, profile: data };
    } catch (error) {
      console.error('Error adding rounds to rifle profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscribe to real-time profile changes
  subscribeToProfileChanges(callback) {
    if (!this.currentUser) {
      console.warn('Cannot subscribe to profile changes: user not authenticated');
      return null;
    }

    const subscription = supabase
      .channel('rifle_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLES.RIFLE_PROFILES,
          filter: `user_id=eq.${this.currentUser.id}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
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
          console.error('Error in GunProfileService event listener:', error);
        }
      });
    }
  }

  // Cleanup
  cleanup() {
    this.listeners.clear();
  }
}

export default new GunProfileService();