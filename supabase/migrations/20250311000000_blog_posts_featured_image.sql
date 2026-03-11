-- Add featured_image column to blog_posts (used by admin panel)
-- Run this in Supabase SQL Editor: copy and paste
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image text;

-- Optional: copy existing cover_image to featured_image for posts that have one
UPDATE blog_posts SET featured_image = cover_image WHERE featured_image IS NULL AND cover_image IS NOT NULL;
