/**
 * Mock Database Service for Testing
 * Replaces SQLite with in-memory storage for initial testing
 */

class MockDatabaseService {
  constructor() {
    this.sessions = [];
    this.ladderTests = [];
    this.settings = new Map([
      ['premium_status', 'false'],
      ['cloud_sync_enabled', 'false'],
      ['app_version', '1.0'],
    ]);
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('Mock database initialized');
    this.isInitialized = true;
    return Promise.resolve();
  }

  async saveShootingSession(sessionData) {
    const session = {
      ...sessionData,
      id: sessionData.id || Date.now().toString(),
    };
    
    // Remove existing session with same ID
    this.sessions = this.sessions.filter(s => s.id !== session.id);
    this.sessions.unshift(session);
    
    console.log('Mock: Session saved', session.id);
    return Promise.resolve({
      success: true,
      id: session.id,
    });
  }

  async getShootingSessions(limit = 50, offset = 0) {
    const result = this.sessions
      .slice(offset, offset + limit);
    
    console.log('Mock: Retrieved sessions', result.length);
    return Promise.resolve(result);
  }

  async saveLadderTest(ladderData) {
    const test = {
      ...ladderData,
      id: ladderData.id || Date.now().toString(),
    };
    
    // Remove existing test with same ID
    this.ladderTests = this.ladderTests.filter(t => t.id !== test.id);
    this.ladderTests.unshift(test);
    
    console.log('Mock: Ladder test saved', test.id);
    return Promise.resolve({
      success: true,
      id: test.id,
    });
  }

  async getLadderTests(limit = 20, offset = 0) {
    const result = this.ladderTests
      .slice(offset, offset + limit);
    
    console.log('Mock: Retrieved ladder tests', result.length);
    return Promise.resolve(result);
  }

  async getSetting(key, defaultValue = null) {
    const value = this.settings.get(key);
    return Promise.resolve(value !== undefined ? value : defaultValue);
  }

  async setSetting(key, value) {
    this.settings.set(key, value.toString());
    console.log('Mock: Setting saved', key, value);
    return Promise.resolve(true);
  }

  async exportAllData() {
    return Promise.resolve({
      sessions: this.sessions,
      ladderTests: this.ladderTests,
      exportDate: new Date().toISOString(),
      appVersion: '1.0',
      format: 'rifleLogbook_mobile_backup',
    });
  }

  async close() {
    this.isInitialized = false;
    console.log('Mock database closed');
    return Promise.resolve();
  }
}

// Export singleton instance
export default new MockDatabaseService();