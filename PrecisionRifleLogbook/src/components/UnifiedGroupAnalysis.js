/**
 * Unified Group Analysis Component
 * Works with both Ladder Tests and Normal Sessions
 * Provides group size analysis similar to Ballistic-X
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../components/common/AppStyles';
import Card from './common/Card';

const UnifiedGroupAnalysis = ({ data, dataType, targetDistance = 100 }) => {
  const [measurementUnit, setMeasurementUnit] = useState('MOA'); // 'MOA' or 'MIL'
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Process data based on type (ladder test vs normal session)
  const processedData = useMemo(() => {
    if (!data) return null;

    if (dataType === 'session') {
      // Normal shooting session - use shot data
      return processSessionData(data);
    } else if (dataType === 'ladder') {
      // Ladder test - use charge data with potential shot groups
      return processLadderData(data);
    }

    return null;
  }, [data, dataType]);

  const processSessionData = (session) => {
    if (!session.shots || session.shots.length < 2) {
      return null;
    }

    // Filter shots that have both elevation and windage data
    const validShots = session.shots.filter(shot => 
      shot.actualElevation !== '' && 
      shot.actualWind !== '' &&
      !isNaN(parseFloat(shot.actualElevation)) && 
      !isNaN(parseFloat(shot.actualWind))
    );

    if (validShots.length < 2) {
      return null;
    }

    return {
      type: 'session',
      title: `${session.getFormattedDate()} - ${session.rifleProfile}`,
      subtitle: `${validShots.length} shots at ${session.rangeDistance} yards`,
      groups: [{
        id: 'main',
        name: 'Main Group',
        shots: validShots,
        distance: session.rangeDistance || 100
      }]
    };
  };

  const processLadderData = (ladderTest) => {
    if (!ladderTest.charges || ladderTest.charges.length === 0) {
      return null;
    }

    // For ladder tests, we can analyze:
    // 1. Velocity groups per charge
    // 2. Shot groups if available
    // 3. Overall consistency

    const groups = [];

    // Add velocity analysis groups
    ladderTest.charges.forEach((charge, index) => {
      if (charge.velocities && charge.velocities.length >= 2) {
        groups.push({
          id: `charge-${index}`,
          name: `${charge.charge_weight}gr Charge`,
          type: 'velocity',
          velocities: charge.velocities,
          chargeWeight: charge.charge_weight
        });
      }
    });

    // Add shot groups if available (some ladder tests record actual impacts)
    if (ladderTest.shotGroups && ladderTest.shotGroups.length > 0) {
      ladderTest.shotGroups.forEach((group, index) => {
        if (group.shots && group.shots.length >= 2) {
          groups.push({
            id: `group-${index}`,
            name: `Shot Group ${index + 1}`,
            type: 'shots',
            shots: group.shots,
            distance: group.distance || ladderTest.distance || 100
          });
        }
      });
    }

    return {
      type: 'ladder',
      title: `${ladderTest.getFormattedDate()} - ${ladderTest.rifle}`,
      subtitle: `${ladderTest.charges.length} charges tested`,
      groups: groups
    };
  };

  const calculateGroupSize = (shots, distance) => {
    if (!shots || shots.length < 2) return null;

    // Convert to numeric values
    const shotPoints = shots.map(shot => ({
      id: shot.id || shot.roundNumber,
      elevation: parseFloat(shot.actualElevation || shot.elevation || 0),
      windage: parseFloat(shot.actualWind || shot.windage || 0),
      roundNumber: shot.roundNumber || shot.id
    }));

    // Calculate group statistics
    const elevations = shotPoints.map(p => p.elevation);
    const windages = shotPoints.map(p => p.windage);

    // Find min/max for each axis
    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);
    const minWindage = Math.min(...windages);
    const maxWindage = Math.max(...windages);

    // Calculate spreads
    const elevationSpread = maxElevation - minElevation;
    const windageSpread = maxWindage - minWindage;

    // Calculate center of group
    const centerElevation = (minElevation + maxElevation) / 2;
    const centerWindage = (minWindage + maxWindage) / 2;

    // Calculate distances from center for each shot
    const distancesFromCenter = shotPoints.map(point => {
      const deltaElevation = point.elevation - centerElevation;
      const deltaWindage = point.windage - centerWindage;
      return Math.sqrt(deltaElevation * deltaElevation + deltaWindage * deltaWindage);
    });

    // Find maximum distance from center (group radius)
    const maxDistanceFromCenter = Math.max(...distancesFromCenter);
    const groupDiameter = maxDistanceFromCenter * 2;

    // Convert to MOA or MIL at target distance
    const moaPerInch = 1.047; // 1 MOA = 1.047 inches at 100 yards
    const milPerInch = 0.36; // 1 MIL = 0.36 inches at 100 yards
    
    const distanceFactor = distance / 100; // Adjust for actual distance
    
    const groupSizeInches = groupDiameter * distanceFactor;
    const groupSizeMOA = groupSizeInches / moaPerInch;
    const groupSizeMIL = groupSizeInches / milPerInch;

    // Calculate extreme spread (largest distance between any two shots)
    let maxExtremeSpread = 0;
    for (let i = 0; i < shotPoints.length; i++) {
      for (let j = i + 1; j < shotPoints.length; j++) {
        const deltaElevation = shotPoints[i].elevation - shotPoints[j].elevation;
        const deltaWindage = shotPoints[i].windage - shotPoints[j].windage;
        const distance = Math.sqrt(deltaElevation * deltaElevation + deltaWindage * deltaWindage);
        maxExtremeSpread = Math.max(maxExtremeSpread, distance);
      }
    }

    const extremeSpreadInches = maxExtremeSpread * distanceFactor;
    const extremeSpreadMOA = extremeSpreadInches / moaPerInch;
    const extremeSpreadMIL = extremeSpreadInches / milPerInch;

    // Calculate mean radius (average distance from center)
    const meanRadius = distancesFromCenter.reduce((sum, dist) => sum + dist, 0) / distancesFromCenter.length;
    const meanRadiusInches = meanRadius * distanceFactor;
    const meanRadiusMOA = meanRadiusInches / moaPerInch;
    const meanRadiusMIL = meanRadiusInches / milPerInch;

    return {
      shotCount: shots.length,
      elevationSpread,
      windageSpread,
      centerElevation,
      centerWindage,
      groupSizeMOA,
      groupSizeMIL,
      groupSizeInches,
      extremeSpreadMOA,
      extremeSpreadMIL,
      extremeSpreadInches,
      meanRadiusMOA,
      meanRadiusMIL,
      meanRadiusInches,
      shotPoints,
      distancesFromCenter
    };
  };

  const calculateVelocityGroup = (velocities) => {
    if (!velocities || velocities.length < 2) return null;

    const velocityValues = velocities.map(v => parseFloat(v));
    const avgVelocity = velocityValues.reduce((sum, v) => sum + v, 0) / velocityValues.length;
    const minVelocity = Math.min(...velocityValues);
    const maxVelocity = Math.max(...velocityValues);
    const velocitySpread = maxVelocity - minVelocity;
    const velocitySD = Math.sqrt(
      velocityValues.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocityValues.length
    );

    return {
      shotCount: velocities.length,
      avgVelocity,
      minVelocity,
      maxVelocity,
      velocitySpread,
      velocitySD
    };
  };

  const getGroupQuality = (groupSizeMOA) => {
    if (groupSizeMOA < 0.5) return { quality: 'Excellent', color: Colors.success };
    if (groupSizeMOA < 1.0) return { quality: 'Very Good', color: Colors.info };
    if (groupSizeMOA < 1.5) return { quality: 'Good', color: Colors.warning };
    if (groupSizeMOA < 2.0) return { quality: 'Fair', color: Colors.error };
    return { quality: 'Poor', color: Colors.error };
  };

  if (!processedData) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>🎯 Group Analysis</Text>
        <Text style={styles.noDataText}>
          {dataType === 'session' 
            ? 'Need at least 2 shots with elevation and windage data to calculate group size.'
            : 'Need at least 2 velocity readings or shot groups to analyze.'
          }
        </Text>
      </Card>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.mainCard}>
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Group Analysis</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                measurementUnit === 'MOA' && styles.activeUnitButton
              ]}
              onPress={() => setMeasurementUnit('MOA')}
            >
              <Text style={[
                styles.unitButtonText,
                measurementUnit === 'MOA' && styles.activeUnitButtonText
              ]}>
                MOA
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                measurementUnit === 'MIL' && styles.activeUnitButton
              ]}
              onPress={() => setMeasurementUnit('MIL')}
            >
              <Text style={[
                styles.unitButtonText,
                measurementUnit === 'MIL' && styles.activeUnitButtonText
              ]}>
                MIL
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Source Info */}
        <Card style={styles.sourceCard}>
          <Text style={styles.sourceTitle}>{processedData.title}</Text>
          <Text style={styles.sourceSubtitle}>{processedData.subtitle}</Text>
          <Text style={styles.sourceType}>
            {dataType === 'session' ? '📊 Shooting Session' : '📈 Ladder Test'}
          </Text>
        </Card>

        {/* Group Selection */}
        {processedData.groups.length > 1 && (
          <Card style={styles.selectionCard}>
            <Text style={styles.sectionTitle}>Select Group to Analyze:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {processedData.groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupButton,
                    selectedGroup?.id === group.id && styles.selectedGroupButton
                  ]}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Text style={[
                    styles.groupButtonText,
                    selectedGroup?.id === group.id && styles.selectedGroupButtonText
                  ]}>
                    {group.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Group Analysis */}
        {processedData.groups.map((group, index) => {
          // Show first group by default, or selected group
          if (processedData.groups.length > 1 && selectedGroup && selectedGroup.id !== group.id) {
            return null;
          }

          let analysis = null;
          if (group.type === 'shots') {
            analysis = calculateGroupSize(group.shots, group.distance);
          } else if (group.type === 'velocity') {
            analysis = calculateVelocityGroup(group.velocities);
          }

          if (!analysis) return null;

          const groupQuality = group.type === 'shots' ? getGroupQuality(analysis.groupSizeMOA) : null;

          return (
            <View key={group.id}>
              <Card style={styles.groupCard}>
                <Text style={styles.groupTitle}>{group.name}</Text>
                
                {group.type === 'shots' ? (
                  // Shot Group Analysis
                  <View>
                    <View style={styles.groupSizeDisplay}>
                      <Text style={styles.groupSizeLabel}>Group Size:</Text>
                      <Text style={styles.groupSizeValue}>
                        {measurementUnit === 'MOA' 
                          ? `${analysis.groupSizeMOA.toFixed(2)} MOA`
                          : `${analysis.groupSizeMIL.toFixed(2)} MIL`
                        }
                      </Text>
                      {groupQuality && (
                        <View style={[styles.qualityBadge, { backgroundColor: groupQuality.color }]}>
                          <Text style={styles.qualityText}>{groupQuality.quality}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{analysis.shotCount}</Text>
                        <Text style={styles.statLabel}>Shots</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{group.distance}</Text>
                        <Text style={styles.statLabel}>Yards</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {measurementUnit === 'MOA' 
                            ? `${analysis.extremeSpreadMOA.toFixed(2)}`
                            : `${analysis.extremeSpreadMIL.toFixed(2)}`
                          }
                        </Text>
                        <Text style={styles.statLabel}>Extreme Spread</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {measurementUnit === 'MOA' 
                            ? `${analysis.meanRadiusMOA.toFixed(2)}`
                            : `${analysis.meanRadiusMIL.toFixed(2)}`
                          }
                        </Text>
                        <Text style={styles.statLabel}>Mean Radius</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  // Velocity Group Analysis
                  <View>
                    <View style={styles.velocityDisplay}>
                      <Text style={styles.velocityLabel}>Average Velocity:</Text>
                      <Text style={styles.velocityValue}>
                        {analysis.avgVelocity.toFixed(0)} fps
                      </Text>
                    </View>

                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{analysis.shotCount}</Text>
                        <Text style={styles.statLabel}>Readings</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{analysis.velocitySpread}</Text>
                        <Text style={styles.statLabel}>Spread (fps)</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{analysis.velocitySD.toFixed(1)}</Text>
                        <Text style={styles.statLabel}>SD (fps)</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{group.chargeWeight}</Text>
                        <Text style={styles.statLabel}>Charge (gr)</Text>
                      </View>
                    </View>
                  </View>
                )}
              </Card>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  mainCard: {
    marginBottom: Spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  title: {
    ...Typography.h3,
    color: Colors.primaryDeep,
  },
  
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.grayLight,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  
  unitButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  
  activeUnitButton: {
    backgroundColor: Colors.primary,
  },
  
  unitButtonText: {
    ...Typography.body,
    color: Colors.grayDeep,
    fontWeight: '500',
  },
  
  activeUnitButtonText: {
    color: Colors.white,
  },
  
  sourceCard: {
    marginBottom: Spacing.lg,
  },
  
  sourceTitle: {
    ...Typography.h4,
    color: Colors.primaryDeep,
    marginBottom: Spacing.xs,
  },
  
  sourceSubtitle: {
    ...Typography.body,
    color: Colors.grayDeep,
    marginBottom: Spacing.xs,
  },
  
  sourceType: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  selectionCard: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
    color: Colors.primaryDeep,
  },
  
  groupButton: {
    backgroundColor: Colors.grayLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    minWidth: 120,
    alignItems: 'center',
  },
  
  selectedGroupButton: {
    backgroundColor: Colors.primary,
  },
  
  groupButtonText: {
    ...Typography.body,
    color: Colors.grayDeep,
    fontWeight: '500',
  },
  
  selectedGroupButtonText: {
    color: Colors.white,
  },
  
  groupCard: {
    marginBottom: Spacing.lg,
  },
  
  groupTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
    color: Colors.primaryDeep,
  },
  
  groupSizeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    borderRadius: BorderRadius.md,
  },
  
  groupSizeLabel: {
    ...Typography.body,
    color: Colors.grayDeep,
  },
  
  groupSizeValue: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  
  qualityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  
  qualityText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  
  velocityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderRadius: BorderRadius.md,
  },
  
  velocityLabel: {
    ...Typography.body,
    color: Colors.grayDeep,
  },
  
  velocityValue: {
    ...Typography.h2,
    color: Colors.success,
    fontWeight: 'bold',
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  statItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  
  statValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.grayDeep,
    textAlign: 'center',
  },
  
  noDataText: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.gray,
    fontStyle: 'italic',
  },
});

export default UnifiedGroupAnalysis; 