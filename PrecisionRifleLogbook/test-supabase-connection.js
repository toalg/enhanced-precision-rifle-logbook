/**
 * Test Supabase Connection
 * Run this to verify your Supabase setup is working
 * Usage: node test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmanNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      if (error.message.includes('relation "users" does not exist')) {
        console.log('💡 The users table doesn\'t exist. This is normal for a new project.');
      }
    } else {
      console.log('✅ Basic connection successful');
    }

    // Test 2: Authentication service
    console.log('\n2️⃣ Testing authentication service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth service failed:', authError.message);
    } else {
      console.log('✅ Auth service working');
      console.log('   Current session:', authData.session ? 'Active' : 'None');
    }

    // Test 3: Try to create a test user
    console.log('\n3️⃣ Testing user creation...');
    const testEmail = 'developer@gmail.com';
    const testPassword = 'testpass123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.log('❌ User creation failed:', signUpError.message);
      
      if (signUpError.message.includes('User already registered')) {
        console.log('💡 User already exists, trying to sign in...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });
        
        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message);
        } else {
          console.log('✅ Sign in successful');
          console.log('   User ID:', signInData.user.id);
        }
      }
    } else {
      console.log('✅ User creation successful');
      console.log('   User ID:', signUpData.user.id);
      
      // Clean up - delete the test user
      console.log('🧹 Cleaning up test user...');
      await supabase.auth.signOut();
    }

    // Test 4: Check project settings
    console.log('\n4️⃣ Checking project configuration...');
    console.log('   URL:', supabaseUrl);
    console.log('   Key length:', supabaseAnonKey.length, 'characters');
    
    if (supabaseAnonKey.startsWith('eyJ')) {
      console.log('✅ Anon key format looks correct');
    } else {
      console.log('❌ Anon key format may be incorrect');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSupabaseConnection().then(() => {
  console.log('\n🏁 Test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 