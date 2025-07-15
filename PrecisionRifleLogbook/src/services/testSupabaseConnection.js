import SupabaseService from './SupabaseService';

(async () => {
  const result = await SupabaseService.initialize();
  console.log('Supabase test result:', result);
})(); 