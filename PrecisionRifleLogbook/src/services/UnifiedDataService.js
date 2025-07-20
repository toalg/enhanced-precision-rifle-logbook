/**
 * Unified Data Service - Supabase Integration
 * Provides a unified interface for data operations using Supabase backend
 */

import SupabaseAuthService from './SupabaseAuthService';
import SupabaseService from './SupabaseService';

class UnifiedDataService {
  constructor() {
    this.authService = SupabaseAuthService;
    this.supabaseService = SupabaseService;
    this.listeners = new Map();
  }

  // Authentication (using Supabase Auth)
  async signInWithEmail(email, password) {
    return await this.authService.signInWithEmail(email, password);
  }

  async signUpWithEmail(email, password, displayName = null) {
    return await this.authService.signUpWithEmail(email, password, displayName);
  }

  async signOut() {
    return await this.authService.signOut();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  // Data Operations (using Supabase)
  async saveShootingSession(sessionData) {
    return await this.supabaseService.saveShootingSession(sessionData);
  }

  async getShootingSessions(limit = 50, offset = 0) {
    return await this.supabaseService.getShootingSessions(limit, offset);
  }

  async saveLadderTest(ladderData) {
    return await this.supabaseService.saveLadderTest(ladderData);
  }

  async getLadderTests(limit = 20, offset = 0) {
    return await this.supabaseService.getLadderTests(limit, offset);
  }

  // Daily Notes (Supabase)
  async saveDailyNote(noteData) {
    return await this.supabaseService.saveDailyNote(noteData);
  }

  async getDailyNote(date) {
    return await this.supabaseService.getDailyNote(date);
  }

  async getDailyNotes(limit = 50, offset = 0) {
    return await this.supabaseService.getDailyNotes(limit, offset);
  }

  // File Upload (Supabase Storage)
  async uploadTargetPhoto(uri, sessionId) {
    return await this.supabaseService.uploadTargetPhoto(uri, sessionId);
  }

  async uploadExportFile(fileUri, filename) {
    return await this.supabaseService.uploadExportFile(fileUri, filename);
  }

  // Premium Features
  async enablePremium() {
    return await this.supabaseService.enablePremium();
  }

  async checkPremiumStatus() {
    return await this.supabaseService.checkPremiumStatus();
  }

  async toggleCloudSync() {
    return await this.supabaseService.toggleCloudSync();
  }

  async getCloudSyncSetting() {
    return await this.supabaseService.getCloudSyncSetting();
  }

  // Data Export/Import
  async exportAllData() {
    return await this.supabaseService.exportAllData();
  }

  async importData(data) {
    return await this.supabaseService.importData(data);
  }

  async clearAllData() {
    return await this.supabaseService.clearAllData();
  }

  // Event System
  subscribeToSessions(callback) {
    return this.supabaseService.subscribeToSessions(callback);
  }

  subscribeToLadderTests(callback) {
    return this.supabaseService.subscribeToLadderTests(callback);
  }

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
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Initialization
  async initialize() {
    try {
      console.log('Initializing UnifiedDataService...');
      
      // Initialize Supabase Auth
      const authResult = await this.authService.initialize();
      if (!authResult.success) {
        console.error('Failed to initialize Supabase Auth:', authResult.error);
        return { success: false, error: authResult.error };
      }

      // Initialize Supabase Service
      const supabaseResult = await this.supabaseService.initialize();
      if (!supabaseResult.success) {
        console.error('Failed to initialize Supabase Service:', supabaseResult.error);
        return { success: false, error: supabaseResult.error };
      }

      console.log('UnifiedDataService initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Error initializing UnifiedDataService:', error);
      return { success: false, error: error.message };
    }
  }

  // Setup event forwarding from Supabase services
  setupEventForwarding() {
    // Forward auth events
    this.authService.addEventListener('authStateChanged', (user) => {
      this.emit('authStateChanged', user);
    });

    // Forward data events
    this.supabaseService.addEventListener('sessionSaved', (data) => {
      this.emit('sessionSaved', data);
    });

    this.supabaseService.addEventListener('ladderTestSaved', (data) => {
      this.emit('ladderTestSaved', data);
    });

    this.supabaseService.addEventListener('premiumEnabled', (data) => {
      this.emit('premiumEnabled', data);
    });

    this.supabaseService.addEventListener('cloudSyncToggled', (data) => {
      this.emit('cloudSyncToggled', data);
    });
  }

  // Cleanup
  cleanup() {
    this.authService.destroy();
    this.supabaseService.cleanup();
    this.listeners.clear();
  }
}

// Export singleton instance
export default new UnifiedDataService(); 