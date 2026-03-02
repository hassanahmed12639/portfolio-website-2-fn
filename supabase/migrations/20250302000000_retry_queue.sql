create table if not exists retry_queue (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  event_id text,
  payload jsonb not null,
  platform text not null default 'meta',
  attempt int not null default 1,
  max_attempts int not null default 4,
  next_retry_at timestamptz not null,
  last_error text,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists retry_queue_status_idx on retry_queue(status, next_retry_at);
create index if not exists retry_queue_user_idx on retry_queue(user_id);
