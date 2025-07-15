-- Supabase Database Schema for Enhanced Precision Rifle Logbook
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Shooting Sessions table
CREATE TABLE IF NOT EXISTS shooting_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    rifle_profile TEXT NOT NULL,
    range_distance DECIMAL(8,2) NOT NULL,
    range_unit TEXT DEFAULT 'yards',
    ammo_type TEXT NOT NULL,
    muzzle_velocity INTEGER,
    temperature DECIMAL(5,2),
    temp_unit TEXT DEFAULT 'F',
    humidity DECIMAL(5,2),
    pressure DECIMAL(6,2),
    pressure_unit TEXT DEFAULT 'inHg',
    wind_speed DECIMAL(5,2),
    wind_speed_unit TEXT DEFAULT 'mph',
    wind_direction TEXT,
    pred_elevation DECIMAL(8,3),
    elevation_unit TEXT DEFAULT 'MOA',
    actual_elevation DECIMAL(8,3),
    actual_elevation_unit TEXT DEFAULT 'MOA',
    pred_windage DECIMAL(8,3),
    windage_unit TEXT DEFAULT 'MOA',
    actual_windage DECIMAL(8,3),
    actual_windage_unit TEXT DEFAULT 'MOA',
    target_photo_path TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ladder Tests table
CREATE TABLE IF NOT EXISTS ladder_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    rifle_profile TEXT NOT NULL,
    ammo_type TEXT NOT NULL,
    bullet_weight DECIMAL(6,2),
    bullet_weight_unit TEXT DEFAULT 'gr',
    powder_type TEXT,
    primer_type TEXT,
    brass_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ladder Charges table (for individual charge weights in a test)
CREATE TABLE IF NOT EXISTS ladder_charges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ladder_test_id UUID REFERENCES ladder_tests(id) ON DELETE CASCADE NOT NULL,
    charge_weight DECIMAL(6,3) NOT NULL,
    charge_weight_unit TEXT DEFAULT 'gr',
    shot_1_velocity INTEGER,
    shot_2_velocity INTEGER,
    shot_3_velocity INTEGER,
    shot_4_velocity INTEGER,
    shot_5_velocity INTEGER,
    average_velocity INTEGER,
    standard_deviation DECIMAL(8,2),
    extreme_spread INTEGER,
    group_size DECIMAL(6,2),
    group_size_unit TEXT DEFAULT 'inches',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rifle Profiles table
CREATE TABLE IF NOT EXISTS rifle_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    caliber TEXT NOT NULL,
    barrel_length DECIMAL(5,2),
    barrel_length_unit TEXT DEFAULT 'inches',
    twist_rate DECIMAL(6,2),
    twist_rate_unit TEXT DEFAULT '1:',
    scope_height DECIMAL(5,2),
    scope_height_unit TEXT DEFAULT 'inches',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    premium_status BOOLEAN DEFAULT FALSE,
    cloud_sync_enabled BOOLEAN DEFAULT TRUE,
    default_units JSONB DEFAULT '{"distance": "yards", "temperature": "F", "pressure": "inHg", "wind": "mph", "elevation": "MOA", "windage": "MOA"}'::jsonb,
    notification_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Notes table (for the journaling feature)
CREATE TABLE IF NOT EXISTS daily_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    title TEXT,
    brain_dump TEXT,
    market_focus TEXT,
    priorities JSONB DEFAULT '[]'::jsonb,
    goals_intentions TEXT,
    journal_reflection TEXT,
    trading_notes TEXT,
    quick_links JSONB DEFAULT '[]'::jsonb,
    analytics_reports JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Analytics Events table (for tracking user behavior)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_user_id ON shooting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_date ON shooting_sessions(date);
CREATE INDEX IF NOT EXISTS idx_ladder_tests_user_id ON ladder_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_ladder_tests_date ON ladder_tests(date);
CREATE INDEX IF NOT EXISTS idx_ladder_charges_test_id ON ladder_charges(ladder_test_id);
CREATE INDEX IF NOT EXISTS idx_rifle_profiles_user_id ON rifle_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_notes_user_date ON daily_notes(user_id, date);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_timestamp ON analytics_events(user_id, timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shooting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ladder_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ladder_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rifle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Shooting sessions policies
CREATE POLICY "Users can view own sessions" ON shooting_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON shooting_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON shooting_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON shooting_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Ladder tests policies
CREATE POLICY "Users can view own ladder tests" ON ladder_tests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ladder tests" ON ladder_tests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ladder tests" ON ladder_tests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ladder tests" ON ladder_tests
    FOR DELETE USING (auth.uid() = user_id);

-- Ladder charges policies (through test ownership)
CREATE POLICY "Users can view own ladder charges" ON ladder_charges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ladder_tests 
            WHERE ladder_tests.id = ladder_charges.ladder_test_id 
            AND ladder_tests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own ladder charges" ON ladder_charges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ladder_tests 
            WHERE ladder_tests.id = ladder_charges.ladder_test_id 
            AND ladder_tests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own ladder charges" ON ladder_charges
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM ladder_tests 
            WHERE ladder_tests.id = ladder_charges.ladder_test_id 
            AND ladder_tests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own ladder charges" ON ladder_charges
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM ladder_tests 
            WHERE ladder_tests.id = ladder_charges.ladder_test_id 
            AND ladder_tests.user_id = auth.uid()
        )
    );

-- Rifle profiles policies
CREATE POLICY "Users can view own rifle profiles" ON rifle_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rifle profiles" ON rifle_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rifle profiles" ON rifle_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rifle profiles" ON rifle_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Daily notes policies
CREATE POLICY "Users can view own daily notes" ON daily_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily notes" ON daily_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily notes" ON daily_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily notes" ON daily_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can view own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('target-photos', 'target-photos', true),
    ('user-avatars', 'user-avatars', true),
    ('exports', 'exports', false),
    ('temp', 'temp', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for target photos
CREATE POLICY "Users can upload own target photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'target-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own target photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'target-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own target photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'target-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for exports
CREATE POLICY "Users can upload own exports" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'exports' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own exports" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'exports' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own exports" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'exports' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shooting_sessions_updated_at BEFORE UPDATE ON shooting_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ladder_tests_updated_at BEFORE UPDATE ON ladder_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rifle_profiles_updated_at BEFORE UPDATE ON rifle_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_notes_updated_at BEFORE UPDATE ON daily_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 