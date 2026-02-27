-- Run this in Supabase SQL Editor (exact from spec):
-- create table if not exists privacy_settings (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid references profiles(id) on delete cascade,
--   ip_anonymization bool default true,
--   data_retention_days int default 90,
--   consent_mode bool default true,
--   pii_masking bool default true,
--   gdpr_mode bool default false,
--   ccpa_mode bool default false,
--   auto_delete_enabled bool default true,
--   created_at timestamp default now()
-- );
-- Then add optional column for Data Minimization toggle: alter table privacy_settings add column if not exists data_minimization bool default false;

create table if not exists privacy_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  ip_anonymization bool default true,
  data_retention_days int default 90,
  consent_mode bool default true,
  pii_masking bool default true,
  gdpr_mode bool default false,
  ccpa_mode bool default false,
  auto_delete_enabled bool default true,
  data_minimization bool default false,
  created_at timestamp default now()
);

-- Optional: allow upsert by user_id (else API uses select + update/insert):
-- alter table privacy_settings add constraint privacy_settings_user_id_key unique (user_id);

-- RLS: allow authenticated users to read/insert/update their own row (required for toggles to persist)
alter table privacy_settings enable row level security;

create policy "Users can read own privacy_settings"
  on privacy_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own privacy_settings"
  on privacy_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own privacy_settings"
  on privacy_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- If the table already exists and toggles still revert, run only the RLS block above in Supabase SQL Editor.
