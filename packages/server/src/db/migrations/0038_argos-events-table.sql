-- ARGOS Events Table + nightJobTriggers extensions
-- Story 14-3: ARGOS Trigger Condition Auto-Collect

-- Add new columns to night_job_triggers
ALTER TABLE night_job_triggers ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE night_job_triggers ADD COLUMN IF NOT EXISTS cooldown_minutes INTEGER NOT NULL DEFAULT 30;

-- Create argos event status enum
DO $$ BEGIN
  CREATE TYPE argos_event_status AS ENUM ('detected', 'executing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create argos_events table
CREATE TABLE IF NOT EXISTS argos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  trigger_id UUID NOT NULL REFERENCES night_job_triggers(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  status argos_event_status NOT NULL DEFAULT 'detected',
  command_id UUID,
  result TEXT,
  error TEXT,
  duration_ms INTEGER,
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS argos_events_company_idx ON argos_events(company_id);
CREATE INDEX IF NOT EXISTS argos_events_trigger_idx ON argos_events(trigger_id);
CREATE INDEX IF NOT EXISTS argos_events_status_idx ON argos_events(status);
