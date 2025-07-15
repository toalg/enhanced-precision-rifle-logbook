/**
 * Analytics Screen - Professional Ballistic Analysis
 * Migrated from rifle_logbook.html analytics tab (lines 942-993)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import { CommonStyles, Colors, Typography, Spacing } from '../components/common/AppStyles';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

import LogbookService from '../services/LogbookService';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [ladderTests, setLadderTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    initializeScreen();
    
    // Listen for premium status changes
    const handlePremiumEnabled = () => {
      setIsPremium(true);
    };

    LogbookService.addEventListener('premiumEnabled', handlePremiumEnabled);
    
    return () => {
      LogbookService.removeEventListener('premiumEnabled', handlePremiumEnabled);
    };
  }, []);

  const initializeScreen = async () => {
    try {
      setLoading(true);
      
      // Check premium status
      const premium = await LogbookService.checkPremiumStatus();
      setIsPremium(premium);
      
      if (premium) {
        // Load ladder tests for analysis
        const tests = await LogbookService.getLadderTests(10, 0);
        setLadderTests(tests);
        
        // Auto-select most recent test
        if (tests.length > 0) {
          analyzeTest(tests[0]);
        }
      }
    } catch (error) {
      console.error('Error initializing analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTest = async (test) => {
    try {
      setSelectedTest(test);
      const analysisResult = await LogbookService.analyzeLadderTest(test.id);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error analyzing test:', error);
      Alert.alert('Error', 'Failed to analyze test data');
    }
  };

  const showPremiumUpgrade = () => {
    Alert.alert(
      '🚀 Upgrade to Premium',
      'Unlock advanced ballistic analytics, velocity charts, and professional load analysis tools!',
      [
        {
          text: 'Enable Premium (Demo)',
          onPress: async () => {
            try {
              await LogbookService.enablePremium();
              Alert.alert('Premium Activated!', 'Advanced analytics features are now available');
              initializeScreen();
            } catch (error) {
              Alert.alert('Error', 'Failed to enable premium features');
            }
          },
        },
        { text: 'Maybe Later', style: 'cancel' },
      ]
    );
  };

  const renderVelocityChart = () => {
    if (!analysis || !analysis.test.charges) return null;

    const charges = analysis.test.charges
      .filter(c => c.average_velocity)
      .sort((a, b) => a.charge_weight - b.charge_weight);

    if (charges.length === 0) return null;

    const maxVelocity = Math.max(...charges.map(c => c.average_velocity));
    const minVelocity = Math.min(...charges.map(c => c.average_velocity));
    const velocityRange = maxVelocity - minVelocity;

    return (
      <Card variant="info" style={styles.chartCard}>
        <Text style={styles.chartTitle}>📈 Velocity Analysis</Text>
        
        <View style={styles.chart}>
          <View style={styles.chartContainer}>
            {charges.map((charge, index) => {
              const height = velocityRange > 0 
                ? ((charge.average_velocity - minVelocity) / velocityRange) * 150 + 20
                : 100;
                
              return (
                <View key={index} style={styles.chartBar}>
                  <Text style={styles.chartVelocity}>
                    {Math.round(charge.average_velocity)}
                  </Text>
                  <View 
                    style={[
                      styles.chartColumn, 
                      { 
                        height: height,
                        backgroundColor: analysis.bestCharge?.charge_weight === charge.charge_weight 
                          ? Colors.success 
                          : Colors.primary
                      }
                    ]} 
                  />
                  <Text style={styles.chartCharge}>
                    {charge.charge_weight.toFixed(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        
        <Text style={styles.chartNote}>
          Chart shows average velocity vs charge weight. Green indicates best consistency.
        </Text>
      </Card>
    );
  };

  const renderFlatSpotAnalysis = () => {
    if (!analysis) return null;

    return (
      <Card variant="success" style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>🎯 Flat Spot Detection</Text>
        
        {analysis.flatSpots && analysis.flatSpots.length > 0 ? (
          <View>
            <Text style={styles.analysisText}>
              Found {analysis.flatSpots.length} potential velocity node(s):
            </Text>
            
            {analysis.flatSpots.map((spot, index) => (
              <View key={index} style={styles.flatSpotItem}>
                <Text style={styles.flatSpotCharge}>{spot.charge}gr</Text>
                <Text style={styles.flatSpotVelocity}>{spot.velocity} fps</Text>
                <Text style={styles.flatSpotConfidence}>
                  {spot.confidence.toUpperCase()}
                </Text>
              </View>
            ))}
            
            <Text style={styles.analysisNote}>
              Velocity nodes indicate stable charge weights with minimal velocity variation.
            </Text>
          </View>
        ) : (
          <Text style={styles.analysisText}>
            No clear velocity nodes detected. Consider testing with smaller increments or different charge range.
          </Text>
        )}
      </Card>
    );
  };

  const renderStatisticalAnalysis = () => {
    if (!analysis || !analysis.overallStats) return null;

    const stats = analysis.overallStats;

    return (
      <Card variant="info" style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>📊 Statistical Analysis</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalShots}</Text>
            <Text style={styles.statLabel}>Total Shots</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.averageVelocity || '--'}</Text>
            <Text style={styles.statLabel}>Avg Velocity</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.overallES || '--'}</Text>
            <Text style={styles.statLabel}>Overall ES</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.chargeCount}</Text>
            <Text style={styles.statLabel}>Charges Tested</Text>
          </View>
        </View>

        {analysis.bestCharge && (
          <View style={styles.bestChargeSection}>
            <Text style={styles.bestChargeTitle}>🏆 Most Consistent Charge:</Text>
            <Text style={styles.bestChargeText}>
              {analysis.bestCharge.charge_weight}gr - SD: {analysis.bestCharge.standard_deviation?.toFixed(1)} fps
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const renderLoadRecommendations = () => {
    if (!analysis || !analysis.recommendations) return null;

    return (
      <Card variant="warning" style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>⚖️ Load Analysis & Safety</Text>
        
        <View style={styles.safetyWarning}>
          <Text style={styles.safetyText}>
            ⚠️ SAFETY NOTICE: This application provides data analysis only. 
            Never exceed published load data from reputable sources. Always start low and work up safely.
          </Text>
        </View>
        
        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsTitle}>📋 Analysis Results:</Text>
          {analysis.recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendationItem}>
              • {rec}
            </Text>
          ))}
        </View>
        
        <View style={styles.referencesSection}>
          <Text style={styles.referencesTitle}>📚 Recommended References:</Text>
          <Text style={styles.referenceItem}>• Hodgdon Load Data Center</Text>
          <Text style={styles.referenceItem}>• Manufacturer reloading manuals</Text>
          <Text style={styles.referenceItem}>• Peer-reviewed load data sources</Text>
          <Text style={styles.referenceItem}>• Local reloading communities & mentors</Text>
        </View>
      </Card>
    );
  };

  const renderTestSelector = () => {
    if (ladderTests.length === 0) return null;

    return (
      <Card style={styles.selectorCard}>
        <Text style={styles.selectorTitle}>Select Test for Analysis:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ladderTests.map((test, index) => (
            <Button
              key={test.id}
              title={`${test.rifle} - ${test.getFormattedDate()}`}
              onPress={() => analyzeTest(test)}
              variant={selectedTest?.id === test.id ? "primary" : "outline"}
              style={styles.testButton}
              size="small"
            />
          ))}
        </ScrollView>
      </Card>
    );
  };

  const renderPremiumFeatures = () => (
    <ScrollView>
      {renderTestSelector()}
      {renderVelocityChart()}
      {renderFlatSpotAnalysis()}
      {renderStatisticalAnalysis()}
      {renderLoadRecommendations()}
    </ScrollView>
  );

  const renderFreeTier = () => (
    <View style={styles.upgradeContainer}>
      <Card variant="primary" style={styles.upgradeCard}>
        <Text style={styles.upgradeTitle}>📊 Professional Analytics</Text>
        <Text style={styles.upgradeSubtitle}>PRO Feature</Text>
        
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>📈 Interactive velocity charts</Text>
          <Text style={styles.featureItem}>🎯 Flat spot detection & analysis</Text>
          <Text style={styles.featureItem}>📊 Advanced statistical analysis</Text>
          <Text style={styles.featureItem}>⚖️ Professional load recommendations</Text>
          <Text style={styles.featureItem}>🌡️ Environmental correlation analysis</Text>
          <Text style={styles.featureItem}>📋 Comprehensive ballistic reports</Text>
        </View>
        
        <Button
          title="🚀 Upgrade to Premium"
          onPress={showPremiumUpgrade}
          variant="primary"
          size="large"
          style={styles.upgradeButton}
        />
        
        <Text style={styles.upgradeNote}>
          Unlock advanced ballistic analytics and professional load development tools
        </Text>
      </Card>
      
      <Card style={styles.demoCard}>
        <Text style={styles.demoTitle}>📊 Preview: Velocity Chart</Text>
        <View style={styles.demoChart}>
          <Text style={styles.demoText}>
            Load ladder test data to see charge weight vs velocity analysis with:
          </Text>
          <Text style={styles.demoFeature}>• Interactive charts and graphs</Text>
          <Text style={styles.demoFeature}>• Velocity node identification</Text>
          <Text style={styles.demoFeature}>• Statistical consistency analysis</Text>
          <Text style={styles.demoFeature}>• Professional load recommendations</Text>
        </View>
      </Card>
    </View>
  );

  if (loading) {
    return (
      <View style={CommonStyles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      <View style={CommonStyles.contentContainer}>
        {isPremium ? renderPremiumFeatures() : renderFreeTier()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorCard: {
    marginBottom: Spacing.lg,
  },
  
  selectorTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  
  testButton: {
    marginRight: Spacing.sm,
    minWidth: 150,
  },
  
  chartCard: {
    marginBottom: Spacing.lg,
  },
  
  chartTitle: {
    ...Typography.h3,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  
  chart: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
  },
  
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  
  chartVelocity: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  
  chartColumn: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  
  chartCharge: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    transform: [{ rotate: '-45deg' }],
  },
  
  chartNote: {
    ...Typography.bodySmall,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  analysisCard: {
    marginBottom: Spacing.lg,
  },
  
  analysisTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: Spacing.sm,
  },
  
  analysisText: {
    ...Typography.body,
    marginBottom: Spacing.md,
  },
  
  analysisNote: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    borderRadius: 8,
  },
  
  flatSpotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  
  flatSpotCharge: {
    ...Typography.h4,
    color: Colors.success,
    fontWeight: '700',
  },
  
  flatSpotVelocity: {
    ...Typography.body,
    fontWeight: '600',
  },
  
  flatSpotConfidence: {
    ...Typography.caption,
    backgroundColor: Colors.success,
    color: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    fontWeight: '600',
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  
  statItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  
  statValue: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
  },
  
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.grayDeep,
    textAlign: 'center',
  },
  
  bestChargeSection: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    padding: Spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  
  bestChargeTitle: {
    ...Typography.h4,
    color: Colors.success,
    marginBottom: Spacing.sm,
  },
  
  bestChargeText: {
    ...Typography.body,
    fontWeight: '600',
  },
  
  safetyWarning: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderWidth: 2,
    borderColor: Colors.error,
    borderRadius: 8,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  safetyText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  recommendationsSection: {
    marginBottom: Spacing.lg,
  },
  
  recommendationsTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  
  recommendationItem: {
    ...Typography.body,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  
  referencesSection: {
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    padding: Spacing.lg,
    borderRadius: 8,
  },
  
  referencesTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
    color: Colors.warning,
  },
  
  referenceItem: {
    ...Typography.body,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.md,
  },
  
  upgradeContainer: {
    flex: 1,
  },
  
  upgradeCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  upgradeTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  
  upgradeSubtitle: {
    backgroundColor: Colors.primary,
    color: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: Spacing.xl,
  },
  
  featureItem: {
    ...Typography.body,
    color: Colors.white,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.md,
  },
  
  upgradeButton: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  
  upgradeNote: {
    ...Typography.bodySmall,
    color: Colors.white,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  demoCard: {
    marginBottom: Spacing.lg,
  },
  
  demoTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  demoChart: {
    backgroundColor: 'rgba(151, 157, 172, 0.1)',
    padding: Spacing.lg,
    borderRadius: 12,
    minHeight: 150,
    justifyContent: 'center',
  },
  
  demoText: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  demoFeature: {
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

export default AnalyticsScreen;