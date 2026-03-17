create table if not exists gtm_container_downloads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  pixel_id text,
  downloaded_at timestamptz default now() not null
);

create index if not exists gtm_container_downloads_user_idx on gtm_container_downloads(user_id);
create index if not exists gtm_container_downloads_downloaded_at_idx on gtm_container_downloads(downloaded_at);

alter table gtm_container_downloads enable row level security;

create policy "Users can insert own gtm container downloads" on gtm_container_downloads
  for insert with check (auth.uid() = user_id);

create policy "Users can view own gtm container downloads" on gtm_container_downloads
  for select using (auth.uid() = user_id);

