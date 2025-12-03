-- CRED Application - Complete Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ENABLE EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. USERS TABLE (ALREADY CREATED)
-- ============================================

-- Users table already exists with this structure:
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('staff', 'advisor')),
    avatar TEXT,
    department VARCHAR(100),
    employee_id VARCHAR(50),
    phone VARCHAR(20),
    joined_classes JSONB DEFAULT '[]'::jsonb,
    cred_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing indexes for existing users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_cred_points ON users(cred_points DESC);

-- ============================================
-- 3. CLASSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_code VARCHAR(50) UNIQUE NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    semester VARCHAR(50),
    academic_year VARCHAR(20),
    advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_students INTEGER DEFAULT 0, -- Maximum capacity
    current_enrollment INTEGER DEFAULT 0, -- Current enrolled count
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for classes table
CREATE INDEX IF NOT EXISTS idx_classes_code ON classes(class_code);
CREATE INDEX IF NOT EXISTS idx_classes_advisor ON classes(advisor_id);
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department);

-- ============================================
-- 4. STUDENTS TABLE (REMOVED - No students in this project)
-- ============================================

-- Students table removed as project is staff and advisor only
-- Staff members will be tracked in users table with role='staff'

-- ============================================
-- 5. REQUESTS TABLE (Staff Work Requests)
-- ============================================

CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    work_description TEXT NOT NULL,
    requested_points INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'correction')),
    response_message TEXT,
    approved_points INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- Indexes for requests table
CREATE INDEX IF NOT EXISTS idx_requests_staff ON requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_requests_advisor ON requests(advisor_id);
CREATE INDEX IF NOT EXISTS idx_requests_class ON requests(class_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at DESC);

-- ============================================
-- 6. ACTIVITIES TABLE (Activity History for Staff)
-- ============================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('credit', 'debit', 'request_approved', 'request_rejected', 'request_correction')),
    description TEXT NOT NULL,
    points INTEGER NOT NULL,
    related_request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activities table
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('request_submitted', 'request_approved', 'request_rejected', 'request_correction')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    request_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 8. AUTO-UPDATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to classes table
DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to students table (REMOVED - no students)
-- DROP TRIGGER IF EXISTS update_students_updated_at ON students;
-- CREATE TRIGGER update_students_updated_at
--     BEFORE UPDATE ON students
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- Apply to requests table
DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. AUTO PASSWORD HASHING TRIGGER
-- ============================================

-- Function to auto-hash passwords
CREATE OR REPLACE FUNCTION hash_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if password doesn't start with $2 (not already hashed)
  IF NEW.password IS NOT NULL AND NEW.password NOT LIKE '$2%' THEN
    NEW.password := crypt(NEW.password, gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT
DROP TRIGGER IF EXISTS hash_password_on_insert ON users;
CREATE TRIGGER hash_password_on_insert
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION hash_password();

-- Trigger for UPDATE
DROP TRIGGER IF EXISTS hash_password_on_update ON users;
CREATE TRIGGER hash_password_on_update
  BEFORE UPDATE OF password ON users
  FOR EACH ROW
  WHEN (OLD.password IS DISTINCT FROM NEW.password)
  EXECUTE FUNCTION hash_password();

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY; -- REMOVED - no students
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Allow public read access" ON users;
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated updates" ON users;
CREATE POLICY "Allow authenticated updates" ON users FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for new users" ON users;
CREATE POLICY "Allow insert for new users" ON users FOR INSERT WITH CHECK (true);

-- Classes table policies
DROP POLICY IF EXISTS "Allow public read classes" ON classes;
CREATE POLICY "Allow public read classes" ON classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow advisors to manage classes" ON classes;
CREATE POLICY "Allow advisors to manage classes" ON classes FOR ALL USING (true) WITH CHECK (true);

-- Students table policies (REMOVED - no students in this project)
-- DROP POLICY IF EXISTS "Allow public read students" ON students;
-- CREATE POLICY "Allow public read students" ON students FOR SELECT USING (true);

-- DROP POLICY IF EXISTS "Allow manage students" ON students;
-- CREATE POLICY "Allow manage students" ON students FOR ALL USING (true) WITH CHECK (true);

-- Requests table policies
DROP POLICY IF EXISTS "Allow public read requests" ON requests;
CREATE POLICY "Allow public read requests" ON requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow manage requests" ON requests;
CREATE POLICY "Allow manage requests" ON requests FOR ALL USING (true) WITH CHECK (true);

-- Activities table policies
DROP POLICY IF EXISTS "Allow public read activities" ON activities;
CREATE POLICY "Allow public read activities" ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert activities" ON activities;
CREATE POLICY "Allow insert activities" ON activities FOR INSERT WITH CHECK (true);

-- Notifications table policies
DROP POLICY IF EXISTS "Allow users read own notifications" ON notifications;
CREATE POLICY "Allow users read own notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert notifications" ON notifications;
CREATE POLICY "Allow insert notifications" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users update own notifications" ON notifications;
CREATE POLICY "Allow users update own notifications" ON notifications FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users delete own notifications" ON notifications;
CREATE POLICY "Allow users delete own notifications" ON notifications FOR DELETE USING (true);

-- ============================================
-- 11. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample users (passwords will auto-hash)
INSERT INTO users (email, password, name, role, department, employee_id, cred_points) VALUES
    ('advisor@gmail.com', 'password', 'Dr. HOD', 'advisor', 'Computer Science', 'EMP001', 0),
    ('staff@gmail.com', 'password', 'John Staff', 'staff', 'Computer Science', 'EMP002', 850)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 12. VERIFICATION QUERIES
-- ============================================

-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- View sample users
SELECT id, email, name, role, department, employee_id, cred_points, LEFT(password, 20) as password_hash 
FROM users;
