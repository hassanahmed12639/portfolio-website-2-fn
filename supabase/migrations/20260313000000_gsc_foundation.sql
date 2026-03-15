-- TrackHive GSC foundation tables

create extension if not exists pgcrypto;

create table if not exists public.gsc_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_account_email text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gsc_properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gsc_connection_id uuid not null references public.gsc_connections(id) on delete cascade,
  site_url text not null,
  permission_level text,
  is_selected boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, site_url)
);

create table if not exists public.gsc_query_page_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.gsc_properties(id) on delete cascade,
  metric_date date not null,
  query text not null,
  page text not null,
  country text,
  device text,
  clicks numeric not null default 0,
  impressions numeric not null default 0,
  ctr numeric not null default 0,
  position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, property_id, metric_date, query, page, country, device)
);

create table if not exists public.gsc_page_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.gsc_properties(id) on delete cascade,
  metric_date date not null,
  page text not null,
  clicks numeric not null default 0,
  impressions numeric not null default 0,
  ctr numeric not null default 0,
  avg_position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, property_id, metric_date, page)
);

create index if not exists idx_gsc_qpd_user_date on public.gsc_query_page_daily(user_id, metric_date desc);
create index if not exists idx_gsc_qpd_user_query on public.gsc_query_page_daily(user_id, query);
create index if not exists idx_gsc_qpd_user_page on public.gsc_query_page_daily(user_id, page);

alter table public.gsc_connections enable row level security;
alter table public.gsc_properties enable row level security;
alter table public.gsc_query_page_daily enable row level security;
alter table public.gsc_page_daily enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gsc_connections' and policyname = 'Users own gsc_connections'
  ) then
    create policy "Users own gsc_connections" on public.gsc_connections for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gsc_properties' and policyname = 'Users own gsc_properties'
  ) then
    create policy "Users own gsc_properties" on public.gsc_properties for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gsc_query_page_daily' and policyname = 'Users own gsc_query_page_daily'
  ) then
    create policy "Users own gsc_query_page_daily" on public.gsc_query_page_daily for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'gsc_page_daily' and policyname = 'Users own gsc_page_daily'
  ) then
    create policy "Users own gsc_page_daily" on public.gsc_page_daily for all using (auth.uid() = user_id);
  end if;
end $$;
