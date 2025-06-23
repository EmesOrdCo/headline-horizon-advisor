
-- Create a table to store real news headlines and AI analysis
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  category TEXT,
  priority TEXT,
  ai_prediction TEXT,
  ai_confidence INTEGER,
  ai_sentiment TEXT,
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (since this is public news data)
CREATE POLICY "Anyone can view news articles" 
  ON public.news_articles 
  FOR SELECT 
  USING (true);

-- Create policy to allow insert/update from service role (for our edge functions)
CREATE POLICY "Service role can manage news articles" 
  ON public.news_articles 
  FOR ALL 
  USING (true);

-- Create an index for better performance when querying by symbol
CREATE INDEX idx_news_articles_symbol ON public.news_articles(symbol);
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at DESC);
