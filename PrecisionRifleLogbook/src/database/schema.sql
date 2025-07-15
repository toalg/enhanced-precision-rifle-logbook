-- Precision Rifle Logbook Database Schema
-- Migrated from localStorage data models in rifle_logbook.html

-- Shooting Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    rifle_profile TEXT NOT NULL,
    range_distance REAL NOT NULL,
    range_unit TEXT DEFAULT 'yards',
    ammo_type TEXT NOT NULL,
    muzzle_velocity REAL,
    
    -- Environmental Data
    temperature REAL,
    temp_unit TEXT DEFAULT 'F',
    humidity INTEGER,
    pressure REAL,
    pressure_unit TEXT DEFAULT 'inHg',
    wind_speed REAL,
    wind_speed_unit TEXT DEFAULT 'mph',
    wind_direction TEXT,
    
    -- Ballistic Data
    pred_elevation REAL,
    elevation_unit TEXT DEFAULT 'MOA',
    actual_elevation REAL,
    actual_elevation_unit TEXT DEFAULT 'MOA',
    pred_windage REAL,
    windage_unit TEXT DEFAULT 'MOA',
    actual_windage REAL,
    actual_windage_unit TEXT DEFAULT 'MOA',
    
    -- Additional Fields
    target_photo_path TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN DEFAULT 0
);

-- Ladder Tests Table
CREATE TABLE IF NOT EXISTS ladder_tests (
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
);

-- Ladder Test Charges Table (One-to-Many with ladder_tests)
CREATE TABLE IF NOT EXISTS ladder_charges (
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
);

-- Rifle Profiles Table (Future feature)
CREATE TABLE IF NOT EXISTS rifle_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    caliber TEXT,
    barrel_length REAL,
    twist_rate TEXT,
    scope TEXT,
    zero_distance REAL,
    zero_unit TEXT DEFAULT 'yards',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Settings Table (App preferences and premium status)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Cloud Sync Log (Premium feature)
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'create', 'update', 'delete'
    synced_at TEXT DEFAULT CURRENT_TIMESTAMP,
    sync_status TEXT DEFAULT 'pending' -- 'pending', 'success', 'failed'
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_rifle ON sessions(rifle_profile);
CREATE INDEX IF NOT EXISTS idx_ladder_tests_date ON ladder_tests(date);
CREATE INDEX IF NOT EXISTS idx_ladder_charges_test_id ON ladder_charges(ladder_test_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(sync_status);

-- Insert Default Settings
INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('premium_status', 'false'),
    ('cloud_sync_enabled', 'false'),
    ('default_temp_unit', 'F'),
    ('default_distance_unit', 'yards'),
    ('default_elevation_unit', 'MOA'),
    ('app_version', '1.0'),
    ('first_launch', 'true');