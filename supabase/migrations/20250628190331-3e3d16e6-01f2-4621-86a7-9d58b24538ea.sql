
-- Create a table to store user's selected stocks
CREATE TABLE public.user_stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_stocks ENABLE ROW LEVEL SECURITY;

-- Create policies for user_stocks
CREATE POLICY "Users can view their own stocks" 
  ON public.user_stocks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stocks" 
  ON public.user_stocks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stocks" 
  ON public.user_stocks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a table to store analyzed articles for user stocks
CREATE TABLE public.user_stock_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  symbol TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  ai_sentiment TEXT,
  ai_confidence INTEGER,
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for user_stock_articles
ALTER TABLE public.user_stock_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stock articles" 
  ON public.user_stock_articles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock articles" 
  ON public.user_stock_articles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
