-- Run this in Supabase SQL editor to add anomaly/validation columns to events table.

alter table events add column if not exists event_id text;
alter table events add column if not exists validation_score int default 100;
alter table events add column if not exists validation_issues jsonb default '[]';
alter table events add column if not exists validation_checks jsonb default '[]';
alter table events add column if not exists payload jsonb default '{}';
