/**
 * Profile Selection Screen
 * Screen for selecting a gun profile when starting a new session
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  SafeAreaView
} from 'react-native';
import GunProfileService from '../../services/GunProfileService';
import { GunProfile, FirearmType } from '../../models/GunProfile';

const ProfileSelectionScreen = ({ 
  visible, 
  onClose, 
  onProfileSelected, 
  title = "Select Gun Profile" 
}) => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadProfiles();
    }
  }, [visible]);

  useEffect(() => {
    filterAndSortProfiles();
  }, [profiles, searchText, sortBy]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const allProfiles = GunProfileService.getSortedProfiles(sortBy);
      setProfiles(allProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      Alert.alert('Error', 'Failed to load gun profiles');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProfiles = () => {
    let filtered = profiles;
    
    if (searchText) {
      filtered = GunProfileService.searchProfiles(searchText);
    }
    
    filtered.sort((a, b) => GunProfile.compare(a, b, sortBy));
    setFilteredProfiles(filtered);
  };

  const handleProfileSelect = (profile) => {
    onProfileSelected(profile);
    onClose();
  };

  const handleCreateNew = () => {
    // Navigate to create new profile screen
    Alert.alert(
      'Create New Profile',
      'Would you like to create a new gun profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create', 
          onPress: () => {
            // This would typically navigate to a profile creation screen
            // For now, we'll create a simple profile
            const newProfile = GunProfile.createEmpty();
            newProfile.name = `New ${FirearmType.getDisplayName(FirearmType.RIFLE)}`;
            handleProfileSelect(newProfile);
          }
        }
      ]
    );
  };

  const renderProfile = ({ item: profile }) => {
    const cleaningStatus = profile.getCleaningStatus();
    
    return (
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => handleProfileSelect(profile)}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.getDisplayName()}</Text>
            <Text style={styles.profileType}>{profile.getTypeDisplayName()}</Text>
            {profile.caliber && (
              <Text style={styles.profileCaliber}>{profile.caliber}</Text>
            )}
          </View>
          <View style={styles.profileStats}>
            <Text style={styles.roundCount}>{profile.totalRounds} rounds</Text>
            <View style={[styles.cleaningBadge, { backgroundColor: cleaningStatus.color }]}>
              <Text style={styles.cleaningIcon}>{cleaningStatus.icon}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.profileFooter}>
          <Text style={styles.lastSession}>
            Last: {profile.getLastSessionDisplayDate()}
          </Text>
          <Text style={styles.cleaningStatus}>
            {cleaningStatus.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No gun profiles found</Text>
      <Text style={styles.emptySubtext}>
        Create your first gun profile to get started
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateNew}
      >
        <Text style={styles.createButtonText}>Create Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const SortButton = ({ value, label }) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        sortBy === value && styles.sortButtonActive
      ]}
      onPress={() => setSortBy(value)}
    >
      <Text style={[
        styles.sortButtonText,
        sortBy === value && styles.sortButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search profiles..."
            value={searchText}
            onChangeText={setSearchText}
            clearButtonMode="while-editing"
          />
        </View>

        <View style={styles.sortContainer}>
          <SortButton value="name" label="Name" />
          <SortButton value="type" label="Type" />
          <SortButton value="totalRounds" label="Rounds" />
          <SortButton value="lastSession" label="Recent" />
          <SortButton value="cleaningDue" label="Cleaning" />
        </View>

        <FlatList
          data={filteredProfiles}
          renderItem={renderProfile}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateNew}
          >
            <Text style={styles.addButtonText}>+ Add New Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001233',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#33415C',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#0466C8',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#33415C',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#33415C',
  },
  sortButtonActive: {
    backgroundColor: '#0466C8',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#7D8597',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#33415C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: '#7D8597',
    marginBottom: 2,
  },
  profileCaliber: {
    fontSize: 12,
    color: '#0466C8',
    fontWeight: '500',
  },
  profileStats: {
    alignItems: 'flex-end',
  },
  roundCount: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  cleaningBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleaningIcon: {
    fontSize: 12,
  },
  profileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSession: {
    fontSize: 12,
    color: '#7D8597',
  },
  cleaningStatus: {
    fontSize: 11,
    color: '#7D8597',
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7D8597',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7D8597',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#0466C8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#33415C',
  },
  addButton: {
    backgroundColor: '#0466C8',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileSelectionScreen;