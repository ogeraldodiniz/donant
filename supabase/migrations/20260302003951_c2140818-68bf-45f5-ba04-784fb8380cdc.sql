
-- ============================================================
-- FIX: Recreate ALL policies as PERMISSIVE (default)
-- PostgreSQL requires at least one PERMISSIVE policy to grant
-- access. RESTRICTIVE policies alone always deny.
-- ============================================================

-- push_subscriptions
DROP POLICY IF EXISTS "Users read own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users delete own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admin read all subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_sub_user_update" ON public.push_subscriptions;

CREATE POLICY "push_sub_user_select" ON public.push_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "push_sub_user_insert" ON public.push_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_sub_user_update" ON public.push_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "push_sub_user_delete" ON public.push_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "push_sub_admin_select" ON public.push_subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- cashback_transactions
DROP POLICY IF EXISTS "cashback_tx_user_select" ON public.cashback_transactions;
CREATE POLICY "cashback_tx_user_select" ON public.cashback_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- clickouts
DROP POLICY IF EXISTS "clickouts_user_insert" ON public.clickouts;
DROP POLICY IF EXISTS "clickouts_user_select" ON public.clickouts;
CREATE POLICY "clickouts_user_insert" ON public.clickouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clickouts_user_select" ON public.clickouts FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- notifications
DROP POLICY IF EXISTS "notifications_user_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_user_update" ON public.notifications;
CREATE POLICY "notifications_user_select" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_user_update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "profiles_user_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
CREATE POLICY "profiles_user_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_user_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "user_roles_user_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_select" ON public.user_roles;
CREATE POLICY "user_roles_user_select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user_roles_admin_select" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ngos
DROP POLICY IF EXISTS "ngos_public_read" ON public.ngos;
DROP POLICY IF EXISTS "ngos_admin_insert" ON public.ngos;
DROP POLICY IF EXISTS "ngos_admin_update" ON public.ngos;
DROP POLICY IF EXISTS "ngos_admin_delete" ON public.ngos;
CREATE POLICY "ngos_public_read" ON public.ngos FOR SELECT USING (true);
CREATE POLICY "ngos_admin_insert" ON public.ngos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ngos_admin_update" ON public.ngos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ngos_admin_delete" ON public.ngos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- stores
DROP POLICY IF EXISTS "stores_public_read" ON public.stores;
DROP POLICY IF EXISTS "stores_admin_insert" ON public.stores;
DROP POLICY IF EXISTS "stores_admin_update" ON public.stores;
DROP POLICY IF EXISTS "stores_admin_delete" ON public.stores;
CREATE POLICY "stores_public_read" ON public.stores FOR SELECT USING (true);
CREATE POLICY "stores_admin_insert" ON public.stores FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "stores_admin_update" ON public.stores FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "stores_admin_delete" ON public.stores FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- site_content
DROP POLICY IF EXISTS "site_content_public_read" ON public.site_content;
DROP POLICY IF EXISTS "site_content_admin_insert" ON public.site_content;
DROP POLICY IF EXISTS "site_content_admin_update" ON public.site_content;
DROP POLICY IF EXISTS "site_content_admin_delete" ON public.site_content;
CREATE POLICY "site_content_public_read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "site_content_admin_insert" ON public.site_content FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_content_admin_update" ON public.site_content FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_content_admin_delete" ON public.site_content FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- donation_ledger
DROP POLICY IF EXISTS "donation_ledger_public_read" ON public.donation_ledger;
CREATE POLICY "donation_ledger_public_read" ON public.donation_ledger FOR SELECT USING (true);

-- payout_batches
DROP POLICY IF EXISTS "payout_batches_public_read" ON public.payout_batches;
CREATE POLICY "payout_batches_public_read" ON public.payout_batches FOR SELECT USING (true);
