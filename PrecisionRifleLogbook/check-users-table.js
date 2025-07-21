/**
 * Check Users Table Structure
 * This script checks if the users table exists and what its structure looks like
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsersTable() {
  console.log('🔍 Checking Users Table Structure...\n');

  try {
    // Step 1: Try to query the users table
    console.log('1️⃣ Testing users table access...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
      console.log('   Error code:', usersError.code);
      
      if (usersError.code === '42P01') {
        console.log('💡 The users table does not exist!');
        console.log('🔧 We need to create the users table');
      }
    } else {
      console.log('✅ Users table exists and is accessible');
      if (users.length > 0) {
        console.log('   Sample user data:', users[0]);
        console.log('   Available columns:', Object.keys(users[0]));
      } else {
        console.log('   Table is empty');
      }
    }

    // Step 2: Check if we can create a user record
    console.log('\n2️⃣ Testing user creation...');
    const testUserId = '0e844b13-94d6-4702-bb63-ec7778de08a4'; // From our test
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'developer@gmail.com',
        display_name: 'Developer Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (createError) {
      console.log('❌ User creation failed:', createError.message);
      console.log('   Error code:', createError.code);
    } else {
      console.log('✅ User creation successful!');
      console.log('   Created user:', newUser[0]);
      
      // Clean up
      await supabase
        .from('users')
        .delete()
        .eq('id', testUserId);
      console.log('🧹 Test user cleaned up');
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Run the check
checkUsersTable().then(() => {
  console.log('\n🏁 Users table check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 