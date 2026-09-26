-- ============================================================
-- MIGRATION 012 — AUTH BOOTSTRAP
-- Creates trigger for auto-provisioning public.users on signup
-- and promotes the first auth user to admin.
-- ============================================================

-- Trigger function: auto-insert public.users row when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, display_name, role, status, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user',
    'active',
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Back-fill: create public.users rows for any auth users that signed up before this trigger existed
INSERT INTO public.users (id, display_name, role, status, email_verified)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  'user',
  'active',
  au.email_confirmed_at IS NOT NULL
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Promote first confirmed user to admin
-- Update this to target your specific admin email if needed.
UPDATE public.users
SET role = 'admin'
WHERE id = (
  SELECT au.id
  FROM auth.users au
  JOIN public.users pu ON pu.id = au.id
  WHERE au.email_confirmed_at IS NOT NULL
  ORDER BY au.created_at ASC
  LIMIT 1
)
AND role = 'user';

-- Confirm result
SELECT au.email, pu.role, pu.status, pu.email_verified
FROM public.users pu
JOIN auth.users au ON au.id = pu.id
ORDER BY au.created_at;
