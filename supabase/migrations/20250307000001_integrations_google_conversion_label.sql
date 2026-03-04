-- Google Ads Enhanced Conversions: store conversion label per user
alter table integrations add column if not exists conversion_label text;
