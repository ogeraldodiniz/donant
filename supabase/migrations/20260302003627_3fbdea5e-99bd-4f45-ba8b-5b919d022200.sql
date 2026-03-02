-- Fix cashback_transactions SELECT policy
DROP POLICY IF EXISTS "Users read own transactions" ON public.cashback_transactions;
CREATE POLICY "cashback_tx_user_select"
  ON public.cashback_transactions AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix clickouts policies
DROP POLICY IF EXISTS "Users insert own clickouts" ON public.clickouts;
DROP POLICY IF EXISTS "Users read own clickouts" ON public.clickouts;
CREATE POLICY "clickouts_user_insert"
  ON public.clickouts AS PERMISSIVE
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clickouts_user_select"
  ON public.clickouts AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix notifications policies
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "notifications_user_select"
  ON public.notifications AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_user_update"
  ON public.notifications AS PERMISSIVE
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Fix profiles policies
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin read all profiles" ON public.profiles;
CREATE POLICY "profiles_user_select"
  ON public.profiles AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "profiles_user_update"
  ON public.profiles AS PERMISSIVE
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "profiles_admin_select"
  ON public.profiles AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin read all roles" ON public.user_roles;
CREATE POLICY "user_roles_user_select"
  ON public.user_roles AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "user_roles_admin_select"
  ON public.user_roles AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix admin CRUD policies on ngos, stores, site_content (currently RESTRICTIVE)
DROP POLICY IF EXISTS "Admin insert ngos" ON public.ngos;
DROP POLICY IF EXISTS "Admin update ngos" ON public.ngos;
DROP POLICY IF EXISTS "Admin delete ngos" ON public.ngos;
CREATE POLICY "ngos_admin_insert" ON public.ngos AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ngos_admin_update" ON public.ngos AS PERMISSIVE FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ngos_admin_delete" ON public.ngos AS PERMISSIVE FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin insert stores" ON public.stores;
DROP POLICY IF EXISTS "Admin update stores" ON public.stores;
DROP POLICY IF EXISTS "Admin delete stores" ON public.stores;
CREATE POLICY "stores_admin_insert" ON public.stores AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "stores_admin_update" ON public.stores AS PERMISSIVE FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "stores_admin_delete" ON public.stores AS PERMISSIVE FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin insert site_content" ON public.site_content;
DROP POLICY IF EXISTS "Admin update site_content" ON public.site_content;
DROP POLICY IF EXISTS "Admin delete site_content" ON public.site_content;
CREATE POLICY "site_content_admin_insert" ON public.site_content AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_content_admin_update" ON public.site_content AS PERMISSIVE FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_content_admin_delete" ON public.site_content AS PERMISSIVE FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
