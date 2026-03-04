-- Platform delivery status for event logs (Meta CAPI, GA4, TikTok, Google Enhanced Conversions)
alter table events add column if not exists meta_status text default 'pending';
alter table events add column if not exists ga4_status text default 'pending';
alter table events add column if not exists tiktok_status text default 'pending';
alter table events add column if not exists google_status text default 'pending';
