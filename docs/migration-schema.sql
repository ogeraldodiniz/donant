-- ============================================
-- SCHEMA COMPLETO PARA MIGRAÇÃO - MyCashbacks
-- Execute no SQL Editor do seu projeto Supabase
-- ============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.cashback_status AS ENUM ('tracked', 'pending', 'confirmed', 'donated', 'reverted');
CREATE TYPE public.notification_type AS ENUM ('status_change', 'donation_confirmed', 'general');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed');

-- 2. TABELAS

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  avatar_url text,
  phone text,
  city text,
  state text,
  gender text,
  birth_date date,
  locale text NOT NULL DEFAULT 'pt',
  selected_ngo_id uuid,
  notify_email boolean NOT NULL DEFAULT true,
  notify_web boolean NOT NULL DEFAULT true,
  notify_whatsapp boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE TABLE public.ngos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  mission text,
  logo_url text,
  website_url text,
  locale text NOT NULL DEFAULT 'pt',
  total_received numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- FK de profiles para ngos (após criar ngos)
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_selected_ngo FOREIGN KEY (selected_ngo_id) REFERENCES public.ngos(id) ON DELETE SET NULL;

CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  logo_url text,
  website_url text,
  cashback_rate numeric NOT NULL DEFAULT 0,
  category text,
  terms text,
  mycashbacks_store_id text UNIQUE,
  locale text NOT NULL DEFAULT 'pt',
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.clickouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid NOT NULL REFERENCES public.stores(id),
  redirect_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cashback_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid NOT NULL REFERENCES public.stores(id),
  clickout_id uuid REFERENCES public.clickouts(id),
  ngo_id uuid NOT NULL REFERENCES public.ngos(id),
  amount numeric NOT NULL DEFAULT 0,
  status cashback_status NOT NULL DEFAULT 'tracked',
  mycashbacks_transaction_id text,
  tracked_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  donated_at timestamptz,
  reverted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cashback_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  store_id uuid NOT NULL REFERENCES public.stores(id),
  ngo_id uuid NOT NULL REFERENCES public.ngos(id),
  purchase_date date NOT NULL,
  order_number text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.donation_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.cashback_transactions(id),
  ngo_id uuid NOT NULL REFERENCES public.ngos(id),
  amount numeric NOT NULL,
  donated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type notification_type NOT NULL DEFAULT 'general',
  related_transaction_id uuid REFERENCES public.cashback_transactions(id),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payout_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid NOT NULL REFERENCES public.ngos(id),
  total_amount numeric NOT NULL DEFAULT 0,
  transaction_count integer NOT NULL DEFAULT 0,
  status payout_status NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  summary text,
  content text NOT NULL DEFAULT '',
  cover_url text,
  locale text NOT NULL DEFAULT 'pt',
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL,
  value text NOT NULL DEFAULT '',
  locale text NOT NULL DEFAULT 'pt',
  section text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_key, locale)
);

-- 3. FUNÇÕES

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. TRIGGER para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. TRIGGERS de updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cashback_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cashback_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. RLS (Row Level Security)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clickouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashback_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_user_select ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_user_update ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY profiles_admin_select ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY user_roles_user_select ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_roles_admin_select ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ngos
CREATE POLICY ngos_public_read ON public.ngos FOR SELECT USING (true);
CREATE POLICY ngos_admin_insert ON public.ngos FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY ngos_admin_update ON public.ngos FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY ngos_admin_delete ON public.ngos FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- stores
CREATE POLICY stores_public_read ON public.stores FOR SELECT USING (true);
CREATE POLICY stores_admin_insert ON public.stores FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY stores_admin_update ON public.stores FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY stores_admin_delete ON public.stores FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- clickouts
CREATE POLICY clickouts_user_select ON public.clickouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY clickouts_user_insert ON public.clickouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY clickouts_admin_select ON public.clickouts FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- cashback_transactions
CREATE POLICY cashback_tx_user_select ON public.cashback_transactions FOR SELECT USING (auth.uid() = user_id);

-- cashback_claims
CREATE POLICY claims_user_select ON public.cashback_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY claims_user_insert ON public.cashback_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY claims_admin_select ON public.cashback_claims FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY claims_admin_update ON public.cashback_claims FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- donation_ledger
CREATE POLICY donation_ledger_public_read ON public.donation_ledger FOR SELECT USING (true);

-- notifications
CREATE POLICY notifications_user_select ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_user_update ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY notifications_user_delete ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- payout_batches
CREATE POLICY payout_batches_public_read ON public.payout_batches FOR SELECT USING (true);

-- push_subscriptions
CREATE POLICY push_sub_user_select ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY push_sub_user_insert ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY push_sub_user_update ON public.push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY push_sub_user_delete ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY push_sub_admin_select ON public.push_subscriptions FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- news
CREATE POLICY news_public_read ON public.news FOR SELECT USING (is_published = true);
CREATE POLICY news_admin_select ON public.news FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY news_admin_insert ON public.news FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY news_admin_update ON public.news FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY news_admin_delete ON public.news FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- site_content
CREATE POLICY site_content_public_read ON public.site_content FOR SELECT USING (true);
CREATE POLICY site_content_admin_insert ON public.site_content FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY site_content_admin_update ON public.site_content FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY site_content_admin_delete ON public.site_content FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- 7. STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 8. REALTIME (se necessário)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
