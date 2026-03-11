-- Ad platform connections
CREATE TABLE IF NOT EXISTS ad_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('meta', 'google', 'tiktok')),
  access_token text NOT NULL,
  account_id text NOT NULL,
  account_name text,
  token_expires_at timestamptz,
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  connected_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Campaign data synced from platforms
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES ad_connections(id) ON DELETE CASCADE,
  platform text NOT NULL,
  campaign_id text,
  campaign_name text NOT NULL,
  spend numeric DEFAULT 0,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  conversions numeric DEFAULT 0,
  roas numeric DEFAULT 0,
  ctr numeric DEFAULT 0,
  cpc numeric DEFAULT 0,
  cpm numeric DEFAULT 0,
  date_start date,
  date_end date,
  synced_at timestamptz DEFAULT now()
);

-- Custom dashboards
CREATE TABLE IF NOT EXISTS custom_dashboards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  template_type text DEFAULT 'blank',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dashboard widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dashboard_id uuid REFERENCES custom_dashboards(id) ON DELETE CASCADE,
  widget_type text NOT NULL,
  title text NOT NULL,
  platform_filter text DEFAULT 'all',
  metric text,
  position integer DEFAULT 0,
  width text DEFAULT 'half',
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ad_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own connections" ON ad_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own campaigns" ON ad_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own dashboards" ON custom_dashboards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own widgets" ON dashboard_widgets FOR ALL USING (
  dashboard_id IN (SELECT id FROM custom_dashboards WHERE user_id = auth.uid())
);
