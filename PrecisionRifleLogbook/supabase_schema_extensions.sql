-- Gun Profiles Schema Extensions for Enhanced Precision Rifle Logbook
-- Run this SQL in your Supabase SQL Editor

-- 1. Extend rifle_profiles table with gun profile fields
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS total_rounds INTEGER DEFAULT 0;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS last_cleaned_at INTEGER DEFAULT 0;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS cleaning_interval INTEGER DEFAULT 200;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS firearm_type TEXT DEFAULT 'rifle';

-- 2. Add round counting to shooting_sessions table
ALTER TABLE shooting_sessions ADD COLUMN IF NOT EXISTS rounds_fired INTEGER DEFAULT 1;

-- 3. Create function to auto-update total rounds when sessions are added
CREATE OR REPLACE FUNCTION update_rifle_total_rounds()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE rifle_profiles 
    SET 
        total_rounds = total_rounds + COALESCE(NEW.rounds_fired, 1),
        updated_at = NOW()
    WHERE name = NEW.rifle_profile AND user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically update round counts
DROP TRIGGER IF EXISTS on_session_insert ON shooting_sessions;
CREATE TRIGGER on_session_insert
    AFTER INSERT ON shooting_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_rifle_total_rounds();

-- 5. Create function to mark rifle as cleaned
CREATE OR REPLACE FUNCTION mark_rifle_cleaned(profile_name TEXT, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE rifle_profiles 
    SET 
        last_cleaned_at = total_rounds,
        updated_at = NOW()
    WHERE name = profile_name AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get rifles needing cleaning
CREATE OR REPLACE FUNCTION get_rifles_needing_cleaning(user_uuid UUID)
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
        rp.id,
        rp.name,
        rp.caliber,
        rp.total_rounds,
        rp.last_cleaned_at,
        rp.cleaning_interval,
        (rp.total_rounds - rp.last_cleaned_at) as rounds_since_cleaning,
        (rp.total_rounds - rp.last_cleaned_at) >= rp.cleaning_interval as needs_cleaning
    FROM rifle_profiles rp
    WHERE rp.user_id = user_uuid
    AND (rp.total_rounds - rp.last_cleaned_at) >= rp.cleaning_interval;
END;
$$ LANGUAGE plpgsql;

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rifle_profiles_user_id ON rifle_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_rifle_profiles_name_user ON rifle_profiles(name, user_id);
CREATE INDEX IF NOT EXISTS idx_shooting_sessions_rifle_profile ON shooting_sessions(rifle_profile, user_id);

-- 8. Update RLS policies to include new columns
-- (Assuming RLS is already enabled on rifle_profiles table)
-- The existing policies should work with the new columns automatically

-- 9. Create a view for easy access to cleaning status
CREATE OR REPLACE VIEW rifle_cleaning_status AS
SELECT 
    id,
    user_id,
    name,
    caliber,
    manufacturer,
    model,
    total_rounds,
    last_cleaned_at,
    cleaning_interval,
    (total_rounds - last_cleaned_at) as rounds_since_cleaning,
    (total_rounds - last_cleaned_at) >= cleaning_interval as needs_cleaning,
    created_at,
    updated_at
FROM rifle_profiles;

-- 10. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON rifle_profiles TO authenticated;
GRANT SELECT ON rifle_cleaning_status TO authenticated;
GRANT EXECUTE ON FUNCTION mark_rifle_cleaned(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rifles_needing_cleaning(UUID) TO authenticated;

-- Verification queries (run these to check the setup)
-- SELECT * FROM rifle_profiles LIMIT 5;
-- SELECT * FROM rifle_cleaning_status LIMIT 5;
-- SELECT * FROM get_rifles_needing_cleaning('your-user-uuid-here'); 