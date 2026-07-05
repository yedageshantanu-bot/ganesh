-- ============================================================
-- Ganesh Tajane World - Supabase SQL Setup
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the traveler_messages table
CREATE TABLE IF NOT EXISTS traveler_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  city_country TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE traveler_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages (public access)
CREATE POLICY "Allow public read access" ON traveler_messages
  FOR SELECT
  USING (true);

-- Allow anyone to insert messages (public access)
CREATE POLICY "Allow public insert access" ON traveler_messages
  FOR INSERT
  WITH CHECK (true);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_traveler_messages_created_at 
  ON traveler_messages(created_at DESC);

-- ============================================================
-- Optional: Insert a sample message for testing
-- ============================================================
-- INSERT INTO traveler_messages (full_name, city_country, rating, message)
-- VALUES ('Sample Traveler', 'Mumbai, India', 5, 'A beautiful spiritual journey!');
-- ============================================================