-- Leads table for lead-gen dashboard: capture Lead events and scoring
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  phone text,
  first_name text,
  last_name text,
  score text default 'new' check (score in ('new', 'good', 'bad', 'hot', 'converted')),
  stage text default 'new' check (stage in ('new', 'contacted', 'qualified', 'proposal', 'converted')),
  meta_feedback_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists leads_user_id on leads(user_id);
create index if not exists leads_user_score on leads(user_id, score);
create index if not exists leads_user_stage on leads(user_id, stage);

alter table leads enable row level security;

create policy "Users can read own leads"
  on leads for select
  using (auth.uid() = user_id);

create policy "Users can insert own leads"
  on leads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own leads"
  on leads for update
  using (auth.uid() = user_id);

create policy "Users can delete own leads"
  on leads for delete
  using (auth.uid() = user_id);
