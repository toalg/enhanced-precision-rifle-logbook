import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import SupabaseAuthService from '../services/SupabaseAuthService';
import SupabaseService from '../services/SupabaseService';
import { CommonStyles, Colors, Typography, Spacing } from '../components/common/AppStyles';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const TestBackendScreen = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const { signIn, signOut, user } = useAuth();

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results = {};

    // Test Supabase Auth Service
    try {
      const initResult = await SupabaseAuthService.initialize();
      const connectionResult = await SupabaseAuthService.testConnection();
      
      results.supabaseAuth = {
        success: initResult.success && connectionResult.success,
        initResult,
        connectionResult,
        isAvailable: SupabaseAuthService.isAuthAvailable()
      };
    } catch (error) {
      results.supabaseAuth = {
        success: false,
        error: error.message,
        isAvailable: false
      };
    }

    // Test Supabase Service
    try {
      const initResult = await SupabaseService.initialize();
      const connectionResult = await SupabaseService.testConnection();
      
      results.supabase = {
        success: initResult.success && connectionResult.success,
        initResult,
        connectionResult,
        isAvailable: SupabaseService.isAvailable()
      };
    } catch (error) {
      results.supabase = {
        success: false,
        error: error.message,
        isAvailable: false
      };
    }

    setTestResults(results);
  };

  const handleQuickLogin = async (userType) => {
    setLoading(true);
    try {
      const result = await SupabaseAuthService.quickLogin(userType);
      if (result.success) {
        Alert.alert('Success', `Logged in as ${userType} test user`);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestUsers = async () => {
    setLoading(true);
    try {
      const results = await SupabaseAuthService.createTestUsers();
      Alert.alert('Test Users Created', JSON.stringify(results, null, 2));
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTestResult = (serviceName, result) => (
    <Card style={styles.testCard}>
      <Text style={styles.serviceTitle}>{serviceName}</Text>
      
      <View style={styles.resultContainer}>
        <Text style={[styles.status, result.success ? styles.success : styles.error]}>
          {result.success ? '✓ SUCCESS' : '✗ FAILED'}
        </Text>
        
        {result.error && (
          <Text style={styles.errorText}>Error: {result.error}</Text>
        )}
        
        {result.initResult && (
          <Text style={styles.detailText}>
            Init: {result.initResult.success ? '✓' : '✗'} {result.initResult.error || 'OK'}
          </Text>
        )}
        
        {result.connectionResult && (
          <Text style={styles.detailText}>
            Connection: {result.connectionResult.success ? '✓' : '✗'} {result.connectionResult.error || 'OK'}
          </Text>
        )}
        
        <Text style={styles.detailText}>
          Available: {result.isAvailable ? '✓' : '✗'}
        </Text>
      </View>
    </Card>
  );

  const renderDevelopmentTools = () => {
    if (!__DEV__) return null;

    const testUsers = SupabaseAuthService.getTestUsers();
    
    return (
      <Card style={styles.testCard}>
        <Text style={styles.serviceTitle}>🔧 Development Tools</Text>
        
        <View style={styles.devToolsContainer}>
          <Text style={styles.sectionTitle}>Current User</Text>
          <Text style={styles.detailText}>
            {user ? `${user.displayName} (${user.email})` : 'Not signed in'}
          </Text>
          
          <Text style={styles.sectionTitle}>Quick Login</Text>
          <View style={styles.buttonRow}>
            {Object.entries(testUsers).map(([userType, userData]) => (
              <Button
                key={userType}
                title={userType}
                onPress={() => handleQuickLogin(userType)}
                variant="secondary"
                size="small"
                style={styles.quickLoginButton}
                disabled={loading}
              />
            ))}
          </View>
          
          <View style={styles.buttonRow}>
            <Button
              title="Create Test Users"
              onPress={handleCreateTestUsers}
              variant="primary"
              size="small"
              style={styles.devButton}
              disabled={loading}
            />
            
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="error"
              size="small"
              style={styles.devButton}
              disabled={loading}
            />
          </View>
          
          <Text style={styles.devNote}>
            These tools are only available in development mode
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={CommonStyles.container}>
      <ScrollView style={CommonStyles.contentContainer}>
        <Text style={styles.title}>Backend Service Tests</Text>
        <Text style={styles.subtitle}>Testing service connectivity and development tools</Text>
        
        {Object.keys(testResults).length > 0 ? (
          <>
            {renderTestResult('Supabase Auth', testResults.supabaseAuth)}
            {renderTestResult('Supabase Service', testResults.supabase)}
            {renderDevelopmentTools()}
          </>
        ) : (
          <Card style={styles.testCard}>
            <Text style={styles.loadingText}>Running tests...</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    ...Typography.h1,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.grayDark,
    marginBottom: Spacing.lg,
  },
  testCard: {
    marginBottom: Spacing.lg,
  },
  serviceTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  resultContainer: {
    gap: Spacing.sm,
  },
  status: {
    ...Typography.h4,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  success: {
    color: Colors.success,
  },
  error: {
    color: Colors.error,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    fontStyle: 'italic',
  },
  detailText: {
    ...Typography.bodySmall,
    color: Colors.grayDark,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.grayDark,
    textAlign: 'center',
  },
  devToolsContainer: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickLoginButton: {
    flex: 1,
    minWidth: 80,
  },
  devButton: {
    flex: 1,
  },
  devNote: {
    ...Typography.bodySmall,
    color: Colors.grayDark,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

export default TestBackendScreen; 