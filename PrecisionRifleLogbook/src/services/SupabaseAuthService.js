/**
 * Supabase Authentication Service
 * Production-ready authentication using Supabase Auth
 * Fast builds, no native dependencies
 * Includes development testing features
 */

import { supabase } from '../config/supabase';
import { DevConfig, DevUtils } from '../config/devConfig';

// Development test users
const DEV_TEST_USERS = DevConfig.testUsers;

// Development configuration
const DEV_CONFIG = DevConfig.auth;

class SupabaseAuthService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.listeners = new Map();
    this.authStateListener = null;
    this.isDevelopment = __DEV__;
  }

  // Initialize Supabase Auth
  async initialize() {
    try {
      this.isInitialized = true;
      
      // Development mode: Check if we should bypass auth
      if (this.isDevelopment && DEV_CONFIG.bypassAuth) {
        console.log('🔧 Development mode: Bypassing authentication');
        this.currentUser = DEV_CONFIG.mockUser;
        this.emit('authStateChanged', this.currentUser);
        return { success: true, initialized: true, message: 'Development mode - auth bypassed' };
      }
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting initial session:', error);
      } else {
        this.currentUser = session?.user || null;
      }
      
      // Development mode: Auto-login with test user if no session
      if (this.isDevelopment && DEV_CONFIG.autoLogin && !this.currentUser) {
        console.log('🔧 Development mode: Auto-login with test user');
        await this.autoLoginWithTestUser();
      }
      
      // Set up auth state listener
      this.authStateListener = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Supabase auth state changed:', event, session?.user?.id);
        this.currentUser = session?.user || null;
        this.emit('authStateChanged', this.currentUser);
      });
      
      console.log('Supabase Auth Service initialized successfully');
      return { success: true, initialized: true, message: 'Supabase Auth ready' };
    } catch (error) {
      console.error('Supabase Auth Service initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  // Development: Auto-login with test user
  async autoLoginWithTestUser(userType = DEV_CONFIG.defaultTestUser) {
    try {
      const testUser = DEV_TEST_USERS[userType];
      if (!testUser) {
        console.warn(`Test user type '${userType}' not found`);
        return false;
      }
      
      console.log(`🔧 Auto-login with test user: ${testUser.email}`);
      const result = await this.signInWithEmail(testUser.email, testUser.password);
      return result.success;
    } catch (error) {
      console.error('Auto-login failed:', error);
      return false;
    }
  }

  // Development: Get available test users
  getTestUsers() {
    if (!this.isDevelopment) {
      return {};
    }
    return DEV_TEST_USERS;
  }

  // Development: Quick login with test user
  async quickLogin(userType = 'developer') {
    if (!this.isDevelopment) {
      throw new Error('Quick login only available in development mode');
    }
    
    const testUser = DEV_TEST_USERS[userType];
    if (!testUser) {
      throw new Error(`Test user type '${userType}' not found`);
    }
    
    return await this.signInWithEmail(testUser.email, testUser.password);
  }

  // Development: Create test users (for first-time setup)
  async createTestUsers() {
    if (!this.isDevelopment) {
      throw new Error('Test user creation only available in development mode');
    }
    
    console.log('🔧 Creating test users for development...');
    const results = {};
    
    for (const [userType, userData] of Object.entries(DEV_TEST_USERS)) {
      try {
        const result = await this.signUpWithEmail(
          userData.email, 
          userData.password, 
          userData.displayName
        );
        results[userType] = result.success ? 'created' : result.error;
      } catch (error) {
        results[userType] = error.message;
      }
    }
    
    console.log('Test user creation results:', results);
    return results;
  }

  // Check if auth is available
  isAuthAvailable() {
    return this.isInitialized;
  }

  // Test auth connectivity
  async testConnection() {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Supabase Auth not initialized' };
      }
      
      // Development mode: Return mock data if bypassing auth
      if (this.isDevelopment && DEV_CONFIG.bypassAuth) {
        return { 
          success: true, 
          authenticated: true,
          userId: DEV_CONFIG.mockUser.id,
          development: true
        };
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { 
        success: true, 
        authenticated: !!session?.user,
        userId: session?.user?.id || null 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      if (!this.isInitialized) {
        throw new Error('Supabase Auth not initialized');
      }
      
      // Development mode: Check if bypassing auth
      if (this.isDevelopment && DEV_CONFIG.bypassAuth) {
        console.log('🔧 Development mode: Bypassing sign in');
        this.currentUser = DEV_CONFIG.mockUser;
        this.emit('authStateChanged', this.currentUser);
        return { 
          success: true, 
          user: this.currentUser,
          development: true
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      this.currentUser = data.user;
      
      return { 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0]
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: this.formatErrorMessage(error) };
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email, password, displayName = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('Supabase Auth not initialized');
      }
      
      // Development mode: Check if bypassing auth
      if (this.isDevelopment && DEV_CONFIG.bypassAuth) {
        console.log('🔧 Development mode: Bypassing sign up');
        this.currentUser = {
          ...DEV_CONFIG.mockUser,
          email: email,
          displayName: displayName || email.split('@')[0]
        };
        this.emit('authStateChanged', this.currentUser);
        return { 
          success: true, 
          user: this.currentUser,
          development: true
        };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      this.currentUser = data.user;
      
      return { 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0]
        }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: this.formatErrorMessage(error) };
    }
  }

  // Sign out
  async signOut() {
    try {
      if (!this.isInitialized) {
        throw new Error('Supabase Auth not initialized');
      }
      
      // Development mode: Check if bypassing auth
      if (this.isDevelopment && DEV_CONFIG.bypassAuth) {
        console.log('🔧 Development mode: Bypassing sign out');
        this.currentUser = null;
        this.emit('authStateChanged', null);
        return { success: true, development: true };
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      this.currentUser = null;
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: this.formatErrorMessage(error) };
    }
  }

  // Get current user
  getCurrentUser() {
    // Development mode: Return mock user if bypassing auth
    if (this.isDevelopment && DEV_CONFIG.bypassAuth) {
      return this.currentUser || DEV_CONFIG.mockUser;
    }
    
    return this.currentUser;
  }

  // Get user ID
  getUserId() {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  // Reset password
  async resetPassword(email) {
    try {
      if (!this.isInitialized) {
        throw new Error('Supabase Auth not initialized');
      }
      
      // Development mode: Mock password reset
      if (this.isDevelopment && DEV_CONFIG.bypassAuth) {
        console.log('🔧 Development mode: Mocking password reset');
        return { 
          success: true, 
          message: 'Password reset email sent (development mode)',
          development: true
        };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        throw error;
      }
      
      return { 
        success: true, 
        message: 'Password reset email sent successfully' 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: this.formatErrorMessage(error) };
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.isInitialized) {
        throw new Error('Supabase Auth not initialized');
      }
      
      // Development mode: Mock profile update
      if (this.isDevelopment && DEV_CONFIG.bypassAuth) {
        console.log('🔧 Development mode: Mocking profile update');
        this.currentUser = { ...this.currentUser, ...updates };
        this.emit('authStateChanged', this.currentUser);
        return { 
          success: true, 
          user: this.currentUser,
          development: true
        };
      }
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) {
        throw error;
      }
      
      this.currentUser = data.user;
      
      return { 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.display_name || data.user.email?.split('@')[0]
        }
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: this.formatErrorMessage(error) };
    }
  }

  // Format error messages for user display
  formatErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      // Map common Supabase auth errors to user-friendly messages
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('invalid login credentials')) {
        return 'Invalid email or password. Please try again.';
      }
      if (errorMessage.includes('email not confirmed')) {
        return 'Please check your email and confirm your account before signing in.';
      }
      if (errorMessage.includes('user already registered')) {
        return 'An account with this email already exists. Please sign in instead.';
      }
      if (errorMessage.includes('password should be at least')) {
        return 'Password must be at least 6 characters long.';
      }
      if (errorMessage.includes('invalid email')) {
        return 'Please enter a valid email address.';
      }
      
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  // Event system
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in auth event listener for ${event}:`, error);
        }
      });
    }
  }

  // Cleanup
  destroy() {
    if (this.authStateListener) {
      this.authStateListener.data?.subscription?.unsubscribe();
      this.authStateListener = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export default new SupabaseAuthService();