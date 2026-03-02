-- Drop ALL existing SELECT policies on ngos to start fresh
DROP POLICY IF EXISTS "Anyone can read ngos" ON public.ngos;
DROP POLICY IF EXISTS "ngos_select_public" ON public.ngos;

-- Create a PERMISSIVE select policy (default is PERMISSIVE when AS keyword is omitted or explicitly set)
CREATE POLICY "ngos_public_read"
  ON public.ngos
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (true);
