-- Run this SQL in your Supabase SQL Editor to create the blog_posts table
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  author text default 'TrackHive Team',
  category text default 'Server-Side Tracking',
  tags text[] default '{}',
  published boolean default false,
  views integer default 0,
  read_time integer default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists blog_posts_slug_idx on blog_posts(slug);
create index if not exists blog_posts_published_idx on blog_posts(published);
