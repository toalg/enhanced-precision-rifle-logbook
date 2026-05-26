/**
 * Development Configuration
 * Only consumed under __DEV__ guards. Production builds dead-code-eliminate
 * the false branches via Hermes minification when __DEV__ is replaced with `false`.
 *
 * Test users and their credentials have been removed - if you need a dev
 * login, sign up through the app or use a real Supabase Auth account.
 */

export const DevConfig = {
  // Authentication knobs (dev-only, never gate prod logic on these)
  auth: {
    // If true, the auth service skips Supabase and uses `mockUser` instead.
    // Useful for offline UI work. Leave false unless you specifically need it.
    bypassAuth: false,

    // Mock user returned when bypassAuth is true. No real credentials here.
    mockUser: {
      id: 'dev-user-local',
      email: 'dev@local',
      displayName: 'Local Dev',
      isPremium: true,
    },
  },

  // UI knobs
  ui: {
    showDevIndicators: true,
    debugLogging: true,
    showPerformanceMetrics: false,
  },
};

export const DevUtils = {
  isDevelopment: __DEV__,

  getAuthConfig() {
    return DevConfig.auth;
  },

  isAuthBypassed() {
    return __DEV__ && DevConfig.auth.bypassAuth;
  },

  logDevInfo(message, data = null) {
    if (__DEV__ && DevConfig.ui.debugLogging) {
      console.warn(`🔧 [DEV] ${message}`, data || '');
    }
  },

  showDevIndicator() {
    return __DEV__ && DevConfig.ui.showDevIndicators;
  },
};

export default DevConfig;
