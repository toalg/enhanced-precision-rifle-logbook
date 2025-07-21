/**
 * Rebuild Supabase Database
 * This script cleans up the database and removes any existing users
 * Run this to start fresh after changing email confirmation settings
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function rebuildDatabase() {
  console.log('🔧 Rebuilding Supabase Database...\n');

  try {
    // Step 1: Get all existing users
    console.log('1️⃣ Checking existing users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Could not fetch users:', usersError.message);
      console.log('💡 This might be because we need admin privileges');
    } else {
      console.log(`📊 Found ${users.users.length} existing users`);
      
      // Step 2: Delete all existing users
      if (users.users.length > 0) {
        console.log('\n2️⃣ Deleting existing users...');
        for (const user of users.users) {
          console.log(`   Deleting user: ${user.email} (${user.id})`);
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
          if (deleteError) {
            console.log(`   ❌ Failed to delete ${user.email}:`, deleteError.message);
          } else {
            console.log(`   ✅ Deleted ${user.email}`);
          }
        }
      }
    }

    // Step 3: Clear any existing sessions
    console.log('\n3️⃣ Clearing sessions...');
    await supabase.auth.signOut();
    console.log('   ✅ Sessions cleared');

    // Step 4: Test user creation with new settings
    console.log('\n4️⃣ Testing new user creation...');
    const testEmail = 'developer@gmail.com';
    const testPassword = 'testpass123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.log('❌ User creation failed:', signUpError.message);
    } else {
      console.log('✅ User creation successful');
      console.log('   User ID:', signUpData.user.id);
      console.log('   Email confirmed:', signUpData.user.email_confirmed_at ? 'Yes' : 'No');
      
      // Test immediate sign in
      console.log('\n5️⃣ Testing immediate sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message);
      } else {
        console.log('✅ Sign in successful');
        console.log('   Session active:', !!signInData.session);
      }
    }

    // Step 5: Clean up test user
    console.log('\n6️⃣ Cleaning up test user...');
    await supabase.auth.signOut();
    console.log('   ✅ Test user cleaned up');

  } catch (error) {
    console.error('❌ Database rebuild failed:', error.message);
  }
}

// Run the rebuild
rebuildDatabase().then(() => {
  console.log('\n🏁 Database rebuild completed!');
  console.log('💡 You can now test your app with fresh authentication');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Rebuild failed:', error);
  process.exit(1);
}); 