-- The policies were already created before the constraint error.
-- Just add the missing UPDATE policy.
CREATE POLICY "push_sub_user_update"
  ON public.push_subscriptions AS PERMISSIVE
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
