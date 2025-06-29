
-- Add the missing source_links column to user_stock_articles table
ALTER TABLE public.user_stock_articles 
ADD COLUMN source_links text;
