-- Fix security issues with functions by setting search_path
CREATE OR REPLACE FUNCTION public.update_company_logos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;