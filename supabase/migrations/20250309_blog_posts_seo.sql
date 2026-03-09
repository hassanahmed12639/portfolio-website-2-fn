-- Add SEO and content columns to blog_posts (idempotent)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS primary_keyword text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 5;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author text DEFAULT 'TrackHive Team';
