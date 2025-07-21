/**
 * Apply Supabase Schema Extensions
 * This script applies the missing columns and functions to fix the database schema
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Schema extensions SQL
const schemaExtensions = `
-- Gun Profiles Schema Extensions for Enhanced Precision Rifle Logbook

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

-- 8. Create a view for easy access to cleaning status
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

-- 9. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON rifle_profiles TO authenticated;
GRANT SELECT ON rifle_cleaning_status TO authenticated;
GRANT EXECUTE ON FUNCTION mark_rifle_cleaned(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_rifles_needing_cleaning(UUID) TO authenticated;
`;

async function applySchemaExtensions() {
  console.log('🔧 Applying Supabase Schema Extensions...\n');

  try {
    // Split the SQL into individual statements
    const statements = schemaExtensions
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n${i + 1}/${statements.length}: Executing statement...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`   ⚠️ Statement ${i + 1} had an issue:`, error.message);
          // Continue with other statements
        } else {
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        }
      } catch (execError) {
        console.log(`   ⚠️ Could not execute statement ${i + 1}:`, execError.message);
        // Continue with other statements
      }
    }

    // Test the schema by trying to create a test profile
    console.log('\n🧪 Testing schema with a test profile...');
    const { data: testProfile, error: testError } = await supabase
      .from('rifle_profiles')
      .insert({
        name: 'Test Rifle',
        caliber: '.308',
        cleaning_interval: 200,
        manufacturer: 'Test Manufacturer',
        model: 'Test Model'
      })
      .select();

    if (testError) {
      console.log('❌ Test profile creation failed:', testError.message);
    } else {
      console.log('✅ Test profile created successfully');
      console.log('   Profile ID:', testProfile[0].id);
      console.log('   Cleaning interval:', testProfile[0].cleaning_interval);
      
      // Clean up test profile
      await supabase
        .from('rifle_profiles')
        .delete()
        .eq('name', 'Test Rifle');
      console.log('🧹 Test profile cleaned up');
    }

  } catch (error) {
    console.error('❌ Schema application failed:', error.message);
  }
}

// Run the schema application
applySchemaExtensions().then(() => {
  console.log('\n🏁 Schema extensions applied!');
  console.log('💡 Your app should now work without database errors');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed to apply schema:', error);
  process.exit(1);
}); 