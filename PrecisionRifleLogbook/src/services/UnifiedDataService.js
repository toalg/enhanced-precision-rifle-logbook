/**
 * Unified Data Service - Abstraction Layer for Firebase and Supabase
 * Provides a unified interface for data operations, allowing easy switching between backends
 */

import FirebaseService from './FirebaseService';
import SupabaseService from './SupabaseService';

class UnifiedDataService {
  constructor() {
    this.currentBackend = 'supabase'; // Default to Supabase for main data
    this.firebaseService = new FirebaseService();
    this.supabaseService = new SupabaseService();
    this.listeners = new Map();
  }

  // Configuration
  setBackend(backend) {
    if (['firebase', 'supabase'].includes(backend)) {
      this.currentBackend = backend;
      console.log(`Switched to ${backend} backend`);
    }
  }

  getBackend() {
    return this.currentBackend;
  }

  // Authentication (using Firebase by default for better cross-platform support)
  async signInWithEmail(email, password) {
    return await this.firebaseService.signInWithEmail(email, password);
  }

  async signUpWithEmail(email, password) {
    return await this.firebaseService.signUpWithEmail(email, password);
  }

  async signOut() {
    return await this.firebaseService.signOut();
  }

  getCurrentUser() {
    return this.firebaseService.getCurrentUser();
  }

  // Data Operations (using current backend)
  async saveShootingSession(sessionData) {
    if (this.currentBackend === 'firebase') {
      return await this.firebaseService.saveShootingSession(sessionData);
    } else {
      return await this.supabaseService.saveShootingSession(sessionData);
    }
  }

  async getShootingSessions(limit = 50, offset = 0) {
    if (this.currentBackend === 'firebase') {
      return await this.firebaseService.getShootingSessions(limit, offset);
    } else {
      return await this.supabaseService.getShootingSessions(limit, offset);
    }
  }

  async saveLadderTest(ladderData) {
    if (this.currentBackend === 'firebase') {
      return await this.firebaseService.saveLadderTest(ladderData);
    } else {
      return await this.supabaseService.saveLadderTest(ladderData);
    }
  }

  async getLadderTests(limit = 20, offset = 0) {
    if (this.currentBackend === 'firebase') {
      return await this.firebaseService.getLadderTests(limit, offset);
    } else {
      return await this.supabaseService.getLadderTests(limit, offset);
    }
  }

  // Daily Notes (Supabase only for now, as it's better for structured data)
  async saveDailyNote(noteData) {
    return await this.supabaseService.saveDailyNote(noteData);
  }

  async getDailyNote(date) {
    return await this.supabaseService.getDailyNote(date);
  }

  // File Storage (Firebase Storage by default for better mobile support)
  async uploadTargetPhoto(uri, sessionId) {
    return await this.firebaseService.uploadTargetPhoto(uri, sessionId);
  }

  async uploadExportFile(fileUri, filename) {
    return await this.firebaseService.uploadExportFile(fileUri, filename);
  }

  // Dual Sync (save to both backends for redundancy)
  async dualSyncSession(sessionData) {
    try {
      const results = await Promise.allSettled([
        this.firebaseService.saveShootingSession(sessionData),
        this.supabaseService.saveShootingSession(sessionData)
      ]);

      const firebaseResult = results[0];
      const supabaseResult = results[1];

      if (firebaseResult.status === 'fulfilled' && supabaseResult.status === 'fulfilled') {
        return { 
          success: true, 
          firebaseId: firebaseResult.value.sessionId,
          supabaseId: supabaseResult.value.sessionId
        };
      } else {
        console.warn('Dual sync partially failed:', { firebaseResult, supabaseResult });
        return { 
          success: false, 
          error: 'Partial sync failure',
          firebaseResult,
          supabaseResult
        };
      }
    } catch (error) {
      console.error('Dual sync error:', error);
      return { success: false, error: error.message };
    }
  }

  async dualSyncLadderTest(ladderData) {
    try {
      const results = await Promise.allSettled([
        this.firebaseService.saveLadderTest(ladderData),
        this.supabaseService.saveLadderTest(ladderData)
      ]);

      const firebaseResult = results[0];
      const supabaseResult = results[1];

      if (firebaseResult.status === 'fulfilled' && supabaseResult.status === 'fulfilled') {
        return { 
          success: true, 
          firebaseId: firebaseResult.value.testId,
          supabaseId: supabaseResult.value.testId
        };
      } else {
        console.warn('Dual sync partially failed:', { firebaseResult, supabaseResult });
        return { 
          success: false, 
          error: 'Partial sync failure',
          firebaseResult,
          supabaseResult
        };
      }
    } catch (error) {
      console.error('Dual sync error:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time Subscriptions (Supabase for real-time features)
  subscribeToSessions(callback) {
    return this.supabaseService.subscribeToSessions(callback);
  }

  subscribeToLadderTests(callback) {
    return this.supabaseService.subscribeToLadderTests(callback);
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
          console.error('Error in unified event listener:', error);
        }
      });
    }
  }

  // Initialize both services
  async initialize() {
    try {
      console.log('Initializing Unified Data Service...');
      
      // Initialize both services
      const firebaseResult = await this.firebaseService.initialize();
      const supabaseResult = await this.supabaseService.initialize();

      if (firebaseResult.success && supabaseResult.success) {
        console.log('Unified Data Service initialized successfully');
        
        // Set up event forwarding
        this.setupEventForwarding();
        
        return { success: true };
      } else {
        console.error('Service initialization failed:', { firebaseResult, supabaseResult });
        return { success: false, firebaseResult, supabaseResult };
      }
    } catch (error) {
      console.error('Error initializing Unified Data Service:', error);
      return { success: false, error: error.message };
    }
  }

  // Forward events from both services
  setupEventForwarding() {
    // Firebase events
    this.firebaseService.addEventListener('authStateChanged', (data) => {
      this.emit('authStateChanged', data);
    });

    this.firebaseService.addEventListener('sessionSaved', (data) => {
      this.emit('sessionSaved', data);
    });

    this.firebaseService.addEventListener('ladderTestSaved', (data) => {
      this.emit('ladderTestSaved', data);
    });

    // Supabase events
    this.supabaseService.addEventListener('authStateChanged', (data) => {
      this.emit('authStateChanged', data);
    });

    this.supabaseService.addEventListener('sessionSaved', (data) => {
      this.emit('sessionSaved', data);
    });

    this.supabaseService.addEventListener('ladderTestSaved', (data) => {
      this.emit('ladderTestSaved', data);
    });

    this.supabaseService.addEventListener('dailyNoteSaved', (data) => {
      this.emit('dailyNoteSaved', data);
    });
  }

  // Cleanup
  cleanup() {
    this.supabaseService.cleanup();
    this.listeners.clear();
  }
}

export default new UnifiedDataService(); 