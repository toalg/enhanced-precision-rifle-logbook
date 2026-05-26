-- =============================================================================
-- Precision Rifle Logbook — v1 launch schema
-- Consolidated from supabase-schema.sql + supabase_schema_extensions.sql
-- Changes vs source-of-truth:
--   - Removed placeholder `ALTER DATABASE ... app.jwt_secret` line (Supabase manages this)
--   - Removed `daily_notes` table (trading-app leftover, not used by the app)
--   - Added `handle_new_user` trigger to auto-create public.users on signup
--   - Added `delete_user_account()` function for App Store compliance (Phase 2.1)
--   - Rifle profile extensions (round counting, cleaning) merged inline
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Rifle Profiles table (with round counting + cleaning fields merged in)
CREATE TABLE IF NOT EXISTS public.rifle_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    caliber TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date DATE,
    firearm_type TEXT DEFAULT 'rifle',
    barrel_length DECIMAL(5,2),
    barrel_length_unit TEXT DEFAULT 'inches',
    twist_rate DECIMAL(6,2),
    twist_rate_unit TEXT DEFAULT '1:',
    scope_height DECIMAL(5,2),
    scope_height_unit TEXT DEFAULT 'inches',
    total_rounds INTEGER DEFAULT 0,
    last_cleaned_at INTEGER DEFAULT 0,
    cleaning_interval INTEGER DEFAULT 200,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shooting Sessions
CREATE TABLE IF NOT EXISTS public.shooting_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    rifle_profile TEXT NOT NULL,
    rounds_fired INTEGER DEFAULT 1,
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

-- Ladder Tests
CREATE TABLE IF NOT EXISTS public.ladder_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
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

-- Ladder Charges
CREATE TABLE IF NOT EXISTS public.ladder_charges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ladder_test_id UUID REFERENCES public.ladder_tests(id) ON DELETE CASCADE NOT NULL,
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

-- User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    premium_status BOOLEAN DEFAULT FALSE,
    cloud_sync_enabled BOOLEAN DEFAULT TRUE,
    default_units JSONB DEFAULT '{"distance": "yards", "temperature": "F", "pressure": "inHg", "wind": "mph", "elevation": "MOA", "windage": "MOA"}'::jsonb,
    notification_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events (for in-app event tracking; complements Sentry)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_rifle_profiles_user_id ON public.rifle_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_rifle_profiles_name_user ON public.rifle_profiles(name, user_id);
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_user_id ON public.shooting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_date ON public.shooting_sessions(date);
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_rifle_profile ON public.shooting_sessions(rifle_profile, user_id);
CREATE INDEX IF NOT EXISTS idx_ladder_tests_user_id ON public.ladder_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_ladder_tests_date ON public.ladder_tests(date);
CREATE INDEX IF NOT EXISTS idx_ladder_charges_test_id ON public.ladder_charges(ladder_test_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_timestamp ON public.analytics_events(user_id, timestamp);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rifle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shooting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ladder_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ladder_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Rifle profiles
CREATE POLICY "rifle_profiles_select_own" ON public.rifle_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rifle_profiles_insert_own" ON public.rifle_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rifle_profiles_update_own" ON public.rifle_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "rifle_profiles_delete_own" ON public.rifle_profiles FOR DELETE USING (auth.uid() = user_id);

-- Shooting sessions
CREATE POLICY "shooting_sessions_select_own" ON public.shooting_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "shooting_sessions_insert_own" ON public.shooting_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shooting_sessions_update_own" ON public.shooting_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "shooting_sessions_delete_own" ON public.shooting_sessions FOR DELETE USING (auth.uid() = user_id);

-- Ladder tests
CREATE POLICY "ladder_tests_select_own" ON public.ladder_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ladder_tests_insert_own" ON public.ladder_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ladder_tests_update_own" ON public.ladder_tests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ladder_tests_delete_own" ON public.ladder_tests FOR DELETE USING (auth.uid() = user_id);

-- Ladder charges (via parent test ownership)
CREATE POLICY "ladder_charges_select_own" ON public.ladder_charges FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ladder_tests WHERE ladder_tests.id = ladder_charges.ladder_test_id AND ladder_tests.user_id = auth.uid())
);
CREATE POLICY "ladder_charges_insert_own" ON public.ladder_charges FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.ladder_tests WHERE ladder_tests.id = ladder_charges.ladder_test_id AND ladder_tests.user_id = auth.uid())
);
CREATE POLICY "ladder_charges_update_own" ON public.ladder_charges FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.ladder_tests WHERE ladder_tests.id = ladder_charges.ladder_test_id AND ladder_tests.user_id = auth.uid())
);
CREATE POLICY "ladder_charges_delete_own" ON public.ladder_charges FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.ladder_tests WHERE ladder_tests.id = ladder_charges.ladder_test_id AND ladder_tests.user_id = auth.uid())
);

-- User settings
CREATE POLICY "user_settings_select_own" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert_own" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update_own" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Analytics events
CREATE POLICY "analytics_events_select_own" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analytics_events_insert_own" ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Storage buckets + policies
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) VALUES
    ('target-photos', 'target-photos', true),
    ('user-avatars', 'user-avatars', true),
    ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Target photos
CREATE POLICY "target_photos_insert_own" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'target-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "target_photos_select_own" ON storage.objects FOR SELECT USING (
    bucket_id = 'target-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "target_photos_delete_own" ON storage.objects FOR DELETE USING (
    bucket_id = 'target-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Avatars
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_select_own" ON storage.objects FOR SELECT USING (
    bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE USING (
    bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Exports (private)
CREATE POLICY "exports_insert_own" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "exports_select_own" ON storage.objects FOR SELECT USING (
    bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "exports_delete_own" ON storage.objects FOR DELETE USING (
    bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- -----------------------------------------------------------------------------
-- Functions + triggers
-- -----------------------------------------------------------------------------

-- updated_at auto-touch
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rifle_profiles_updated_at BEFORE UPDATE ON public.rifle_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shooting_sessions_updated_at BEFORE UPDATE ON public.shooting_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ladder_tests_updated_at BEFORE UPDATE ON public.ladder_tests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create public.users row when auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-increment rifle round count when a session is logged
CREATE OR REPLACE FUNCTION public.update_rifle_total_rounds()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.rifle_profiles
    SET total_rounds = total_rounds + COALESCE(NEW.rounds_fired, 1),
        updated_at = NOW()
    WHERE name = NEW.rifle_profile AND user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_session_insert ON public.shooting_sessions;
CREATE TRIGGER on_session_insert
    AFTER INSERT ON public.shooting_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_rifle_total_rounds();

-- Mark rifle as cleaned (resets cleaning counter)
CREATE OR REPLACE FUNCTION public.mark_rifle_cleaned(profile_name TEXT, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.rifle_profiles
    SET last_cleaned_at = total_rounds,
        updated_at = NOW()
    WHERE name = profile_name AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Get rifles needing cleaning
CREATE OR REPLACE FUNCTION public.get_rifles_needing_cleaning(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    caliber TEXT,
    total_rounds INTEGER,
    last_cleaned_at INTEGER,
    cleaning_interval INTEGER,
    rounds_since_cleaning INTEGER,
    needs_cleaning BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rp.id, rp.name, rp.caliber, rp.total_rounds, rp.last_cleaned_at, rp.cleaning_interval,
        (rp.total_rounds - rp.last_cleaned_at) AS rounds_since_cleaning,
        (rp.total_rounds - rp.last_cleaned_at) >= rp.cleaning_interval AS needs_cleaning
    FROM public.rifle_profiles rp
    WHERE rp.user_id = user_uuid
      AND (rp.total_rounds - rp.last_cleaned_at) >= rp.cleaning_interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Rifle cleaning status view
CREATE OR REPLACE VIEW public.rifle_cleaning_status AS
SELECT
    id, user_id, name, caliber, manufacturer, model,
    total_rounds, last_cleaned_at, cleaning_interval,
    (total_rounds - last_cleaned_at) AS rounds_since_cleaning,
    (total_rounds - last_cleaned_at) >= cleaning_interval AS needs_cleaning,
    created_at, updated_at
FROM public.rifle_profiles;

-- =============================================================================
-- Account deletion (App Store compliance — Apple Guideline 5.1.1(v))
-- The client calls public.delete_my_account() while authenticated.
-- SECURITY DEFINER lets it call auth.admin.delete_user via internal extension.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    uid UUID;
BEGIN
    uid := auth.uid();
    IF uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- All public.* rows cascade via FK ON DELETE CASCADE when we delete from auth.users.
    -- But we delete explicitly for defense-in-depth and so the function is auditable.
    DELETE FROM public.analytics_events WHERE user_id = uid;
    DELETE FROM public.ladder_charges WHERE ladder_test_id IN (SELECT id FROM public.ladder_tests WHERE user_id = uid);
    DELETE FROM public.ladder_tests WHERE user_id = uid;
    DELETE FROM public.shooting_sessions WHERE user_id = uid;
    DELETE FROM public.rifle_profiles WHERE user_id = uid;
    DELETE FROM public.user_settings WHERE user_id = uid;
    DELETE FROM public.users WHERE id = uid;

    -- Finally delete from auth.users (cascades the rest via FK).
    DELETE FROM auth.users WHERE id = uid;
END;
$$;

-- Only allow authenticated users to call this
REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

-- -----------------------------------------------------------------------------
-- Permissions
-- -----------------------------------------------------------------------------

GRANT SELECT ON public.rifle_cleaning_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_rifle_cleaned(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rifles_needing_cleaning(UUID) TO authenticated;
