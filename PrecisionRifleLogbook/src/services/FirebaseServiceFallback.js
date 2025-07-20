/**
 * Firebase Service Fallback - Temporary Development Solution
 * This allows the app to run while Firebase builds in the background
 */

class FirebaseServiceFallback {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.listeners = new Map();
    console.warn('Using Firebase fallback - limited authentication features');
  }

  async initialize() {
    this.isInitialized = true;
    return { success: true, initialized: true, message: 'Fallback mode active' };
  }

  isFirebaseAvailable() {
    return true; // Pretend it's available
  }

  async testConnection() {
    return { success: true, authenticated: false, userId: null };
  }

  // Mock authentication for development
  async signInWithEmail(email, password) {
    if (email && password) {
      this.currentUser = {
        uid: 'fallback-user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0]
      };
      this.emit('authStateChanged', this.currentUser);
      return { 
        success: true, 
        user: this.currentUser
      };
    }
    return { success: false, error: 'Invalid credentials' };
  }

  async signUpWithEmail(email, password, displayName = null) {
    if (email && password) {
      this.currentUser = {
        uid: 'fallback-user-' + Date.now(),
        email: email,
        displayName: displayName || email.split('@')[0]
      };
      this.emit('authStateChanged', this.currentUser);
      return { 
        success: true, 
        user: this.currentUser
      };
    }
    return { success: false, error: 'Invalid input' };
  }

  async signOut() {
    this.currentUser = null;
    this.emit('authStateChanged', null);
    return { success: true };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getFirebaseUserId() {
    return this.currentUser?.uid || null;
  }

  // Mock Firestore methods
  async createUserProfile(userData) {
    console.log('Fallback: Would create user profile:', userData);
    return { success: true };
  }

  async getUserProfile(uid) {
    return { success: true, data: { uid, email: 'fallback@example.com' } };
  }

  async saveShootingSession(sessionData) {
    console.log('Fallback: Would save session:', sessionData);
    return { success: true, id: 'fallback-session-' + Date.now() };
  }

  async getShootingSessions(limit = 50) {
    return { success: true, data: [] };
  }

  async saveLadderTest(ladderData) {
    console.log('Fallback: Would save ladder test:', ladderData);
    return { success: true, id: 'fallback-ladder-' + Date.now() };
  }

  async getLadderTests(limit = 20) {
    return { success: true, data: [] };
  }

  async uploadTargetPhoto(uri, sessionId) {
    console.log('Fallback: Would upload photo:', { uri, sessionId });
    return { success: true, url: 'fallback-url', filename: 'fallback.jpg' };
  }

  async uploadExportFile(fileUri, filename) {
    console.log('Fallback: Would upload file:', { fileUri, filename });
    return { success: true, url: 'fallback-url', filename };
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
          console.error('Error in Firebase fallback event listener:', error);
        }
      });
    }
  }

  destroy() {
    this.listeners.clear();
  }
}

export default new FirebaseServiceFallback();