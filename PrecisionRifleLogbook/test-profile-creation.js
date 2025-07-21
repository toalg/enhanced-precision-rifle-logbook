/**
 * Test Profile Creation with Authenticated User
 * This script tests if we can create profiles after proper authentication
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileCreation() {
  console.log('🧪 Testing Profile Creation with Authenticated User...\n');

  try {
    // Step 1: Sign in with existing user
    console.log('1️⃣ Signing in with existing user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'developer@gmail.com',
      password: 'testpass123'
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      return;
    }
    
    console.log('✅ Sign in successful');
    console.log('   User ID:', signInData.user.id);
    console.log('   Email:', signInData.user.email);

    // Step 2: Test profile creation
    console.log('\n2️⃣ Testing profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('rifle_profiles')
      .insert({
        name: 'Test Rifle Profile',
        caliber: '.308 Winchester',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        firearm_type: 'rifle',
        cleaning_interval: 200,
        total_rounds: 0,
        last_cleaned_at: 0
      })
      .select();

    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
      console.log('   Error code:', profileError.code);
      console.log('   Error details:', profileError.details);
    } else {
      console.log('✅ Profile creation successful!');
      console.log('   Profile ID:', profile[0].id);
      console.log('   Name:', profile[0].name);
      console.log('   Cleaning interval:', profile[0].cleaning_interval);
      
      // Clean up test profile
      await supabase
        .from('rifle_profiles')
        .delete()
        .eq('name', 'Test Rifle Profile');
      console.log('🧹 Test profile cleaned up');
    }

    // Step 3: Check if user exists in users table
    console.log('\n3️⃣ Checking if user exists in users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user.id);

    if (usersError) {
      console.log('❌ Could not query users table:', usersError.message);
    } else {
      console.log('✅ Users table query successful');
      if (users.length > 0) {
        console.log('   User found in users table');
        console.log('   User data:', users[0]);
      } else {
        console.log('❌ User NOT found in users table - this is the problem!');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProfileCreation().then(() => {
  console.log('\n🏁 Profile creation test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 