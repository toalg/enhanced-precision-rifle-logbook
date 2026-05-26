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
  TouchableOpacity,
} from 'react-native';

import { CommonStyles, Colors, Typography, Spacing, BorderRadius } from '../components/common/AppStyles';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

import LogbookService from '../services/LogbookService';
import SessionAnalytics from '../components/SessionAnalytics';
import GroupSizeCalculator from '../components/GroupSizeCalculator';
import UnifiedGroupAnalysis from '../components/UnifiedGroupAnalysis';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [ladderTests, setLadderTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions', 'groups', or 'premium'
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedLadderTest, setSelectedLadderTest] = useState(null);
  const [groupAnalysisType, setGroupAnalysisType] = useState(null); // 'session' or 'ladder'

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
      
      // Load shooting sessions for analytics
      const sessionData = await LogbookService.getShootingSessions(50, 0);
      setSessions(sessionData);
      
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

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
        onPress={() => setActiveTab('sessions')}
      >
        <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>
          📊 Session Analytics
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
        onPress={() => setActiveTab('groups')}
      >
        <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
          🎯 Group Analysis
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'premium' && styles.activeTab]}
        onPress={() => setActiveTab('premium')}
      >
        <Text style={[styles.tabText, activeTab === 'premium' && styles.activeTabText]}>
          🚀 Premium Features
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSessionAnalytics = () => (
    <SessionAnalytics sessions={sessions} />
  );

  const renderGroupAnalysis = () => {
    // Find sessions with shot data
    const sessionsWithShots = sessions.filter(session => 
      session.shots && session.shots.length >= 2
    );

    // Find ladder tests with velocity data
    const ladderTestsWithData = ladderTests.filter(test => 
      test.charges && test.charges.some(charge => 
        charge.velocities && charge.velocities.length >= 2
      )
    );

    const hasSessionData = sessionsWithShots.length > 0;
    const hasLadderData = ladderTestsWithData.length > 0;

    if (!hasSessionData && !hasLadderData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available for group analysis</Text>
          <Text style={styles.emptySubtext}>
            Record shooting sessions with elevation/windage data or ladder tests with velocity data
          </Text>
        </View>
      );
    }

    // If we have a selected data type, show the analysis
    if (groupAnalysisType && selectedSession) {
      return (
        <View style={styles.container}>
          <Card style={styles.selectedSessionCard}>
            <View style={styles.selectedSessionHeader}>
              <Text style={styles.selectedSessionTitle}>
                {selectedSession.getFormattedDate()} - {selectedSession.rifleProfile}
              </Text>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setSelectedSession(null);
                  setGroupAnalysisType(null);
                }}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedSessionSubtext}>
              {selectedSession.shots.length} shots at {selectedSession.rangeDistance} yards
            </Text>
          </Card>
          
          <UnifiedGroupAnalysis 
            data={selectedSession}
            dataType="session"
            targetDistance={selectedSession.rangeDistance || 100}
          />
        </View>
      );
    }

    if (groupAnalysisType && selectedLadderTest) {
      return (
        <View style={styles.container}>
          <Card style={styles.selectedSessionCard}>
            <View style={styles.selectedSessionHeader}>
              <Text style={styles.selectedSessionTitle}>
                {selectedLadderTest.getFormattedDate()} - {selectedLadderTest.rifle}
              </Text>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setSelectedLadderTest(null);
                  setGroupAnalysisType(null);
                }}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedSessionSubtext}>
              {selectedLadderTest.charges.length} charges tested
            </Text>
          </Card>
          
          <UnifiedGroupAnalysis 
            data={selectedLadderTest}
            dataType="ladder"
            targetDistance={selectedLadderTest.distance || 100}
          />
        </View>
      );
    }

    // Show data type selection
    return (
      <View style={styles.container}>
        <Card style={styles.selectorCard}>
          <Text style={styles.selectorTitle}>Select Data Type for Group Analysis:</Text>
          
          {hasSessionData && (
            <TouchableOpacity
              style={styles.dataTypeButton}
              onPress={() => setGroupAnalysisType('session')}
            >
              <Text style={styles.dataTypeButtonText}>📊 Shooting Sessions</Text>
              <Text style={styles.dataTypeButtonSubtext}>
                {sessionsWithShots.length} sessions with shot data
              </Text>
            </TouchableOpacity>
          )}
          
          {hasLadderData && (
            <TouchableOpacity
              style={styles.dataTypeButton}
              onPress={() => setGroupAnalysisType('ladder')}
            >
              <Text style={styles.dataTypeButtonText}>📈 Ladder Tests</Text>
              <Text style={styles.dataTypeButtonSubtext}>
                {ladderTestsWithData.length} tests with velocity data
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Show session selection if session type is selected */}
        {groupAnalysisType === 'session' && (
          <Card style={styles.selectorCard}>
            <Text style={styles.selectorTitle}>Select Session:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sessionsWithShots.map((session, index) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.sessionButton}
                  onPress={() => setSelectedSession(session)}
                >
                  <Text style={styles.sessionButtonText}>
                    {session.getFormattedDate()}
                  </Text>
                  <Text style={styles.sessionButtonSubtext}>
                    {session.shots.length} shots
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Show ladder test selection if ladder type is selected */}
        {groupAnalysisType === 'ladder' && (
          <Card style={styles.selectorCard}>
            <Text style={styles.selectorTitle}>Select Ladder Test:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ladderTestsWithData.map((test, index) => (
                <TouchableOpacity
                  key={test.id}
                  style={styles.sessionButton}
                  onPress={() => setSelectedLadderTest(test)}
                >
                  <Text style={styles.sessionButtonText}>
                    {test.getFormattedDate()}
                  </Text>
                  <Text style={styles.sessionButtonSubtext}>
                    {test.charges.length} charges
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}
      </View>
    );
  };

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
        {renderTabSelector()}
        {activeTab === 'sessions' ? renderSessionAnalytics() : 
         activeTab === 'groups' ? renderGroupAnalysis() :
         (isPremium ? renderPremiumFeatures() : renderFreeTier())}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  
  activeTab: {
    backgroundColor: Colors.primary,
  },
  
  tabText: {
    ...Typography.body,
    color: Colors.grayDeep,
    fontWeight: '500',
  },
  
  activeTabText: {
    color: Colors.white,
    fontWeight: '600',
  },
  
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
    ...CommonStyles.statusInfo,
    ...Typography.bodySmall,
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
  
  flatSpotItem: {
    ...CommonStyles.statusSuccess,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    ...CommonStyles.statusInfo,
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
    ...CommonStyles.statusSuccess,
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
    ...CommonStyles.statusError,
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
    ...CommonStyles.statusWarning,
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
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  emptyText: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  emptySubtext: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.gray,
  },
  
  sessionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    minWidth: 120,
    alignItems: 'center',
  },
  
  sessionButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  
  sessionButtonSubtext: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.8,
  },
  
  selectedSessionCard: {
    marginBottom: Spacing.lg,
  },
  
  selectedSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  selectedSessionTitle: {
    ...Typography.h4,
    color: Colors.primaryDeep,
    flex: 1,
  },
  
  backButton: {
    backgroundColor: Colors.grayDeep,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  
  backButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '500',
  },
  
  selectedSessionSubtext: {
    ...Typography.bodySmall,
    color: Colors.grayDeep,
  },
  
  dataTypeButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  
  dataTypeButtonText: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  
  dataTypeButtonSubtext: {
    ...Typography.bodySmall,
    color: Colors.white,
    opacity: 0.8,
  },
});

export default AnalyticsScreen;