
-- Add phone and notification preferences to profiles
ALTER TABLE public.profiles
  ADD COLUMN phone text,
  ADD COLUMN notify_web boolean NOT NULL DEFAULT true,
  ADD COLUMN notify_whatsapp boolean NOT NULL DEFAULT false,
  ADD COLUMN notify_email boolean NOT NULL DEFAULT true;
