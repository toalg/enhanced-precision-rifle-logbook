/**
 * Gun Profiles Screen - Rifle Profile Management
 * Displays rifle profiles with cleaning status and round counting
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleaningProgressBar from '../components/profiles/CleaningProgressBar';
import { useProfiles } from '../context/ProfileContext';
import { GunProfileService } from '../services/GunProfileService';

const GunProfilesScreen = () => {
  console.log('🔍 GunProfilesScreen rendering...');
  
  const {
    profiles,
    loading,
    loadProfiles,
    createProfile,
    deleteProfile,
    markAsCleaned
  } = useProfiles();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const gunProfileService = new GunProfileService();
  const [newProfile, setNewProfile] = useState({
    name: '',
    caliber: '',
    model: '',
    purchase_date: '',
    cleaning_interval: '',
    notes: '',
    firearm_type: 'rifle'
  });

  // Load profiles on component mount
  useEffect(() => {
    console.log('🔍 GunProfilesScreen useEffect running...');
    loadProfiles();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfiles();
    setRefreshing(false);
  }, [loadProfiles]);

  const handleMarkAsCleaned = useCallback(async (profile) => {
    Alert.alert(
      'Mark as Cleaned',
      `Mark "${profile.name}" as cleaned? This will reset the cleaning counter.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Cleaned',
          style: 'destructive',
          onPress: async () => {
            try {
              await markAsCleaned(profile);
              Alert.alert('Success', `${profile.name} marked as cleaned!`);
            } catch (error) {
              console.error('Error marking as cleaned:', error);
              Alert.alert('Error', 'Failed to mark as cleaned');
            }
          }
        }
      ]
    );
  }, [markAsCleaned]);

  const handleDeleteProfile = useCallback(async (profile) => {
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${profile.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfile(profile.id);
              Alert.alert('Success', `${profile.name} deleted successfully`);
            } catch (error) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', 'Failed to delete profile');
            }
          }
        }
      ]
    );
  }, [deleteProfile]);

  const handleAddProfile = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!newProfile.name.trim() || !newProfile.caliber.trim()) {
      Alert.alert('Error', 'Name and caliber are required');
      return;
    }

    // Check if cleaning interval is blank
    if (!newProfile.cleaning_interval.trim()) {
      Alert.alert(
        'No Cleaning Schedule',
        'You haven\'t set a cleaning interval. This means no cleaning reminders will be shown. You can always edit this later.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: () => saveProfileData()
          }
        ]
      );
      return;
    }

    saveProfileData();
  }, [newProfile]);

  const saveProfileData = useCallback(async () => {
    try {
      const profileData = {
        ...newProfile,
        cleaning_interval: newProfile.cleaning_interval.trim() ? parseInt(newProfile.cleaning_interval) || 200 : 200
      };
      
      await createProfile(profileData);
      Alert.alert('Success', `${newProfile.name} added successfully`);
      setShowAddModal(false);
      setNewProfile({
        name: '',
        caliber: '',
        model: '',
        purchase_date: '',
        cleaning_interval: '',
        notes: '',
        firearm_type: 'rifle'
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile');
    }
  }, [newProfile, createProfile]);

  const renderProfileCard = useCallback((profile) => {
    const roundsSinceCleaning = profile.total_rounds - profile.last_cleaned_at;

    return (
      <View key={profile.id} style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <View style={styles.profileActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cleanButton]}
              onPress={() => handleMarkAsCleaned(profile)}
            >
              <Text style={styles.actionButtonText}>🧹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteProfile(profile)}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileDetails}>
          <Text style={styles.profileCaliber}>{profile.caliber}</Text>
          {profile.model && (
            <Text style={styles.profileModel}>{profile.model}</Text>
          )}
        </View>

        <View style={styles.roundsSection}>
          <Text style={styles.roundsLabel}>Total Rounds: {profile.total_rounds}</Text>
          <Text style={styles.roundsLabel}>Rounds Since Cleaning: {roundsSinceCleaning}</Text>
        </View>

        <CleaningProgressBar
          roundsSinceCleaning={roundsSinceCleaning}
          cleaningInterval={profile.cleaning_interval}
          style={styles.cleaningProgressBar}
        />

        {profile.notes && (
          <Text style={styles.profileNotes}>{profile.notes}</Text>
        )}
      </View>
    );
  }, [handleMarkAsCleaned, handleDeleteProfile]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No Rifle Profiles</Text>
      <Text style={styles.emptyStateText}>
        Get started by adding your first rifle profile to track rounds and cleaning schedules.
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddProfile}>
        <Text style={styles.addButtonText}>Add Rifle Profile</Text>
      </TouchableOpacity>
    </View>
  ), [handleAddProfile]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0466C8" />
        <Text style={styles.loadingText}>Loading rifle profiles...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Gun Profiles</Text>
          <Text style={styles.subtitle}>
            Manage your rifle profiles and track cleaning schedules
          </Text>
        </View>

        <View style={styles.profilesContainer}>
          {profiles.length === 0 ? renderEmptyState() : profiles.map(renderProfileCard)}
        </View>

        {profiles.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddProfile}>
              <Text style={styles.addButtonText}>Add Rifle Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Profile Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Rifle Profile</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Rifle Name (e.g., Remington 700)"
              placeholderTextColor="#7D8597"
              value={newProfile.name}
              onChangeText={(text) => setNewProfile({...newProfile, name: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Caliber (e.g., .308 Winchester)"
              placeholderTextColor="#7D8597"
              value={newProfile.caliber}
              onChangeText={(text) => setNewProfile({...newProfile, caliber: text})}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Model (e.g., 700 SPS)"
              placeholderTextColor="#7D8597"
              value={newProfile.model}
              onChangeText={(text) => setNewProfile({...newProfile, model: text})}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Purchase Date (e.g., 2023-01-01)"
              placeholderTextColor="#7D8597"
              value={newProfile.purchase_date}
              onChangeText={(text) => setNewProfile({...newProfile, purchase_date: text})}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Cleaning Interval (e.g., 200 rounds) - Optional"
              placeholderTextColor="#7D8597"
              value={newProfile.cleaning_interval}
              onChangeText={(text) => setNewProfile({...newProfile, cleaning_interval: text})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Notes (optional)"
              placeholderTextColor="#7D8597"
              value={newProfile.notes}
              onChangeText={(text) => setNewProfile({...newProfile, notes: text})}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalButtonSaveText}>Save Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001233',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#33415C',
    borderBottomWidth: 1,
    borderBottomColor: '#4A5568',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E9ECEF',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001233',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E9ECEF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#E9ECEF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#0466C8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profilesContainer: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#33415C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanButton: {
    backgroundColor: '#4ECDC4',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    fontSize: 16,
  },
  profileDetails: {
    marginBottom: 12,
  },
  profileCaliber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0466C8',
    marginBottom: 4,
  },
  profileModel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  roundsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roundsLabel: {
    fontSize: 14,
    color: '#E9ECEF',
    fontWeight: '500',
  },
  cleaningSection: {
    marginBottom: 12,
  },
  cleaningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cleaningLabel: {
    fontSize: 14,
    color: '#E9ECEF',
    fontWeight: '500',
  },
  cleaningWarning: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#001233',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  cleaningInterval: {
    fontSize: 12,
    color: '#7D8597',
    fontStyle: 'italic',
  },
  noCleaningSchedule: {
    fontSize: 12,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
  profileNotes: {
    fontSize: 14,
    color: '#7D8597',
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7D8597',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 18, 51, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#33415C',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#001233',
    borderWidth: 1,
    borderColor: '#4A5568',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#7D8597',
  },
  modalButtonCancelText: {
    color: '#7D8597',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSave: {
    backgroundColor: '#0466C8',
  },
  modalButtonSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GunProfilesScreen;