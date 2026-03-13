-- Add display_currency column to profiles for user's preferred currency display
-- Values are ISO 4217 currency codes (USD, EUR, GBP, etc.)
-- Display only - no conversion; same numeric value shown with different symbol/format
alter table profiles add column if not exists display_currency text default 'USD';
