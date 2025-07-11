-- Fix foreign key constraints to allow user deletion with CASCADE

-- Drop existing foreign key constraints that don't have CASCADE
ALTER TABLE public.user_stocks DROP CONSTRAINT IF EXISTS user_stocks_user_id_fkey;
ALTER TABLE public.user_stock_articles DROP CONSTRAINT IF EXISTS user_stock_articles_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate foreign key constraints with CASCADE DELETE
ALTER TABLE public.user_stocks 
ADD CONSTRAINT user_stocks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_stock_articles 
ADD CONSTRAINT user_stock_articles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;