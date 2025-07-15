/**
 * Settings Screen - Data Management & Premium Features
 * Migrated from rifle_logbook.html settings tab (lines 620-686)
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

import LogbookService from '../services/LogbookService';

const SettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [ladderCount, setLadderCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

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
      '🚀 Upgrade to Premium',
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

  const handleDataExport = async () => {
    try {
      setExporting(true);
      
      const exportData = await LogbookService.exportAllData();
      const exportString = JSON.stringify(exportData, null, 2);
      
      // In a real app, you'd use react-native-fs to save the file
      // For now, we'll use the Share API
      await Share.share({
        message: exportString,
        title: 'Precision Rifle Logbook Data Export',
      });
      
      Alert.alert(
        'Export Complete',
        `Exported ${exportData.sessions.length} sessions and ${exportData.ladderTests.length} ladder tests`
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export data: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDataImport = () => {
    Alert.alert(
      'Import Data',
      'Data import feature requires file system access. In a production app, this would open a file picker to select your backup JSON file.',
      [
        {
          text: 'Demo Import',
          onPress: () => {
            Alert.alert('Demo', 'This would import data from a selected backup file');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      '⚠️ Clear All Data',
      'This will permanently delete ALL your data including sessions and ladder tests. Are you absolutely sure?',
      [
        {
          text: 'Yes, Delete Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This action cannot be undone. Have you exported your data for backup?',
              [
                {
                  text: 'Delete All Data',
                  style: 'destructive',
                  onPress: clearAllData,
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const clearAllData = async () => {
    try {
      // This would require additional database service methods
      Alert.alert('Demo', 'In production, this would clear all data from the database');
      setSessionCount(0);
      setLadderCount(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data: ' + error.message);
    }
  };

  const renderPremiumStatus = () => (
    <Card variant={isPremium ? "success" : "info"} style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>
            {isPremium ? '🚀 Premium Active' : '🆓 Free Version'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isPremium 
              ? 'Cloud sync and advanced features enabled'
              : 'Local storage only - your data stays on your device'
            }
          </Text>
        </View>
        
        {!isPremium && (
          <Button
            title="Upgrade"
            onPress={handlePremiumUpgrade}
            variant="primary"
            size="small"
          />
        )}
      </View>
    </Card>
  );

  const renderCloudSync = () => (
    <Card variant={isPremium ? "default" : "warning"} style={styles.featureCard}>
      <Text style={styles.featureTitle}>☁️ Cloud Backup & Sync</Text>
      <Text style={styles.featureDescription}>
        Automatically backup your data to the cloud and sync across devices.
      </Text>
      
      <Button
        title={isPremium 
          ? (cloudSyncEnabled ? '☁️ Cloud Sync: ON' : '☁️ Cloud Sync: OFF')
          : '☁️ Cloud Sync (Premium)'
        }
        onPress={handleCloudSyncToggle}
        variant={isPremium ? (cloudSyncEnabled ? "success" : "secondary") : "outline"}
        style={styles.featureButton}
      />
      
      {isPremium && (
        <Text style={styles.securityNote}>
          <Text style={styles.securityLabel}>Security:</Text> All data is encrypted before cloud storage
        </Text>
      )}
    </Card>
  );

  const renderDataManagement = () => (
    <Card style={styles.featureCard}>
      <Text style={styles.featureTitle}>💾 Data Backup & Transfer</Text>
      <Text style={styles.featureDescription}>
        Export your data for manual backup or transfer to another device.
      </Text>
      
      <View style={styles.buttonRow}>
        <Button
          title="📤 Export Data"
          onPress={handleDataExport}
          loading={exporting}
          variant="primary"
          style={styles.halfButton}
        />
        
        <Button
          title="📥 Import Data"
          onPress={handleDataImport}
          loading={importing}
          variant="secondary"
          style={styles.halfButton}
        />
      </View>
      
      <View style={styles.exportInfo}>
        <Text style={styles.exportInfoText}>
          📋 Export includes: All sessions, ladder tests, and settings in JSON format
        </Text>
      </View>
    </Card>
  );

  const renderStorageInfo = () => (
    <Card style={styles.featureCard}>
      <Text style={styles.featureTitle}>📊 Storage Information</Text>
      
      <View style={styles.storageStats}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Sessions:</Text>
          <Text style={styles.statValue}>{sessionCount}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Ladder Tests:</Text>
          <Text style={styles.statValue}>{ladderCount}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Storage Type:</Text>
          <Text style={styles.statValue}>
            {isPremium && cloudSyncEnabled ? 'Cloud + Local' : 'Local Device Storage'}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Data Security:</Text>
          <Text style={styles.statValue}>
            {isPremium && cloudSyncEnabled ? 'Encrypted cloud backup' : 'Stored locally only'}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderDangerZone = () => (
    <Card variant="error" style={styles.dangerCard}>
      <Text style={styles.dangerTitle}>⚠️ Data Management</Text>
      <Text style={styles.dangerDescription}>
        Dangerous actions - use with caution!
      </Text>
      
      <Button
        title="🗑️ Clear All Data"
        onPress={handleClearAllData}
        variant="error"
        style={styles.dangerButton}
      />
      
      <Text style={styles.dangerWarning}>
        This will permanently delete all sessions and ladder tests. Export your data first!
      </Text>
    </Card>
  );

  const renderAboutSection = () => (
    <Card style={styles.aboutCard}>
      <Text style={styles.aboutTitle}>📱 About Precision Rifle Logbook</Text>
      
      <View style={styles.aboutInfo}>
        <Text style={styles.aboutItem}>Version: 1.0.0</Text>
        <Text style={styles.aboutItem}>Platform: React Native</Text>
        <Text style={styles.aboutItem}>Database: SQLite</Text>
        <Text style={styles.aboutItem}>Migration: From HTML/JS Web App</Text>
      </View>
      
      <Text style={styles.aboutDescription}>
        A comprehensive shooting logbook application for precision rifle enthusiasts. 
        Track shooting sessions, environmental conditions, ladder testing, and ballistic analytics.
      </Text>
      
      <View style={styles.aboutFeatures}>
        <Text style={styles.aboutFeature}>📝 Session logging with environmental data</Text>
        <Text style={styles.aboutFeature}>🎯 Ladder test generation and analysis</Text>
        <Text style={styles.aboutFeature}>📊 Professional ballistic analytics (Premium)</Text>
        <Text style={styles.aboutFeature}>☁️ Cloud sync and backup (Premium)</Text>
        <Text style={styles.aboutFeature}>💾 Data export/import functionality</Text>
      </View>
    </Card>
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
        {renderPremiumStatus()}
        {renderCloudSync()}
        {renderDataManagement()}
        {renderStorageInfo()}
        {renderDangerZone()}
        {renderAboutSection()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    marginBottom: Spacing.lg,
  },
  
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statusInfo: {
    flex: 1,
  },
  
  statusTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  
  statusSubtitle: {
    ...Typography.body,
    color: Colors.white,
  },
  
  featureCard: {
    marginBottom: Spacing.lg,
  },
  
  featureTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: Spacing.sm,
  },
  
  featureDescription: {
    ...Typography.body,
    marginBottom: Spacing.lg,
    color: Colors.grayDeep,
  },
  
  featureButton: {
    marginBottom: Spacing.md,
  },
  
  securityNote: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
  },
  
  securityLabel: {
    fontWeight: '600',
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  halfButton: {
    flex: 1,
  },
  
  exportInfo: {
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    padding: Spacing.md,
    borderRadius: 8,
  },
  
  exportInfoText: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  
  storageStats: {
    backgroundColor: 'rgba(151, 157, 172, 0.1)',
    padding: Spacing.lg,
    borderRadius: 12,
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  statLabel: {
    ...Typography.body,
    fontWeight: '600',
  },
  
  statValue: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  dangerCard: {
    marginBottom: Spacing.lg,
  },
  
  dangerTitle: {
    ...Typography.h3,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  
  dangerDescription: {
    ...Typography.body,
    color: Colors.error,
    marginBottom: Spacing.lg,
  },
  
  dangerButton: {
    marginBottom: Spacing.md,
  },
  
  dangerWarning: {
    ...Typography.bodySmall,
    color: Colors.error,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  aboutCard: {
    marginBottom: Spacing.xl,
  },
  
  aboutTitle: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    color: Colors.primary,
  },
  
  aboutInfo: {
    backgroundColor: 'rgba(151, 157, 172, 0.1)',
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  
  aboutItem: {
    ...Typography.body,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  
  aboutDescription: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
    color: Colors.grayDeep,
  },
  
  aboutFeatures: {
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    padding: Spacing.lg,
    borderRadius: 12,
  },
  
  aboutFeature: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  
  loadingText: {
    ...Typography.body,
    color: Colors.white,
    marginTop: Spacing.md,
  },
});

export default SettingsScreen;