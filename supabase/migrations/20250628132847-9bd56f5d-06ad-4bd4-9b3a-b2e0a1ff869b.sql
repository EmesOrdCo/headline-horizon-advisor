
-- Add source_links column to news_articles table
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS source_links text;
