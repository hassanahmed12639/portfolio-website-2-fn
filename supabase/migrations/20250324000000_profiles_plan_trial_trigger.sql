-- Add plan and trial columns to profiles for new signups
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trial boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Function to create profile on new auth signup (7-day pro trial)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, api_key, plan, is_trial, trial_started_at, trial_ends_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    gen_random_uuid()::text,
    'pro',
    true,
    now(),
    now() + interval '7 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (may have different implementation)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
