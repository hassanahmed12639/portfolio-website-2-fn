-- Unified Revenue + SEO intelligence foundation

create extension if not exists pgcrypto;

create table if not exists public.channel_touchpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text,
  session_id text,
  visitor_id text,
  occurred_at timestamptz not null default now(),
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
  platform text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.conversions_fact (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text,
  order_id text,
  conversion_name text not null default 'Purchase',
  conversion_at timestamptz not null default now(),
  value numeric not null default 0,
  currency text not null default 'USD',
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.attribution_models (
  id uuid primary key default gen_random_uuid(),
  model_key text not null unique,
  display_name text not null,
  lookback_days integer not null default 30,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.attribution_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversion_id uuid not null references public.conversions_fact(id) on delete cascade,
  model_id uuid not null references public.attribution_models(id) on delete cascade,
  touchpoint_id uuid references public.channel_touchpoints(id) on delete set null,
  channel text not null,
  credit_pct numeric not null check (credit_pct >= 0 and credit_pct <= 1),
  revenue_allocated numeric not null default 0,
  computed_at timestamptz not null default now(),
  unique (conversion_id, model_id, touchpoint_id, channel)
);

create table if not exists public.seo_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete set null,
  opportunity_type text not null,
  page text,
  keyword text,
  priority_score numeric not null default 0,
  impact_score numeric not null default 0,
  recommendation text,
  recommendation_json jsonb not null default '{}'::jsonb,
  status text not null default 'open',
  detected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_clusters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete set null,
  cluster_name text not null,
  centroid_keyword text,
  keywords jsonb not null default '[]'::jsonb,
  pages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_cannibalization (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete set null,
  keyword text not null,
  pages jsonb not null default '[]'::jsonb,
  severity numeric not null default 0,
  detected_at timestamptz not null default now()
);

create table if not exists public.seo_alert_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_type text not null,
  severity text not null default 'info',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.competitor_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  competitor_domain text not null,
  keyword text not null,
  country text,
  device text,
  search_volume numeric,
  cpc numeric,
  competitor_position numeric,
  your_position numeric,
  difficulty numeric,
  captured_at timestamptz not null default now(),
  unique (user_id, competitor_domain, keyword, country, device)
);

create table if not exists public.serp_features_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  keyword text not null,
  country text,
  device text,
  metric_date date not null default current_date,
  has_featured_snippet boolean not null default false,
  has_video boolean not null default false,
  has_image_pack boolean not null default false,
  has_local_pack boolean not null default false,
  your_url text,
  your_position numeric,
  created_at timestamptz not null default now(),
  unique (user_id, keyword, country, device, metric_date)
);

create table if not exists public.predictive_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid references public.gsc_properties(id) on delete set null,
  keyword text not null,
  page text,
  probability_top3 numeric,
  expected_click_uplift numeric,
  expected_revenue_uplift numeric,
  model_version text,
  generated_at timestamptz not null default now()
);

-- DB-backed alerting migration
create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Unnamed',
  enabled boolean not null default true,
  condition text not null,
  threshold numeric,
  event_name text,
  notify_email text not null,
  cooldown_minutes integer not null default 60,
  last_triggered_at timestamptz,
  condition_group text,
  platform text,
  pixel_id text,
  time_window text,
  currency text,
  threshold_hours integer,
  custom_event_name text,
  custom_field text,
  custom_operator text,
  custom_value text,
  frequency text default 'immediately',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alert_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id uuid references public.alert_rules(id) on delete set null,
  rule_name text not null,
  triggered_at timestamptz not null default now(),
  condition text not null,
  value numeric not null default 0,
  threshold numeric not null default 0,
  email_sent_to text not null,
  status text not null default 'sent'
);

insert into public.attribution_models (model_key, display_name, lookback_days, config)
values
  ('last_click', 'Last Click', 30, '{}'::jsonb),
  ('first_click', 'First Click', 30, '{}'::jsonb),
  ('linear', 'Linear', 30, '{}'::jsonb),
  ('position_based', 'Position Based', 30, '{"first":0.4,"last":0.4,"middle":0.2}'::jsonb),
  ('time_decay', 'Time Decay', 30, '{"half_life_days":7}'::jsonb)
on conflict (model_key) do nothing;

create index if not exists idx_touchpoints_user_time on public.channel_touchpoints(user_id, occurred_at desc);
create unique index if not exists uq_touchpoints_user_event_platform_time on public.channel_touchpoints(user_id, event_id, platform, occurred_at);
create index if not exists idx_touchpoints_user_session on public.channel_touchpoints(user_id, session_id);
create index if not exists idx_touchpoints_click_ids on public.channel_touchpoints(gclid, fbclid, ttclid);
create index if not exists idx_conv_user_time on public.conversions_fact(user_id, conversion_at desc);
create unique index if not exists uq_conversions_user_event_id on public.conversions_fact(user_id, event_id);
create index if not exists idx_attr_user_model on public.attribution_results(user_id, model_id, computed_at desc);
create index if not exists idx_attr_conv on public.attribution_results(conversion_id);
create index if not exists idx_seo_opp_user_priority on public.seo_opportunities(user_id, priority_score desc, detected_at desc);
create index if not exists idx_comp_kw_user_domain on public.competitor_keywords(user_id, competitor_domain);
create index if not exists idx_predictive_user_generated on public.predictive_scores(user_id, generated_at desc);
create index if not exists idx_alert_rules_user_enabled on public.alert_rules(user_id, enabled);
create index if not exists idx_alert_logs_user_triggered on public.alert_logs(user_id, triggered_at desc);

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
alter table public.alert_rules enable row level security;
alter table public.alert_logs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='channel_touchpoints' and policyname='Users own channel_touchpoints') then
    create policy "Users own channel_touchpoints" on public.channel_touchpoints for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='conversions_fact' and policyname='Users own conversions_fact') then
    create policy "Users own conversions_fact" on public.conversions_fact for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='attribution_models' and policyname='Read attribution_models') then
    create policy "Read attribution_models" on public.attribution_models for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='attribution_results' and policyname='Users own attribution_results') then
    create policy "Users own attribution_results" on public.attribution_results for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='seo_opportunities' and policyname='Users own seo_opportunities') then
    create policy "Users own seo_opportunities" on public.seo_opportunities for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='seo_clusters' and policyname='Users own seo_clusters') then
    create policy "Users own seo_clusters" on public.seo_clusters for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='seo_cannibalization' and policyname='Users own seo_cannibalization') then
    create policy "Users own seo_cannibalization" on public.seo_cannibalization for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='seo_alert_logs' and policyname='Users own seo_alert_logs') then
    create policy "Users own seo_alert_logs" on public.seo_alert_logs for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='competitor_keywords' and policyname='Users own competitor_keywords') then
    create policy "Users own competitor_keywords" on public.competitor_keywords for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='serp_features_daily' and policyname='Users own serp_features_daily') then
    create policy "Users own serp_features_daily" on public.serp_features_daily for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='predictive_scores' and policyname='Users own predictive_scores') then
    create policy "Users own predictive_scores" on public.predictive_scores for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='alert_rules' and policyname='Users own alert_rules') then
    create policy "Users own alert_rules" on public.alert_rules for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='alert_logs' and policyname='Users own alert_logs') then
    create policy "Users own alert_logs" on public.alert_logs for all using (auth.uid() = user_id);
  end if;
end $$;
