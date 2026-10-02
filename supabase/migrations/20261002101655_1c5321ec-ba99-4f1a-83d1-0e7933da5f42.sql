CREATE OR REPLACE FUNCTION public.force_review_pending()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.approved := false;
  NEW.deleted_at := NULL;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.force_review_pending() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER reviews_force_pending BEFORE INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.force_review_pending();