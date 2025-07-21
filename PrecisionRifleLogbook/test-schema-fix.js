/**
 * Test Schema Fix
 * This script tests if the cleaning_interval column has been added
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSchemaFix() {
  console.log('🧪 Testing Database Schema Fix...\n');

  try {
    // Test 1: Try to create a rifle profile with cleaning_interval
    console.log('1️⃣ Testing rifle profile creation with cleaning_interval...');
    const { data: profile, error: profileError } = await supabase
      .from('rifle_profiles')
      .insert({
        name: 'Test Rifle Schema',
        caliber: '.308',
        cleaning_interval: 200,
        manufacturer: 'Test Manufacturer',
        model: 'Test Model'
      })
      .select();

    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
      console.log('💡 This means the cleaning_interval column is still missing');
      console.log('🔧 You need to run the SQL commands in your Supabase dashboard');
    } else {
      console.log('✅ Profile creation successful!');
      console.log('   Profile ID:', profile[0].id);
      console.log('   Name:', profile[0].name);
      console.log('   Cleaning interval:', profile[0].cleaning_interval);
      console.log('   Manufacturer:', profile[0].manufacturer);
      
      // Clean up test profile
      await supabase
        .from('rifle_profiles')
        .delete()
        .eq('name', 'Test Rifle Schema');
      console.log('🧹 Test profile cleaned up');
    }

    // Test 2: Check if the column exists by querying the table structure
    console.log('\n2️⃣ Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('rifle_profiles')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.log('❌ Could not query table:', columnsError.message);
    } else {
      console.log('✅ Table is accessible');
      if (columns.length > 0) {
        const sampleProfile = columns[0];
        console.log('   Available columns:', Object.keys(sampleProfile).join(', '));
        
        if ('cleaning_interval' in sampleProfile) {
          console.log('✅ cleaning_interval column exists!');
        } else {
          console.log('❌ cleaning_interval column is missing');
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSchemaFix().then(() => {
  console.log('\n🏁 Schema test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 