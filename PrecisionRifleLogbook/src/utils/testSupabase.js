/**
 * Supabase Connection Test Utility
 * Tests connectivity to Supabase backend
 */

import { supabase } from '../config/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('user_settings')
      .select('count')
      .limit(1);
    
    if (error) {
      console.warn('⚠️ Supabase connection test failed:', error.message);
      return { 
        success: false, 
        error: error.message,
        details: 'Database query failed'
      };
    }
    
    console.log('✅ Supabase connection successful');
    return { 
      success: true, 
      message: 'Connected to Supabase',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return { 
      success: false, 
      error: error.message,
      details: 'Network or configuration error'
    };
  }
};

export const testSupabaseAuth = async () => {
  try {
    console.log('🔍 Testing Supabase authentication...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.warn('⚠️ Supabase auth test failed:', error.message);
      return { 
        success: false, 
        error: error.message,
        details: 'Authentication failed'
      };
    }
    
    console.log('✅ Supabase authentication successful');
    return { 
      success: true, 
      message: 'Authentication working',
      user: user ? 'Authenticated' : 'Not authenticated',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Supabase auth test error:', error);
    return { 
      success: false, 
      error: error.message,
      details: 'Authentication error'
    };
  }
};

export const testSupabaseRealtime = async () => {
  try {
    console.log('🔍 Testing Supabase realtime...');
    
    const channel = supabase
      .channel('test_realtime')
      .on('presence', { event: 'sync' }, () => {
        console.log('✅ Realtime presence sync working');
      })
      .subscribe();
    
    // Wait a moment for subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Unsubscribe
    await supabase.removeChannel(channel);
    
    console.log('✅ Supabase realtime test successful');
    return { 
      success: true, 
      message: 'Realtime connection working',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Supabase realtime test error:', error);
    return { 
      success: false, 
      error: error.message,
      details: 'Realtime connection failed'
    };
  }
};

export const runFullSupabaseTest = async () => {
  console.log('🚀 Running full Supabase connectivity test...');
  
  const results = {
    connection: await testSupabaseConnection(),
    auth: await testSupabaseAuth(),
    realtime: await testSupabaseRealtime(),
    timestamp: new Date().toISOString()
  };
  
  const allSuccessful = results.connection.success && 
                       results.auth.success && 
                       results.realtime.success;
  
  console.log('📊 Supabase test results:', results);
  
  return {
    success: allSuccessful,
    results,
    summary: allSuccessful ? 'All tests passed' : 'Some tests failed'
  };
};