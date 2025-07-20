import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SupabaseAuthService from '../services/SupabaseAuthService';
import SupabaseService from '../services/SupabaseService';
import { CommonStyles, Colors, Typography, Spacing } from '../components/common/AppStyles';
import Card from '../components/common/Card';

const TestBackendScreen = () => {
  const [testResults, setTestResults] = useState({});

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
        isAvailable: SupabaseAuthService.isAvailable()
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

  return (
    <View style={CommonStyles.container}>
      <ScrollView style={CommonStyles.contentContainer}>
        <Text style={styles.title}>Backend Service Tests</Text>
        <Text style={styles.subtitle}>Testing service connectivity and initialization</Text>
        
        {Object.keys(testResults).length > 0 ? (
          <>
            {renderTestResult('Supabase Auth', testResults.supabaseAuth)}
            {renderTestResult('Supabase Service', testResults.supabase)}
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
});

export default TestBackendScreen; 