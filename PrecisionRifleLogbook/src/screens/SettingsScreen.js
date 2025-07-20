/**
 * Settings Screen - Data Management & Premium Features
 * Unified visual theme with consistent design patterns
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';

import { CommonStyles, Colors, Typography, Spacing } from '../components/common/AppStyles';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import GunProfilesScreen from './GunProfilesScreen';

import LogbookService from '../services/LogbookService';
import { useProfiles } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [ladderCount, setLadderCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeSection, setActiveSection] = useState('main'); // 'main' or 'profiles'

  // Get profile context
  const { profiles, selectedProfile } = useProfiles();
  
  // Get auth context
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadSettings();
    
    // Listen for service events
    const handlePremiumEnabled = () => {
      setIsPremium(true);
    };

    const handleCloudSyncToggled = ({ enabled }) => {
      setCloudSyncEnabled(enabled);
    };

    LogbookService.addEventListener('premiumEnabled', handlePremiumEnabled);
    LogbookService.addEventListener('cloudSyncToggled', handleCloudSyncToggled);
    
    return () => {
      LogbookService.removeEventListener('premiumEnabled', handlePremiumEnabled);
      LogbookService.removeEventListener('cloudSyncToggled', handleCloudSyncToggled);
    };
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const [premium, cloudSync, sessions, ladders] = await Promise.all([
        LogbookService.checkPremiumStatus(),
        LogbookService.getCloudSyncSetting(),
        LogbookService.getShootingSessions(1000, 0),
        LogbookService.getLadderTests(100, 0),
      ]);
      
      setIsPremium(premium);
      setCloudSyncEnabled(cloudSync);
      setSessionCount(sessions.length);
      setLadderCount(ladders.length);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Unlock cloud sync, advanced analytics, and premium features!',
      [
        {
          text: 'Enable Premium (Demo)',
          onPress: async () => {
            try {
              await LogbookService.enablePremium();
              Alert.alert('Premium Activated!', 'Cloud sync and advanced features are now available');
            } catch (error) {
              Alert.alert('Error', 'Failed to enable premium features');
            }
          },
        },
        { text: 'Maybe Later', style: 'cancel' },
      ]
    );
  };

  const handleCloudSyncToggle = async () => {
    try {
      if (!isPremium) {
        handlePremiumUpgrade();
        return;
      }

      const newState = await LogbookService.toggleCloudSync();
      
      if (newState) {
        Alert.alert(
          'Cloud Sync Enabled',
          'Your data will be automatically backed up to the cloud and synced across devices.'
        );
      } else {
        Alert.alert(
          'Cloud Sync Disabled',
          'Data will remain stored locally on your device only.'
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      
      const exportData = await LogbookService.exportAllData();
      
      await Share.share({
        message: `Precision Rifle Logbook Data Export\n\n${JSON.stringify(exportData, null, 2)}`,
        title: 'Precision Rifle Logbook Data',
      });
      
      Alert.alert('Export Complete', 'Your data has been exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      'Import Data',
      'This will replace all existing data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: async () => {
            try {
              setImporting(true);
              // Mock import for now
              await new Promise(resolve => setTimeout(resolve, 2000));
              Alert.alert('Import Complete', 'Data imported successfully');
            } catch (error) {
              Alert.alert('Import Failed', 'Failed to import data');
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all shooting sessions, ladder tests, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await LogbookService.clearAllData();
              Alert.alert('Data Cleared', 'All data has been cleared successfully');
              loadSettings(); // Refresh counts
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  // Unified Card Components
  const renderGunProfilesCard = () => {
    const profilesNeedingCleaning = profiles.filter(profile => {
      const roundsSinceCleaning = profile.total_rounds - profile.last_cleaned_at;
      return roundsSinceCleaning >= (profile.cleaning_interval || 200);
    }).length;

    return (
      <Card variant="dark">
        <Text style={styles.sectionTitle}>🔧 Gun Profiles</Text>
        <Text style={styles.sectionDescription}>
          Manage your rifle profiles and track cleaning schedules
        </Text>
        
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profiles.length}</Text>
            <Text style={styles.statLabel}>Total Profiles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{selectedProfile ? '1' : '0'}</Text>
            <Text style={styles.statLabel}>Selected</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, profilesNeedingCleaning > 0 && styles.warningText]}>
              {profilesNeedingCleaning}
            </Text>
            <Text style={styles.statLabel}>Need Cleaning</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Manage Gun Profiles"
            onPress={() => setActiveSection('profiles')}
            variant="primary"
            size="medium"
          />
        </View>
      </Card>
    );
  };

  const renderPremiumStatusCard = () => (
    <Card variant={isPremium ? "success" : "dark"}>
      <Text style={styles.sectionTitle}>💎 Premium Status</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.statusText}>
          {isPremium ? 'Premium Active' : 'Free Version'}
        </Text>
        <Text style={styles.sectionDescription}>
          {isPremium 
            ? 'All premium features unlocked' 
            : 'Local storage only - your data stays on your device'
          }
        </Text>
      </View>
      {!isPremium && (
        <View style={styles.buttonContainer}>
          <Button
            title="Upgrade to Premium"
            onPress={handlePremiumUpgrade}
            variant="primary"
            size="medium"
          />
        </View>
      )}
    </Card>
  );

  const renderCloudSyncCard = () => (
    <Card variant={!isPremium ? "dark" : (cloudSyncEnabled ? "success" : "dark")}>
      <Text style={styles.sectionTitle}>☁️ Cloud Backup & Sync</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.statusText}>
          {cloudSyncEnabled ? 'Cloud Sync Enabled' : 'Cloud Sync Disabled'}
        </Text>
        <Text style={styles.sectionDescription}>
          Automatically backup your data to the cloud and sync across devices.
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={cloudSyncEnabled ? 'Cloud Sync Enabled' : 'Enable Cloud Sync'}
          onPress={handleCloudSyncToggle}
          variant={cloudSyncEnabled ? 'success' : 'primary'}
          disabled={!isPremium}
          size="medium"
        />
      </View>
      
      {!isPremium && (
        <Text style={styles.premiumNote}>
          Premium feature - upgrade to enable cloud sync
        </Text>
      )}
      
      <Text style={styles.securityNote}>
        <Text style={styles.bold}>Security:</Text> All data is encrypted before cloud storage
      </Text>
    </Card>
  );

  const renderDataManagementCard = () => (
    <Card variant="dark">
      <Text style={styles.sectionTitle}>💾 Data Management</Text>
      <Text style={styles.sectionDescription}>
        Export your data as JSON for backup or transfer to another device
      </Text>
      
      <View style={styles.buttonRow}>
        <Button
          title="Export Data"
          onPress={handleExportData}
          variant="secondary"
          loading={exporting}
          style={styles.halfWidthButton}
          size="medium"
        />
        <Button
          title="Import Data"
          onPress={handleImportData}
          variant="secondary"
          loading={importing}
          style={styles.halfWidthButton}
          size="medium"
        />
      </View>
    </Card>
  );

  const renderStorageInfoCard = () => (
    <Card variant="dark">
      <Text style={styles.sectionTitle}>📊 Storage Information</Text>
      
      <View style={styles.storageStats}>
        <View style={styles.storageItem}>
          <Text style={styles.storageLabel}>Shooting Sessions</Text>
          <Text style={styles.storageValue}>{sessionCount}</Text>
        </View>
        
        <View style={styles.storageItem}>
          <Text style={styles.storageLabel}>Ladder Tests</Text>
          <Text style={styles.storageValue}>{ladderCount}</Text>
        </View>
        
        <View style={styles.storageItem}>
          <Text style={styles.storageLabel}>Storage Type</Text>
          <Text style={styles.storageValue}>
            {isPremium ? 'Cloud + Local' : 'Local Only'}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderDangerZoneCard = () => (
    <Card variant="error">
      <Text style={styles.dangerSectionTitle}>⚠️ Danger Zone</Text>
      <Text style={styles.dangerSectionDescription}>
        This will permanently delete all your data. Use with caution.
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Clear All Data"
          onPress={handleClearAllData}
          variant="error"
          size="medium"
        />
      </View>
    </Card>
  );

  const renderAccountCard = () => (
    <Card variant="primary">
      <Text style={styles.sectionTitle}>👤 Account</Text>
      
      <View style={styles.aboutInfo}>
        <Text style={styles.infoItem}>Email: {user?.email || 'Unknown'}</Text>
        <Text style={styles.infoItem}>User ID: {user?.uid?.substring(0, 8) + '...' || 'N/A'}</Text>
        {user?.displayName && <Text style={styles.infoItem}>Name: {user.displayName}</Text>}
      </View>
      
      <Text style={styles.sectionDescription}>
        Manage your account settings and authentication.
      </Text>
      
      <View style={styles.buttonRow}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          style={styles.halfWidthButton}
        />
      </View>
    </Card>
  );

  const renderAboutCard = () => (
    <Card variant="info">
      <Text style={styles.sectionTitle}>ℹ️ About Precision Rifle Logbook</Text>
      
      <View style={styles.aboutInfo}>
        <Text style={styles.infoItem}>Version: 1.0.0</Text>
        <Text style={styles.infoItem}>Platform: React Native</Text>
        <Text style={styles.infoItem}>Database: SQLite</Text>
        <Text style={styles.infoItem}>Migration: From HTML/JS Web App</Text>
      </View>
      
      <Text style={styles.sectionDescription}>
        A comprehensive shooting logbook application for precision rifle enthusiasts. 
        Track shooting sessions, environmental conditions, ladder testing, and ballistic analytics.
      </Text>
      
      <View style={styles.featuresList}>
        <Text style={styles.featureItem}>• Session logging with environmental data</Text>
        <Text style={styles.featureItem}>• Ladder test generation and analysis</Text>
        <Text style={styles.featureItem}>• Professional ballistic analytics (Premium)</Text>
        <Text style={styles.featureItem}>• Cloud sync and backup (Premium)</Text>
        <Text style={styles.featureItem}>• Data export/import functionality</Text>
      </View>
    </Card>
  );

  const handleSignOut = async () => {
    try {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign Out', 
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
                Alert.alert('Success', 'Signed out successfully');
              } catch (error) {
                Alert.alert('Error', 'Failed to sign out: ' + error.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out: ' + error.message);
    }
  };

  const renderMainSettings = () => (
    <>
      {renderAccountCard()}
      {renderGunProfilesCard()}
      {renderPremiumStatusCard()}
      {renderCloudSyncCard()}
      {renderDataManagementCard()}
      {renderStorageInfoCard()}
      {renderDangerZoneCard()}
      {renderAboutCard()}
    </>
  );

  if (loading) {
    return (
      <View style={CommonStyles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      <ScrollView style={CommonStyles.contentContainer}>
        {activeSection === 'main' ? (
          renderMainSettings()
        ) : (
          <>
            <View style={styles.navigationHeader}>
              <Button
                title="← Back"
                onPress={() => setActiveSection('main')}
                variant="secondary"
                size="small"
              />
              <Text style={styles.navigationTitle}>Gun Profiles</Text>
              <View style={{ width: 60 }} />
            </View>
            <GunProfilesScreen />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Loading
  loadingText: {
    ...Typography.body,
    color: Colors.grayDark,
    marginTop: Spacing.md,
  },

  // Navigation
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primaryDarkest,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    marginBottom: Spacing.md,
  },

  navigationTitle: {
    ...Typography.h3,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },

  // Content Layout
  contentContainer: {
    marginBottom: Spacing.lg,
  },

  buttonContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },

  halfWidthButton: {
    flex: 1,
  },

  // Typography
  sectionTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.md,
  },

  dangerSectionTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.md,
  },

  statusText: {
    ...Typography.h4,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },

  sectionDescription: {
    ...Typography.body,
    color: Colors.grayDark,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },

  dangerSectionDescription: {
    ...Typography.body,
    color: Colors.white,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },

  // Profile Stats
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    marginVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.grayDeep,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  statLabel: {
    ...Typography.caption,
    color: Colors.grayDark,
    textAlign: 'center',
  },

  warningText: {
    color: Colors.warning,
  },

  // Storage Stats
  storageStats: {
    marginTop: Spacing.md,
  },

  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },

  storageLabel: {
    ...Typography.body,
    color: Colors.white,
  },

  storageValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
  },

  // About Section
  aboutInfo: {
    marginBottom: Spacing.lg,
  },

  infoItem: {
    ...Typography.bodySmall,
    color: Colors.grayDark,
    marginBottom: Spacing.xs,
  },

  featuresList: {
    marginTop: Spacing.lg,
  },

  featureItem: {
    ...Typography.bodySmall,
    color: Colors.grayDark,
    marginBottom: Spacing.sm,
  },

  // Notes
  premiumNote: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    textAlign: 'center',
  },

  securityNote: {
    ...Typography.bodySmall,
    color: Colors.grayDark,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },

  bold: {
    fontWeight: '600',
  },
});

export default SettingsScreen;