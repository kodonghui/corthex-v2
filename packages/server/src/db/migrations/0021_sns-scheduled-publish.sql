-- Add 'scheduled' status to sns_status enum
ALTER TYPE sns_status ADD VALUE IF NOT EXISTS 'scheduled' AFTER 'approved';

-- Add scheduled_at column to sns_contents
ALTER TABLE sns_contents ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;
