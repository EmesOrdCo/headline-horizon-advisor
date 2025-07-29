-- Fix search path for trigger functions - drop triggers first
DROP TRIGGER IF EXISTS update_user_bank_accounts_updated_at ON public.user_bank_accounts;
DROP TRIGGER IF EXISTS update_company_logos_updated_at ON public.company_logos;

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

-- Recreate triggers
CREATE TRIGGER update_user_bank_accounts_updated_at
BEFORE UPDATE ON public.user_bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_user_bank_accounts_updated_at();

CREATE TRIGGER update_company_logos_updated_at
BEFORE UPDATE ON public.company_logos
FOR EACH ROW
EXECUTE FUNCTION public.update_company_logos_updated_at();