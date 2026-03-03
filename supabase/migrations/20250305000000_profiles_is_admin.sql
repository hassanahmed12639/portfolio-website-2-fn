-- Add is_admin column to profiles for admin panel access
alter table profiles add column if not exists is_admin boolean not null default false;
