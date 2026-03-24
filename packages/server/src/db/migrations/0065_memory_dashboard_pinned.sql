-- Story 28.8: Add pinned column to agent_memories for CEO dashboard
ALTER TABLE agent_memories ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;
