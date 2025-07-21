/**
 * Reusable Input Field Component
 * Migrated from rifle_logbook.html form inputs
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing, CommonStyles } from './AppStyles';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  error,
  required = false,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  labelStyle,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }
    
    if (error) {
      baseStyle.push(styles.inputError);
    }
    
    if (!editable) {
      baseStyle.push(styles.inputDisabled);
    }
    
    if (multiline) {
      baseStyle.push(styles.inputMultiline);
    }
    
    if (inputStyle) {
      baseStyle.push(inputStyle);
    }
    
    return baseStyle;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[styles.inputContainer, style]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Text style={styles.icon}>{leftIcon}</Text>
          </View>
        )}
        
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.grayDark}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            <Text style={styles.icon}>{rightIcon}</Text>
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  
  required: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderWidth: 2,
    borderColor: Colors.grayDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.gray,
    minHeight: 48,
  },
  
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    color: Colors.black,
  },
  
  inputError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },
  
  inputDisabled: {
    backgroundColor: Colors.grayDark,
    opacity: 0.6,
  },
  
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  
  leftIconContainer: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  
  rightIconContainer: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 1,
  },
  
  icon: {
    fontSize: 18,
    color: Colors.grayDeep,
  },
  
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default InputField;