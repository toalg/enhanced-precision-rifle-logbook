/**
 * Gun Profile Service - Rifle Profile Management with Supabase
 * Handles rifle profiles, round counting, and cleaning reminders
 */

import { supabase } from '../config/supabase';
import SupabaseAuthService from './SupabaseAuthService';

// Helper function to ensure user is authenticated via Supabase Auth
const ensureAuthenticated = async () => {
  try {
    const supabaseUser = SupabaseAuthService.getCurrentUser();
    
    if (!supabaseUser) {
      throw new Error('User must be authenticated to access rifle profiles');
    }
    
    // Return Supabase user ID for RLS
    return { id: supabaseUser.id, email: supabaseUser.email };
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Authentication required: Please sign in to continue');
  }
};

export class GunProfileService {
  constructor() {
    this.tableName = 'rifle_profiles';
  }

  // Fetch all rifle profiles for the current user
  async fetchProfiles() {
    try {
      // Ensure user is authenticated
      await ensureAuthenticated();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rifle profiles:', error);
      throw error;
    }
  }

  // Create a new rifle profile
  async createProfile(profile) {
    try {
      // Ensure user is authenticated and get user data
      const user = await ensureAuthenticated();

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          user_id: user.id,
          name: profile.name,
          caliber: profile.caliber,
          manufacturer: profile.manufacturer || null,
          model: profile.model || null,
          serial_number: profile.serial_number || null,
          purchase_date: profile.purchase_date || null,
          notes: profile.notes || null,
          firearm_type: profile.firearm_type || 'rifle',
          total_rounds: 0,
          last_cleaned_at: 0,
          cleaning_interval: profile.cleaning_interval || 200
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating rifle profile:', error);
      throw error;
    }
  }

  // Update an existing rifle profile
  async updateProfile(id, updates) {
    try {
      // Ensure user is authenticated
      await ensureAuthenticated();

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          name: updates.name,
          caliber: updates.caliber,
          manufacturer: updates.manufacturer || null,
          model: updates.model || null,
          serial_number: updates.serial_number || null,
          purchase_date: updates.purchase_date || null,
          notes: updates.notes || null,
          firearm_type: updates.firearm_type || 'rifle',
          cleaning_interval: updates.cleaning_interval || 200,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating rifle profile:', error);
      throw error;
    }
  }

  // Delete a rifle profile
  async deleteProfile(id) {
    try {
      // Ensure user is authenticated
      await ensureAuthenticated();

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting rifle profile:', error);
      throw error;
    }
  }

  // Mark a rifle as cleaned
  async markAsCleaned(profileName) {
    try {
      const { error } = await supabase
        .rpc('mark_rifle_cleaned', {
          profile_name: profileName,
          user_uuid: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking rifle as cleaned:', error);
      throw error;
    }
  }

  // Get rifles that need cleaning
  async getProfilesNeedingCleaning() {
    try {
      const { data, error } = await supabase
        .rpc('get_rifles_needing_cleaning', {
          user_uuid: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching rifles needing cleaning:', error);
      throw error;
    }
  }

  // Get cleaning status for all rifles
  async getCleaningStatus() {
    try {
      const { data, error } = await supabase
        .from('rifle_cleaning_status')
        .select('*')
        .order('needs_cleaning', { ascending: false })
        .order('rounds_since_cleaning', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching cleaning status:', error);
      throw error;
    }
  }

  // Subscribe to real-time changes
  subscribeToProfileChanges(callback) {
    return supabase
      .channel('rifle_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName
        },
        callback
      )
      .subscribe();
  }

  // Get profile by name (for session integration)
  async getProfileByName(name) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile by name:', error);
      throw error;
    }
  }

  // Update round count for a profile (called by session service)
  async updateRoundCount(profileName, roundsFired) {
    try {
      // First get the current profile to get the current total_rounds
      const { data: currentProfile, error: fetchError } = await supabase
        .from(this.tableName)
        .select('total_rounds')
        .eq('name', profileName)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new total
      const currentRounds = currentProfile?.total_rounds || 0;
      const newTotal = currentRounds + (roundsFired || 1);

      // Update with the new total
      const { error } = await supabase
        .from(this.tableName)
        .update({
          total_rounds: newTotal,
          updated_at: new Date().toISOString()
        })
        .eq('name', profileName);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating round count:', error);
      throw error;
    }
  }
}