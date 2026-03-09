-- Add avatar columns to profiles
alter table profiles add column if not exists avatar_type text default 'initials' check (avatar_type in ('initials', 'image'));
alter table profiles add column if not exists avatar_url text;
