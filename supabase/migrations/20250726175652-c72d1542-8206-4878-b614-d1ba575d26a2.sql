-- Add Alpaca account fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS alpaca_account_id UUID,
ADD COLUMN IF NOT EXISTS alpaca_account_number TEXT,
ADD COLUMN IF NOT EXISTS alpaca_account_status TEXT,
ADD COLUMN IF NOT EXISTS alpaca_account_created_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_alpaca_account_id ON public.profiles(alpaca_account_id);
CREATE INDEX IF NOT EXISTS idx_profiles_alpaca_account_number ON public.profiles(alpaca_account_number);

-- Add RLS policies for Alpaca account data
CREATE POLICY "Users can view their own Alpaca account data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own Alpaca account data" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);