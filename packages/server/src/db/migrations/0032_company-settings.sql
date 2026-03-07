-- Story 6-6: Add settings JSONB to companies table for quick actions config
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "settings" jsonb;
