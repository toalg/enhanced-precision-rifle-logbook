/**
 * Group Size Calculator Component
 * Inspired by Ballistic-X group analysis functionality
 * Calculates MOA/MIL groups from shot elevation/windage data
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing } from './common/AppStyles';
import Card from './common/Card';
import { useBallisticUnit } from '../hooks/useBallisticUnit';
import BallisticUtils from '../utils/BallisticUtils';

const GroupSizeCalculator = ({ shots, targetDistance = 100 }) => {
  const { ballisticUnit } = useBallisticUnit();

  // Calculate group size from shot data using BallisticUtils
  const groupAnalysis = useMemo(() => {
    return BallisticUtils.calculateGroupSize(shots, ballisticUnit);
  }, [shots, ballisticUnit]);

  // Get group quality assessment
  const groupQuality = useMemo(() => {
    if (!groupAnalysis) return null;
    return BallisticUtils.getGroupQuality(groupAnalysis.groupSize, ballisticUnit);
  }, [groupAnalysis, ballisticUnit]);

  if (!groupAnalysis) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>🎯 Group Size Calculator</Text>
        <Text style={styles.noDataText}>
          Need at least 2 shots with elevation and windage data to calculate group size.
        </Text>
        <Text style={styles.helpText}>
          Enter actual elevation and windage measurements in the shooting table to see group analysis.
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>🎯 Group Analysis ({ballisticUnit})</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Shot Count:</Text>
          <Text style={styles.statValue}>{groupAnalysis.shotCount}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Group Size:</Text>
          <Text style={[styles.statValue, { color: groupQuality?.color || Colors.primary }]}>
            {groupAnalysis.formattedGroupSize}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Quality:</Text>
          <Text style={[styles.statValue, { color: groupQuality?.color || Colors.primary }]}>
            {groupQuality?.quality || 'Unknown'}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Extreme Spread:</Text>
          <Text style={styles.statValue}>{groupAnalysis.formattedExtremeSpread}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Mean Radius:</Text>
          <Text style={styles.statValue}>{groupAnalysis.formattedMeanRadius}</Text>
        </View>
      </View>

      <View style={styles.spreadContainer}>
        <Text style={styles.sectionTitle}>Shot Spread</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Elevation:</Text>
          <Text style={styles.statValue}>
            {BallisticUtils.formatValue(groupAnalysis.elevationSpread, ballisticUnit)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Windage:</Text>
          <Text style={styles.statValue}>
            {BallisticUtils.formatValue(groupAnalysis.windageSpread, ballisticUnit)}
          </Text>
        </View>
      </View>

      <Text style={styles.note}>
        Group size calculated at {targetDistance} yards using {ballisticUnit} measurements.
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  title: {
    ...Typography.h3,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  noDataText: {
    ...Typography.body,
    color: Colors.grayDark,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  helpText: {
    ...Typography.bodySmall,
    color: Colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  statsContainer: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    ...Typography.h4,
    color: Colors.white,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayDeep,
  },

  statLabel: {
    ...Typography.body,
    color: Colors.gray,
  },

  statValue: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },

  spreadContainer: {
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.grayDeep,
  },

  note: {
    ...Typography.caption,
    color: Colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
});

export default GroupSizeCalculator;