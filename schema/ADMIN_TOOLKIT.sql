-- ===================================================================
-- ADMIN TOOLKIT: User Management SQL Commands
-- ===================================================================
-- Use these commands to manage users and troubleshoot issues
-- Run in: Supabase Dashboard → SQL Editor
-- ===================================================================

-- ===================================================================
-- 📋 USER LISTING & SEARCH
-- ===================================================================

-- View all users with their details
SELECT 
    u.id,
    u.email,
    pu.name,
    pu.employee_id,
    pu.role,
    pu.department,
    u.created_at,
    u.updated_at
FROM auth.users u
LEFT JOIN public.users pu ON pu.id = u.id
ORDER BY u.created_at DESC;

-- Search user by email
SELECT 
    u.id,
    u.email,
    pu.name,
    pu.employee_id,
    pu.role,
    u.created_at
FROM auth.users u
LEFT JOIN public.users pu ON pu.id = u.id
WHERE u.email ILIKE '%emp001%';
-- Replace with search term

-- Count total users
SELECT 
    COUNT(DISTINCT u.id) as total_auth_users,
    COUNT(DISTINCT pu.id) as total_profiles,
    COUNT(DISTINCT CASE WHEN pu.id IS NULL THEN u.id END) as missing_profiles
FROM auth.users u
LEFT JOIN public.users pu ON pu.id = u.id;

-- ===================================================================
-- 🔐 PASSWORD MANAGEMENT
-- ===================================================================

-- Reset user password to employee_id (default reset)
UPDATE auth.users 
SET encrypted_password = crypt('EMP001', gen_salt('bf'))
WHERE email = 'emp001@example.com';
-- Replace EMP001 with employee_id and email

-- Reset multiple users' passwords
WITH users_to_reset AS (
  SELECT u.id, u.email, pu.employee_id
  FROM auth.users u
  LEFT JOIN public.users pu ON pu.id = u.id
  WHERE u.email IN ('emp001@example.com', 'emp002@example.com')
)
UPDATE auth.users au
SET encrypted_password = crypt(COALESCE(utr.employee_id, 'DefaultPass123'), gen_salt('bf'))
FROM users_to_reset utr
WHERE au.id = utr.id;

-- View password change history
SELECT 
    pcl.id,
    u.email,
    pu.employee_id,
    pu.name,
    pcl.changed_at,
    pcl.changed_by
FROM public.password_change_log pcl
JOIN auth.users u ON u.id = pcl.user_id
LEFT JOIN public.users pu ON pu.id = u.id
ORDER BY pcl.changed_at DESC
LIMIT 50;

-- ===================================================================
-- ➕ ADD SINGLE USER (Template)
-- ===================================================================

DO $$
DECLARE 
  v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1);
  v_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user
  ) VALUES (
    gen_random_uuid(),
    v_project_id,
    'emp006@example.com',
    crypt('EMP006', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Employee Six","employee_id":"EMP006","department":"Sales","role":"staff"}',
    false
  ) RETURNING id INTO v_user_id;
  
  INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id, jsonb_build_object('sub', v_user_id::text), 'email', NOW(), NOW());
  
  RAISE NOTICE 'User created: emp006@example.com / EMP006';
END $$;

-- ===================================================================
-- 🗑️ DELETE USER (Dangerous - Use with caution)
-- ===================================================================

-- Delete single user (will cascade to public.users)
DELETE FROM auth.users WHERE email = 'emp001@example.com';

-- Delete multiple users at once
DELETE FROM auth.users 
WHERE email IN ('emp001@example.com', 'emp002@example.com');

-- Delete all test users
DELETE FROM auth.users WHERE email LIKE 'test%@example.com' OR email LIKE 'emp%@example.com';

-- ===================================================================
-- 🔄 SYNC & CONSISTENCY CHECKS
-- ===================================================================

-- Find users in auth.users but NOT in public.users (missing profiles)
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'name' as name,
    u.created_at
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = u.id)
ORDER BY u.created_at DESC;

-- Fix missing profiles (run if above query returns results)
INSERT INTO public.users (id, email, name, role, employee_id, department, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', 'User'),
    COALESCE(u.raw_user_meta_data->>'role', 'staff'),
    u.raw_user_meta_data->>'employee_id',
    u.raw_user_meta_data->>'department',
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = u.id);

-- Verify trigger is working by checking recent creations
SELECT 
    au.email,
    au.created_at as auth_created,
    pu.created_at as profile_created,
    CASE WHEN pu.id IS NOT NULL THEN '✅ Synced' ELSE '❌ Missing' END as status
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
ORDER BY au.created_at DESC
LIMIT 10;

-- ===================================================================
-- 👤 UPDATE USER DETAILS
-- ===================================================================

-- Update user name
UPDATE public.users 
SET name = 'New Name', updated_at = NOW()
WHERE email = 'emp001@example.com';

-- Update user role
UPDATE public.users 
SET role = 'advisor', updated_at = NOW()
WHERE email = 'emp001@example.com';

-- Update multiple user details
UPDATE public.users 
SET 
    department = 'Engineering',
    phone = '+1234567890',
    updated_at = NOW()
WHERE email = 'emp001@example.com';

-- ===================================================================
-- 📊 STATISTICS & REPORTS
-- ===================================================================

-- User count by role
SELECT 
    role,
    COUNT(*) as count
FROM public.users
GROUP BY role
ORDER BY count DESC;

-- User count by department
SELECT 
    department,
    COUNT(*) as count
FROM public.users
WHERE department IS NOT NULL
GROUP BY department
ORDER BY count DESC;

-- Newest users (last 7 days)
SELECT 
    email,
    name,
    employee_id,
    role,
    created_at
FROM public.users
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Users who changed password (last 30 days)
SELECT 
    u.email,
    pu.name,
    COUNT(*) as password_changes,
    MAX(pcl.changed_at) as last_change
FROM public.password_change_log pcl
JOIN auth.users u ON u.id = pcl.user_id
LEFT JOIN public.users pu ON pu.id = u.id
WHERE pcl.changed_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, pu.name
ORDER BY COUNT(*) DESC;

-- ===================================================================
-- 🔍 DIAGNOSTIC QUERIES
-- ===================================================================

-- Check trigger exists and is active
SELECT 
    trigger_name,
    event_object_table,
    event_manipulation,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_password_change')
ORDER BY trigger_name;

-- Check function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_auth_user_sync', 'log_password_change')
ORDER BY routine_name;

-- Check all instances (should be 1 for your project)
SELECT id, raw_base_config, created_at FROM auth.instances;

-- Check database size
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(table_name)) as size
FROM (
    SELECT 'auth.users' as table_name
    UNION ALL SELECT 'public.users'
    UNION ALL SELECT 'public.password_change_log'
) tables
ORDER BY pg_total_relation_size(table_name) DESC;

-- ===================================================================
-- 🚨 EMERGENCY OPERATIONS
-- ===================================================================

-- Disable trigger (emergency maintenance)
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
-- Remember to re-enable: ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Re-enable trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Clear password change log (be careful!)
DELETE FROM public.password_change_log;
-- This removes all password change history

-- Reset user to initial state
DELETE FROM public.users WHERE email = 'emp001@example.com';
DELETE FROM auth.users WHERE email = 'emp001@example.com';
-- Will cascade delete automatically

-- ===================================================================
-- 📄 EXPORT OPERATIONS
-- ===================================================================

-- Export all users as CSV format (copy-paste into Excel)
COPY (
    SELECT 
        u.email,
        pu.name,
        pu.employee_id,
        pu.department,
        pu.role,
        pu.phone,
        u.created_at
    FROM auth.users u
    LEFT JOIN public.users pu ON pu.id = u.id
    ORDER BY u.created_at DESC
) TO STDOUT WITH CSV HEADER;

-- ===================================================================
-- ⚙️ MAINTENANCE QUERIES
-- ===================================================================

-- Analyze query performance
ANALYZE auth.users;
ANALYZE public.users;
ANALYZE public.password_change_log;

-- Vacuum to reclaim space (should run automatically)
VACUUM auth.users;
VACUUM public.users;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users') AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ===================================================================
-- 💡 COMMON WORKFLOWS
-- ===================================================================

-- WORKFLOW 1: Add 10 new employees
-- 1. Prepare CSV with email, name, employee_id, department
-- 2. For each row, run the template:
/*
DO $$
DECLARE 
  v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1);
  v_user_id UUID;
BEGIN
  INSERT INTO auth.users (...) VALUES (...);
  INSERT INTO auth.identities (...) VALUES (...);
END $$;
*/
-- 3. Verify: SELECT * FROM public.users WHERE created_at >= NOW() - INTERVAL '1 hour';

-- WORKFLOW 2: Mass password reset
-- 1. SELECT email, employee_id FROM public.users WHERE condition;
-- 2. For each, run: UPDATE auth.users SET encrypted_password = crypt('...', gen_salt('bf')) WHERE email = '...';
-- 3. Notify users of new password

-- WORKFLOW 3: Audit password changes
-- 1. SELECT * FROM public.password_change_log ORDER BY changed_at DESC;
-- 2. Cross-reference with user actions in app logs
-- 3. Investigate any suspicious patterns

-- WORKFLOW 4: Fix sync issues
-- 1. Run: SELECT * FROM auth.users WHERE id NOT IN (SELECT id FROM public.users);
-- 2. Run: INSERT INTO public.users (...) SELECT ... FROM auth.users WHERE ...;
-- 3. Verify with count query

-- ===================================================================
-- 📞 HELP & DOCUMENTATION
-- ===================================================================

-- For full documentation, see:
-- - USER_MANAGEMENT_GUIDE.md
-- - QUICK_REFERENCE.md
-- - USER_MANAGEMENT_IMPLEMENTATION.md
-- - BULK_USER_IMPORT.sql
-- - ENHANCED_TRIGGERS.sql
