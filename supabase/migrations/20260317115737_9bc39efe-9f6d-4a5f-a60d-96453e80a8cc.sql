
CREATE TABLE public.rallys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id uuid NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
  title text NOT NULL,
  goal numeric NOT NULL DEFAULT 0,
  reward text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  locale text NOT NULL DEFAULT 'pt',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rallys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rallys_public_read" ON public.rallys FOR SELECT TO public USING (true);
CREATE POLICY "rallys_admin_insert" ON public.rallys FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "rallys_admin_update" ON public.rallys FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "rallys_admin_delete" ON public.rallys FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_rallys_updated_at BEFORE UPDATE ON public.rallys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
