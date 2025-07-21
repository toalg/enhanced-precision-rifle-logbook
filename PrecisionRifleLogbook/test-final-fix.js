const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmam5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalFix() {
  console.log('🧪 Final Test - Profile Creation with RLS Fix...\n');

  try {
    // Step 1: Sign in
    console.log('1️⃣ Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'developer@gmail.com',
      password: 'testpass123'
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      console.log('   Error code:', signInError.code);
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
        user_id: signInData.user.id,
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
      
      // Check if it's an RLS issue
      if (profileError.code === '42501') {
        console.log('\n🔍 This appears to be an RLS policy issue.');
        console.log('   The RLS policies may not be properly configured.');
      }
    } else {
      console.log('✅ Profile creation successful!');
      console.log('   Profile ID:', profile[0].id);
      console.log('   Name:', profile[0].name);
      console.log('   User ID:', profile[0].user_id);
      
      // Clean up
      await supabase
        .from('rifle_profiles')
        .delete()
        .eq('id', profile[0].id);
      console.log('🧹 Test profile cleaned up');
      
      console.log('\n🎉 SUCCESS! The RLS fix is working correctly.');
      console.log('   Profile creation should now work in the app.');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testFinalFix().then(() => {
  console.log('\n🏁 Final test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 