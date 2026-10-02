ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.diagnoses ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.diagnoses ADD COLUMN IF NOT EXISTS admin_note text NOT NULL DEFAULT '';

DROP POLICY IF EXISTS "public reads approved reviews" ON public.reviews;
CREATE POLICY "public reads approved reviews" ON public.reviews FOR SELECT TO anon, authenticated
  USING (approved = true AND deleted_at IS NULL);

GRANT UPDATE ON public.diagnoses TO authenticated;
CREATE POLICY "admins update diagnoses" ON public.diagnoses FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  target_type text NOT NULL DEFAULT '',
  target_id uuid,
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.admin_activity TO authenticated;
GRANT ALL ON public.admin_activity TO service_role;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage activity" ON public.admin_activity FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins insert settings" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('min_public_rating', '4'::jsonb),
  ('show_reviews', 'true'::jsonb),
  ('announcement', '""'::jsonb)
ON CONFLICT (key) DO NOTHING;