-- Fix search path for trigger functions
DROP FUNCTION IF EXISTS public.update_user_bank_accounts_updated_at();
DROP FUNCTION IF EXISTS public.update_company_logos_updated_at();

-- Recreate with proper search path
CREATE OR REPLACE FUNCTION public.update_user_bank_accounts_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_company_logos_updated_at()
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