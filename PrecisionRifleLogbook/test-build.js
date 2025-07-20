/**
 * Test Build Script - Verify all services can be imported and initialized
 * Run with: node test-build.js
 */

console.log('🧪 Testing service imports and initialization...\n');

// Test Supabase Auth Service
try {
  const SupabaseAuthService = require('./src/services/SupabaseAuthService.js');
  console.log('✓ SupabaseAuthService import successful');
  
  const supabaseAuthService = new SupabaseAuthService();
  supabaseAuthService.initialize().then(result => {
    console.log('✓ SupabaseAuthService initialization:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.error('  Error:', result.error);
    }
  }).catch(error => {
    console.error('✗ SupabaseAuthService initialization failed:', error.message);
  });
} catch (error) {
  console.error('✗ SupabaseAuthService import failed:', error.message);
}

// Test Supabase Service
try {
  const SupabaseService = require('./src/services/SupabaseService.js');
  console.log('✓ SupabaseService import successful');
  
  const supabaseService = new SupabaseService();
  supabaseService.initialize().then(result => {
    console.log('✓ SupabaseService initialization:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.error('  Error:', result.error);
    }
  }).catch(error => {
    console.error('✗ SupabaseService initialization failed:', error.message);
  });
} catch (error) {
  console.error('✗ SupabaseService import failed:', error.message);
}

// Test Unified Data Service
try {
  const UnifiedDataService = require('./src/services/UnifiedDataService.js');
  console.log('✓ UnifiedDataService import successful');
  
  UnifiedDataService.initialize().then(result => {
    console.log('✓ UnifiedDataService initialization:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.error('  Error:', result.error);
    }
  }).catch(error => {
    console.error('✗ UnifiedDataService initialization failed:', error.message);
  });
} catch (error) {
  console.error('✗ UnifiedDataService import failed:', error.message);
}

// Test Gun Profile Service
try {
  const GunProfileService = require('./src/services/GunProfileService.js');
  console.log('✓ GunProfileService import successful');
  
  GunProfileService.initialize().then(result => {
    console.log('✓ GunProfileService initialization:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
      console.error('  Error:', result.error);
    }
  }).catch(error => {
    console.error('✗ GunProfileService initialization failed:', error.message);
  });
} catch (error) {
  console.error('✗ GunProfileService import failed:', error.message);
}

console.log('\n🏁 Test build completed!'); 