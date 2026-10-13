ALTER TABLE public.diagnoses ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';
ALTER TABLE public.diagnoses ADD COLUMN IF NOT EXISTS answers jsonb NOT NULL DEFAULT '{}'::jsonb;
GRANT INSERT ON public.diagnoses TO anon, authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diagnoses;