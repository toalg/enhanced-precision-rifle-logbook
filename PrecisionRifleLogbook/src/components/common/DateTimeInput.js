/**
 * Date Time Input Component
 * User-friendly date and time input with better formatting
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

import { Colors, Typography, Spacing, BorderRadius } from './AppStyles';
import InputField from './InputField';

const DateTimeInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  required = false,
  ...props 
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // Format the display value to be more user-friendly
  const getDisplayValue = () => {
    if (!value) return '';
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      
      const options = {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return value;
    }
  };

  // Format for the input field (datetime-local format)
  const getInputValue = () => {
    if (!value) return '';
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 16);
    } catch (error) {
      return value;
    }
  };

  const handleDateTimeChange = (newValue) => {
    if (newValue) {
      // Convert from datetime-local format to ISO string
      const date = new Date(newValue);
      onChangeText(date.toISOString());
    } else {
      onChangeText('');
    }
  };

  if (Platform.OS === 'web') {
    // Use native HTML datetime-local input on web
    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <input
          type="datetime-local"
          value={getInputValue()}
          onChange={(e) => handleDateTimeChange(e.target.value)}
          placeholder={placeholder}
          style={styles.webInput}
        />
        {value && (
          <Text style={styles.preview}>
            Preview: {getDisplayValue()}
          </Text>
        )}
      </View>
    );
  }

  // For mobile, use a touchable that shows the formatted date
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {value ? getDisplayValue() : (placeholder || 'Select date and time')}
        </Text>
      </TouchableOpacity>
      
      {/* Fallback input field for manual entry */}
      <InputField
        label="Manual Entry (YYYY-MM-DDTHH:mm format)"
        value={getInputValue()}
        onChangeText={handleDateTimeChange}
        placeholder="2025-01-20T14:30"
        style={styles.manualInput}
      />
      
      {value && (
        <Text style={styles.preview}>
          Will display as: {getDisplayValue()}
        </Text>
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
  },
  
  dateButton: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 2,
    borderColor: Colors.grayDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  
  dateText: {
    ...Typography.body,
    color: Colors.black,
  },
  
  placeholderText: {
    color: Colors.grayDark,
  },
  
  manualInput: {
    marginTop: Spacing.sm,
    marginBottom: 0,
  },
  
  preview: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  
  webInput: {
    backgroundColor: Colors.inputBackground,
    border: `2px solid ${Colors.grayDark}`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'system-ui',
  },
});

export default DateTimeInput;