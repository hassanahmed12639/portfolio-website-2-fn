-- Add extended metrics to ad_campaigns for leads, messaging, reach, etc.
ALTER TABLE ad_campaigns
  ADD COLUMN IF NOT EXISTS leads numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_per_lead numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS messages numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_per_message numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frequency numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS link_clicks bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS add_to_cart numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS initiate_checkout numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_per_purchase numeric DEFAULT 0;
