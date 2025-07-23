// Test the populate-all-logos function
fetch('https://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/populate-all-logos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdHN3cGdqcnpuYnJubXZtcG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDA1NDEsImV4cCI6MjA2NjE3NjU0MX0.cZnP8_BO6jMYJkGzcUzTwmzD4buHcOCF_qAoXti-Tfg',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ action: 'populate' })
})
.then(response => response.json())
.then(data => {
  console.log('🎉 Logo population result:', data);
  if (data.success) {
    console.log('✅ Population completed successfully!');
  } else {
    console.error('❌ Population failed:', data.error);
  }
})
.catch(error => console.error('💥 Request failed:', error));

console.log('🚀 Logo population has been triggered! Check the edge function logs for real-time progress.');