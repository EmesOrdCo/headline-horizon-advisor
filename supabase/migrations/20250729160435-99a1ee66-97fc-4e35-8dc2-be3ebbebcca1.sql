-- Enable the pg_cron extension to schedule tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to update portfolio snapshots every hour
SELECT cron.schedule(
  'portfolio-snapshots-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://gjtswpgjrznbrnmvmpno.supabase.co/functions/v1/portfolio-snapshot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqdHN3cGdqcnpuYnJubXZtcG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDA1NDEsImV4cCI6MjA2NjE3NjU0MX0.cZnP8_BO6jMYJkGzcUzTwmzD4buHcOCF_qAoXti-Tfg"}'::jsonb,
        body:=concat('{"scheduled_time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);