const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmam5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS Policies on rifle_profiles table...\n');

  try {
    // Check if RLS is enabled
    const { data: rlsEnabled, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('row_security')
      .eq('table_name', 'rifle_profiles')
      .eq('table_schema', 'public')
      .single();

    if (rlsError) {
      console.log('❌ Error checking RLS status:', rlsError.message);
      return;
    }

    console.log('1️⃣ RLS Status:');
    console.log(`   RLS Enabled: ${rlsEnabled?.row_security || 'Unknown'}\n`);

    // Check existing policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'rifle_profiles');

    if (policiesError) {
      console.log('❌ Error checking policies:', policiesError.message);
      return;
    }

    console.log('2️⃣ Current Policies:');
    if (policies && policies.length > 0) {
      policies.forEach((policy, index) => {
        console.log(`   Policy ${index + 1}:`);
        console.log(`     Name: ${policy.policyname}`);
        console.log(`     Command: ${policy.cmd}`);
        console.log(`     Roles: ${policy.roles}`);
        console.log(`     Qual: ${policy.qual}`);
        console.log(`     With Check: ${policy.with_check}`);
        console.log('');
      });
    } else {
      console.log('   No policies found\n');
    }

    // Check table permissions
    const { data: permissions, error: permError } = await supabase
      .from('information_schema.role_table_grants')
      .select('*')
      .eq('table_name', 'rifle_profiles')
      .eq('grantee', 'authenticated');

    if (permError) {
      console.log('❌ Error checking permissions:', permError.message);
      return;
    }

    console.log('3️⃣ Table Permissions for authenticated role:');
    if (permissions && permissions.length > 0) {
      permissions.forEach((perm, index) => {
        console.log(`   Permission ${index + 1}:`);
        console.log(`     Privilege: ${perm.privilege_type}`);
        console.log(`     Grantable: ${perm.is_grantable}`);
        console.log('');
      });
    } else {
      console.log('   No permissions found for authenticated role\n');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkRLSPolicies(); 