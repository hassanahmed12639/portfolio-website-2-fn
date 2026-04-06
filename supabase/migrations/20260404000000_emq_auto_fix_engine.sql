-- EMQ Auto-Fix Engine tables
-- Store EMQ fix results alongside events

create table if not exists event_emq_fixes (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  score int not null check (score >= 0 and score <= 10),
  fixed_fields jsonb default '{}',
  suggested_fields jsonb default '{}',
  original_event jsonb not null,
  fixed_event jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_event_emq_fixes_event_id on event_emq_fixes(event_id);
create index if not exists idx_event_emq_fixes_user_id on event_emq_fixes(user_id);
create index if not exists idx_event_emq_fixes_score on event_emq_fixes(score);
create index if not exists idx_event_emq_fixes_created_at on event_emq_fixes(created_at);

-- Add trigger to update updated_at
create or replace function update_event_emq_fixes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists trigger_update_event_emq_fixes_updated_at
  before update on event_emq_fixes
  for each row execute function update_event_emq_fixes_updated_at();