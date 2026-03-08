-- Update profiles table with plan limits
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS events_this_month integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS events_reset_at timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_owner_id uuid REFERENCES profiles(id);

-- Plan limits table
CREATE TABLE IF NOT EXISTS plan_limits (
  plan text PRIMARY KEY,
  events_per_month integer,
  max_pixels integer,
  max_team_members integer,
  platforms text[],
  features text[]
);

INSERT INTO plan_limits (plan, events_per_month, max_pixels, max_team_members, platforms, features) VALUES
('free', 500, 1, 0,
  ARRAY['meta'],
  ARRAY['overview','setup','event_logs_24h','playground_limited','scanner_limited']::text[]),
('pro', 25000, 3, 0,
  ARRAY['meta','tiktok','ga4','google'],
  ARRAY['overview','setup','lead_manager','event_logs','live_stream','event_replay','raw_data','pixels','playground','templates_free','data_quality','validator','deduplication','retry_queue','http_headers','cookie_extender','anomaly_detection','scanner','enrichment','integrations','reverse_proxy','attribution','email_alerts']::text[]),
('agency', -1, 25, 5,
  ARRAY['meta','tiktok','ga4','google'],
  ARRAY['overview','setup','lead_manager','event_logs','live_stream','event_replay','raw_data','pixels','playground','templates_all','data_quality','validator','deduplication','retry_queue','http_headers','cookie_extender','anomaly_detection','scanner','enrichment','integrations','reverse_proxy','attribution','email_alerts','team_members','priority_support']::text[])
ON CONFLICT (plan) DO UPDATE SET
  events_per_month = EXCLUDED.events_per_month,
  max_pixels = EXCLUDED.max_pixels,
  max_team_members = EXCLUDED.max_team_members,
  platforms = EXCLUDED.platforms,
  features = EXCLUDED.features;

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email text NOT NULL,
  role text DEFAULT 'viewer',
  status text DEFAULT 'pending',
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  UNIQUE(owner_id, member_email)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners_manage_team" ON team_members;
CREATE POLICY "owners_manage_team" ON team_members
  FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "members_view_own" ON team_members;
CREATE POLICY "members_view_own" ON team_members
  FOR SELECT USING (auth.uid() = member_id);
