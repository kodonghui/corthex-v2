-- Add 'pending_approval' to order_status enum for approval execution mode (Story 10-5)
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending_approval';
