-- Run this in Supabase SQL editor to create the attribution_scores table.
create table if not exists attribution_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  conversion_id text,
  event_name text,
  truth_score numeric,
  meta_score numeric,
  google_score numeric,
  ga4_score numeric,
  utm_score numeric,
  server_score numeric,
  breakdown jsonb default '{}',
  recommendation text,
  created_at timestamp default now(),
  unique (user_id, conversion_id)
);
