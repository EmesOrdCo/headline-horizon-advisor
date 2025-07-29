-- Create portfolio snapshots table to store daily account values
CREATE TABLE public.portfolio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_equity DECIMAL(15,2) NOT NULL DEFAULT 0,
  cash DECIMAL(15,2) NOT NULL DEFAULT 0,
  long_market_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  buying_power DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one snapshot per user per account per date
  UNIQUE(user_id, account_id, snapshot_date)
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own portfolio snapshots" 
ON public.portfolio_snapshots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolio snapshots" 
ON public.portfolio_snapshots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio snapshots" 
ON public.portfolio_snapshots 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_portfolio_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_portfolio_snapshots_updated_at
BEFORE UPDATE ON public.portfolio_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_snapshots_updated_at();

-- Create index for better performance
CREATE INDEX idx_portfolio_snapshots_user_account_date ON public.portfolio_snapshots(user_id, account_id, snapshot_date DESC);