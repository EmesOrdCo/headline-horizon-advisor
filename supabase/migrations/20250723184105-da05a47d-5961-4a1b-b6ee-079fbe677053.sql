-- Create company_logos table to store logos locally
CREATE TABLE public.company_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.company_logos ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to logos
CREATE POLICY "Logos are publicly viewable" 
ON public.company_logos 
FOR SELECT 
USING (true);

-- Create policy for service role to manage logos
CREATE POLICY "Service role can manage logos" 
ON public.company_logos 
FOR ALL 
USING (true);

-- Create index for faster symbol lookups
CREATE INDEX idx_company_logos_symbol ON public.company_logos(symbol);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_company_logos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_logos_updated_at
  BEFORE UPDATE ON public.company_logos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_logos_updated_at();