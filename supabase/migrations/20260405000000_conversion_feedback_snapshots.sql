create table if not exists conversion_feedback_snapshots (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  snapshot_date date not null,
  pixel_event_count int not null default 0,
  capi_event_count int not null default 0,
  signal_loss_pct int not null default 0,
  status text not null default 'No data',
  suggestion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conversion_feedback_snapshots_user_date_idx
  on conversion_feedback_snapshots(user_id, snapshot_date);
