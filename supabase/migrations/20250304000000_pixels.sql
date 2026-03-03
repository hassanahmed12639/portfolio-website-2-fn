create table if not exists pixels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  platform text not null default 'meta',
  pixel_id text not null,
  access_token text not null,
  name text not null default 'My Pixel',
  is_active boolean default true,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index if not exists pixels_user_idx on pixels(user_id);

-- RLS policies
alter table pixels enable row level security;

create policy "Users can view own pixels" on pixels
  for select using (auth.uid() = user_id);

create policy "Users can insert own pixels" on pixels
  for insert with check (auth.uid() = user_id);

create policy "Users can update own pixels" on pixels
  for update using (auth.uid() = user_id);

create policy "Users can delete own pixels" on pixels
  for delete using (auth.uid() = user_id);
