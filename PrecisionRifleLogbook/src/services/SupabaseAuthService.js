/**
 * Supabase Authentication Service
 * Production-ready authentication using Supabase Auth
 * Fast builds, no native dependencies
 */

import { supabase } from '../config/supabase';

class SupabaseAuthService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.listeners = new Map();
    this.authStateListener = null;
  }

  // Initialize Supabase Auth
  async initialize() {
    try {
      this.isInitialized = true;
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting initial session:', error);
      } else {
        this.currentUser = session?.user || null;
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
          uid: data.user.id,
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
      
      const signUpData = {
        email: email.trim(),
        password: password
      };
      
      // Add display name to metadata if provided
      if (displayName) {
        signUpData.options = {
          data: {
            display_name: displayName.trim()
          }
        };
      }
      
      const { data, error } = await supabase.auth.signUp(signUpData);
      
      if (error) {
        throw error;
      }
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          requiresConfirmation: true,
          message: 'Please check your email to confirm your account',
          user: {
            uid: data.user.id,
            email: data.user.email,
            displayName: displayName || data.user.email?.split('@')[0]
          }
        };
      }
      
      this.currentUser = data.user;
      
      return { 
        success: true, 
        user: {
          uid: data.user.id,
          email: data.user.email,
          displayName: displayName || data.user.email?.split('@')[0]
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
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user ID for database operations
  getUserId() {
    return this.currentUser?.id || null;
  }

  // Reset password
  async resetPassword(email) {
    try {
      if (!this.isInitialized) {
        throw new Error('Supabase Auth not initialized');
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        throw error;
      }
      
      return { 
        success: true, 
        message: 'Password reset email sent' 
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: this.formatErrorMessage(error) };
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.isInitialized || !this.currentUser) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) {
        throw error;
      }
      
      this.currentUser = data.user;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Format error messages for user display
  formatErrorMessage(error) {
    if (typeof error === 'string') return error;
    
    const message = error.message || 'An unknown error occurred';
    
    // Common Supabase error message improvements
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password';
    }
    if (message.includes('User already registered')) {
      return 'An account with this email already exists';
    }
    if (message.includes('Password should be')) {
      return 'Password must be at least 6 characters long';
    }
    if (message.includes('Unable to validate email')) {
      return 'Please enter a valid email address';
    }
    if (message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link';
    }
    
    return message;
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
          console.error('Error in Supabase auth event listener:', error);
        }
      });
    }
  }

  // Clean up on app termination
  destroy() {
    if (this.authStateListener) {
      this.authStateListener.data.subscription.unsubscribe();
    }
    this.listeners.clear();
  }
}

export default new SupabaseAuthService();