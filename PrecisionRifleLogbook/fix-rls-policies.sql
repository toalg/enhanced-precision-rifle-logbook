-- Fix Row Level Security Policies for rifle_profiles table
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on rifle_profiles table (if not already enabled)
ALTER TABLE rifle_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can insert their own rifle profiles" ON rifle_profiles;
DROP POLICY IF EXISTS "Users can view their own rifle profiles" ON rifle_profiles;
DROP POLICY IF EXISTS "Users can update their own rifle profiles" ON rifle_profiles;
DROP POLICY IF EXISTS "Users can delete their own rifle profiles" ON rifle_profiles;

-- 3. Create new policies
-- Policy for inserting rifle profiles
CREATE POLICY "Users can insert their own rifle profiles" ON rifle_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for viewing rifle profiles
CREATE POLICY "Users can view their own rifle profiles" ON rifle_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy for updating rifle profiles
CREATE POLICY "Users can update their own rifle profiles" ON rifle_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting rifle profiles
CREATE POLICY "Users can delete their own rifle profiles" ON rifle_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Grant necessary permissions
GRANT ALL ON rifle_profiles TO authenticated;

-- 5. Test the policies
-- You can test by running a SELECT query to see if the policies work
-- SELECT * FROM rifle_profiles WHERE user_id = auth.uid(); 