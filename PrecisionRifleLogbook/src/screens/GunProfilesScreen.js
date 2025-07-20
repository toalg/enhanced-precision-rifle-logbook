/**
 * Gun Profiles Screen - Rifle Profile Management
 * Displays rifle profiles with cleaning status and round counting
 */

import React, { useState, useEffect } from 'react';
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
import GunProfileService from '../services/GunProfileService';
import { SafeAreaView } from 'react-native-safe-area-context';

const GunProfilesScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showCleaningModal, setShowCleaningModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    caliber: '',
    manufacturer: '',
    model: '',
    cleaning_interval: 200,
    notes: ''
  });

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles();
    
    // Subscribe to real-time changes
    const subscription = GunProfileService.subscribeToProfileChanges((payload) => {
      console.log('Profile change detected:', payload);
      loadProfiles();
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const result = await GunProfileService.getRifleProfiles();
      
      if (result.success) {
        setProfiles(result.profiles);
      } else {
        console.error('Failed to load profiles:', result.error);
        Alert.alert('Error', 'Failed to load rifle profiles');
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      Alert.alert('Error', 'Failed to load rifle profiles');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
    setRefreshing(false);
  };

  const handleMarkAsCleaned = async (profile) => {
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
              const result = await GunProfileService.markAsCleaned(profile.id);
              if (result.success) {
                Alert.alert('Success', `${profile.name} marked as cleaned!`);
                loadProfiles();
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              console.error('Error marking as cleaned:', error);
              Alert.alert('Error', 'Failed to mark as cleaned');
            }
          }
        }
      ]
    );
  };

  const handleDeleteProfile = async (profile) => {
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
              const result = await GunProfileService.deleteRifleProfile(profile.id);
              if (result.success) {
                Alert.alert('Success', `${profile.name} deleted successfully`);
                loadProfiles();
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', 'Failed to delete profile');
            }
          }
        }
      ]
    );
  };

  const handleAddProfile = () => {
    setShowAddModal(true);
  };

  const handleSaveProfile = async () => {
    if (!newProfile.name.trim() || !newProfile.caliber.trim()) {
      Alert.alert('Error', 'Name and caliber are required');
      return;
    }

    try {
      const result = await GunProfileService.createRifleProfile(newProfile);
      if (result.success) {
        Alert.alert('Success', `${newProfile.name} added successfully`);
        setShowAddModal(false);
        setNewProfile({
          name: '',
          caliber: '',
          manufacturer: '',
          model: '',
          cleaning_interval: 200,
          notes: ''
        });
        loadProfiles();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile');
    }
  };

  const renderProfileCard = (profile) => {
    const roundsSinceCleaning = profile.roundsSinceCleaning || 0;
    const needsCleaning = profile.needsCleaning || false;
    const cleaningProgress = Math.min((roundsSinceCleaning / profile.cleaning_interval) * 100, 100);

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
          {profile.manufacturer && (
            <Text style={styles.profileManufacturer}>
              {profile.manufacturer} {profile.model}
            </Text>
          )}
        </View>

        <View style={styles.roundsSection}>
          <Text style={styles.roundsLabel}>Total Rounds: {profile.total_rounds}</Text>
          <Text style={styles.roundsLabel}>
            Since Cleaning: {roundsSinceCleaning}
          </Text>
        </View>

        <View style={styles.cleaningSection}>
          <View style={styles.cleaningHeader}>
            <Text style={styles.cleaningLabel}>
              Cleaning Status ({roundsSinceCleaning}/{profile.cleaning_interval})
            </Text>
            {needsCleaning && (
              <Text style={styles.cleaningWarning}>⚠️ Needs Cleaning</Text>
            )}
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${cleaningProgress}%`,
                  backgroundColor: needsCleaning ? '#FF6B6B' : '#4ECDC4'
                }
              ]} 
            />
          </View>
        </View>

        {profile.notes && (
          <Text style={styles.profileNotes}>{profile.notes}</Text>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔫</Text>
      <Text style={styles.emptyStateTitle}>No Rifle Profiles</Text>
      <Text style={styles.emptyStateText}>
        Add your first rifle profile to start tracking rounds and cleaning schedules.
      </Text>
             <TouchableOpacity style={styles.addButton} onPress={() => handleAddProfile()}>
         <Text style={styles.addButtonText}>Add Rifle Profile</Text>
       </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0466C8" />
          <Text style={styles.loadingText}>Loading rifle profiles...</Text>
        </View>
      </SafeAreaView>
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
          <Text style={styles.title}>Rifle Profiles</Text>
          <Text style={styles.subtitle}>
            Track rounds and cleaning schedules for your firearms
          </Text>
        </View>

        {profiles.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.profilesContainer}>
            {profiles.map(renderProfileCard)}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {profiles.length} rifle{profiles.length !== 1 ? 's' : ''} • 
            {profiles.filter(p => p.needsCleaning).length} need cleaning
          </Text>
                 </View>
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
               placeholder="Manufacturer (e.g., Remington)"
               placeholderTextColor="#7D8597"
               value={newProfile.manufacturer}
               onChangeText={(text) => setNewProfile({...newProfile, manufacturer: text})}
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
               placeholder="Cleaning Interval (default: 200 rounds)"
               placeholderTextColor="#7D8597"
               value={newProfile.cleaning_interval.toString()}
               onChangeText={(text) => setNewProfile({...newProfile, cleaning_interval: parseInt(text) || 200})}
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
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#001233',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7D8597',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7D8597',
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
    color: '#001233',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7D8597',
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
    backgroundColor: '#FFFFFF',
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
    color: '#001233',
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
  profileManufacturer: {
    fontSize: 14,
    color: '#7D8597',
  },
  roundsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roundsLabel: {
    fontSize: 14,
    color: '#33415C',
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
    color: '#33415C',
    fontWeight: '500',
  },
  cleaningWarning: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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