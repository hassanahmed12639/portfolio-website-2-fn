create table if not exists header_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  custom_headers jsonb default '[]',
  forward_user_agent bool default true,
  forward_ip bool default true,
  forward_referer bool default true,
  forward_origin bool default true,
  custom_user_agent text default null,
  override_user_agent bool default false,
  is_active bool default true,
  created_at timestamp default now()
);

-- Platform-specific columns
alter table header_settings add column if not exists meta_send_test_event_code bool default false;
alter table header_settings add column if not exists meta_test_event_code text default null;
alter table header_settings add column if not exists meta_send_action_source bool default true;
alter table header_settings add column if not exists meta_action_source text default 'website';
alter table header_settings add column if not exists google_send_x_forwarded_for bool default true;
alter table header_settings add column if not exists google_send_user_agent_override bool default true;
alter table header_settings add column if not exists tiktok_send_tt_user_data bool default false;

alter table header_settings enable row level security;

create policy "Users can read own header_settings"
  on header_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own header_settings"
  on header_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own header_settings"
  on header_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
