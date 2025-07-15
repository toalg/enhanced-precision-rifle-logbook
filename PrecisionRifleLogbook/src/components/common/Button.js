/**
 * Reusable Button Component
 * Migrated from rifle_logbook.html button styles
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from './AppStyles';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  ...props 
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${variant}`], styles[`size_${size}`]];
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]];
    
    if (textStyle) {
      baseStyle.push(textStyle);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.white : Colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && <Text style={[styles.icon, { marginRight: title ? Spacing.sm : 0 }]}>{icon}</Text>}
          {title && <Text style={getTextStyle()}>{title}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  
  // Variants
  button_primary: {
    backgroundColor: Colors.primary,
  },
  
  button_secondary: {
    backgroundColor: Colors.grayDeep,
  },
  
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  
  button_ghost: {
    backgroundColor: 'transparent',
  },
  
  button_success: {
    backgroundColor: Colors.success,
  },
  
  button_warning: {
    backgroundColor: Colors.warning,
  },
  
  button_error: {
    backgroundColor: Colors.error,
  },
  
  // Sizes
  size_small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  
  size_medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  
  size_large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  text_primary: {
    color: Colors.white,
  },
  
  text_secondary: {
    color: Colors.white,
  },
  
  text_outline: {
    color: Colors.primary,
  },
  
  text_ghost: {
    color: Colors.primary,
  },
  
  text_success: {
    color: Colors.white,
  },
  
  text_warning: {
    color: Colors.white,
  },
  
  text_error: {
    color: Colors.white,
  },
  
  // Text sizes
  textSize_small: {
    fontSize: 14,
  },
  
  textSize_medium: {
    fontSize: 16,
  },
  
  textSize_large: {
    fontSize: 18,
  },
  
  // States
  disabled: {
    backgroundColor: Colors.grayDark,
    opacity: 0.6,
  },
  
  icon: {
    fontSize: 16,
  },
});

export default Button;