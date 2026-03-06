-- Add missing integration columns for Google Enhanced Conversions and GA4
alter table integrations add column if not exists conversion_label text;
alter table integrations add column if not exists conversion_id text;
alter table integrations add column if not exists ga4_measurement_id text;
alter table integrations add column if not exists ga4_api_secret text;
