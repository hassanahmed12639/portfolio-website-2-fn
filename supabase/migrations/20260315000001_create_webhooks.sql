-- Webhooks and webhook_logs for TrackHive lead gen server-side ingestion
-- Run this in Supabase SQL editor if not using CLI

-- Table: webhooks
create table if not exists webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  token text unique not null default gen_random_uuid()::text,
  event_name text default 'Lead',
  event_value numeric default 0,
  pixel_ids uuid[] default '{}',
  field_map jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists webhooks_user_id on webhooks(user_id);
create index if not exists webhooks_token on webhooks(token);

alter table webhooks enable row level security;

create policy "Users can manage own webhooks"
  on webhooks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add source and webhook_id to leads for webhook-originated leads
alter table leads add column if not exists source text;
alter table leads add column if not exists source_display text;
alter table leads add column if not exists webhook_id uuid references webhooks(id) on delete set null;

create index if not exists leads_webhook_id on leads(webhook_id);

-- Table: webhook_logs
create table if not exists webhook_logs (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null references webhooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_payload jsonb,
  mapped_data jsonb,
  status text default 'received' check (status in ('received', 'sent', 'failed')),
  platform_responses jsonb default '{}',
  lead_id uuid references leads(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists webhook_logs_webhook_id on webhook_logs(webhook_id);
create index if not exists webhook_logs_user_id on webhook_logs(user_id);
create index if not exists webhook_logs_created_at on webhook_logs(created_at desc);

alter table webhook_logs enable row level security;

create policy "Users can read own webhook_logs"
  on webhook_logs for select
  using (auth.uid() = user_id);
