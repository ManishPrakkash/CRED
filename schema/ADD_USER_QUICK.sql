# ⚡ QUICK: Add New User with Complete Data

## Copy-Paste Ready

```sql
DO $$
DECLARE
    v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1);
    v_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user)
    VALUES (v_user_id, v_project_id, 'USER_EMAIL', crypt('USER_PASSWORD', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"USER_NAME","employee_id":"EMP_ID","department":"DEPT","role":"ROLE"}', false);
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, jsonb_build_object('sub', v_user_id::text), 'email', v_user_id::text, NOW(), NOW());
    
    RAISE NOTICE 'User created!';
END $$;
```

## Replace These 6 Values

```
USER_EMAIL       → 'john@company.com'
USER_PASSWORD    → 'password123'
USER_NAME        → 'John Doe'
EMP_ID           → 'EMP101'
DEPT             → 'Engineering'
ROLE             → 'staff' or 'advisor'
```

## Example

```sql
DO $$
DECLARE v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1); v_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user)
    VALUES (v_user_id, v_project_id, 'john@company.com', crypt('John@123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"John Doe","employee_id":"EMP101","department":"Engineering","role":"staff"}', false);
    
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at) VALUES (gen_random_uuid(), v_user_id, jsonb_build_object('sub', v_user_id::text), 'email', v_user_id::text, NOW(), NOW());
    
    RAISE NOTICE '✅ User: john@company.com / John@123';
END $$;
```

## Verify

```sql
-- Check both tables
SELECT 
    u.email, 
    pu.name, 
    pu.employee_id, 
    pu.role,
    CASE WHEN pu.id IS NOT NULL THEN '✅ Complete' ELSE '❌ Missing' END
FROM auth.users u
LEFT JOIN public.users pu ON pu.id = u.id
WHERE u.email = 'john@company.com';
```

## What Happens

1. ✅ User created in auth.users
2. ✅ Auth identity created
3. ✅ **Trigger auto-creates public.users profile**
4. ✅ User ready to login + has full profile

---

## 3 More Examples

### Example 1: Sarah (HR)
```sql
DO $$
DECLARE v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1); v_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user)
    VALUES (v_user_id, v_project_id, 'sarah@company.com', crypt('Sarah@456', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Sarah Smith","employee_id":"EMP102","department":"HR","role":"staff"}', false);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at) VALUES (gen_random_uuid(), v_user_id, jsonb_build_object('sub', v_user_id::text), 'email', v_user_id::text, NOW(), NOW());
END $$;
```

### Example 2: Mike (Advisor/Manager)
```sql
DO $$
DECLARE v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1); v_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user)
    VALUES (v_user_id, v_project_id, 'mike@company.com', crypt('Mike@789', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Mike Johnson","employee_id":"EMP103","department":"Management","role":"advisor"}', false);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at) VALUES (gen_random_uuid(), v_user_id, jsonb_build_object('sub', v_user_id::text), 'email', v_user_id::text, NOW(), NOW());
END $$;
```

### Example 3: Emma (Sales)
```sql
DO $$
DECLARE v_project_id UUID := (SELECT id FROM auth.instances LIMIT 1); v_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user)
    VALUES (v_user_id, v_project_id, 'emma@company.com', crypt('Emma@321', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Emma Brown","employee_id":"EMP104","department":"Sales","role":"staff"}', false);
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at) VALUES (gen_random_uuid(), v_user_id, jsonb_build_object('sub', v_user_id::text), 'email', v_user_id::text, NOW(), NOW());
END $$;
```

---

## Test in App

```
Login: john@company.com
Password: John@123
✅ Should show profile with: John Doe, EMP101, Engineering
```

---

## Files Reference

- **CREATE_NEW_USER.sql** - Template (documented)
- **ADD_NEW_USER_GUIDE.md** - Detailed guide
- **FIX_USER_DATA_SYNC.md** - Problem & solution
- **This file** - Quick reference

**Use this file for quick copy-paste!** 🚀
