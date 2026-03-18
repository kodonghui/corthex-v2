-- Fix: workflow_suggestions table may exist without suggested_steps column
-- if 0056 ran as CREATE TABLE IF NOT EXISTS on a pre-existing table
ALTER TABLE "workflow_suggestions" ADD COLUMN IF NOT EXISTS "suggested_steps" jsonb NOT NULL DEFAULT '[]'::jsonb;
