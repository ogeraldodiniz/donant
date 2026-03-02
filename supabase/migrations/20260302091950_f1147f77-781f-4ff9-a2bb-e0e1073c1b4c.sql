
-- Table for missing cashback claims
CREATE TABLE public.cashback_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_id UUID NOT NULL REFERENCES public.stores(id),
  ngo_id UUID NOT NULL REFERENCES public.ngos(id),
  purchase_date DATE NOT NULL,
  order_number TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cashback_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claims_user_select" ON public.cashback_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "claims_user_insert" ON public.cashback_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "claims_admin_select" ON public.cashback_claims
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "claims_admin_update" ON public.cashback_claims
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cashback_claims_updated_at
  BEFORE UPDATE ON public.cashback_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
