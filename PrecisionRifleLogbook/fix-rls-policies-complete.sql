-- Complete RLS Policy Fix for rifle_profiles table
-- This script will remove all existing policies and create new ones

-- Step 1: Drop all existing policies on rifle_profiles table
DROP POLICY IF EXISTS "Users can insert their own rifle profiles" ON rifle_profiles;
DROP POLICY IF EXISTS "Users can view their own rifle profiles" ON rifle_profiles;
DROP POLICY IF EXISTS "Users can update their own rifle profiles" ON rifle_profiles;
DROP POLICY IF EXISTS "Users can delete their own rifle profiles" ON rifle_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON rifle_profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON rifle_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON rifle_profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON rifle_profiles;

-- Step 2: Enable RLS on the table
ALTER TABLE rifle_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Grant all permissions to authenticated users
GRANT ALL ON rifle_profiles TO authenticated;

-- Step 4: Create new policies
-- Policy for inserting rifle profiles
CREATE POLICY "Users can insert their own rifle profiles"
ON rifle_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for viewing rifle profiles
CREATE POLICY "Users can view their own rifle profiles"
ON rifle_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for updating rifle profiles
CREATE POLICY "Users can update their own rifle profiles"
ON rifle_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for deleting rifle profiles
CREATE POLICY "Users can delete their own rifle profiles"
ON rifle_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Step 5: Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'rifle_profiles'; 