
-- Fix ngos read policy to use correct roles
DROP POLICY IF EXISTS "Anyone can read ngos" ON public.ngos;
CREATE POLICY "Anyone can read ngos"
  ON public.ngos
  FOR SELECT
  TO anon, authenticated
  USING (true);
