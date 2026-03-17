create extension if not exists pgcrypto;

create table if not exists public.portfolio_tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_portfolio_tools_active_sort
  on public.portfolio_tools (is_active, sort_order, created_at);

create table if not exists public.portfolio_resume_settings (
  id uuid primary key default gen_random_uuid(),
  hero_badge text,
  hero_title text,
  hero_prefix text,
  rotate_words jsonb not null default '[]'::jsonb,
  contact_links jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  tools jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);
