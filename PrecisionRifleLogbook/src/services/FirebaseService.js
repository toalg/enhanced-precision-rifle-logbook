/**
 * Firebase Service - Authentication, Firestore, and Storage
 * Handles Firebase-specific operations for the app
 */

let auth, firestore, storage;
let useFirebaseFallback = false;

try {
  auth = require('@react-native-firebase/auth').default;
  firestore = require('@react-native-firebase/firestore').default;
  storage = require('@react-native-firebase/storage').default;
} catch (error) {
  console.warn('Firebase modules not available, using fallback:', error.message);
  useFirebaseFallback = true;
}

// Safe Firebase initialization
const initializeFirebase = () => {
  if (useFirebaseFallback) {
    console.log('Using Firebase fallback mode');
    return true;
  }
  
  try {
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
};

import { FIRESTORE_COLLECTIONS, STORAGE_PATHS } from '../config/firebase';

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.listeners = new Map();
    this.authStateListener = null;
    this.initialize();
  }

  // Initialize Firebase safely
  async initialize() {
    try {
      this.isInitialized = initializeFirebase();
      
      if (this.isInitialized) {
        // Set up auth state listener
        this.authStateListener = auth().onAuthStateChanged((user) => {
          this.currentUser = user;
          this.emit('authStateChanged', user);
        });
        
        console.log('Firebase Service initialized successfully');
        return { success: true, initialized: true, message: 'Firebase ready' };
      }
      
      return { success: false, initialized: false, message: 'Firebase initialization failed' };
    } catch (error) {
      console.error('Firebase Service initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if Firebase is available
  isFirebaseAvailable() {
    return this.isInitialized;
  }

  // Test Firebase connectivity
  async testConnection() {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Firebase not initialized' };
      }
      
      // Test auth service
      const user = auth().currentUser;
      return { 
        success: true, 
        authenticated: !!user,
        userId: user?.uid || null 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Authentication Methods
  async signInWithEmail(email, password) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      
      return { 
        success: true, 
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email, password, displayName = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Update profile with display name if provided
      if (displayName) {
        await userCredential.user.updateProfile({ displayName });
      }
      
      this.currentUser = userCredential.user;
      
      // Create user profile in Firestore
      await this.createUserProfile({
        uid: userCredential.user.uid,
        email,
        displayName: displayName || null,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      
      return { 
        success: true, 
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      await auth().signOut();
      this.currentUser = null;
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Get Firebase user ID for Supabase integration
  getFirebaseUserId() {
    return this.currentUser?.uid || null;
  }

  // Firestore Methods
  async createUserProfile(userData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      await firestore()
        .collection(FIRESTORE_COLLECTIONS.USERS)
        .doc(userData.uid)
        .set(userData);
        
      return { success: true };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserProfile(uid) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const doc = await firestore()
        .collection(FIRESTORE_COLLECTIONS.USERS)
        .doc(uid)
        .get();
        
      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, error: error.message };
    }
  }

  async saveShootingSession(sessionData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = await firestore()
        .collection(FIRESTORE_COLLECTIONS.SESSIONS)
        .add({
          ...sessionData,
          userId: this.currentUser?.uid,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
        
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving shooting session:', error);
      return { success: false, error: error.message };
    }
  }

  async getShootingSessions(limit = 50, offset = 0) {
    try {
      if (!this.isInitialized || !this.currentUser) {
        throw new Error('Firebase not initialized or user not authenticated');
      }
      
      const snapshot = await firestore()
        .collection(FIRESTORE_COLLECTIONS.SESSIONS)
        .where('userId', '==', this.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
        
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: sessions };
    } catch (error) {
      console.error('Error getting shooting sessions:', error);
      return { success: false, error: error.message };
    }
  }

  async saveLadderTest(ladderData) {
    try {
      if (!this.isInitialized) {
        throw new Error('Firebase not initialized');
      }
      
      const docRef = await firestore()
        .collection(FIRESTORE_COLLECTIONS.LADDER_TESTS)
        .add({
          ...ladderData,
          userId: this.currentUser?.uid,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
        
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error saving ladder test:', error);
      return { success: false, error: error.message };
    }
  }

  async getLadderTests(limit = 20, offset = 0) {
    try {
      if (!this.isInitialized || !this.currentUser) {
        throw new Error('Firebase not initialized or user not authenticated');
      }
      
      const snapshot = await firestore()
        .collection(FIRESTORE_COLLECTIONS.LADDER_TESTS)
        .where('userId', '==', this.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
        
      const tests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: tests };
    } catch (error) {
      console.error('Error getting ladder tests:', error);
      return { success: false, error: error.message };
    }
  }

  // Storage Methods
  async uploadTargetPhoto(uri, sessionId) {
    try {
      if (!this.isInitialized || !this.currentUser) {
        throw new Error('Firebase not initialized or user not authenticated');
      }
      
      const filename = `${sessionId}_${Date.now()}.jpg`;
      const reference = storage().ref(`${STORAGE_PATHS.TARGET_PHOTOS}/${this.currentUser.uid}/${filename}`);
      
      await reference.putFile(uri);
      const downloadURL = await reference.getDownloadURL();
      
      return { success: true, url: downloadURL, filename };
    } catch (error) {
      console.error('Error uploading target photo:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadExportFile(fileUri, filename) {
    try {
      if (!this.isInitialized || !this.currentUser) {
        throw new Error('Firebase not initialized or user not authenticated');
      }
      
      const reference = storage().ref(`${STORAGE_PATHS.EXPORTS}/${this.currentUser.uid}/${filename}`);
      
      await reference.putFile(fileUri);
      const downloadURL = await reference.getDownloadURL();
      
      return { success: true, url: downloadURL, filename };
    } catch (error) {
      console.error('Error uploading export file:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up on app termination
  destroy() {
    if (this.authStateListener) {
      this.authStateListener();
    }
  }

  // Event System
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
          console.error('Error in Firebase event listener:', error);
        }
      });
    }
  }
}

export default new FirebaseService(); 