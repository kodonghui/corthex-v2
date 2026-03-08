-- Migration: 0037_bookmarks-table
-- Story: 17-1 Operation Log API - Bookmarks

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  command_id UUID NOT NULL REFERENCES commands(id),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX bookmarks_company_user_idx ON bookmarks(company_id, user_id);
CREATE UNIQUE INDEX bookmarks_company_user_command_uniq ON bookmarks(company_id, user_id, command_id);
