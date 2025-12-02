-- Migration: Add RLS policies for subscribers table
-- Run this in Supabase SQL Editor

-- Allow anonymous users to insert new subscribers (for subscription form)
CREATE POLICY "Allow anonymous insert" ON subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to select their own record by management_token (for preferences page)
CREATE POLICY "Allow select by management_token" ON subscribers
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to update their own record by id (for preferences form)
CREATE POLICY "Allow update own record" ON subscribers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
