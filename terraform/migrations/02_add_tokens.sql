-- Migration: Add management_token to subscribers
-- Run this in Supabase SQL Editor after 01_initial_schema (supabase.sql)

-- Add management_token column for passwordless subscriber management
ALTER TABLE subscribers
ADD COLUMN management_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Backfill existing rows with tokens
UPDATE subscribers SET management_token = gen_random_uuid() WHERE management_token IS NULL;

-- Make the column NOT NULL after backfill
ALTER TABLE subscribers ALTER COLUMN management_token SET NOT NULL;

-- Index for fast token lookups (used in preferences page)
CREATE INDEX idx_subscribers_management_token ON subscribers(management_token);
