/**
 * Development Configuration
 * Easy-to-modify settings for development and testing
 * Only loaded in development builds (__DEV__)
 */

export const DevConfig = {
  // Authentication Settings
  auth: {
    // Auto-login with test user on app start
    // Set to false if you want to test manual login
    autoLogin: true,
    
    // Which test user to auto-login with
    defaultTestUser: 'developer', // 'developer', 'shooter', 'premium'
    
    // Skip authentication entirely (useful for UI testing)
    // Set to true to bypass all authentication
    bypassAuth: false, // Now testing real authentication
    
    // Mock user data when bypassing auth
    mockUser: {
      id: 'dev-user-123',
      email: 'developer@gmail.com',
      displayName: 'Developer Test User',
      isPremium: true
    }
  },

  // Test Users (will be created automatically)
  testUsers: {
    developer: {
      email: 'developer@gmail.com', // Using gmail.com domain
      password: 'testpass123',
      displayName: 'Developer Test User'
    },
    shooter: {
      email: 'shooter@gmail.com', // Using gmail.com domain
      password: 'testpass123',
      displayName: 'Precision Shooter'
    },
    premium: {
      email: 'premium@gmail.com', // Using gmail.com domain
      password: 'testpass123', 
      displayName: 'Premium User'
    }
  },

  // Database Settings
  database: {
    // Use mock data instead of real Supabase
    useMockData: false,
    
    // Auto-populate with sample data
    autoPopulate: true,
    
    // Sample data settings
    sampleData: {
      shootingSessions: 5,
      ladderTests: 3,
      gunProfiles: 2
    }
  },

  // UI/UX Settings
  ui: {
    // Show development indicators
    showDevIndicators: true,
    
    // Enable debug logging
    debugLogging: true,
    
    // Show performance metrics
    showPerformanceMetrics: false
  },

  // Feature Flags
  features: {
    // Enable premium features for testing
    enablePremium: true,
    
    // Enable cloud sync for testing
    enableCloudSync: true,
    
    // Enable advanced analytics
    enableAdvancedAnalytics: true
  }
};

// Helper functions for development
export const DevUtils = {
  // Check if we're in development mode
  isDevelopment: __DEV__,
  
  // Get current auth configuration
  getAuthConfig() {
    return DevConfig.auth;
  },
  
  // Get test users
  getTestUsers() {
    return DevConfig.testUsers;
  },
  
  // Check if auth is bypassed
  isAuthBypassed() {
    return __DEV__ && DevConfig.auth.bypassAuth;
  },
  
  // Check if auto-login is enabled
  isAutoLoginEnabled() {
    return __DEV__ && DevConfig.auth.autoLogin;
  },
  
  // Get default test user
  getDefaultTestUser() {
    return DevConfig.auth.defaultTestUser;
  },
  
  // Log development info
  logDevInfo(message, data = null) {
    if (__DEV__ && DevConfig.ui.debugLogging) {
      console.log(`🔧 [DEV] ${message}`, data || '');
    }
  },
  
  // Show development indicator
  showDevIndicator() {
    return __DEV__ && DevConfig.ui.showDevIndicators;
  }
};

export default DevConfig; 