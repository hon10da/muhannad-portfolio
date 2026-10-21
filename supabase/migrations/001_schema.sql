-- Portfolio schema, RLS and Storage policies. Run once in Supabase SQL Editor.
create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy "admins read own row" on public.admin_users for select to authenticated using (user_id = auth.uid());
-- no insert/update/delete policies: admins can only be added from the SQL editor (service role)

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create table public.profile (id int primary key check (id = 1), data jsonb not null default '{}', updated_at timestamptz not null default now());
create table public.projects (id uuid primary key default gen_random_uuid(), slug text, name text not null, categories text[] not null default '{}', short text not null default '', tools text[] not null default '{}',
  thumbnail text not null default '', cover text not null default '', screenshots text[] not null default '{}', github text not null default '', live text not null default '',
  overview text not null default '', objective text not null default '', contribution text not null default '', features text[] not null default '{}', notes text not null default '',
  featured boolean not null default false, published boolean not null default false, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.designs (id uuid primary key default gen_random_uuid(), title text not null, category text not null, image text not null default '', description text not null default '', tools text[] not null default '{}', details text not null default '',
  published boolean not null default false, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.skills (id uuid primary key default gen_random_uuid(), group_name text not null, items text[] not null default '{}', published boolean not null default false, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.experience (id uuid primary key default gen_random_uuid(), role text not null, org text not null, period text not null default '', points text[] not null default '{}', published boolean not null default false, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.education (id uuid primary key default gen_random_uuid(), degree text not null, school text not null, period text not null default '', published boolean not null default false, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.certifications (id uuid primary key default gen_random_uuid(), title text not null, issuer text not null default '', date_text text not null default '', published boolean not null default false, sort_order int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['projects','designs','skills','experience','education','certifications'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public reads published" on public.%I for select to anon, authenticated using (published = true)', t);
    execute format('create policy "admins full access" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create trigger touch before update on public.%I for each row execute function public.touch()', t);
  end loop;
end $$;
alter table public.profile enable row level security;
create policy "public reads profile" on public.profile for select to anon, authenticated using (true);
create policy "admins write profile" on public.profile for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage: public-read bucket, admin-only writes, size and type limits
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio','portfolio',true,10485760,array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "admins upload portfolio files" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admins update portfolio files" on storage.objects for update to authenticated using (bucket_id = 'portfolio' and public.is_admin()) with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admins delete portfolio files" on storage.objects for delete to authenticated using (bucket_id = 'portfolio' and public.is_admin());
