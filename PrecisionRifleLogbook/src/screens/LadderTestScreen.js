/**
 * Ladder Test Screen
 * Migrated from rifle_logbook.html ladder test functionality (lines 860-940)
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
import { LadderTest, LadderCharge } from '../models/LadderTest';

const LadderTestScreen = () => {
  const [ladderTests, setLadderTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state (migrated from rifle_logbook.html ladder form structure)
  const [formData, setFormData] = useState(() => LadderTest.createEmpty());
  const [charges, setCharges] = useState([]);

  // Ladder generation state
  const [startCharge, setStartCharge] = useState('42.0');
  const [endCharge, setEndCharge] = useState('44.0');
  const [chargeIncrement, setChargeIncrement] = useState('0.2');

  useEffect(() => {
    loadLadderTests();
    
    // Listen for service events
    const handleLadderTestSaved = () => {
      loadLadderTests();
      setShowForm(false);
      resetForm();
    };

    LogbookService.addEventListener('ladderTestSaved', handleLadderTestSaved);
    
    return () => {
      LogbookService.removeEventListener('ladderTestSaved', handleLadderTestSaved);
    };
  }, []);

  const loadLadderTests = async () => {
    try {
      setLoading(true);
      const testData = await LogbookService.getLadderTests(20, 0);
      setLadderTests(testData);
    } catch (error) {
      console.error('Error loading ladder tests:', error);
      Alert.alert('Error', 'Failed to load ladder tests');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLadderTests();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData(LadderTest.createEmpty());
    setCharges([]);
    setStartCharge('42.0');
    setEndCharge('44.0');
    setChargeIncrement('0.2');
  };

  const updateFormField = (field, value) => {
    setFormData(prev => {
      const updated = prev.clone();
      updated[field] = value;
      updated.touch();
      return updated;
    });
  };

  // Generate ladder charges (migrated from rifle_logbook.html lines 1416-1470)
  const generateLadderCharges = () => {
    const start = parseFloat(startCharge);
    const end = parseFloat(endCharge);
    const increment = parseFloat(chargeIncrement);

    if (!start || !end || !increment) {
      Alert.alert('Error', 'Please fill in start charge, end charge, and increment');
      return;
    }

    if (start >= end) {
      Alert.alert('Error', 'Start charge must be less than end charge');
      return;
    }

    const generatedCharges = LadderTest.generateCharges(start, end, increment);
    setCharges(generatedCharges);
    
    // Update form data
    setFormData(prev => {
      const updated = prev.clone();
      updated.charges = generatedCharges;
      updated.touch();
      return updated;
    });

    Alert.alert('Success', `Generated ${generatedCharges.length} charge weights`);
  };

  const updateChargeVelocity = (chargeIndex, shotIndex, velocity) => {
    setCharges(prev => {
      const updated = [...prev];
      const charge = updated[chargeIndex];
      charge.velocities[shotIndex] = velocity ? parseFloat(velocity) : null;
      return updated;
    });

    // Update form data
    setFormData(prev => {
      const updated = prev.clone();
      updated.charges = charges;
      updated.touch();
      return updated;
    });
  };

  const updateChargeNotes = (chargeIndex, notes) => {
    setCharges(prev => {
      const updated = [...prev];
      updated[chargeIndex].notes = notes;
      return updated;
    });

    // Update form data
    setFormData(prev => {
      const updated = prev.clone();
      updated.charges = charges;
      updated.touch();
      return updated;
    });
  };

  const validateAndSave = async () => {
    try {
      setSaving(true);
      
      // Update charges in form data
      const updatedFormData = formData.clone();
      updatedFormData.charges = charges;
      
      const validation = updatedFormData.validate();
      if (!validation.isValid) {
        Alert.alert('Validation Error', validation.errors.join('\n'));
        return;
      }

      await LogbookService.saveLadderTest(updatedFormData.toJSON());
      
      Alert.alert('Success', 'Ladder test saved successfully!');
    } catch (error) {
      console.error('Error saving ladder test:', error);
      Alert.alert('Error', 'Failed to save ladder test: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const analyzeTest = async (testId) => {
    try {
      const analysis = await LogbookService.analyzeLadderTest(testId);
      
      let analysisText = `Test Analysis for ${analysis.test.rifle}\n\n`;
      
      if (analysis.bestCharge) {
        const stats = analysis.bestCharge;
        analysisText += `🎯 Best Charge: ${stats.chargeWeight}gr\n`;
        analysisText += `📊 SD: ${stats.standardDeviation} fps\n`;
        analysisText += `📈 ES: ${stats.extremeSpread} fps\n\n`;
      }
      
      if (analysis.flatSpots && analysis.flatSpots.length > 0) {
        analysisText += `🔍 Velocity Nodes Found:\n`;
        analysis.flatSpots.forEach(spot => {
          analysisText += `• ${spot.charge}gr @ ${spot.velocity} fps\n`;
        });
        analysisText += '\n';
      }
      
      analysisText += `⚠️ Always verify against published load data\n`;
      analysisText += `📚 Consult official reloading manuals`;
      
      Alert.alert('Ladder Test Analysis', analysisText, [
        { text: 'View in Analytics', onPress: () => {/* Navigate to analytics */} },
        { text: 'OK' }
      ]);
    } catch (error) {
      console.error('Error analyzing test:', error);
      Alert.alert('Error', 'Failed to analyze ladder test');
    }
  };

  const renderChargeEntry = (charge, index) => {
    const stats = charge.getStatistics();
    
    return (
      <Card key={index} variant="info" style={styles.chargeCard}>
        <View style={styles.chargeHeader}>
          <Text style={styles.chargeTitle}>Round {index + 1}</Text>
          <Text style={styles.chargeWeight}>{charge.chargeWeight.toFixed(1)}gr</Text>
        </View>
        
        <Text style={styles.velocityLabel}>Velocities (fps):</Text>
        <View style={styles.velocityRow}>
          <InputField
            placeholder="Shot 1"
            value={charge.velocities[0]?.toString() || ''}
            onChangeText={(value) => updateChargeVelocity(index, 0, value)}
            keyboardType="numeric"
            style={styles.velocityInput}
          />
          <InputField
            placeholder="Shot 2"
            value={charge.velocities[1]?.toString() || ''}
            onChangeText={(value) => updateChargeVelocity(index, 1, value)}
            keyboardType="numeric"
            style={styles.velocityInput}
          />
          <InputField
            placeholder="Shot 3"
            value={charge.velocities[2]?.toString() || ''}
            onChangeText={(value) => updateChargeVelocity(index, 2, value)}
            keyboardType="numeric"
            style={styles.velocityInput}
          />
        </View>
        
        {stats.shotCount > 0 && (
          <View style={styles.statsRow}>
            <Text style={styles.statText}>Avg: {stats.average || '--'}</Text>
            <Text style={styles.statText}>ES: {stats.extremeSpread || '--'}</Text>
            <Text style={styles.statText}>SD: {stats.standardDeviation || '--'}</Text>
          </View>
        )}
        
        <InputField
          placeholder="Pressure signs, accuracy notes..."
          value={charge.notes}
          onChangeText={(notes) => updateChargeNotes(index, notes)}
          multiline
          numberOfLines={2}
          style={styles.notesInput}
        />
      </Card>
    );
  };

  const renderTestItem = (test, index) => (
    <Card key={test.id} style={styles.testCard}>
      <View style={styles.testHeader}>
        <Text style={styles.testDate}>{test.getFormattedDate()}</Text>
        <Text style={styles.testRifle}>{test.rifle}</Text>
      </View>
      
      <View style={styles.testDetails}>
        <Text style={styles.testDetail}>
          <Text style={styles.testDetailLabel}>Range: </Text>
          {test.rangeDistance} yards
        </Text>
        
        <Text style={styles.testDetail}>
          <Text style={styles.testDetailLabel}>Bullet: </Text>
          {test.bullet}
        </Text>
        
        <Text style={styles.testDetail}>
          <Text style={styles.testDetailLabel}>Powder: </Text>
          {test.powder}
        </Text>
        
        <Text style={styles.testDetail}>
          <Text style={styles.testDetailLabel}>Charges Tested: </Text>
          {test.charges.length}
        </Text>
      </View>
      
      {test.notes && (
        <Text style={styles.testNotes}>{test.notes}</Text>
      )}
      
      <Button
        title="📊 Analyze Test"
        onPress={() => analyzeTest(test.id)}
        variant="primary"
        style={styles.analyzeButton}
      />
    </Card>
  );

  const renderForm = () => (
    <ScrollView>
      <Card variant="info" style={styles.formCard}>
        <Text style={styles.formTitle}>🎯 Ladder Test Setup</Text>
        
        {/* Test Configuration */}
        <Text style={styles.sectionTitle}>Test Configuration</Text>
        
        <InputField
          label="Test Date"
          value={formData.date}
          onChangeText={(value) => updateFormField('date', value)}
          placeholder="Select date"
          required
        />
        
        <InputField
          label="Rifle Configuration"
          value={formData.rifle}
          onChangeText={(value) => updateFormField('rifle', value)}
          placeholder="Remington 700 .308, 26in barrel"
          required
        />
        
        <InputField
          label="Test Range (yards)"
          value={formData.rangeDistance?.toString() || ''}
          onChangeText={(value) => updateFormField('rangeDistance', parseFloat(value) || 0)}
          placeholder="300"
          keyboardType="numeric"
          required
        />
        
        <InputField
          label="Bullet & Weight"
          value={formData.bullet}
          onChangeText={(value) => updateFormField('bullet', value)}
          placeholder="Berger 175gr VLD"
          required
        />
        
        <InputField
          label="Powder Type"
          value={formData.powder}
          onChangeText={(value) => updateFormField('powder', value)}
          placeholder="H4350"
          required
        />
        
        <InputField
          label="Brass & Prep"
          value={formData.brass}
          onChangeText={(value) => updateFormField('brass', value)}
          placeholder="Lapua .308, 2x fired, annealed"
        />

        {/* Ladder Generation */}
        <Card variant="warning" style={styles.ladderGenCard}>
          <Text style={styles.sectionTitle}>⚖️ Ladder Data Entry</Text>
          
          <View style={styles.generatorRow}>
            <View style={styles.generatorInput}>
              <InputField
                label="Start Charge (gr)"
                value={startCharge}
                onChangeText={setStartCharge}
                placeholder="42.0"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.generatorInput}>
              <InputField
                label="End Charge (gr)"
                value={endCharge}
                onChangeText={setEndCharge}
                placeholder="44.0"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.generatorInput}>
              <InputField
                label="Increment (gr)"
                value={chargeIncrement}
                onChangeText={setChargeIncrement}
                placeholder="0.2"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <Button
            title="Generate Ladder"
            onPress={generateLadderCharges}
            variant="secondary"
            icon="⚖️"
          />
        </Card>
        
        {/* Charge Entries */}
        {charges.length > 0 && (
          <View style={styles.chargeEntries}>
            <Text style={styles.sectionTitle}>Charge Weight Data</Text>
            {charges.map(renderChargeEntry)}
          </View>
        )}
        
        <InputField
          label="Test Notes"
          value={formData.notes}
          onChangeText={(value) => updateFormField('notes', value)}
          placeholder="Weather conditions, equipment notes, observations..."
          multiline
          numberOfLines={3}
        />

        {/* Form Actions */}
        <View style={styles.formActions}>
          <Button
            title="💾 Save Ladder Test"
            onPress={validateAndSave}
            loading={saving}
            variant="primary"
            style={styles.saveButton}
          />
          
          <Button
            title="🗑️ Clear Form"
            onPress={() => {
              resetForm();
              Alert.alert('Form Cleared', 'Ladder test form has been reset');
            }}
            variant="secondary"
            style={styles.clearButton}
          />
        </View>
      </Card>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={CommonStyles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading ladder tests...</Text>
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
            title={showForm ? "📋 View Tests" : "🎯 New Ladder Test"}
            onPress={() => setShowForm(!showForm)}
            variant={showForm ? "secondary" : "primary"}
          />
        </View>

        {/* Content */}
        {showForm ? (
          renderForm()
        ) : (
          <>
            {ladderTests.length === 0 ? (
              <View style={CommonStyles.emptyState}>
                <Text style={[styles.emptyText, CommonStyles.emptyStateText]}>
                  No ladder tests recorded yet.{'\n'}
                  Tap "New Ladder Test" to get started!
                </Text>
              </View>
            ) : (
              ladderTests.map(renderTestItem)
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
  
  sectionTitle: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    color: Colors.primaryDeep,
  },
  
  ladderGenCard: {
    marginVertical: Spacing.lg,
  },
  
  generatorRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  generatorInput: {
    flex: 1,
  },
  
  chargeEntries: {
    marginTop: Spacing.lg,
  },
  
  chargeCard: {
    marginBottom: Spacing.md,
  },
  
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  chargeTitle: {
    ...Typography.h4,
    color: Colors.black,
  },
  
  chargeWeight: {
    ...Typography.h4,
    color: Colors.primary,
    backgroundColor: Colors.primary,
    color: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  velocityLabel: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  
  velocityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  
  velocityInput: {
    flex: 1,
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    padding: Spacing.sm,
    borderRadius: 8,
  },
  
  statText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryDeep,
  },
  
  notesInput: {
    marginBottom: 0,
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
  
  testCard: {
    marginBottom: Spacing.md,
  },
  
  testHeader: {
    marginBottom: Spacing.md,
  },
  
  testDate: {
    ...Typography.h4,
    color: Colors.primaryDeep,
    marginBottom: Spacing.xs,
  },
  
  testRifle: {
    ...Typography.h3,
    color: Colors.black,
  },
  
  testDetails: {
    marginBottom: Spacing.md,
  },
  
  testDetail: {
    ...Typography.body,
    marginBottom: Spacing.xs,
  },
  
  testDetailLabel: {
    fontWeight: '600',
    color: Colors.primaryDeep,
  },
  
  testNotes: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
    backgroundColor: 'rgba(151, 157, 172, 0.1)',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  
  analyzeButton: {
    marginTop: Spacing.sm,
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

export default LadderTestScreen;