drop policy if exists "reviews are public" on public.reviews;
revoke execute on function public.has_role(uuid, app_role) from anon, authenticated, public;
grant execute on function public.has_role(uuid, app_role) to service_role;