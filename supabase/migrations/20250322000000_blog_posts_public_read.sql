-- Allow public (anon + authenticated) to read published blog posts.
-- Required for TrackHive /blog page to display posts.
alter table blog_posts enable row level security;

drop policy if exists "Public can read published blog posts" on blog_posts;
create policy "Public can read published blog posts" on blog_posts
  for select
  using (published = true);
