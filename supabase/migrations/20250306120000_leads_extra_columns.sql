-- Add columns to leads table for event tracking and Lead Manager
alter table leads add column if not exists pixel_id text;
alter table leads add column if not exists event_id text;
alter table leads add column if not exists source_url text;
alter table leads add column if not exists event_name text default 'Lead';
alter table leads add column if not exists value numeric default 0;
alter table leads add column if not exists currency text default 'USD';
alter table leads add column if not exists meta_feedback_at timestamptz;
alter table leads add column if not exists notes text;
alter table leads add column if not exists ip_address text;
alter table leads add column if not exists user_agent text;
alter table leads add column if not exists raw_data jsonb;
