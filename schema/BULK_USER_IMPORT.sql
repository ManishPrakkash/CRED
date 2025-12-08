-- ===================================================================
-- BULK USER IMPORT SCRIPT
-- ===================================================================
-- This script adds users to auth.users with employee_id as password
-- The auto-sync trigger then creates/updates profiles in public.users
-- Use this for bulk importing employees with default password = employee_id
-- ===================================================================

-- IMPORTANT: Replace project_id with your actual Supabase project instance ID
-- Find it at: Supabase Dashboard > Settings > API > Project ID (JWT Secret section)
-- Or run: SELECT id FROM auth.instances LIMIT 1;

DO $$
DECLARE
    v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1);
    v_user_id UUID;
BEGIN
    -- Example bulk insert for 60 members (customize email, name, employee_id as needed)
    -- Each user gets employee_id as their default password
    
    -- User 1
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user
    ) VALUES (
        gen_random_uuid(),
        v_project_id,
        'emp001@example.com',
        crypt('EMP001', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Employee 1","employee_id":"EMP001","department":"Engineering","role":"staff"}',
        false
    ) RETURNING id INTO v_user_id;
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text),
        'email',
        NOW(),
        NOW()
    );

    -- User 2
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user
    ) VALUES (
        gen_random_uuid(),
        v_project_id,
        'emp002@example.com',
        crypt('EMP002', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Employee 2","employee_id":"EMP002","department":"Engineering","role":"staff"}',
        false
    ) RETURNING id INTO v_user_id;
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text),
        'email',
        NOW(),
        NOW()
    );

    -- User 3
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user
    ) VALUES (
        gen_random_uuid(),
        v_project_id,
        'emp003@example.com',
        crypt('EMP003', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Employee 3","employee_id":"EMP003","department":"HR","role":"staff"}',
        false
    ) RETURNING id INTO v_user_id;
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text),
        'email',
        NOW(),
        NOW()
    );

    -- User 4
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user
    ) VALUES (
        gen_random_uuid(),
        v_project_id,
        'emp004@example.com',
        crypt('EMP004', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Employee 4","employee_id":"EMP004","department":"Sales","role":"staff"}',
        false
    ) RETURNING id INTO v_user_id;
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text),
        'email',
        NOW(),
        NOW()
    );

    -- User 5
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user
    ) VALUES (
        gen_random_uuid(),
        v_project_id,
        'emp005@example.com',
        crypt('EMP005', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Employee 5","employee_id":"EMP005","department":"Marketing","role":"staff"}',
        false
    ) RETURNING id INTO v_user_id;
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text),
        'email',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Users created successfully. Auto-sync trigger will create public.users profiles.';

END $$;

-- ===================================================================
-- VERIFY USERS CREATED
-- ===================================================================
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'name' AS name,
    u.raw_user_meta_data->>'employee_id' AS employee_id,
    u.raw_user_meta_data->>'department' AS department,
    u.raw_user_meta_data->>'role' AS role,
    u.created_at
FROM auth.users u
WHERE u.email LIKE 'emp%@example.com'
ORDER BY u.created_at DESC;

-- Verify public.users profiles were created by trigger
SELECT 
    id,
    email,
    name,
    employee_id,
    department,
    role,
    created_at
FROM public.users
WHERE email LIKE 'emp%@example.com'
ORDER BY created_at DESC;

-- ===================================================================
-- TEMPLATE FOR ADDING MORE USERS
-- ===================================================================
-- Copy this block and replace the values:
/*
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.instances LIMIT 1),
    'empXXX@example.com',
    crypt('EMPXXX', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Employee Name","employee_id":"EMPXXX","department":"Department","role":"staff"}',
    false
) RETURNING id INTO v_user_id;

INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text),
    'email',
    NOW(),
    NOW()
);
*/
