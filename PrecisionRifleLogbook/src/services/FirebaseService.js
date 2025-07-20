/**
 * Firebase Service - Authentication, Firestore, and Storage
 * Handles Firebase-specific operations for the app
 */

// Lazy load Firebase modules to prevent native module errors
let auth = null;
let firestore = null;
let storage = null;

// Safe Firebase initialization
const initializeFirebase = () => {
  try {
    if (!auth) {
      auth = require('@react-native-firebase/auth').default;
    }
    if (!firestore) {
      firestore = require('@react-native-firebase/firestore').default;
    }
    if (!storage) {
      storage = require('@react-native-firebase/storage').default;
    }
    return true;
  } catch (error) {
    console.warn('Firebase modules not available:', error.message);
    return false;
  }
};

import { FIRESTORE_COLLECTIONS, STORAGE_PATHS } from '../config/firebase';

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.listeners = new Map();
  }

  // Initialize Firebase safely
  async initialize() {
    try {
      this.isInitialized = initializeFirebase();
      if (this.isInitialized) {
        this.auth = auth();
        this.firestore = firestore();
        this.storage = storage();
        console.log('Firebase service initialized successfully');
      } else {
        console.warn('Firebase not available - running in offline mode');
      }
      return { success: true, initialized: this.isInitialized };
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return { success: false, error: error.message, initialized: false };
    }
  }

  // Check if Firebase is available
  isFirebaseAvailable() {
    return this.isInitialized && this.auth && this.firestore && this.storage;
  }

  // Test Firebase connectivity
  async testConnection() {
    if (!this.isFirebaseAvailable()) {
      return { success: false, error: 'Firebase not available' };
    }
    
    try {
      // Simple test - just check if we can access Firebase
      const testDoc = this.firestore.collection('test').doc('connection-test');
      await testDoc.get();
      return { success: true, message: 'Firebase connection successful' };
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Authentication Methods
  async signInWithEmail(email, password) {
    if (!this.isFirebaseAvailable()) {
      return { success: false, error: 'Firebase not available' };
    }
    
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      this.emit('authStateChanged', { user: this.currentUser });
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Firebase sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signUpWithEmail(email, password) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      
      // Create user profile in Firestore
      await this.createUserProfile({
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        createdAt: new Date().toISOString()
      });
      
      this.emit('authStateChanged', { user: this.currentUser });
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Firebase sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      this.currentUser = null;
      this.emit('authStateChanged', { user: null });
      return { success: true };
    } catch (error) {
      console.error('Firebase sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Firestore Methods
  async createUserProfile(userData) {
    try {
      await this.firestore
        .collection(FIRESTORE_COLLECTIONS.USERS)
        .doc(userData.uid)
        .set(userData);
      return { success: true };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  async saveShootingSession(sessionData) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      const sessionRef = await this.firestore
        .collection(FIRESTORE_COLLECTIONS.SESSIONS)
        .add({
          ...sessionData,
          userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp()
        });

      this.emit('sessionSaved', { sessionId: sessionRef.id, session: sessionData });
      return { success: true, sessionId: sessionRef.id };
    } catch (error) {
      console.error('Error saving session to Firestore:', error);
      return { success: false, error: error.message };
    }
  }

  async getShootingSessions(limit = 50, offset = 0) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      const snapshot = await this.firestore
        .collection(FIRESTORE_COLLECTIONS.SESSIONS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, sessions };
    } catch (error) {
      console.error('Error fetching sessions from Firestore:', error);
      return { success: false, error: error.message };
    }
  }

  async saveLadderTest(ladderData) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      const testRef = await this.firestore
        .collection(FIRESTORE_COLLECTIONS.LADDER_TESTS)
        .add({
          ...ladderData,
          userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp()
        });

      this.emit('ladderTestSaved', { testId: testRef.id, test: ladderData });
      return { success: true, testId: testRef.id };
    } catch (error) {
      console.error('Error saving ladder test to Firestore:', error);
      return { success: false, error: error.message };
    }
  }

  async getLadderTests(limit = 20, offset = 0) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      const snapshot = await this.firestore
        .collection(FIRESTORE_COLLECTIONS.LADDER_TESTS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const tests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, tests };
    } catch (error) {
      console.error('Error fetching ladder tests from Firestore:', error);
      return { success: false, error: error.message };
    }
  }

  // Storage Methods
  async uploadTargetPhoto(uri, sessionId) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      const filename = `target-${sessionId}-${Date.now()}.jpg`;
      const storageRef = this.storage.ref(`${STORAGE_PATHS.TARGET_PHOTOS}/${userId}/${filename}`);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      await storageRef.put(blob);
      
      const downloadURL = await storageRef.getDownloadURL();
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error uploading target photo:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadExportFile(fileUri, filename) {
    try {
      const userId = this.getCurrentUser()?.uid;
      if (!userId) throw new Error('User not authenticated');

      const storageRef = this.storage.ref(`${STORAGE_PATHS.EXPORTS}/${userId}/${filename}`);
      
      const response = await fetch(fileUri);
      const blob = await response.blob();
      await storageRef.put(blob);
      
      const downloadURL = await storageRef.getDownloadURL();
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error uploading export file:', error);
      return { success: false, error: error.message };
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