import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import SupabaseService from '../services/SupabaseService';
import FirebaseService from '../services/FirebaseService';

const TestBackendScreen = () => {
  const [supabaseResult, setSupabaseResult] = useState(null);
  const [firebaseResult, setFirebaseResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testSupabase = async () => {
    setLoading(true);
    try {
      const result = await SupabaseService.initialize();
      setSupabaseResult(result);
    } catch (error) {
      setSupabaseResult({ success: false, error: error.message });
    }
    setLoading(false);
  };

  const testFirebase = async () => {
    setLoading(true);
    try {
      const initResult = await FirebaseService.initialize();
      if (initResult.success && initResult.initialized) {
        // Test actual Firebase connection
        const connectionResult = await FirebaseService.testConnection();
        setFirebaseResult({
          initialization: initResult,
          connection: connectionResult,
          isAvailable: FirebaseService.isFirebaseAvailable()
        });
      } else {
        setFirebaseResult({
          initialization: initResult,
          isAvailable: FirebaseService.isFirebaseAvailable()
        });
      }
    } catch (error) {
      setFirebaseResult({ success: false, error: error.message });
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Backend Connectivity Test</Text>
      <Button title="Test Supabase Connection" onPress={testSupabase} disabled={loading} />
      {supabaseResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Supabase Result:</Text>
          <Text selectable style={styles.resultText}>{JSON.stringify(supabaseResult, null, 2)}</Text>
        </View>
      )}
      <Button title="Test Firebase Connection" onPress={testFirebase} disabled={loading} />
      {firebaseResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Firebase Result:</Text>
          <Text selectable style={styles.resultText}>{JSON.stringify(firebaseResult, null, 2)}</Text>
        </View>
      )}
      <Text style={styles.note}>
        This screen is for development/testing only. Remove before production.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#001233',
  },
  resultBox: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    width: '100%',
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0466C8',
  },
  resultText: {
    fontFamily: 'monospace',
    color: '#212529',
    fontSize: 13,
  },
  note: {
    marginTop: 32,
    color: '#7D8597',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default TestBackendScreen; 