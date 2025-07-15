/**
 * Logbook Screen - Main Session Logging
 * Migrated from rifle_logbook.html logbook tab functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { CommonStyles, Colors, Typography, Spacing } from '../components/common/AppStyles';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import Card from '../components/common/Card';

import LogbookService from '../services/LogbookService';
import { ShootingSession } from '../models/ShootingSession';

const LogbookScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state (migrated from rifle_logbook.html form structure)
  const [formData, setFormData] = useState(() => ShootingSession.createEmpty());

  useEffect(() => {
    loadSessions();
    
    // Listen for service events
    const handleSessionSaved = () => {
      loadSessions();
      setShowForm(false);
      resetForm();
    };

    LogbookService.addEventListener('sessionSaved', handleSessionSaved);
    
    return () => {
      LogbookService.removeEventListener('sessionSaved', handleSessionSaved);
    };
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const sessionData = await LogbookService.getShootingSessions(50, 0);
      setSessions(sessionData);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load shooting sessions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData(ShootingSession.createEmpty());
  };

  const updateFormField = (field, value) => {
    setFormData(prev => {
      const updated = prev.clone();
      updated[field] = value;
      updated.touch();
      return updated;
    });
  };

  // Weather simulation (migrated from rifle_logbook.html lines 1699-1722)
  const simulateWeatherData = () => {
    const mockData = LogbookService.generateMockEnvironmentalData();
    
    updateFormField('temperature', mockData.temperature);
    updateFormField('humidity', mockData.humidity);
    updateFormField('pressure', mockData.pressure);
    updateFormField('windSpeed', mockData.windSpeed);
    updateFormField('windDirection', mockData.windDirection);
    
    Alert.alert('Weather Data', 'Environmental data simulated and auto-filled!');
  };

  const validateAndSave = async () => {
    try {
      setSaving(true);
      
      const validation = formData.validate();
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      await LogbookService.saveShootingSession(formData.toJSON());
      
      Alert.alert('Success', 'Shooting session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save session: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderSessionItem = (session, index) => (
    <Card key={session.id} style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{session.getFormattedDate()}</Text>
        <Text style={styles.sessionRifle}>{session.rifleProfile}</Text>
      </View>
      
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionDetail}>
          <Text style={styles.sessionDetailLabel}>Range: </Text>
          {session.rangeDistance} {session.rangeUnit}
        </Text>
        
        <Text style={styles.sessionDetail}>
          <Text style={styles.sessionDetailLabel}>Ammo: </Text>
          {session.ammoType}
        </Text>
        
        {session.muzzleVelocity && (
          <Text style={styles.sessionDetail}>
            <Text style={styles.sessionDetailLabel}>Velocity: </Text>
            {session.muzzleVelocity} fps
          </Text>
        )}
        
        {session.hasCompleteEnvironmentalData() && (
          <Text style={styles.sessionDetail}>
            <Text style={styles.sessionDetailLabel}>Conditions: </Text>
            {session.getEnvironmentalSummary()}
          </Text>
        )}
      </View>
      
      {session.notes && (
        <Text style={styles.sessionNotes}>{session.notes}</Text>
      )}
    </Card>
  );

  const renderForm = () => (
    <Card variant="info" style={styles.formCard}>
      <Text style={styles.formTitle}>📝 New Shooting Session</Text>
      
      {/* Weather Meter Section */}
      <Card variant="dark" style={styles.weatherSection}>
        <Text style={styles.weatherTitle}>📡 Weather Meter Data</Text>
        <Button
          title="Simulate Weather Data"
          icon="🌡️"
          onPress={simulateWeatherData}
          variant="primary"
          style={styles.weatherButton}
        />
      </Card>

      {/* Basic Information */}
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <InputField
        label="Date & Time"
        value={formData.date}
        onChangeText={(value) => updateFormField('date', value)}
        placeholder="Select date and time"
        required
      />
      
      <InputField
        label="Rifle Profile"
        value={formData.rifleProfile}
        onChangeText={(value) => updateFormField('rifleProfile', value)}
        placeholder="e.g., Remington 700 .308"
        required
      />
      
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField
            label="Range Distance"
            value={formData.rangeDistance?.toString() || ''}
            onChangeText={(value) => updateFormField('rangeDistance', parseFloat(value) || 0)}
            placeholder="100"
            keyboardType="numeric"
            required
          />
        </View>
        
        <View style={styles.unitSelector}>
          <InputField
            label="Unit"
            value={formData.rangeUnit}
            onChangeText={(value) => updateFormField('rangeUnit', value)}
            placeholder="yards"
          />
        </View>
      </View>
      
      <InputField
        label="Ammo Type & Lot"
        value={formData.ammoType}
        onChangeText={(value) => updateFormField('ammoType', value)}
        placeholder="Federal GMM 175gr, Lot: ABC123"
        required
      />
      
      <InputField
        label="Muzzle Velocity (fps)"
        value={formData.muzzleVelocity?.toString() || ''}
        onChangeText={(value) => updateFormField('muzzleVelocity', parseFloat(value) || null)}
        placeholder="2650"
        keyboardType="numeric"
      />

      {/* Environmental Conditions */}
      <Text style={styles.sectionTitle}>🌡️ Environmental Conditions</Text>
      
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField
            label="Temperature"
            value={formData.temperature?.toString() || ''}
            onChangeText={(value) => updateFormField('temperature', parseFloat(value) || null)}
            placeholder="72"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.unitSelector}>
          <InputField
            label="Unit"
            value={formData.tempUnit}
            onChangeText={(value) => updateFormField('tempUnit', value)}
            placeholder="°F"
          />
        </View>
      </View>
      
      <InputField
        label="Humidity (%)"
        value={formData.humidity?.toString() || ''}
        onChangeText={(value) => updateFormField('humidity', parseInt(value) || null)}
        placeholder="45"
        keyboardType="numeric"
      />
      
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField
            label="Pressure"
            value={formData.pressure?.toString() || ''}
            onChangeText={(value) => updateFormField('pressure', parseFloat(value) || null)}
            placeholder="29.92"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.unitSelector}>
          <InputField
            label="Unit"
            value={formData.pressureUnit}
            onChangeText={(value) => updateFormField('pressureUnit', value)}
            placeholder="inHg"
          />
        </View>
      </View>
      
      <InputField
        label="Wind Direction"
        value={formData.windDirection}
        onChangeText={(value) => updateFormField('windDirection', value)}
        placeholder="3 o'clock or 090°"
      />

      {/* Ballistic Data */}
      <Text style={styles.sectionTitle}>🎯 Predicted vs Actual</Text>
      
      <View style={styles.row}>
        <View style={styles.flex1}>
          <InputField
            label="Predicted Elevation"
            value={formData.predElevation?.toString() || ''}
            onChangeText={(value) => updateFormField('predElevation', parseFloat(value) || null)}
            placeholder="2.5"
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.flex1}>
          <InputField
            label="Actual Elevation"
            value={formData.actualElevation?.toString() || ''}
            onChangeText={(value) => updateFormField('actualElevation', parseFloat(value) || null)}
            placeholder="2.3"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Notes */}
      <InputField
        label="Notes"
        value={formData.notes}
        onChangeText={(value) => updateFormField('notes', value)}
        placeholder="Additional observations, equipment notes, conditions..."
        multiline
        numberOfLines={4}
      />

      {/* Form Actions */}
      <View style={styles.formActions}>
        <Button
          title="💾 Save Session"
          onPress={validateAndSave}
          loading={saving}
          variant="primary"
          style={styles.saveButton}
        />
        
        <Button
          title="🗑️ Clear Form"
          onPress={() => {
            resetForm();
            Alert.alert('Form Cleared', 'Form has been reset');
          }}
          variant="secondary"
          style={styles.clearButton}
        />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={CommonStyles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      <ScrollView 
        style={CommonStyles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Actions */}
        <View style={styles.header}>
          <Button
            title={showForm ? "📋 View Sessions" : "📝 New Session"}
            onPress={() => setShowForm(!showForm)}
            variant={showForm ? "secondary" : "primary"}
          />
        </View>

        {/* Content */}
        {showForm ? (
          renderForm()
        ) : (
          <>
            {sessions.length === 0 ? (
              <View style={CommonStyles.emptyState}>
                <Text style={[styles.emptyText, CommonStyles.emptyStateText]}>
                  No shooting sessions recorded yet.{'\n'}
                  Tap "New Session" to get started!
                </Text>
              </View>
            ) : (
              sessions.map(renderSessionItem)
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  
  formCard: {
    marginBottom: Spacing.xl,
  },
  
  formTitle: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  
  weatherSection: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  
  weatherTitle: {
    ...Typography.h4,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  
  weatherButton: {
    marginTop: Spacing.sm,
  },
  
  sectionTitle: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    color: Colors.primaryDeep,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  
  flex1: {
    flex: 1,
  },
  
  unitSelector: {
    width: 80,
  },
  
  formActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  
  saveButton: {
    flex: 2,
  },
  
  clearButton: {
    flex: 1,
  },
  
  sessionCard: {
    marginBottom: Spacing.md,
  },
  
  sessionHeader: {
    marginBottom: Spacing.md,
  },
  
  sessionDate: {
    ...Typography.h4,
    color: Colors.primaryDeep,
    marginBottom: Spacing.xs,
  },
  
  sessionRifle: {
    ...Typography.h3,
    color: Colors.black,
  },
  
  sessionDetails: {
    marginBottom: Spacing.md,
  },
  
  sessionDetail: {
    ...Typography.body,
    marginBottom: Spacing.xs,
  },
  
  sessionDetailLabel: {
    fontWeight: '600',
    color: Colors.primaryDeep,
  },
  
  sessionNotes: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
    backgroundColor: 'rgba(151, 157, 172, 0.1)',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  
  loadingText: {
    ...Typography.body,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  
  emptyText: {
    color: Colors.grayDark,
  },
});

export default LogbookScreen;