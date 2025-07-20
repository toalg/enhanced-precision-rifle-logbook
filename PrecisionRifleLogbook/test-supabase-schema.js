/**
 * Test Supabase Schema Extensions
 * Run this script to verify the Gun Profiles schema is working correctly
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('rifle_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function testSchemaExtensions() {
  console.log('\n🔍 Testing Schema Extensions...');
  
  try {
    // Test if new columns exist
    const { data, error } = await supabase
      .from('rifle_profiles')
      .select('total_rounds, last_cleaned_at, cleaning_interval, manufacturer, model, serial_number, purchase_date, firearm_type')
      .limit(1);
    
    if (error) {
      console.error('❌ Schema test failed:', error.message);
      return false;
    }
    
    console.log('✅ New columns exist in rifle_profiles table');
    return true;
  } catch (error) {
    console.error('❌ Schema test error:', error.message);
    return false;
  }
}

async function testFunctions() {
  console.log('\n🔍 Testing Database Functions...');
  
  try {
    // Test get_rifles_needing_cleaning function
    const { data, error } = await supabase
      .rpc('get_rifles_needing_cleaning', { user_uuid: '00000000-0000-0000-0000-000000000000' });
    
    if (error) {
      console.error('❌ Function test failed:', error.message);
      return false;
    }
    
    console.log('✅ Database functions are working');
    return true;
  } catch (error) {
    console.error('❌ Function test error:', error.message);
    return false;
  }
}

async function testView() {
  console.log('\n🔍 Testing Database View...');
  
  try {
    // Test rifle_cleaning_status view
    const { data, error } = await supabase
      .from('rifle_cleaning_status')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ View test failed:', error.message);
      return false;
    }
    
    console.log('✅ rifle_cleaning_status view is working');
    return true;
  } catch (error) {
    console.error('❌ View test error:', error.message);
    return false;
  }
}

async function createTestProfile() {
  console.log('\n🔍 Testing Profile Creation...');
  
  try {
    const testProfile = {
      name: 'Test Rifle',
      caliber: '.308 Winchester',
      manufacturer: 'Remington',
      model: '700 SPS',
      serial_number: 'TEST123',
      purchase_date: '2023-01-01',
      cleaning_interval: 200,
      notes: 'Test profile for schema validation',
      firearm_type: 'rifle'
    };
    
    const { data, error } = await supabase
      .from('rifle_profiles')
      .insert([testProfile])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Profile creation failed:', error.message);
      return false;
    }
    
    console.log('✅ Test profile created successfully');
    console.log('   Profile ID:', data.id);
    console.log('   Name:', data.name);
    console.log('   Total Rounds:', data.total_rounds);
    
    // Clean up test profile
    await supabase
      .from('rifle_profiles')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Test profile cleaned up');
    return true;
  } catch (error) {
    console.error('❌ Profile creation error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Supabase Schema Tests...\n');
  
  const tests = [
    { name: 'Connection', test: testSupabaseConnection },
    { name: 'Schema Extensions', test: testSchemaExtensions },
    { name: 'Database Functions', test: testFunctions },
    { name: 'Database View', test: testView },
    { name: 'Profile Creation', test: createTestProfile }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your Supabase schema is ready for Gun Profiles.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your schema setup.');
  }
}

// Run the tests
runAllTests().catch(console.error); 