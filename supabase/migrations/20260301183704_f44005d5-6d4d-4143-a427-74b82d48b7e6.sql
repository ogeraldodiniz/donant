
-- Enums
CREATE TYPE public.cashback_status AS ENUM ('tracked', 'pending', 'confirmed', 'donated', 'reverted');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed');
CREATE TYPE public.notification_type AS ENUM ('status_change', 'donation_confirmed', 'general');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  selected_ngo_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- NGOs
CREATE TABLE public.ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  mission TEXT,
  logo_url TEXT,
  website_url TEXT,
  total_received DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;

-- Add FK after ngos table exists
ALTER TABLE public.profiles ADD CONSTRAINT fk_selected_ngo FOREIGN KEY (selected_ngo_id) REFERENCES public.ngos(id);

-- Stores
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  cashback_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  terms TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  mycashbacks_store_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Clickouts
CREATE TABLE public.clickouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id),
  redirect_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clickouts ENABLE ROW LEVEL SECURITY;

-- Cashback transactions
CREATE TABLE public.cashback_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id),
  clickout_id UUID REFERENCES public.clickouts(id),
  ngo_id UUID NOT NULL REFERENCES public.ngos(id),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status cashback_status NOT NULL DEFAULT 'tracked',
  mycashbacks_transaction_id TEXT,
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  donated_at TIMESTAMPTZ,
  reverted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;

-- Donation ledger
CREATE TABLE public.donation_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.cashback_transactions(id),
  ngo_id UUID NOT NULL REFERENCES public.ngos(id),
  amount DECIMAL(10,2) NOT NULL,
  donated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donation_ledger ENABLE ROW LEVEL SECURITY;

-- Payout batches
CREATE TABLE public.payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID NOT NULL REFERENCES public.ngos(id),
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  transaction_count INT NOT NULL DEFAULT 0,
  status payout_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type notification_type NOT NULL DEFAULT 'general',
  related_transaction_id UUID REFERENCES public.cashback_transactions(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Web push subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.cashback_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ RLS POLICIES ============

-- Profiles: own user + admin read all
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles: own user read
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- NGOs: public read, admin write
CREATE POLICY "Anyone can read ngos" ON public.ngos FOR SELECT USING (true);
CREATE POLICY "Admin insert ngos" ON public.ngos FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update ngos" ON public.ngos FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete ngos" ON public.ngos FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Stores: public read, admin write
CREATE POLICY "Anyone can read stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Admin insert stores" ON public.stores FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update stores" ON public.stores FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete stores" ON public.stores FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Clickouts: own user
CREATE POLICY "Users read own clickouts" ON public.clickouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own clickouts" ON public.clickouts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: own user read
CREATE POLICY "Users read own transactions" ON public.cashback_transactions FOR SELECT USING (auth.uid() = user_id);

-- Donation ledger: public read (transparency)
CREATE POLICY "Anyone can read donations" ON public.donation_ledger FOR SELECT USING (true);

-- Payout batches: public read
CREATE POLICY "Anyone can read payouts" ON public.payout_batches FOR SELECT USING (true);

-- Notifications: own user
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Push subscriptions: own user
CREATE POLICY "Users read own subscriptions" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own subscriptions" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin read all subscriptions" ON public.push_subscriptions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
