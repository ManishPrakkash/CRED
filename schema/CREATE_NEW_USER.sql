-- ===================================================================
-- CREATE NEW USER - COMPLETE SOLUTION
-- ===================================================================
-- This script creates a new user in BOTH auth.users AND public.users
-- Copy this entire DO block, replace the values, and execute in Supabase SQL Editor
-- ===================================================================

DO $$
DECLARE
    v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1);
    v_user_id UUID := gen_random_uuid();
BEGIN
    -- Step 1: Insert into auth.users (creates authentication)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_sso_user
    ) VALUES (
        v_user_id,
        v_project_id,
        'newuser@example.com',                    -- CHANGE THIS: User email
        crypt('password123', gen_salt('bf')),     -- CHANGE THIS: User password
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"New User","employee_id":"EMP999","department":"Engineering","role":"staff"}',
        false
    );

    -- Step 2: Insert into auth.identities (required by Supabase)
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text),
        'email',
        v_user_id::text,
        NOW(),
        NOW()
    );

    -- Step 3: Trigger will AUTOMATICALLY create public.users profile
    -- (No manual INSERT needed - the trigger handles this)

    RAISE NOTICE '✅ User created successfully!';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Email: newuser@example.com';
    RAISE NOTICE 'Password: password123';
    RAISE NOTICE 'Trigger will auto-create profile in public.users';

END $$;

-- ===================================================================
-- VERIFY USER WAS CREATED IN BOTH TABLES
-- ===================================================================
-- Run these queries after executing the above script

-- Check auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'newuser@example.com';

-- Check public.users (should be auto-created by trigger!)
SELECT id, email, name, employee_id, role FROM public.users WHERE email = 'newuser@example.com';

-- ===================================================================
-- WHAT HAPPENS
-- ===================================================================
-- 1. Script INSERT into auth.users
-- 2. Trigger: on_auth_user_created automatically fires
-- 3. Trigger INSERT into public.users (with name, role, employee_id, etc.)
-- 4. Both tables now have user data ✅
-- 5. User can login AND has complete profile
