-- Add timeline column to debates table for event replay
ALTER TABLE debates ADD COLUMN IF NOT EXISTS timeline jsonb NOT NULL DEFAULT '[]'::jsonb;
