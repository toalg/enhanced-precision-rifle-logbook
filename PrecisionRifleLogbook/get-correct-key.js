// Test different API keys to find the correct one
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbosucljjdpeslmwfjsb.supabase.co';

// Test different keys
const testKeys = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmam5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzkxMTUsImV4cCI6MjA2ODExNTExNX0.rKJF2SqMjuvNezXsXpAwSrunT4Ne0IYr6TsmJ1NwHzo',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3N1Y2xqamRwZXNsbXdmam5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNzI5NzAsImV4cCI6MjA0Nzc0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
];

async function testApiKeys() {
  console.log('🔑 Testing API keys...\n');

  for (let i = 0; i < testKeys.length; i++) {
    const key = testKeys[i];
    console.log(`Testing key ${i + 1}: ${key.substring(0, 50)}...`);
    
    const supabase = createClient(supabaseUrl, key);
    
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ Key ${i + 1} failed:`, error.message);
      } else {
        console.log(`✅ Key ${i + 1} works!`);
        console.log(`   This is the correct key to use.`);
        return key;
      }
    } catch (err) {
      console.log(`❌ Key ${i + 1} failed:`, err.message);
    }
  }
  
  console.log('\n❌ No working keys found. Please check your Supabase dashboard for the correct anon key.');
}

testApiKeys(); 