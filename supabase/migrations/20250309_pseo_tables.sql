-- pSEO Pages table
-- Run this in Supabase SQL Editor if not using migrations.
CREATE TABLE IF NOT EXISTS pseo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'integration', 'compare', 'problem', 'usecase'
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_title text,
  meta_description text,
  h1 text,
  hero_subtitle text,
  platform_name text,
  platform_slug text,
  compare_tool_name text,
  tagline text,
  stat_1_number text,
  stat_1_label text,
  stat_2_number text,
  stat_2_label text,
  stat_3_number text,
  stat_3_label text,
  section_1_title text,
  section_1_body text,
  section_2_title text,
  section_2_body text,
  cta_title text,
  cta_subtitle text,
  cta_button_text text DEFAULT 'Get Started Free',
  published boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- pSEO Compare rows table (for comparison tables)
CREATE TABLE IF NOT EXISTS pseo_compare_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pseo_pages(id) ON DELETE CASCADE,
  feature text NOT NULL,
  trackhive_value text NOT NULL,
  competitor_value text NOT NULL,
  sort_order integer DEFAULT 0
);

-- pSEO Steps table (for how it works sections)
CREATE TABLE IF NOT EXISTS pseo_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES pseo_pages(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL
);
