-- SUPABASE SCHEMA FIX: Add missing columns to rifle_profiles table
-- Run this SQL in your Supabase Dashboard SQL Editor

-- 1. Add missing columns to rifle_profiles table
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS total_rounds INTEGER DEFAULT 0;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS last_cleaned_at INTEGER DEFAULT 0;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS cleaning_interval INTEGER DEFAULT 200;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE rifle_profiles ADD COLUMN IF NOT EXISTS firearm_type TEXT DEFAULT 'rifle';

-- 2. Update existing rifle_profiles to have default values
UPDATE rifle_profiles 
SET 
    total_rounds = COALESCE(total_rounds, 0),
    last_cleaned_at = COALESCE(last_cleaned_at, 0),
    cleaning_interval = COALESCE(cleaning_interval, 200),
    firearm_type = COALESCE(firearm_type, 'rifle')
WHERE 
    total_rounds IS NULL 
    OR last_cleaned_at IS NULL 
    OR cleaning_interval IS NULL 
    OR firearm_type IS NULL;

-- 3. Create function to mark rifle as cleaned
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

-- 4. Create function to get rifles needing cleaning
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

-- 5. Create a view for easy access to cleaning status
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

-- 6. Grant permissions
GRANT SELECT ON rifle_cleaning_status TO authenticated;
GRANT EXECUTE ON FUNCTION mark_rifle_cleaned(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rifles_needing_cleaning(UUID) TO authenticated;

-- 7. Refresh schema cache (this helps with the PGRST204 error)
NOTIFY pgrst, 'reload schema';

-- 8. Verification query (check that columns exist)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rifle_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;