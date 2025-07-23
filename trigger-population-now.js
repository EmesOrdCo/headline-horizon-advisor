// Direct API call to trigger logo population
console.log('🚀 Triggering logo population function...');

fetch('https://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/populate-all-logos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdHN3cGdqcnpuYnJubXZtcG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDA1NDEsImV4cCI6MjA2NjE3NjU0MX0.cZnP8_BO6jMYJkGzcUzTwmzD4buHcOCF_qAoXti-Tfg',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ action: 'populate' })
})
.then(response => {
  console.log('📡 Response status:', response.status);
  return response.text();
})
.then(data => {
  console.log('📊 Raw response:', data);
  try {
    const result = JSON.parse(data);
    if (result.success) {
      console.log('🎉 Population started successfully!');
      console.log('📋 Check the edge function logs for detailed progress');
    } else {
      console.error('❌ Population failed:', result.error);
    }
  } catch (e) {
    console.log('Response data:', data);
  }
})
.catch(error => {
  console.error('💥 Request failed:', error);
});

console.log('📋 Logo population has been triggered! Monitor the edge function logs.');