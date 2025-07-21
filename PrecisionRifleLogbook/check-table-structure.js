const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmam5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking rifle_profiles table structure...\n');

  try {
    // Sign in first
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

    // Check table columns
    console.log('\n2️⃣ Table columns:');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'rifle_profiles')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Error checking columns:', columnsError.message);
    } else {
      columns.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
      });
    }

    // Check foreign key constraints
    console.log('\n3️⃣ Foreign key constraints:');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        constraint_name,
        constraint_type,
        table_name
      `)
      .eq('table_name', 'rifle_profiles')
      .eq('table_schema', 'public');

    if (constraintsError) {
      console.log('❌ Error checking constraints:', constraintsError.message);
    } else {
      constraints.forEach(constraint => {
        console.log(`   ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

    // Check RLS status
    console.log('\n4️⃣ RLS status:');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('row_security')
      .eq('table_name', 'rifle_profiles')
      .eq('table_schema', 'public')
      .single();

    if (rlsError) {
      console.log('❌ Error checking RLS:', rlsError.message);
    } else {
      console.log(`   RLS Enabled: ${rlsStatus?.row_security || 'Unknown'}`);
    }

    // Try a simple insert with minimal data
    console.log('\n5️⃣ Testing minimal insert...');
    const { data: insertData, error: insertError } = await supabase
      .from('rifle_profiles')
      .insert({
        user_id: signInData.user.id,
        name: 'Test Profile',
        caliber: '.308',
        firearm_type: 'rifle'
      })
      .select();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      console.log('   Error code:', insertError.code);
      console.log('   Error details:', insertError.details);
    } else {
      console.log('✅ Insert successful!');
      console.log('   Profile ID:', insertData[0].id);
      
      // Clean up
      await supabase
        .from('rifle_profiles')
        .delete()
        .eq('name', 'Test Profile');
      console.log('🧹 Test profile cleaned up');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkTableStructure(); 