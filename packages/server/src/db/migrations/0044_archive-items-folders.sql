-- Epic 17 Story 3: 기밀문서 API (아카이브/필터/유사 문서)

-- Classification enum
DO $$ BEGIN
  CREATE TYPE "classification" AS ENUM('public', 'internal', 'confidential', 'secret');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Archive folders table
CREATE TABLE IF NOT EXISTS "archive_folders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "name" varchar(200) NOT NULL,
  "parent_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "archive_folders_company_idx" ON "archive_folders" ("company_id");
CREATE INDEX IF NOT EXISTS "archive_folders_parent_idx" ON "archive_folders" ("parent_id");

-- Archive items table
CREATE TABLE IF NOT EXISTS "archive_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "command_id" uuid NOT NULL REFERENCES "commands"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "title" varchar(500) NOT NULL,
  "classification" "classification" DEFAULT 'internal' NOT NULL,
  "content" text,
  "summary" text,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "folder_id" uuid REFERENCES "archive_folders"("id"),
  "quality_score" real,
  "agent_id" uuid REFERENCES "agents"("id"),
  "department_id" uuid REFERENCES "departments"("id"),
  "command_type" varchar(50),
  "command_text" text,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

CREATE INDEX IF NOT EXISTS "archive_items_company_idx" ON "archive_items" ("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "archive_items_command_uniq" ON "archive_items" ("company_id", "command_id");
CREATE INDEX IF NOT EXISTS "archive_items_classification_idx" ON "archive_items" ("company_id", "classification");
CREATE INDEX IF NOT EXISTS "archive_items_folder_idx" ON "archive_items" ("company_id", "folder_id");
CREATE INDEX IF NOT EXISTS "archive_items_department_idx" ON "archive_items" ("company_id", "department_id");
