/**
 * Authentication Screen - Firebase Login/Register
 * Production-ready authentication interface
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AppStyles, Colors, Typography, Spacing, BorderRadius } from '../components/common/AppStyles';

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return false;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    
    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert('Sign In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim() || null);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Precision Rifle Logbook</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              returnKeyType={isSignUp ? 'next' : 'done'}
              onSubmitEditing={isSignUp ? undefined : handleSubmit}
            />
          </View>

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setPassword('');
              setConfirmPassword('');
              setDisplayName('');
            }}
            disabled={loading}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.large,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxlarge,
  },
  title: {
    fontSize: Typography.sizes.xlarge,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.small,
  },
  subtitle: {
    fontSize: Typography.sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: Spacing.large,
  },
  label: {
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.medium,
    padding: Spacing.medium,
    fontSize: Typography.sizes.medium,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.medium,
    padding: Spacing.large,
    alignItems: 'center',
    marginTop: Spacing.medium,
    marginBottom: Spacing.large,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.bold,
  },
  switchButton: {
    alignItems: 'center',
    padding: Spacing.medium,
  },
  switchButtonText: {
    color: Colors.primary,
    fontSize: Typography.sizes.medium,
    textDecorationLine: 'underline',
  },
};

export default AuthScreen;