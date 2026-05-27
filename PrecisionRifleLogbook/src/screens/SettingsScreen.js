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
  Linking,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import Config from 'react-native-config';

import { CommonStyles, Colors, Typography, Spacing } from '../components/common/AppStyles';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import GunProfilesScreen from './GunProfilesScreen';

import LogbookService from '../services/LogbookService';
import { supabase } from '../config/supabase';
import { captureException } from '../services/sentry';
import { useProfiles } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [ladderCount, setLadderCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeSection, setActiveSection] = useState('main'); // 'main' or 'profiles'
  const [ballisticUnit, setBallisticUnit] = useState('MOA'); // 'MOA' or 'Mils'

  // Get profile context
  const { profiles, selectedProfile } = useProfiles();
  
  // Get auth context
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadSettings();

    const handleCloudSyncToggled = ({ enabled }) => {
      setCloudSyncEnabled(enabled);
    };

    LogbookService.addEventListener('cloudSyncToggled', handleCloudSyncToggled);

    return () => {
      LogbookService.removeEventListener('cloudSyncToggled', handleCloudSyncToggled);
    };
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const [cloudSync, sessions, ladders, unit] = await Promise.all([
        LogbookService.getCloudSyncSetting(),
        LogbookService.getShootingSessions(1000, 0),
        LogbookService.getLadderTests(100, 0),
        LogbookService.getBallisticUnit(), // Get saved unit preference
      ]);

      setCloudSyncEnabled(cloudSync);
      setSessionCount(sessions.length);
      setLadderCount(ladders.length);
      setBallisticUnit(unit || 'MOA'); // Default to MOA if not set
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloudSyncToggle = async () => {
    try {
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

  const handleBallisticUnitChange = async (newUnit) => {
    try {
      await LogbookService.setBallisticUnit(newUnit);
      setBallisticUnit(newUnit);
      
      Alert.alert(
        'Unit Preference Updated',
        `Ballistic calculations will now use ${newUnit} for elevation and windage adjustments.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update unit preference');
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

  // Account deletion - required by Apple App Store Guideline 5.1.1(v).
  // Two-step confirmation, then calls the delete_my_account() Postgres RPC
  // (SECURITY DEFINER, defined in supabase/migrations/0001_init.sql) which
  // cascade-deletes every row owned by the user across all tables AND
  // deletes the auth.users row. The session becomes invalid immediately
  // after, and we sign out to route the user back to AuthScreen.
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data — shooting sessions, ladder tests, rifle profiles, settings, everything. This cannot be undone.\n\nYour email will remain free for future signup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue…',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Are you absolutely sure?',
      'There is no recovery. All your data will be permanently deleted from our servers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase.rpc('delete_my_account');
              if (error) throw error;

              // Account row is gone; the session token is now invalid. Sign out
              // cleans up local state and routes back to AuthScreen via AuthContext.
              await signOut();

              Alert.alert(
                'Account Deleted',
                'Your account and all data have been permanently deleted.'
              );
            } catch (error) {
              captureException(error, { tags: { action: 'delete_account' } });
              Alert.alert(
                'Error',
                'Failed to delete account. Please check your connection and try again. If the problem persists, contact support.'
              );
              setLoading(false);
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

  const renderCloudSyncCard = () => (
    <Card variant={cloudSyncEnabled ? "success" : "dark"}>
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
          size="medium"
        />
      </View>

      <Text style={styles.securityNote}>
        <Text style={styles.bold}>Security:</Text> All data is encrypted before cloud storage
      </Text>
    </Card>
  );

  const renderBallisticUnitsCard = () => (
    <Card variant="dark">
      <Text style={styles.sectionTitle}>🎯 Ballistic Unit Preferences</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.statusText}>
          Current Unit: {ballisticUnit}
        </Text>
        <Text style={styles.sectionDescription}>
          Choose your preferred unit for elevation and windage adjustments. This affects all ballistic calculations and data displays.
        </Text>
      </View>
      
      <View style={styles.buttonRow}>
        <Button
          title="MOA"
          onPress={() => handleBallisticUnitChange('MOA')}
          variant={ballisticUnit === 'MOA' ? 'primary' : 'secondary'}
          style={styles.halfWidthButton}
          size="medium"
        />
        <Button
          title="Mils"
          onPress={() => handleBallisticUnitChange('Mils')}
          variant={ballisticUnit === 'Mils' ? 'primary' : 'secondary'}
          style={styles.halfWidthButton}
          size="medium"
        />
      </View>
      
      <Text style={styles.securityNote}>
        <Text style={styles.bold}>Note:</Text> Existing data will be converted to display in the selected unit
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
            {cloudSyncEnabled ? 'Cloud + Local' : 'Local Only'}
          </Text>
        </View>
      </View>
    </Card>
  );

  // Open an external URL in the system browser. Logs a Sentry breadcrumb
  // if the URL is missing (would happen if .env wasn't loaded properly).
  const openExternalUrl = async (url, label) => {
    if (!url) {
      captureException(new Error(`Missing URL for ${label}`), { tags: { action: 'open_legal_url', label } });
      Alert.alert(
        'Not Available',
        `The ${label} link isn't configured for this build. Please contact support.`
      );
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Cannot Open Link', `Unable to open ${url}`);
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      captureException(error, { tags: { action: 'open_legal_url', label } });
      Alert.alert('Error', `Failed to open ${label}.`);
    }
  };

  const renderLegalCard = () => (
    <Card variant="dark">
      <Text style={styles.sectionTitle}>📄 Legal</Text>
      <Text style={styles.sectionDescription}>
        Review how your data is handled and the terms of service.
      </Text>

      <View style={styles.buttonRow}>
        <Button
          title="Privacy Policy"
          onPress={() => openExternalUrl(Config.PRIVACY_POLICY_URL, 'Privacy Policy')}
          variant="secondary"
          style={styles.halfWidthButton}
          size="medium"
        />
        <Button
          title="Terms of Service"
          onPress={() => openExternalUrl(Config.TERMS_OF_SERVICE_URL, 'Terms of Service')}
          variant="secondary"
          style={styles.halfWidthButton}
          size="medium"
        />
      </View>
    </Card>
  );

  const renderDangerZoneCard = () => (
    <Card variant="error">
      <Text style={styles.dangerSectionTitle}>⚠️ Danger Zone</Text>
      <Text style={styles.dangerSectionDescription}>
        Destructive actions. These cannot be undone.
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Clear All Data"
          onPress={handleClearAllData}
          variant="error"
          size="medium"
        />
      </View>

      <View style={[styles.buttonContainer, { marginTop: Spacing.md }]}>
        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          variant="error"
          size="medium"
        />
      </View>
    </Card>
  );

  const renderAccountCard = () => (
    <Card variant="dark">
      <Text style={styles.sectionTitle}>👤 Account</Text>
      
      <View style={styles.aboutInfo}>
        <Text style={styles.infoItem}>Email: {user?.email || 'Unknown'}</Text>
        <Text style={styles.infoItem}>User ID: {user?.id?.substring(0, 8) + '...' || 'N/A'}</Text>
        {user?.user_metadata?.display_name && <Text style={styles.infoItem}>Name: {user.user_metadata.display_name}</Text>}
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
      {renderBallisticUnitsCard()}
      {renderCloudSyncCard()}
      {renderDataManagementCard()}
      {renderStorageInfoCard()}
      {renderLegalCard()}
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
    color: Colors.gray,
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