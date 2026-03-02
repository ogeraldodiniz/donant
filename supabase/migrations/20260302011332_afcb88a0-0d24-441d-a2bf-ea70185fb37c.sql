
-- Allow admins to read all clickouts
CREATE POLICY "clickouts_admin_select"
ON public.clickouts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
