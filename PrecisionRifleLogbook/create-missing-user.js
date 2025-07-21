/**
 * Create Missing User Record
 * This script adds the missing user to the users table
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createMissingUser() {
  console.log('🔧 Creating Missing User Record...\n');

  try {
    // Step 1: Sign in to get user info
    console.log('1️⃣ Signing in to get user info...');
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

    // Step 2: Try to create user record with minimal fields
    console.log('\n2️⃣ Creating user record in users table...');
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: signInData.user.id,
        email: signInData.user.email,
        created_at: new Date().toISOString()
      })
      .select();

    if (createError) {
      console.log('❌ User creation failed:', createError.message);
      console.log('   Error code:', createError.code);
      
      // Try with just the ID
      console.log('\n3️⃣ Trying with just the ID...');
      const { data: simpleUser, error: simpleError } = await supabase
        .from('users')
        .insert({
          id: signInData.user.id
        })
        .select();

      if (simpleError) {
        console.log('❌ Simple user creation also failed:', simpleError.message);
        console.log('   Error code:', simpleError.code);
      } else {
        console.log('✅ Simple user creation successful!');
        console.log('   Created user:', simpleUser[0]);
      }
    } else {
      console.log('✅ User creation successful!');
      console.log('   Created user:', newUser[0]);
    }

    // Step 4: Test profile creation again
    console.log('\n4️⃣ Testing profile creation after user creation...');
    const { data: profile, error: profileError } = await supabase
      .from('rifle_profiles')
      .insert({
        name: 'Test Rifle After User Creation',
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
      console.log('❌ Profile creation still failed:', profileError.message);
      console.log('   Error code:', profileError.code);
    } else {
      console.log('✅ Profile creation successful!');
      console.log('   Profile ID:', profile[0].id);
      console.log('   Name:', profile[0].name);
      
      // Clean up test profile
      await supabase
        .from('rifle_profiles')
        .delete()
        .eq('name', 'Test Rifle After User Creation');
      console.log('🧹 Test profile cleaned up');
    }

  } catch (error) {
    console.error('❌ Process failed:', error.message);
  }
}

// Run the process
createMissingUser().then(() => {
  console.log('\n🏁 User creation process completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Process failed:', error);
  process.exit(1);
}); 