import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zctmqrmnmmjrqbehcfis.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdG1xcm1ubW1qcnFiZWhjZmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNzQ1OTgsImV4cCI6MjA1MDY1MDU5OH0.P2VBeSJF6nrj-U2KxGNpqo_z5KGOwVVzEKDQOr7KZQA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function triggerIndexFunds() {
  console.log('🚀 Triggering Index Funds analysis...');
  
  try {
    const { data, error } = await supabase.functions.invoke('fetch-index-funds');
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Success:', data);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

triggerIndexFunds();