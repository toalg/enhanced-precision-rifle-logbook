/**
 * Debug script to test Supabase connection and database setup
 * Run with: node debug-supabase.js
 */

// Import Supabase directly without React Native specific patches
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('rifle_profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Basic connection failed:', error.message);
      return false;
    }
    console.log('✅ Basic connection successful');
    
    // Test authentication approach
    console.log('\n🔍 Testing authentication approach...');
    console.log('ℹ️ This app now uses Firebase Authentication with Supabase for data');
    console.log('ℹ️ Users must sign in with Firebase before accessing Supabase data');
    console.log('ℹ️ Firebase user ID is used as the user_id in Supabase RLS policies');
    
    // For Supabase RLS testing, we'll use a mock Firebase user ID
    const mockFirebaseUserId = 'firebase-user-test-123';
    console.log(`ℹ️ Using mock Firebase user ID for testing: ${mockFirebaseUserId}`);
    
    // Test table structure
    console.log('\n🔍 Testing rifle_profiles table structure...');
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('rifle_profiles')
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error('❌ Table access failed:', tableError.message);
        console.log('💡 You may need to run the schema extensions in your Supabase SQL Editor');
        console.log('💡 File: supabase_schema_extensions.sql');
      } else {
        console.log('✅ Table access successful');
        if (tableData.length > 0) {
          console.log('📋 Sample record fields:', Object.keys(tableData[0]));
        }
      }
    } catch (tableErr) {
      console.error('❌ Table test failed:', tableErr.message);
    }
    
    // Test profile creation with mock Firebase user ID
    console.log('\n🔍 Testing profile creation with Firebase user ID...');
    try {
      const testProfile = {
        user_id: mockFirebaseUserId,
        name: 'Debug Test Rifle',
        caliber: '.308 Winchester',
        manufacturer: 'Test',
        model: 'Debug',
        firearm_type: 'rifle',
        notes: 'Debug test profile - safe to delete'
      };
      
      const { data: createData, error: createError } = await supabase
        .from('rifle_profiles')
        .insert([testProfile])
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Profile creation failed:', createError.message);
        if (createError.message.includes('user_id')) {
          console.log('💡 Issue: user_id field missing - run schema extensions');
        }
        if (createError.message.includes('RLS')) {
          console.log('💡 Issue: Row Level Security - ensure RLS allows Firebase user IDs');
        }
        if (createError.message.includes('firearm_type')) {
          console.log('💡 Issue: firearm_type column missing - run schema extensions');
        }
      } else {
        console.log('✅ Profile creation successful:', createData.id);
        
        // Clean up test profile
        await supabase.from('rifle_profiles').delete().eq('id', createData.id);
        console.log('🧹 Test profile cleaned up');
      }
    } catch (createErr) {
      console.error('❌ Profile creation test failed:', createErr.message);
    }
    
    // Test Firebase + Supabase integration notes
    console.log('\n📋 Firebase + Supabase Integration Notes:');
    console.log('1. Users authenticate with Firebase');
    console.log('2. Firebase user.uid is used as user_id in Supabase');
    console.log('3. Supabase RLS policies should check against Firebase user IDs');
    console.log('4. Run the schema extensions in your Supabase SQL Editor');
    console.log('5. Update RLS policies to allow Firebase authentication patterns');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Supabase debugging complete!');
    } else {
      console.log('\n💥 Issues found - check the logs above');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug script failed:', error);
    process.exit(1);
  });