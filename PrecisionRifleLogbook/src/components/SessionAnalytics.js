/**
 * Session Analytics Component
 * Analyzes shooting session data to provide meaningful insights
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from './common/AppStyles';
import Card from './common/Card';

const SessionAnalytics = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No shooting sessions available for analysis</Text>
        <Text style={styles.emptySubtext}>Record some shooting sessions to see analytics</Text>
      </View>
    );
  }

  // Calculate analytics from sessions
  const analytics = calculateAnalytics(sessions);

  return (
    <ScrollView style={styles.container}>
      {/* Summary Statistics */}
      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>📊 Session Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{analytics.totalSessions}</Text>
            <Text style={styles.summaryLabel}>Total Sessions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{analytics.totalShots}</Text>
            <Text style={styles.summaryLabel}>Total Shots</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{analytics.avgShotsPerSession.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Avg Shots/Session</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{analytics.totalRounds}</Text>
            <Text style={styles.summaryLabel}>Rounds Fired</Text>
          </View>
        </View>
      </Card>

      {/* Distance Analysis */}
      <Card style={styles.analysisCard}>
        <Text style={styles.cardTitle}>🎯 Distance Analysis</Text>
        <View style={styles.distanceStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Most Common Distance:</Text>
            <Text style={styles.statValue}>{analytics.mostCommonDistance} yards</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Distance:</Text>
            <Text style={styles.statValue}>{analytics.avgDistance.toFixed(0)} yards</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Distance Range:</Text>
            <Text style={styles.statValue}>{analytics.minDistance} - {analytics.maxDistance} yards</Text>
          </View>
        </View>
      </Card>

      {/* Velocity Analysis */}
      {analytics.hasVelocityData && (
        <Card style={styles.analysisCard}>
          <Text style={styles.cardTitle}>⚡ Velocity Analysis</Text>
          <View style={styles.velocityStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Velocity:</Text>
              <Text style={styles.statValue}>{analytics.avgVelocity.toFixed(0)} fps</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Velocity Range:</Text>
              <Text style={styles.statValue}>{analytics.minVelocity} - {analytics.maxVelocity} fps</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Velocity Spread:</Text>
              <Text style={styles.statValue}>{analytics.velocitySpread} fps</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Elevation Analysis */}
      {analytics.hasElevationData && (
        <Card style={styles.analysisCard}>
          <Text style={styles.cardTitle}>📐 Elevation Analysis</Text>
          <View style={styles.elevationStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Projected:</Text>
              <Text style={styles.statValue}>{analytics.avgProjectedElevation.toFixed(1)} MOA</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Actual:</Text>
              <Text style={styles.statValue}>{analytics.avgActualElevation.toFixed(1)} MOA</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Difference:</Text>
              <Text style={styles.statValue}>{analytics.avgElevationDifference.toFixed(1)} MOA</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Wind Analysis */}
      {analytics.hasWindData && (
        <Card style={styles.analysisCard}>
          <Text style={styles.cardTitle}>💨 Wind Analysis</Text>
          <View style={styles.windStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Projected:</Text>
              <Text style={styles.statValue}>{analytics.avgProjectedWind.toFixed(1)} MOA</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Actual:</Text>
              <Text style={styles.statValue}>{analytics.avgActualWind.toFixed(1)} MOA</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Difference:</Text>
              <Text style={styles.statValue}>{analytics.avgWindDifference.toFixed(1)} MOA</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Environmental Analysis */}
      {analytics.hasEnvironmentalData && (
        <Card style={styles.analysisCard}>
          <Text style={styles.cardTitle}>🌡️ Environmental Conditions</Text>
          <View style={styles.environmentalStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Temperature:</Text>
              <Text style={styles.statValue}>{analytics.avgTemperature.toFixed(1)}°F</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Humidity:</Text>
              <Text style={styles.statValue}>{analytics.avgHumidity.toFixed(0)}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Wind Speed:</Text>
              <Text style={styles.statValue}>{analytics.avgWindSpeed.toFixed(1)} mph</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Pressure:</Text>
              <Text style={styles.statValue}>{analytics.avgPressure.toFixed(2)} inHg</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Rifle Usage */}
      <Card style={styles.analysisCard}>
        <Text style={styles.cardTitle}>🔫 Rifle Usage</Text>
        <View style={styles.rifleStats}>
          {analytics.rifleUsage.map((rifle, index) => (
            <View key={index} style={styles.rifleItem}>
              <Text style={styles.rifleName}>{rifle.name}</Text>
              <View style={styles.rifleDetails}>
                <Text style={styles.rifleDetail}>{rifle.sessions} sessions</Text>
                <Text style={styles.rifleDetail}>{rifle.shots} shots</Text>
                <Text style={styles.rifleDetail}>{rifle.rounds} rounds</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Trends */}
      <Card style={styles.analysisCard}>
        <Text style={styles.cardTitle}>📈 Trends</Text>
        <View style={styles.trendsContainer}>
          <Text style={styles.trendText}>
            • {analytics.recentActivity} sessions in the last 30 days
          </Text>
          <Text style={styles.trendText}>
            • Most active day: {analytics.mostActiveDay}
          </Text>
          <Text style={styles.trendText}>
            • Average session duration: {analytics.avgSessionDuration} minutes
          </Text>
          {analytics.improvementTrend && (
            <Text style={styles.trendText}>
              • {analytics.improvementTrend}
            </Text>
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const calculateAnalytics = (sessions) => {
  const analytics = {
    totalSessions: sessions.length,
    totalShots: 0,
    totalRounds: 0,
    avgShotsPerSession: 0,
    mostCommonDistance: 0,
    avgDistance: 0,
    minDistance: 0,
    maxDistance: 0,
    hasVelocityData: false,
    avgVelocity: 0,
    minVelocity: 0,
    maxVelocity: 0,
    velocitySpread: 0,
    hasElevationData: false,
    avgProjectedElevation: 0,
    avgActualElevation: 0,
    avgElevationDifference: 0,
    hasWindData: false,
    avgProjectedWind: 0,
    avgActualWind: 0,
    avgWindDifference: 0,
    hasEnvironmentalData: false,
    avgTemperature: 0,
    avgHumidity: 0,
    avgWindSpeed: 0,
    avgPressure: 0,
    rifleUsage: [],
    recentActivity: 0,
    mostActiveDay: 'Unknown',
    avgSessionDuration: 0,
    improvementTrend: null
  };

  // Collect all shots from all sessions
  const allShots = [];
  const distances = [];
  const velocities = [];
  const projectedElevations = [];
  const actualElevations = [];
  const projectedWinds = [];
  const actualWinds = [];
  const temperatures = [];
  const humidities = [];
  const windSpeeds = [];
  const pressures = [];
  const rifleCounts = {};

  sessions.forEach(session => {
    // Count rounds
    analytics.totalRounds += session.rounds || 0;
    
    // Process shots
    if (session.shots && session.shots.length > 0) {
      analytics.totalShots += session.shots.length;
      allShots.push(...session.shots);
      
      session.shots.forEach(shot => {
        if (shot.targetDistance) {
          distances.push(parseFloat(shot.targetDistance));
        }
        if (shot.measuredVelocity) {
          velocities.push(parseFloat(shot.measuredVelocity));
        }
        if (shot.projectedElevation) {
          projectedElevations.push(parseFloat(shot.projectedElevation));
        }
        if (shot.actualElevation) {
          actualElevations.push(parseFloat(shot.actualElevation));
        }
        if (shot.projectedWind) {
          projectedWinds.push(parseFloat(shot.projectedWind));
        }
        if (shot.actualWind) {
          actualWinds.push(parseFloat(shot.actualWind));
        }
      });
    }

    // Environmental data
    if (session.temperature) temperatures.push(parseFloat(session.temperature));
    if (session.humidity) humidities.push(parseFloat(session.humidity));
    if (session.windSpeed) windSpeeds.push(parseFloat(session.windSpeed));
    if (session.pressure) pressures.push(parseFloat(session.pressure));

    // Rifle usage
    const rifleName = session.rifleProfile || 'Unknown';
    if (!rifleCounts[rifleName]) {
      rifleCounts[rifleName] = { sessions: 0, shots: 0, rounds: 0 };
    }
    rifleCounts[rifleName].sessions++;
    rifleCounts[rifleName].shots += session.shots?.length || 0;
    rifleCounts[rifleName].rounds += session.rounds || 0;
  });

  // Calculate averages and statistics
  analytics.avgShotsPerSession = analytics.totalSessions > 0 ? analytics.totalShots / analytics.totalSessions : 0;

  if (distances.length > 0) {
    analytics.avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    analytics.minDistance = Math.min(...distances);
    analytics.maxDistance = Math.max(...distances);
    
    // Find most common distance
    const distanceCounts = {};
    distances.forEach(d => {
      distanceCounts[d] = (distanceCounts[d] || 0) + 1;
    });
    analytics.mostCommonDistance = Object.keys(distanceCounts).reduce((a, b) => 
      distanceCounts[a] > distanceCounts[b] ? a : b
    );
  }

  if (velocities.length > 0) {
    analytics.hasVelocityData = true;
    analytics.avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    analytics.minVelocity = Math.min(...velocities);
    analytics.maxVelocity = Math.max(...velocities);
    analytics.velocitySpread = analytics.maxVelocity - analytics.minVelocity;
  }

  if (projectedElevations.length > 0 && actualElevations.length > 0) {
    analytics.hasElevationData = true;
    analytics.avgProjectedElevation = projectedElevations.reduce((a, b) => a + b, 0) / projectedElevations.length;
    analytics.avgActualElevation = actualElevations.reduce((a, b) => a + b, 0) / actualElevations.length;
    analytics.avgElevationDifference = Math.abs(analytics.avgProjectedElevation - analytics.avgActualElevation);
  }

  if (projectedWinds.length > 0 && actualWinds.length > 0) {
    analytics.hasWindData = true;
    analytics.avgProjectedWind = projectedWinds.reduce((a, b) => a + b, 0) / projectedWinds.length;
    analytics.avgActualWind = actualWinds.reduce((a, b) => a + b, 0) / actualWinds.length;
    analytics.avgWindDifference = Math.abs(analytics.avgProjectedWind - analytics.avgActualWind);
  }

  if (temperatures.length > 0 || humidities.length > 0 || windSpeeds.length > 0 || pressures.length > 0) {
    analytics.hasEnvironmentalData = true;
    if (temperatures.length > 0) {
      analytics.avgTemperature = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    }
    if (humidities.length > 0) {
      analytics.avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    }
    if (windSpeeds.length > 0) {
      analytics.avgWindSpeed = windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length;
    }
    if (pressures.length > 0) {
      analytics.avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
    }
  }

  // Convert rifle counts to array
  analytics.rifleUsage = Object.keys(rifleCounts).map(name => ({
    name,
    ...rifleCounts[name]
  })).sort((a, b) => b.sessions - a.sessions);

  // Calculate recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  analytics.recentActivity = sessions.filter(session => 
    new Date(session.date) > thirtyDaysAgo
  ).length;

  // Estimate session duration (rough calculation)
  analytics.avgSessionDuration = analytics.avgShotsPerSession * 2; // Rough estimate: 2 minutes per shot

  return analytics;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  
  cardTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    color: Colors.primaryDeep,
  },
  
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  
  summaryValue: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  
  summaryLabel: {
    ...Typography.bodySmall,
    color: Colors.grayDeep,
    textAlign: 'center',
  },
  
  analysisCard: {
    marginBottom: Spacing.lg,
  },
  
  distanceStats: {
    gap: Spacing.sm,
  },
  
  velocityStats: {
    gap: Spacing.sm,
  },
  
  elevationStats: {
    gap: Spacing.sm,
  },
  
  windStats: {
    gap: Spacing.sm,
  },
  
  environmentalStats: {
    gap: Spacing.sm,
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  
  statLabel: {
    ...Typography.body,
    color: Colors.grayDeep,
  },
  
  statValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primaryDeep,
  },
  
  rifleStats: {
    gap: Spacing.sm,
  },
  
  rifleItem: {
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  
  rifleName: {
    ...Typography.h4,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  
  rifleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  rifleDetail: {
    ...Typography.bodySmall,
    color: Colors.grayDeep,
  },
  
  trendsContainer: {
    gap: Spacing.sm,
  },
  
  trendText: {
    ...Typography.body,
    color: Colors.grayDeep,
  },
});

export default SessionAnalytics; 