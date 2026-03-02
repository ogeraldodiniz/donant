-- Add locale column to ngos table
ALTER TABLE public.ngos ADD COLUMN locale text NOT NULL DEFAULT 'pt';

-- Add locale column to stores table  
ALTER TABLE public.stores ADD COLUMN locale text NOT NULL DEFAULT 'pt';

-- Add locale column to profiles table (user preferred language)
ALTER TABLE public.profiles ADD COLUMN locale text NOT NULL DEFAULT 'pt';