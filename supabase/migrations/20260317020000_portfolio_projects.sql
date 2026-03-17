create extension if not exists pgcrypto;

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  date text,
  title text not null,
  src text not null,
  author text not null,
  author_title text,
  description text not null,
  read_time text,
  sections jsonb not null default '[]'::jsonb,
  key_takeaways jsonb not null default '[]'::jsonb,
  content_image jsonb,
  content_images jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_portfolio_projects_published on public.portfolio_projects (is_published);
create index if not exists idx_portfolio_projects_sort on public.portfolio_projects (sort_order, created_at desc);
