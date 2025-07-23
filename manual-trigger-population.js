// Manual trigger for logo population function
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://gjtswpgjrznbrnmvmpno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdHN3cGdqcnpuYnJubXZtcG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDA1NDEsImV4cCI6MjA2NjE3NjU0MX0.cZnP8_BO6jMYJkGzcUzTwmzD4buHcOCF_qAoXti-Tfg"
);

async function triggerLogoPopulation() {
  console.log('🚀 Starting logo population process...');
  
  try {
    console.log('📡 Calling populate-all-logos function...');
    
    const { data, error } = await supabase.functions.invoke('populate-all-logos', {
      body: { action: 'populate' }
    });

    if (error) {
      console.error('❌ Error calling populate-all-logos function:', error);
      throw error;
    }

    console.log('✅ Function call successful!');
    console.log('📊 Results:', data);
    
    if (data?.success) {
      console.log('🎉 Logo population completed successfully!');
      console.log(`📈 Total stocks found: ${data.totalStocksFound}`);
      console.log(`✅ Valid stocks filtered: ${data.validStocksFiltered}`);
      console.log(`⚙️ Stocks processed: ${data.stocksProcessed}`);
      console.log(`💾 Logos inserted: ${data.logosInserted}`);
      console.log(`❌ Logos failed: ${data.logosFailed || 0}`);
      console.log(`📋 Existing logos: ${data.existingLogos}`);
    } else {
      console.error('💥 Function returned error:', data?.error);
    }
    
    return data;
  } catch (error) {
    console.error('💥 Failed to trigger logo population:', error);
    throw error;
  }
}

// Execute the function
triggerLogoPopulation()
  .then(result => {
    console.log('🎯 Population process completed');
  })
  .catch(error => {
    console.error('🔥 Population failed:', error);
  });

console.log('📋 Logo population has been triggered! Check the console and edge function logs for progress.');