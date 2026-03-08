-- Add published_at to blog_posts if not present (for sitemap and SEO)
-- Run in Supabase SQL Editor if migrating manually
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Backfill: set published_at = created_at for published posts that don't have it
UPDATE blog_posts
SET published_at = COALESCE(published_at, created_at)
WHERE published = true AND published_at IS NULL;
