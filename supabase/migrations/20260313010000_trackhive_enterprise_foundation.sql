create extension if not exists pgcrypto;

create table if not exists public.channel_touchpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversion_event_id text,
  touchpoint_at timestamptz not null default now(),
  session_key text,
  visitor_id text,
  event_id text,
  event_name text,
  channel text not null default 'direct',
  source text,
  medium text,
  campaign text,
  term text,
  content text,
  landing_page text,
  referrer text,
  gclid text,
  fbclid text,
  ttclid text,
  msclkid text,
  click_id text,
  touchpoint_order integer,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.conversions_fact (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  event_name text not null,
  conversion_at timestamptz not null default now(),
  conversion_date date generated always as ((conversion_at at time zone 'utc')::date) stored,
  value numeric not null default 0,
  currency text not null default 'USD',
  order_id text,
  source_url text,
  referrer text,
  visitor_id text,
  session_key text,
  is_exact boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.attribution_models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model_key text not null,
  model_name text not null,
  window_days integer not null default 30,
  is_default boolean not null default false,
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, model_key)
);

create table if not exists public.attribution_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversion_id uuid not null references public.conversions_fact(id) on delete cascade,
  model_key text not null,
  attribution_window_days integer not null default 30,
  channel text not null,
  source text,
  medium text,
  credit_pct numeric not null default 0,
  revenue_credit numeric not null default 0,
  touchpoint_path jsonb not null default '[]'::jsonb,
  reasoning jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, conversion_id, model_key, channel, source, medium)
);

create table if not exists public.seo_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete cascade,
  metric_date date,
  query text,
  page text,
  issue_type text not null,
  priority_score numeric not null default 0,
  estimated_click_uplift numeric not null default 0,
  estimated_revenue_uplift numeric not null default 0,
  recommendation text,
  ai_suggestion jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_clusters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete cascade,
  cluster_key text not null,
  primary_keyword text,
  page_count integer not null default 0,
  keyword_count integer not null default 0,
  total_impressions numeric not null default 0,
  total_clicks numeric not null default 0,
  avg_position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, property_id, cluster_key)
);

create table if not exists public.seo_cannibalization (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete cascade,
  query text not null,
  pages jsonb not null default '[]'::jsonb,
  severity numeric not null default 0,
  recommendation text,
  created_at timestamptz not null default now(),
  unique (user_id, property_id, query)
);

create table if not exists public.seo_alert_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_type text not null,
  severity text not null default 'medium',
  entity_type text,
  entity_key text,
  details jsonb not null default '{}'::jsonb,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.competitor_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete cascade,
  competitor_domain text not null,
  keyword text not null,
  country text,
  device text,
  rank integer,
  serp_url text,
  search_volume numeric,
  cpc numeric,
  difficulty numeric,
  fetched_at timestamptz not null default now(),
  unique (user_id, competitor_domain, keyword, country, device, fetched_at)
);

create table if not exists public.serp_features_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  feature_date date not null default current_date,
  country text,
  device text,
  features jsonb not null default '[]'::jsonb,
  source_engine text not null default 'serpapi',
  created_at timestamptz not null default now(),
  unique (user_id, keyword, feature_date, country, device)
);

create table if not exists public.predictive_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete cascade,
  score_date date not null default current_date,
  keyword text,
  page text,
  uplift_probability numeric not null default 0,
  incremental_clicks numeric not null default 0,
  projected_revenue numeric not null default 0,
  model_version text not null default 'v1',
  inputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, property_id, score_date, keyword, page, model_version)
);

create index if not exists idx_touchpoints_user_date on public.channel_touchpoints (user_id, touchpoint_at desc);
create index if not exists idx_touchpoints_user_session on public.channel_touchpoints (user_id, session_key);
create index if not exists idx_conversions_user_date on public.conversions_fact (user_id, conversion_date desc);
create index if not exists idx_conversions_user_event on public.conversions_fact (user_id, event_id);
create index if not exists idx_gsc_qpd_user_property_date_query_page on public.gsc_query_page_daily (user_id, property_id, metric_date desc, query, page);
create index if not exists idx_attr_results_user_model_date on public.attribution_results (user_id, model_key, created_at desc);
create index if not exists idx_attr_results_user_conversion on public.attribution_results (user_id, conversion_id);
create index if not exists idx_seo_opps_user_date on public.seo_opportunities (user_id, metric_date desc);
create index if not exists idx_seo_clusters_user_cluster on public.seo_clusters (user_id, cluster_key);
create index if not exists idx_predictive_user_date on public.predictive_scores (user_id, score_date desc);
create index if not exists idx_competitor_user_domain on public.competitor_keywords (user_id, competitor_domain);

alter table public.channel_touchpoints enable row level security;
alter table public.conversions_fact enable row level security;
alter table public.attribution_models enable row level security;
alter table public.attribution_results enable row level security;
alter table public.seo_opportunities enable row level security;
alter table public.seo_clusters enable row level security;
alter table public.seo_cannibalization enable row level security;
alter table public.seo_alert_logs enable row level security;
alter table public.competitor_keywords enable row level security;
alter table public.serp_features_daily enable row level security;
alter table public.predictive_scores enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'channel_touchpoints' and policyname = 'Users own channel_touchpoints'
  ) then
    create policy "Users own channel_touchpoints" on public.channel_touchpoints for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'conversions_fact' and policyname = 'Users own conversions_fact'
  ) then
    create policy "Users own conversions_fact" on public.conversions_fact for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'attribution_models' and policyname = 'Users own attribution_models'
  ) then
    create policy "Users own attribution_models" on public.attribution_models for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'attribution_results' and policyname = 'Users own attribution_results'
  ) then
    create policy "Users own attribution_results" on public.attribution_results for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'seo_opportunities' and policyname = 'Users own seo_opportunities'
  ) then
    create policy "Users own seo_opportunities" on public.seo_opportunities for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'seo_clusters' and policyname = 'Users own seo_clusters'
  ) then
    create policy "Users own seo_clusters" on public.seo_clusters for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'seo_cannibalization' and policyname = 'Users own seo_cannibalization'
  ) then
    create policy "Users own seo_cannibalization" on public.seo_cannibalization for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'seo_alert_logs' and policyname = 'Users own seo_alert_logs'
  ) then
    create policy "Users own seo_alert_logs" on public.seo_alert_logs for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'competitor_keywords' and policyname = 'Users own competitor_keywords'
  ) then
    create policy "Users own competitor_keywords" on public.competitor_keywords for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'serp_features_daily' and policyname = 'Users own serp_features_daily'
  ) then
    create policy "Users own serp_features_daily" on public.serp_features_daily for all using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'predictive_scores' and policyname = 'Users own predictive_scores'
  ) then
    create policy "Users own predictive_scores" on public.predictive_scores for all using (auth.uid() = user_id);
  end if;
end $$;
