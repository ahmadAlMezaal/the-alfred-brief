-- The Alfred Brief - Database Schema
-- Run this in Supabase SQL Editor

-- Subscribers table: stores user emails and their topic preferences
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    preferences_json JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News items table: stores scraped articles and summaries
CREATE TABLE news_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    summary TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sent logs table: tracks sent emails for idempotency
CREATE TABLE sent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    email_id TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, email_id)
);

-- Indexes for common queries
CREATE INDEX idx_subscribers_active ON subscribers(active);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_news_items_category ON news_items(category);
CREATE INDEX idx_news_items_scraped_at ON news_items(scraped_at);
CREATE INDEX idx_sent_logs_date ON sent_logs(date);

-- Row Level Security (enable after setting up auth policies)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_logs ENABLE ROW LEVEL SECURITY;
