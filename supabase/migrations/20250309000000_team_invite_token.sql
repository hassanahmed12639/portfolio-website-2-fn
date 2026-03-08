-- Add invite token columns for team member invitation emails
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS invite_token text UNIQUE;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS invite_expires_at timestamp;
