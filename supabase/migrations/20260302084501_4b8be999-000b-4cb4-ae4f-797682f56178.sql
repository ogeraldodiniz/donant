CREATE POLICY "notifications_user_delete"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);