-- Enrichment settings per user
create table if not exists enrichment_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique,
  geo_enabled bool default true,
  device_enabled bool default true,
  customer_type_enabled bool default true,
  ltv_enabled bool default true,
  email_hash_enabled bool default true,
  phone_hash_enabled bool default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add enrichment columns to events (run if not exists)
alter table events add column if not exists country text;
alter table events add column if not exists city text;
alter table events add column if not exists device_type text;
alter table events add column if not exists customer_type text;
alter table events add column if not exists enriched_data jsonb;

create index if not exists events_enriched_at on events(user_id, created_at) where enriched_data is not null;
