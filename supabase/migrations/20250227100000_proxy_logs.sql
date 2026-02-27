-- Optional: log proxy usage for analytics. Used by /api/proxy/[...path].
create table if not exists proxy_logs (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  destination text not null,
  created_at timestamptz default now()
);

create index if not exists proxy_logs_created_at on proxy_logs(created_at);
