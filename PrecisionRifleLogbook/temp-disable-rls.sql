-- Temporarily disable RLS for testing
ALTER TABLE rifle_profiles DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON rifle_profiles TO authenticated;

-- Test if we can insert without RLS
SELECT 'RLS disabled for testing' as status; 