-- Add PayPal billing columns to profiles for subscription management
alter table profiles add column if not exists plan_activated_at timestamptz;
alter table profiles add column if not exists paypal_subscription_id text;

-- Optional: ensure email exists for webhook matching (if your profiles get email from auth trigger, skip)
-- alter table profiles add column if not exists email text;
