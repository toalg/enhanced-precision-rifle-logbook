/**
 * Logbook Service - Business Logic Layer
 * Migrated from RifleLogbook class in rifle_logbook.html (lines 998-1881)
 */

import DatabaseService from './MockDatabaseService';
import { ShootingSession } from '../models/ShootingSession';
import { LadderTest, LadderCharge } from '../models/LadderTest';

class LogbookService {
  constructor() {
    this.isInitialized = false;
    this.isPremium = false;
    this.listeners = new Map(); // Event listeners for UI updates
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await DatabaseService.initialize();
      this.isPremium = await this.checkPremiumStatus();
      this.isInitialized = true;
      console.log('LogbookService initialized successfully');
    } catch (error) {
      console.error('LogbookService initialization failed:', error);
      throw error;
    }
  }

  // Event system for UI updates
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
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Shooting Session Management
  async saveShootingSession(sessionData) {
    try {
      await this.initialize();
      
      const session = new ShootingSession(sessionData);
      const validation = session.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await DatabaseService.saveShootingSession(session.toJSON());
      
      // Emit event for UI updates
      this.emit('sessionSaved', { session: session.toJSON(), result });
      
      // Auto-sync if premium
      if (this.isPremium && await this.getCloudSyncSetting()) {
        this.syncToCloud('sessions', session.id);
      }

      return result;
    } catch (error) {
      console.error('Error saving shooting session:', error);
      this.emit('error', { type: 'save_session', message: error.message });
      throw error;
    }
  }

  async getShootingSessions(limit = 50, offset = 0) {
    try {
      await this.initialize();
      
      const sessions = await DatabaseService.getShootingSessions(limit, offset);
      return sessions.map(session => ShootingSession.fromJSON(session));
    } catch (error) {
      console.error('Error fetching shooting sessions:', error);
      this.emit('error', { type: 'fetch_sessions', message: error.message });
      throw error;
    }
  }

  async getShootingSessionById(id) {
    try {
      await this.initialize();
      
      const sessions = await DatabaseService.getShootingSessions(1, 0);
      const session = sessions.find(s => s.id === id);
      return session ? ShootingSession.fromJSON(session) : null;
    } catch (error) {
      console.error('Error fetching session by ID:', error);
      throw error;
    }
  }

  // Ladder Test Management
  async saveLadderTest(ladderData) {
    try {
      await this.initialize();
      
      const ladderTest = new LadderTest(ladderData);
      const validation = ladderTest.validate();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await DatabaseService.saveLadderTest(ladderTest.toJSON());
      
      // Emit event for UI updates
      this.emit('ladderTestSaved', { test: ladderTest.toJSON(), result });
      
      // Auto-sync if premium
      if (this.isPremium && await this.getCloudSyncSetting()) {
        this.syncToCloud('ladderTests', ladderTest.id);
      }

      return result;
    } catch (error) {
      console.error('Error saving ladder test:', error);
      this.emit('error', { type: 'save_ladder', message: error.message });
      throw error;
    }
  }

  async getLadderTests(limit = 20, offset = 0) {
    try {
      await this.initialize();
      
      const tests = await DatabaseService.getLadderTests(limit, offset);
      return tests.map(test => LadderTest.fromJSON(test));
    } catch (error) {
      console.error('Error fetching ladder tests:', error);
      this.emit('error', { type: 'fetch_ladders', message: error.message });
      throw error;
    }
  }

  async getLadderTestById(id) {
    try {
      await this.initialize();
      
      const tests = await DatabaseService.getLadderTests(100, 0);
      const test = tests.find(t => t.id === id);
      return test ? LadderTest.fromJSON(test) : null;
    } catch (error) {
      console.error('Error fetching ladder test by ID:', error);
      throw error;
    }
  }

  // Environmental Data Simulation (migrated from rifle_logbook.html lines 1699-1722)
  generateMockEnvironmentalData() {
    return {
      temperature: (Math.random() * 40 + 50).toFixed(1),
      humidity: (Math.random() * 50 + 30).toFixed(0),
      pressure: (Math.random() * 2 + 29).toFixed(2),
      windSpeed: (Math.random() * 15 + 2).toFixed(1),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]
    };
  }

  // Premium Features Management
  async checkPremiumStatus() {
    try {
      const status = await DatabaseService.getSetting('premium_status', 'false');
      return status === 'true';
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  async enablePremium() {
    try {
      await DatabaseService.setSetting('premium_status', 'true');
      this.isPremium = true;
      this.emit('premiumEnabled', { isPremium: true });
      return true;
    } catch (error) {
      console.error('Error enabling premium:', error);
      throw error;
    }
  }

  async getCloudSyncSetting() {
    try {
      const setting = await DatabaseService.getSetting('cloud_sync_enabled', 'false');
      return setting === 'true' && this.isPremium;
    } catch (error) {
      console.error('Error getting cloud sync setting:', error);
      return false;
    }
  }

  async toggleCloudSync() {
    try {
      if (!this.isPremium) {
        throw new Error('Premium subscription required for cloud sync');
      }

      const currentSetting = await this.getCloudSyncSetting();
      const newSetting = !currentSetting;
      
      await DatabaseService.setSetting('cloud_sync_enabled', newSetting.toString());
      
      if (newSetting) {
        // Initial sync when enabling
        await this.syncAllToCloud();
      }

      this.emit('cloudSyncToggled', { enabled: newSetting });
      return newSetting;
    } catch (error) {
      console.error('Error toggling cloud sync:', error);
      throw error;
    }
  }

  // Cloud Sync (Premium Feature) - Simulated
  async syncToCloud(dataType, recordId) {
    if (!this.isPremium) return;

    try {
      // Simulate cloud sync
      await this.simulateCloudUpload(dataType, recordId);
      this.emit('dataSynced', { type: dataType, recordId, status: 'success' });
    } catch (error) {
      console.error('Cloud sync error:', error);
      this.emit('dataSynced', { type: dataType, recordId, status: 'failed', error: error.message });
    }
  }

  async syncAllToCloud() {
    if (!this.isPremium) return;

    try {
      this.emit('syncStarted', { type: 'full' });
      
      // Sync sessions
      const sessions = await this.getShootingSessions(1000, 0);
      for (const session of sessions) {
        await this.syncToCloud('sessions', session.id);
      }

      // Sync ladder tests
      const ladderTests = await this.getLadderTests(100, 0);
      for (const test of ladderTests) {
        await this.syncToCloud('ladderTests', test.id);
      }

      this.emit('syncCompleted', { type: 'full', status: 'success' });
    } catch (error) {
      console.error('Full sync error:', error);
      this.emit('syncCompleted', { type: 'full', status: 'failed', error: error.message });
    }
  }

  async simulateCloudUpload(dataType, recordId) {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Cloud sync: ${dataType}/${recordId} uploaded successfully`);
        resolve();
      }, Math.random() * 1000 + 500);
    });
  }

  // Data Export/Import (migrated from rifle_logbook.html lines 1149-1205)
  async exportAllData() {
    try {
      await this.initialize();
      
      const exportData = await DatabaseService.exportAllData();
      
      // Convert to proper models
      exportData.sessions = exportData.sessions.map(s => ShootingSession.fromJSON(s).toJSON());
      exportData.ladderTests = exportData.ladderTests.map(t => LadderTest.fromJSON(t).toJSON());
      
      this.emit('dataExported', { recordCount: exportData.sessions.length + exportData.ladderTests.length });
      
      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      this.emit('error', { type: 'export', message: error.message });
      throw error;
    }
  }

  async importData(importData) {
    try {
      await this.initialize();
      
      if (importData.format !== 'rifleLogbook_backup' && importData.format !== 'rifleLogbook_mobile_backup') {
        throw new Error('Invalid backup file format');
      }

      // Validate and import sessions
      const sessions = (importData.sessions || []).map(s => ShootingSession.fromJSON(s));
      for (const session of sessions) {
        const validation = session.validate();
        if (validation.isValid) {
          await DatabaseService.saveShootingSession(session.toJSON());
        }
      }

      // Validate and import ladder tests
      const ladderTests = (importData.ladderTests || []).map(t => LadderTest.fromJSON(t));
      for (const test of ladderTests) {
        const validation = test.validate();
        if (validation.isValid) {
          await DatabaseService.saveLadderTest(test.toJSON());
        }
      }

      this.emit('dataImported', { 
        sessions: sessions.length, 
        ladderTests: ladderTests.length 
      });

      return {
        success: true,
        imported: {
          sessions: sessions.length,
          ladderTests: ladderTests.length
        }
      };
    } catch (error) {
      console.error('Error importing data:', error);
      this.emit('error', { type: 'import', message: error.message });
      throw error;
    }
  }

  // Analytics (migrated from rifle_logbook.html lines 1600-1697)
  async analyzeLadderTest(testId) {
    try {
      const test = await this.getLadderTestById(testId);
      if (!test) {
        throw new Error('Ladder test not found');
      }

      const analysis = {
        test: test.toJSON(),
        flatSpots: test.findFlatSpots(),
        bestCharge: test.getBestCharge()?.toJSON(),
        overallStats: test.getOverallStatistics(),
        recommendations: this.generateLoadRecommendations(test)
      };

      this.emit('testAnalyzed', analysis);
      return analysis;
    } catch (error) {
      console.error('Error analyzing ladder test:', error);
      this.emit('error', { type: 'analysis', message: error.message });
      throw error;
    }
  }

  generateLoadRecommendations(test) {
    const bestCharge = test.getBestCharge();
    const flatSpots = test.findFlatSpots();
    
    const recommendations = [
      '⚠️ Always consult published load data from reputable sources',
      '⚠️ Never exceed maximum published charges',
      '⚠️ Start low and work up safely'
    ];

    if (bestCharge) {
      const stats = bestCharge.getStatistics();
      recommendations.push(`🎯 Most consistent charge from your test: ${bestCharge.chargeWeight}gr`);
      recommendations.push(`📊 Standard Deviation: ${stats.standardDeviation} fps`);
    }

    if (flatSpots.length > 0) {
      recommendations.push(`🔍 Found ${flatSpots.length} potential velocity node(s)`);
      flatSpots.forEach(spot => {
        recommendations.push(`   • ${spot.charge}gr @ ${spot.velocity} fps`);
      });
    }

    recommendations.push('📚 Next steps: Test seating depth variations');
    recommendations.push('🎯 Confirm accuracy at longer distances');

    return recommendations;
  }

  // Settings Management
  async getSetting(key, defaultValue = null) {
    try {
      await this.initialize();
      return await DatabaseService.getSetting(key, defaultValue);
    } catch (error) {
      console.error('Error getting setting:', error);
      return defaultValue;
    }
  }

  async setSetting(key, value) {
    try {
      await this.initialize();
      await DatabaseService.setSetting(key, value);
      this.emit('settingChanged', { key, value });
      return true;
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  }

  // Cleanup
  async cleanup() {
    await DatabaseService.close();
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export default new LogbookService();