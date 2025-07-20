/**
 * Cleaning Progress Bar Component
 * Shows cleaning status with color-coded progress
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../common/AppStyles';

const CleaningProgressBar = ({ 
  roundsSinceCleaning, 
  cleaningInterval, 
  style 
}) => {
  if (!cleaningInterval) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.noScheduleText}>No cleaning schedule set</Text>
      </View>
    );
  }

  const progress = Math.min((roundsSinceCleaning / cleaningInterval) * 100, 100);
  
  const getBarColor = () => {
    if (progress <= 50) return Colors.success;
    if (progress <= 80) return '#f39c12'; // orange
    return Colors.error;
  };

  const getStatusText = () => {
    if (progress >= 100) return 'Needs Cleaning';
    if (progress >= 80) return 'Due Soon';
    return 'Good Condition';
  };

  const needsCleaning = progress >= 100;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>Cleaning Status</Text>
        {needsCleaning && (
          <Text style={styles.warning}>⚠️ {getStatusText()}</Text>
        )}
      </View>
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${progress}%`,
              backgroundColor: getBarColor()
            }
          ]} 
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.intervalText}>
          Clean every {cleaningInterval} rounds
        </Text>
        <Text style={styles.countText}>
          {roundsSinceCleaning}/{cleaningInterval} rounds
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  label: {
    ...Typography.label,
    color: Colors.white,
  },
  
  warning: {
    ...Typography.bodySmall,
    color: Colors.error,
    fontWeight: '600',
  },
  
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  intervalText: {
    ...Typography.bodySmall,
    color: Colors.grayDark,
    fontStyle: 'italic',
  },
  
  countText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  noScheduleText: {
    ...Typography.bodySmall,
    color: Colors.grayDark,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default CleaningProgressBar;