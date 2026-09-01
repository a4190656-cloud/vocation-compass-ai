create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins read roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));

alter table public.reviews add column if not exists approved boolean not null default false;

drop policy if exists "Reviews are viewable by everyone" on public.reviews;
drop policy if exists "public can read reviews" on public.reviews;
drop policy if exists "Anyone can view reviews" on public.reviews;

create policy "public reads approved reviews" on public.reviews for select to anon, authenticated using (approved = true);
create policy "admins read all reviews" on public.reviews for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update reviews" on public.reviews for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins delete reviews" on public.reviews for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "admins read diagnoses" on public.diagnoses for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins delete diagnoses" on public.diagnoses for delete to authenticated using (public.has_role(auth.uid(),'admin'));

grant select, update, delete on public.reviews to authenticated;
grant select, delete on public.diagnoses to authenticated;
grant all on public.reviews to service_role;
grant all on public.diagnoses to service_role;

update public.reviews set approved = true;