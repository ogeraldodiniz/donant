
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  locale TEXT NOT NULL DEFAULT 'pt',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Public can read published news
CREATE POLICY "news_public_read" ON public.news FOR SELECT USING (is_published = true);

-- Admin full access
CREATE POLICY "news_admin_select" ON public.news FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "news_admin_insert" ON public.news FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "news_admin_update" ON public.news FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "news_admin_delete" ON public.news FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION update_updated_at();
