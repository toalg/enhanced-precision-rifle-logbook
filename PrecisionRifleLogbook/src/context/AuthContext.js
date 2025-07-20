/**
 * Auth Context - Firebase Authentication Management
 * Handles user authentication state and session management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Try Firebase first, fallback if modules not available
let FirebaseService;
try {
  FirebaseService = require('../services/FirebaseService').default;
} catch (error) {
  console.warn('Using Firebase fallback due to module loading error');
  FirebaseService = require('../services/FirebaseServiceFallback').default;
}

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
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Initialize Firebase and set up auth listener
    const initializeAuth = async () => {
      try {
        // Wait for Firebase to initialize
        const initResult = await FirebaseService.initialize();
        setFirebaseReady(initResult.success);
        
        if (initResult.success) {
          // Get current user
          const currentUser = FirebaseService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(!!currentUser);
          
          // Listen for auth state changes
          FirebaseService.addEventListener('authStateChanged', (firebaseUser) => {
            console.log('Auth state changed:', firebaseUser?.uid);
            setUser(firebaseUser);
            setIsAuthenticated(!!firebaseUser);
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
      FirebaseService.destroy();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    if (!firebaseReady) {
      throw new Error('Firebase not initialized');
    }
    
    const result = await FirebaseService.signInWithEmail(email, password);
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.user;
  };

  // Sign up with email and password
  const signUp = async (email, password, displayName = null) => {
    if (!firebaseReady) {
      throw new Error('Firebase not initialized');
    }
    
    const result = await FirebaseService.signUpWithEmail(email, password, displayName);
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result.user;
  };

  // Sign out
  const signOut = async () => {
    if (!firebaseReady) {
      throw new Error('Firebase not initialized');
    }
    
    const result = await FirebaseService.signOut();
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  // Get user ID for Supabase integration
  const getUserId = () => {
    return user?.uid || null;
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
    firebaseReady,
    signIn,
    signUp,
    signOut,
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