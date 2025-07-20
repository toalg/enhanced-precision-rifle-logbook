/**
 * Auth Context - Supabase Authentication Management
 * Handles user authentication state and session management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import SupabaseAuthService from '../services/SupabaseAuthService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Initialize Supabase Auth and set up auth listener
    const initializeAuth = async () => {
      try {
        // Wait for Supabase Auth to initialize
        const initResult = await SupabaseAuthService.initialize();
        setAuthReady(initResult.success);
        
        if (initResult.success) {
          // Get current user
          const currentUser = SupabaseAuthService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(!!currentUser);
          
          // Listen for auth state changes
          SupabaseAuthService.addEventListener('authStateChanged', (supabaseUser) => {
            console.log('Auth state changed:', supabaseUser?.id);
            setUser(supabaseUser);
            setIsAuthenticated(!!supabaseUser);
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      SupabaseAuthService.destroy();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    if (!authReady) {
      throw new Error('Authentication not initialized');
    }
    
    const result = await SupabaseAuthService.signInWithEmail(email, password);
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.user;
  };

  // Sign up with email and password
  const signUp = async (email, password, displayName = null) => {
    if (!authReady) {
      throw new Error('Authentication not initialized');
    }
    
    const result = await SupabaseAuthService.signUpWithEmail(email, password, displayName);
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.user;
  };

  // Sign out
  const signOut = async () => {
    if (!authReady) {
      throw new Error('Authentication not initialized');
    }
    
    const result = await SupabaseAuthService.signOut();
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    if (!authReady) {
      throw new Error('Authentication not initialized');
    }
    
    const result = await SupabaseAuthService.resetPassword(email);
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.message;
  };

  // Get user ID for Supabase integration
  const getUserId = () => {
    return user?.id || null;
  };

  // Check if user is authenticated and throw error if not (for production)
  const requireAuth = () => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to perform this action');
    }
    return user;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    authReady,
    signIn,
    signUp,
    signOut,
    resetPassword,
    getUserId,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;