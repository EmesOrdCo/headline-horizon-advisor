// Trigger logo population immediately
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://gjtswpgjrznbrnmvmpno.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdHN3cGdqcnpuYnJubXZtcG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDA1NDEsImV4cCI6MjA2NjE3NjU0MX0.cZnP8_BO6jMYJkGzcUzTwmzD4buHcOCF_qAoXti-Tfg"
);

async function triggerLogoPopulation() {
  console.log('🚀 Starting logo population process...');
  
  try {
    const { data, error } = await supabase.functions.invoke('populate-all-logos', {
      body: { action: 'populate' }
    });

    if (error) {
      console.error('❌ Error calling populate-all-logos function:', error);
      throw error;
    }

    console.log('✅ Logo population result:', data);
    return data;
  } catch (error) {
    console.error('💥 Failed to trigger logo population:', error);
    throw error;
  }
}

// Execute the function
triggerLogoPopulation()
  .then(result => {
    console.log('🎉 Population process initiated successfully!');
    console.log('📊 Expected to process ~8000 US stocks');
    console.log('⏱️ This will take approximately 10-15 minutes');
    console.log('📋 Check the edge function logs for real-time progress');
  })
  .catch(error => {
    console.error('🔥 Failed to start population:', error);
  });

console.log('Logo population has been triggered! Check the console for updates.');