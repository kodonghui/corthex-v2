-- ESC-002: Make agents.user_id nullable (agents can be created without a user)
ALTER TABLE agents ALTER COLUMN user_id DROP NOT NULL;
