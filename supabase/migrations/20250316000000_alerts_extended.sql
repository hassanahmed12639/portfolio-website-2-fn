-- Extend alerts table with new columns for expanded alert system
-- Run this in Supabase SQL Editor when migrating from JSON to Supabase storage

-- If using a table named 'alerts':
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS condition_group text;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS platform text DEFAULT 'all';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS pixel_id text DEFAULT 'all';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS time_window text DEFAULT '1hour';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS threshold_hours integer DEFAULT 24;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS custom_event_name text;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS custom_field text;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS custom_operator text;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS custom_value text;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'immediately';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS last_triggered_at timestamptz;
