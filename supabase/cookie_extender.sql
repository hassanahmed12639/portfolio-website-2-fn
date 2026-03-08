-- Run this in Supabase SQL editor for Cookie Lifetime Extender.

-- visitors: stores unique visitors for cookie extender stats (written by /api/cookie/set)
create table if not exists visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null unique,
  api_key text not null,
  user_id uuid references profiles(id) on delete cascade,
  is_returning boolean default false,
  first_seen timestamptz,
  last_seen timestamptz not null,
  visit_count int default 1,
  created_at timestamptz default now()
);

create index if not exists visitors_user_id on visitors(user_id);
create index if not exists visitors_api_key on visitors(api_key);

create table if not exists cookie_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  cookie_lifetime_days int default 180,
  cookie_name text default '_th_uid',
  is_active bool default true,
  created_at timestamp default now(),
  unique (user_id)
);

create table if not exists cookie_visitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  visitor_id text not null,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  visit_count int default 1,
  unique (user_id, visitor_id)
);

create index if not exists cookie_visitors_user_id on cookie_visitors(user_id);
create index if not exists cookie_visitors_visitor_id on cookie_visitors(visitor_id);
