-- Security hardening for public webhook/team surfaces.

-- Webhooks: optional request signing support and stronger constraints.
alter table if exists public.webhooks
  add column if not exists signing_secret text;

alter table if exists public.webhooks
  drop constraint if exists webhooks_name_length_check;
alter table if exists public.webhooks
  add constraint webhooks_name_length_check
  check (char_length(trim(name)) between 1 and 100);

alter table if exists public.webhooks
  drop constraint if exists webhooks_event_name_length_check;
alter table if exists public.webhooks
  add constraint webhooks_event_name_length_check
  check (char_length(trim(coalesce(event_name, 'Lead'))) between 1 and 80);

alter table if exists public.webhooks
  drop constraint if exists webhooks_token_length_check;
alter table if exists public.webhooks
  add constraint webhooks_token_length_check
  check (char_length(token) between 20 and 128);

alter table if exists public.webhooks
  drop constraint if exists webhooks_signing_secret_length_check;
alter table if exists public.webhooks
  add constraint webhooks_signing_secret_length_check
  check (
    signing_secret is null
    or char_length(signing_secret) between 16 and 256
  );

alter table if exists public.webhooks
  drop constraint if exists webhooks_pixel_ids_size_check;
alter table if exists public.webhooks
  add constraint webhooks_pixel_ids_size_check
  check (cardinality(pixel_ids) <= 20);

alter table if exists public.webhooks force row level security;
alter table if exists public.webhook_logs force row level security;

-- Team invites: make owner policy explicit for inserts/updates too.
alter table if exists public.team_members force row level security;

drop policy if exists "owners_manage_team" on public.team_members;
create policy "owners_manage_team" on public.team_members
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
