/**
 * Test script to verify app initialization without Firebase crashes
 */

console.log('Testing app initialization...');

// Test basic imports
try {
  console.log('✓ Testing basic React Native imports...');
  const React = require('react');
  const { NavigationContainer } = require('@react-navigation/native');
  console.log('✓ React and Navigation imports successful');
} catch (error) {
  console.error('✗ Basic imports failed:', error.message);
}

// Test service imports
try {
  console.log('✓ Testing service imports...');
  const LogbookService = require('./src/services/LogbookService.js');
  console.log('✓ LogbookService import successful');
} catch (error) {
  console.error('✗ LogbookService import failed:', error.message);
}

// Test Firebase service (should not crash)
try {
  console.log('✓ Testing Firebase service import...');
  const FirebaseService = require('./src/services/FirebaseService.js');
  console.log('✓ FirebaseService import successful');
  
  // Test initialization
  const firebaseService = new FirebaseService();
  firebaseService.initialize().then(result => {
    console.log('✓ Firebase initialization result:', result);
  }).catch(error => {
    console.log('⚠ Firebase initialization failed (expected):', error.message);
  });
} catch (error) {
  console.error('✗ FirebaseService import failed:', error.message);
}

// Test Unified Data Service
try {
  console.log('✓ Testing Unified Data Service...');
  const UnifiedDataService = require('./src/services/UnifiedDataService.js');
  console.log('✓ UnifiedDataService import successful');
} catch (error) {
  console.error('✗ UnifiedDataService import failed:', error.message);
}

console.log('Test completed!'); 