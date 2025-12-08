-- ============================================
-- AUTO-SYNC TRIGGER: auth.users → public.users
-- ============================================
-- This trigger automatically creates/updates a profile in public.users
-- whenever a user is created or updated in auth.users
-- Run this in Supabase SQL Editor

-- 1️⃣ Create function to sync auth.users → public.users
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update public.users when auth.users is created/updated
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    employee_id,
    department,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    NEW.raw_user_meta_data->>'employee_id',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'phone',
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    role = COALESCE(EXCLUDED.role, public.users.role),
    employee_id = COALESCE(EXCLUDED.employee_id, public.users.employee_id),
    department = COALESCE(EXCLUDED.department, public.users.department),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    updated_at = EXCLUDED.updated_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2️⃣ Create trigger on auth.users (fires after INSERT or UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

-- 3️⃣ Verify trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

RAISE NOTICE 'Trigger created successfully! auth.users will now auto-sync to public.users';

-- ============================================
-- BACKFILL EXISTING USERS (Optional)
-- ============================================
-- If you have existing users in auth.users that don't have profiles in public.users,
-- run this to sync them:

/*
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'User'),
  COALESCE(au.raw_user_meta_data->>'role', 'staff'),
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
*/

-- ============================================
-- TEST THE TRIGGER
-- ============================================
-- Run your existing user creation script and verify it creates in both tables:

/*
DO $$
DECLARE 
  new_id UUID := gen_random_uuid();
BEGIN
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'name', 'Test User',
      'role', 'staff',
      'employee_id', 'EMP001',
      'department', 'Engineering',
      'phone', '1234567890'
    ),
    NOW(),
    NOW()
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    new_id,
    jsonb_build_object(
      'sub', new_id::text,
      'email', 'test@example.com'
    ),
    'email',
    'test@example.com',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'User created! Check public.users - it should auto-sync via trigger.';
END $$;

-- Verify the user was created in both tables:
SELECT 'auth.users' as table_name, id, email FROM auth.users WHERE email = 'test@example.com'
UNION ALL
SELECT 'public.users' as table_name, id, email FROM public.users WHERE email = 'test@example.com';
*/
