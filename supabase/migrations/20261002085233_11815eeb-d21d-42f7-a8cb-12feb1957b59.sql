GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnoses, public.reviews, public.admin_activity, public.site_settings TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT ON public.diagnoses, public.reviews TO anon;
GRANT SELECT ON public.reviews, public.site_settings TO anon;
GRANT ALL ON public.diagnoses, public.reviews, public.admin_activity, public.site_settings, public.user_roles TO service_role;