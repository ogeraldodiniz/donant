
-- Drop the restrictive SELECT policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can read ngos" ON public.ngos;
CREATE POLICY "Anyone can read ngos"
  ON public.ngos
  FOR SELECT
  TO public
  USING (true);
