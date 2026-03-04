-- Onboarding: business info and dashboard type for new users
alter table profiles add column if not exists onboarding_completed boolean default false;
alter table profiles add column if not exists business_name text;
alter table profiles add column if not exists website_url text;
alter table profiles add column if not exists business_type text check (business_type in ('ecommerce', 'leadgen', 'agency', 'saas', 'other'));
alter table profiles add column if not exists monthly_events integer default 0;
alter table profiles add column if not exists ad_platforms text[] default '{}';
alter table profiles add column if not exists dashboard_type text default 'ecommerce' check (dashboard_type in ('ecommerce', 'leadgen'));
