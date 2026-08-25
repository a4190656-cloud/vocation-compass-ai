CREATE TABLE public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  top_codes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.diagnoses TO anon, authenticated;
GRANT ALL ON public.diagnoses TO service_role;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit a diagnosis" ON public.diagnoses FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  rating smallint NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  holland_code text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_comment_len CHECK (char_length(comment) <= 500),
  CONSTRAINT reviews_name_len CHECK (char_length(display_name) BETWEEN 1 AND 60)
);

GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews are public" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can add a review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.reviews (display_name, rating, comment, holland_code) VALUES
('מ. פרידמן', 5, 'אבחון מדויק להפליא. סוף סוף משהו שמדבר בשפה שלנו ומתאים לעולם שלנו.', 'SEC'),
('י. רוזנברג', 5, 'עברתי את השאלון תוך עשר דקות וקיבלתי כיוונים שלא חשבתי עליהם בכלל. ממליץ בחום.', 'IRA'),
('ש. כהן', 5, 'הדוח יצא מסודר ומעוצב, שלחתי אותו לאשתי והיא אמרה שזה בול אני.', 'ASE');