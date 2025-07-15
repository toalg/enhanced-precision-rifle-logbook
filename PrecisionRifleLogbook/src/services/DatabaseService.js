/**
 * Database Service for Precision Rifle Logbook
 * Migrated from localStorage implementation in rifle_logbook.html
 */

import SQLite from 'react-native-sqlite-storage';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  constructor() {
    this.database = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return this.database;

    try {
      console.log('Initializing database...');
      
      // Open database
      this.database = await SQLite.openDatabase({
        name: 'PrecisionRifleLogbook.db',
        location: 'default',
        createFromLocation: 1,
      });

      // Create tables
      await this.createTables();
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
      return this.database;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    try {
      // Define schema SQL directly (since we can't require .sql files in React Native)
      const statements = [
        `CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          rifle_profile TEXT NOT NULL,
          range_distance REAL NOT NULL,
          range_unit TEXT DEFAULT 'yards',
          ammo_type TEXT NOT NULL,
          muzzle_velocity REAL,
          temperature REAL,
          temp_unit TEXT DEFAULT 'F',
          humidity INTEGER,
          pressure REAL,
          pressure_unit TEXT DEFAULT 'inHg',
          wind_speed REAL,
          wind_speed_unit TEXT DEFAULT 'mph',
          wind_direction TEXT,
          pred_elevation REAL,
          elevation_unit TEXT DEFAULT 'MOA',
          actual_elevation REAL,
          actual_elevation_unit TEXT DEFAULT 'MOA',
          pred_windage REAL,
          windage_unit TEXT DEFAULT 'MOA',
          actual_windage REAL,
          actual_windage_unit TEXT DEFAULT 'MOA',
          target_photo_path TEXT,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          synced BOOLEAN DEFAULT 0
        )`,
        
        `CREATE TABLE IF NOT EXISTS ladder_tests (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          rifle TEXT NOT NULL,
          range_distance REAL NOT NULL,
          bullet TEXT NOT NULL,
          powder TEXT NOT NULL,
          brass TEXT,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          synced BOOLEAN DEFAULT 0
        )`,
        
        `CREATE TABLE IF NOT EXISTS ladder_charges (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ladder_test_id TEXT NOT NULL,
          charge_weight REAL NOT NULL,
          shot_1_velocity REAL,
          shot_2_velocity REAL,
          shot_3_velocity REAL,
          average_velocity REAL,
          extreme_spread REAL,
          standard_deviation REAL,
          notes TEXT,
          pressure_signs TEXT,
          FOREIGN KEY (ladder_test_id) REFERENCES ladder_tests(id) ON DELETE CASCADE
        )`,
        
        `CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date)`,
        `CREATE INDEX IF NOT EXISTS idx_sessions_rifle ON sessions(rifle_profile)`,
        `CREATE INDEX IF NOT EXISTS idx_ladder_tests_date ON ladder_tests(date)`,
        `CREATE INDEX IF NOT EXISTS idx_ladder_charges_test_id ON ladder_charges(ladder_test_id)`,
        
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('premium_status', 'false')`,
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('cloud_sync_enabled', 'false')`,
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('app_version', '1.0')`,
      ];

      // Execute each statement
      for (const statement of statements) {
        await this.database.executeSql(statement);
      }

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // Session Management (Migrated from rifle_logbook.html lines 1724-1758)
  async saveShootingSession(sessionData) {
    try {
      const db = await this.initialize();
      
      const insertSQL = `
        INSERT INTO sessions (
          id, date, rifle_profile, range_distance, range_unit, ammo_type,
          muzzle_velocity, temperature, temp_unit, humidity, pressure, pressure_unit,
          wind_speed, wind_speed_unit, wind_direction, pred_elevation, elevation_unit,
          actual_elevation, actual_elevation_unit, pred_windage, windage_unit,
          actual_windage, actual_windage_unit, target_photo_path, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        sessionData.id || Date.now().toString(),
        sessionData.date,
        sessionData.rifleProfile,
        sessionData.rangeDistance,
        sessionData.rangeUnit || 'yards',
        sessionData.ammoType,
        sessionData.muzzleVelocity,
        sessionData.temperature,
        sessionData.tempUnit || 'F',
        sessionData.humidity,
        sessionData.pressure,
        sessionData.pressureUnit || 'inHg',
        sessionData.windSpeed,
        sessionData.windSpeedUnit || 'mph',
        sessionData.windDirection,
        sessionData.predElevation,
        sessionData.elevationUnit || 'MOA',
        sessionData.actualElevation,
        sessionData.actualElevationUnit || 'MOA',
        sessionData.predWindage,
        sessionData.windageUnit || 'MOA',
        sessionData.actualWindage,
        sessionData.actualWindageUnit || 'MOA',
        sessionData.targetPhotoPath,
        sessionData.notes,
      ];

      const result = await db.executeSql(insertSQL, params);
      console.log('Session saved successfully:', result);
      
      return {
        success: true,
        id: params[0],
        insertId: result[0].insertId,
      };
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  async getShootingSessions(limit = 50, offset = 0) {
    try {
      const db = await this.initialize();
      
      const selectSQL = `
        SELECT * FROM sessions 
        ORDER BY date DESC 
        LIMIT ? OFFSET ?
      `;

      const result = await db.executeSql(selectSQL, [limit, offset]);
      const sessions = [];

      for (let i = 0; i < result[0].rows.length; i++) {
        sessions.push(result[0].rows.item(i));
      }

      return sessions;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  // Ladder Test Management (Migrated from rifle_logbook.html lines 1499-1597)
  async saveLadderTest(ladderData) {
    try {
      const db = await this.initialize();
      
      // Start transaction
      await db.transaction(async (tx) => {
        // Insert ladder test
        const testInsertSQL = `
          INSERT INTO ladder_tests (id, date, rifle, range_distance, bullet, powder, brass, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const testId = Date.now().toString();
        await tx.executeSql(testInsertSQL, [
          testId,
          ladderData.date,
          ladderData.rifle,
          ladderData.range,
          ladderData.bullet,
          ladderData.powder,
          ladderData.brass,
          ladderData.notes,
        ]);

        // Insert charges
        const chargeInsertSQL = `
          INSERT INTO ladder_charges (
            ladder_test_id, charge_weight, shot_1_velocity, shot_2_velocity, 
            shot_3_velocity, average_velocity, extreme_spread, standard_deviation, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const charge of ladderData.charges) {
          const velocities = charge.velocities.filter(v => v !== undefined && !isNaN(v));
          
          if (velocities.length > 0) {
            const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length;
            const max = Math.max(...velocities);
            const min = Math.min(...velocities);
            const es = max - min;
            const variance = velocities.reduce((sum, vel) => sum + Math.pow(vel - avg, 2), 0) / velocities.length;
            const sd = Math.sqrt(variance);

            await tx.executeSql(chargeInsertSQL, [
              testId,
              charge.charge,
              charge.velocities[0] || null,
              charge.velocities[1] || null,
              charge.velocities[2] || null,
              avg,
              es,
              sd,
              charge.notes,
            ]);
          }
        }
      });

      console.log('Ladder test saved successfully');
      return { success: true, id: testId };
    } catch (error) {
      console.error('Error saving ladder test:', error);
      throw error;
    }
  }

  async getLadderTests(limit = 20, offset = 0) {
    try {
      const db = await this.initialize();
      
      const selectSQL = `
        SELECT lt.*, 
               GROUP_CONCAT(lc.charge_weight) as charge_weights,
               COUNT(lc.id) as charge_count
        FROM ladder_tests lt
        LEFT JOIN ladder_charges lc ON lt.id = lc.ladder_test_id
        GROUP BY lt.id
        ORDER BY lt.date DESC
        LIMIT ? OFFSET ?
      `;

      const result = await db.executeSql(selectSQL, [limit, offset]);
      const tests = [];

      for (let i = 0; i < result[0].rows.length; i++) {
        const test = result[0].rows.item(i);
        test.charges = await this.getLadderCharges(test.id);
        tests.push(test);
      }

      return tests;
    } catch (error) {
      console.error('Error fetching ladder tests:', error);
      throw error;
    }
  }

  async getLadderCharges(ladderTestId) {
    try {
      const db = await this.initialize();
      
      const selectSQL = `
        SELECT * FROM ladder_charges 
        WHERE ladder_test_id = ? 
        ORDER BY charge_weight ASC
      `;

      const result = await db.executeSql(selectSQL, [ladderTestId]);
      const charges = [];

      for (let i = 0; i < result[0].rows.length; i++) {
        charges.push(result[0].rows.item(i));
      }

      return charges;
    } catch (error) {
      console.error('Error fetching ladder charges:', error);
      throw error;
    }
  }

  // Settings Management (Migrated from localStorage settings)
  async getSetting(key, defaultValue = null) {
    try {
      const db = await this.initialize();
      
      const selectSQL = 'SELECT value FROM settings WHERE key = ?';
      const result = await db.executeSql(selectSQL, [key]);

      if (result[0].rows.length > 0) {
        return result[0].rows.item(0).value;
      }

      return defaultValue;
    } catch (error) {
      console.error('Error getting setting:', error);
      return defaultValue;
    }
  }

  async setSetting(key, value) {
    try {
      const db = await this.initialize();
      
      const upsertSQL = `
        INSERT OR REPLACE INTO settings (key, value, updated_at) 
        VALUES (?, ?, datetime('now'))
      `;

      await db.executeSql(upsertSQL, [key, value.toString()]);
      return true;
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  }

  // Data Export (Migrated from rifle_logbook.html lines 1149-1172)
  async exportAllData() {
    try {
      const sessions = await this.getShootingSessions(1000, 0);
      const ladderTests = await this.getLadderTests(100, 0);
      
      const exportData = {
        sessions,
        ladderTests,
        exportDate: new Date().toISOString(),
        appVersion: '1.0',
        format: 'rifleLogbook_mobile_backup',
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Cleanup
  async close() {
    if (this.database) {
      await this.database.close();
      this.database = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export default new DatabaseService();