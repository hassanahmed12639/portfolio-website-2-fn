-- Ensure pixels table has platform and is_active columns (idempotent)
ALTER TABLE pixels ADD COLUMN IF NOT EXISTS platform text DEFAULT 'meta';
ALTER TABLE pixels ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
