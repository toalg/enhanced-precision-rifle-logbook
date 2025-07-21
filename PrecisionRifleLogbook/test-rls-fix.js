const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmam5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSFix() {
  console.log('🧪 Testing RLS Fix for rifle_profiles...\n');

  try {
    // Step 1: Sign in
    console.log('1️⃣ Signing in...');
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
    } else {
      console.log('✅ Profile creation successful!');
      console.log('   Profile ID:', profile[0].id);
      console.log('   Name:', profile[0].name);
      
      // Step 3: Test profile retrieval
      console.log('\n3️⃣ Testing profile retrieval...');
      const { data: profiles, error: fetchError } = await supabase
        .from('rifle_profiles')
        .select('*')
        .eq('user_id', signInData.user.id);

      if (fetchError) {
        console.log('❌ Profile retrieval failed:', fetchError.message);
      } else {
        console.log('✅ Profile retrieval successful!');
        console.log('   Found profiles:', profiles.length);
        profiles.forEach(p => console.log(`   - ${p.name} (${p.caliber})`));
      }
      
      // Step 4: Test profile update
      console.log('\n4️⃣ Testing profile update...');
      const { data: updatedProfile, error: updateError } = await supabase
        .from('rifle_profiles')
        .update({ total_rounds: 50 })
        .eq('id', profile[0].id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ Profile update failed:', updateError.message);
      } else {
        console.log('✅ Profile update successful!');
        console.log('   Updated rounds:', updatedProfile.total_rounds);
      }
      
      // Step 5: Clean up test profile
      console.log('\n5️⃣ Cleaning up test profile...');
      const { error: deleteError } = await supabase
        .from('rifle_profiles')
        .delete()
        .eq('id', profile[0].id);

      if (deleteError) {
        console.log('❌ Profile deletion failed:', deleteError.message);
      } else {
        console.log('✅ Profile deletion successful!');
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testRLSFix().then(() => {
  console.log('\n🏁 RLS fix test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 