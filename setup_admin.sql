-- ============================================================
-- Ganesh Tajane World - Admin Panel Setup
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Step 1: Add approved column to traveler_messages table
ALTER TABLE traveler_messages 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Step 2: Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Allow admin login (public can check credentials)
CREATE POLICY "Allow admin login" ON admin_users
  FOR SELECT
  USING (true);

-- Step 5: Update traveler_messages RLS - only show approved to public
DROP POLICY IF EXISTS "Allow public read access" ON traveler_messages;
CREATE POLICY "Allow public read approved" ON traveler_messages
  FOR SELECT
  USING (approved = true);

-- Step 6: Allow admin to read all messages
CREATE POLICY "Allow admin read all" ON traveler_messages
  FOR SELECT
  USING (true);

-- Step 7: Allow admin to update messages (approve/delete)
CREATE POLICY "Allow admin update" ON traveler_messages
  FOR UPDATE
  USING (true);

-- Step 8: Allow admin to delete messages
CREATE POLICY "Allow admin delete" ON traveler_messages
  FOR DELETE
  USING (true);

-- Step 9: Create index for approved status
CREATE INDEX IF NOT EXISTS idx_traveler_messages_approved 
  ON traveler_messages(approved);

-- ============================================================
-- Step 10: Insert default admin credentials
-- Email: admin@ganesh.com
-- Password: Ganesh@Admin2024
-- ============================================================
INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@ganesh.com', 'Ganesh@Admin2024')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Optional: Approve all existing messages
-- ============================================================
-- UPDATE traveler_messages SET approved = true WHERE approved = false;

-- ============================================================
-- Verify setup
-- ============================================================
SELECT 'Admin setup complete!' as status;
SELECT COUNT(*) as total_messages FROM traveler_messages;
SELECT COUNT(*) as approved_messages FROM traveler_messages WHERE approved = true;
SELECT email FROM admin_users;
