ALTER TABLE public.diagnoses
  ADD COLUMN IF NOT EXISTS selected_plan text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS unlocked_at timestamptz;

-- existing diagnoses were already visible to their users
UPDATE public.diagnoses SET payment_status = 'paid', unlocked_at = created_at WHERE payment_status = 'pending' AND created_at < now();

ALTER TABLE public.diagnoses ADD CONSTRAINT diagnoses_payment_status_chk CHECK (payment_status IN ('pending','paid'));
ALTER TABLE public.diagnoses ADD CONSTRAINT diagnoses_plan_chk CHECK (selected_plan IS NULL OR selected_plan IN ('report_only','report_with_consultation'));
ALTER TABLE public.diagnoses ADD CONSTRAINT diagnoses_method_chk CHECK (payment_method IS NULL OR payment_method IN ('bit','bank_transfer'));

-- visitors can never insert an already-paid diagnosis
CREATE OR REPLACE FUNCTION public.force_diagnosis_pending()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.payment_status := 'pending';
    NEW.unlocked_at := NULL;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER diagnoses_force_pending BEFORE INSERT ON public.diagnoses
FOR EACH ROW EXECUTE FUNCTION public.force_diagnosis_pending();

-- visitor reads only the access status of their own diagnosis (by its secret id)
CREATE OR REPLACE FUNCTION public.get_diagnosis_access(_id uuid)
RETURNS TABLE(payment_status text, selected_plan text, payment_method text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.payment_status, d.selected_plan, d.payment_method
  FROM public.diagnoses d WHERE d.id = _id AND d.deleted_at IS NULL
$$;

-- visitor saves plan + payment method while still pending
CREATE OR REPLACE FUNCTION public.choose_diagnosis_plan(_id uuid, _plan text, _method text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _plan NOT IN ('report_only','report_with_consultation') OR _method NOT IN ('bit','bank_transfer') THEN
    RAISE EXCEPTION 'invalid choice';
  END IF;
  UPDATE public.diagnoses SET selected_plan = _plan, payment_method = _method
  WHERE id = _id AND payment_status = 'pending';
  RETURN FOUND;
END; $$;

REVOKE ALL ON FUNCTION public.get_diagnosis_access(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.choose_diagnosis_plan(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_diagnosis_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.choose_diagnosis_plan(uuid, text, text) TO anon, authenticated;