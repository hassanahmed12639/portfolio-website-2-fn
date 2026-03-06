-- Optional tenant columns (app uses platform-scoped rows: pixel_id, access_token, tag_id, conversion_label per row)
alter table integrations add column if not exists meta_pixel_id text;
alter table integrations add column if not exists meta_access_token text;
alter table integrations add column if not exists tiktok_pixel_id text;
alter table integrations add column if not exists tiktok_access_token text;
alter table integrations add column if not exists ga4_measurement_id text;
alter table integrations add column if not exists ga4_api_secret text;
alter table integrations add column if not exists google_ads_conversion_id text;
alter table integrations add column if not exists google_ads_conversion_label text;
