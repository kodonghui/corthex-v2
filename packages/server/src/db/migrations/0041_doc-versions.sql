-- Doc Versions table for document versioning (Story 16-2)
CREATE TABLE IF NOT EXISTS "doc_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "doc_id" uuid NOT NULL REFERENCES "knowledge_docs"("id"),
  "version" integer NOT NULL,
  "title" varchar(500) NOT NULL,
  "content" text,
  "content_type" varchar(50) NOT NULL DEFAULT 'markdown',
  "tags" jsonb DEFAULT '[]',
  "edited_by" uuid NOT NULL REFERENCES "users"("id"),
  "change_note" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "doc_versions_doc_idx" ON "doc_versions" ("doc_id");
CREATE UNIQUE INDEX IF NOT EXISTS "doc_versions_doc_version_uniq" ON "doc_versions" ("doc_id", "version");
