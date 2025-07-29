-- Create user transfers table for real transfer records
CREATE TABLE public.user_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alpaca_account_id UUID NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('INCOMING', 'OUTGOING')),
  status TEXT NOT NULL DEFAULT 'COMPLETE' CHECK (status IN ('QUEUED', 'PENDING', 'COMPLETE', 'FAILED')),
  transfer_type TEXT NOT NULL DEFAULT 'ACH',
  reason TEXT,
  alpaca_transfer_id TEXT,
  relationship_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_transfers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own transfers" 
ON public.user_transfers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transfers" 
ON public.user_transfers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transfers" 
ON public.user_transfers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_transfers_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_transfers_updated_at
BEFORE UPDATE ON public.user_transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_user_transfers_updated_at();