/**
 * Reusable Card Component
 * Migrated from rifle_logbook.html card styles
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from './AppStyles';

const Card = ({ 
  children, 
  style, 
  onPress,
  variant = 'default',
  padding = 'default',
  shadow = 'medium',
  ...props 
}) => {
  const getCardStyle = () => {
    const baseStyle = [
      styles.card, 
      styles[`variant_${variant}`],
      styles[`padding_${padding}`],
      shadow && Shadows[shadow]
    ];
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyle()} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  
  // Variants
  variant_default: {
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.grayDark,
  },
  
  variant_dark: {
    backgroundColor: Colors.background,
    borderColor: Colors.grayDeep,
  },
  
  variant_primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  
  variant_success: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderColor: Colors.success,
  },
  
  variant_warning: {
    backgroundColor: 'rgba(241, 196, 15, 0.1)',
    borderColor: Colors.warning,
  },
  
  variant_error: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: Colors.error,
  },
  
  variant_info: {
    backgroundColor: 'rgba(4, 102, 200, 0.1)',
    borderColor: Colors.primary,
  },
  
  // Padding variants
  padding_none: {
    padding: 0,
  },
  
  padding_small: {
    padding: Spacing.md,
  },
  
  padding_default: {
    padding: Spacing.lg,
  },
  
  padding_large: {
    padding: Spacing.xl,
  },
});

export default Card;