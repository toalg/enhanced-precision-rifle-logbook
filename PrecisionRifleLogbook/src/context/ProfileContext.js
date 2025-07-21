/**
 * Profile Context - Global profile state management
 * Handles selected profile, round tracking, and profile requirements
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { GunProfileService } from '../services/GunProfileService';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const gunProfileService = new GunProfileService();
  const { user, isAuthenticated, authReady } = useAuth();

  // No need for custom auth checking - use AuthContext

  // Load profiles once auth is ready
  useEffect(() => {
    if (authReady) {
      loadProfiles();
    }
  }, [authReady]);

  // Create default .308 profile if no profiles exist
  useEffect(() => {
    const createDefaultProfile = async () => {
      // Temporarily disabled to debug authentication issues
      console.log('Default profile creation disabled for debugging');
      return;
      
      if (profiles.length === 0 && !loading && authReady && isAuthenticated && user) {
        try {
          console.log('Creating default .308 profile for user:', user.email);
          const defaultProfile = {
            name: 'Generic .308 Winchester',
            caliber: '.308 Winchester',
            manufacturer: 'Generic',
            model: '.308 Winchester',
            firearm_type: 'rifle',
            notes: 'Default profile for testing and basic use'
          };
          await createProfile(defaultProfile);
          console.log('✅ Default .308 profile created');
        } catch (error) {
          console.error('Error creating default profile:', error);
          // Don't show error dialog for now
        }
      }
    };

    createDefaultProfile();
  }, [profiles.length, loading, authReady, isAuthenticated, user]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const profileData = await gunProfileService.fetchProfiles();
      setProfiles(profileData);
      
      // Auto-select first profile if none selected
      if (!selectedProfile && profileData.length > 0) {
        setSelectedProfile(profileData[0]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const createProfile = async (profileData) => {
    try {
      const newProfile = await gunProfileService.createProfile(profileData);
      setProfiles(prev => [newProfile, ...prev]);
      
      // Auto-select new profile if it's the first one
      if (profiles.length === 0) {
        setSelectedProfile(newProfile);
      }
      
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const updateProfile = async (id, updates) => {
    try {
      const updatedProfile = await gunProfileService.updateProfile(id, updates);
      setProfiles(prev => prev.map(p => p.id === id ? updatedProfile : p));
      
      // Update selected profile if it was the one updated
      if (selectedProfile && selectedProfile.id === id) {
        setSelectedProfile(updatedProfile);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const deleteProfile = async (id) => {
    try {
      await gunProfileService.deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      
      // Clear selected profile if it was deleted
      if (selectedProfile && selectedProfile.id === id) {
        setSelectedProfile(profiles.find(p => p.id !== id) || null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  };

  const markAsCleaned = async (profile) => {
    try {
      await gunProfileService.markAsCleaned(profile.name);
      
      // Update local state
      const updatedProfile = {
        ...profile,
        last_cleaned_at: profile.total_rounds
      };
      
      setProfiles(prev => prev.map(p => 
        p.id === profile.id ? updatedProfile : p
      ));
      
      if (selectedProfile && selectedProfile.id === profile.id) {
        setSelectedProfile(updatedProfile);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error marking as cleaned:', error);
      throw error;
    }
  };

  const addRoundsToProfile = async (profileName, roundsFired = 1) => {
    try {
      await gunProfileService.updateRoundCount(profileName, roundsFired);
      
      // Update local state
      setProfiles(prev => prev.map(p => 
        p.name === profileName 
          ? { ...p, total_rounds: p.total_rounds + roundsFired }
          : p
      ));
      
      if (selectedProfile && selectedProfile.name === profileName) {
        setSelectedProfile(prev => ({
          ...prev,
          total_rounds: prev.total_rounds + roundsFired
        }));
      }
    } catch (error) {
      console.error('Error updating round count:', error);
      throw error;
    }
  };

  const requireProfileSelection = () => {
    return new Promise((resolve, reject) => {
      if (selectedProfile) {
        resolve(selectedProfile);
        return;
      }

      if (profiles.length === 0) {
        Alert.alert(
          'No Rifle Profiles',
          'You need to create a rifle profile before starting a session. Would you like to create a default profile now?',
          [
            {
              text: 'Create Default Profile',
              onPress: async () => {
                try {
                  const defaultProfile = {
                    name: 'My Rifle',
                    caliber: '.308 Winchester',
                    manufacturer: 'Custom',
                    model: 'Custom Build',
                    firearm_type: 'rifle',
                    notes: 'Default profile created automatically'
                  };
                  const newProfile = await createProfile(defaultProfile);
                  setSelectedProfile(newProfile);
                  resolve(newProfile);
                } catch (error) {
                  console.error('Error creating default profile:', error);
                  reject(new Error('PROFILE_CREATION_FAILED'));
                }
              }
            },
            {
              text: 'Create Custom Profile',
              onPress: () => reject(new Error('NEED_PROFILE_CREATION'))
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => reject(new Error('USER_CANCELLED'))
            }
          ]
        );
      } else {
        Alert.alert(
          'Select Rifle Profile',
          'Please select which rifle you\'re using for this session.',
          [
            ...profiles.slice(0, 3).map(profile => ({
              text: profile.name,
              onPress: () => {
                setSelectedProfile(profile);
                resolve(profile);
              }
            })),
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => reject(new Error('USER_CANCELLED'))
            }
          ]
        );
      }
    });
  };

  const value = {
    profiles,
    selectedProfile,
    setSelectedProfile,
    loading,
    isInitialized,
    authReady,
    loadProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    markAsCleaned,
    addRoundsToProfile,
    requireProfileSelection,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;