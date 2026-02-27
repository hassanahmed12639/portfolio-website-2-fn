-- IP modification and data anonymization columns for privacy_settings
alter table privacy_settings add column if not exists ip_modification text default 'anonymized';
alter table privacy_settings add column if not exists anonymize_email bool default true;
alter table privacy_settings add column if not exists anonymize_phone bool default true;
alter table privacy_settings add column if not exists strip_query_params bool default false;
alter table privacy_settings add column if not exists anonymize_user_agent bool default false;
