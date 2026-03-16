CREATE TABLE IF NOT EXISTS "workflow_suggestions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "reason" text NOT NULL,
  "suggested_steps" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "workflow_suggestions_company_user_idx" ON "workflow_suggestions" ("company_id", "user_id");
CREATE INDEX IF NOT EXISTS "workflow_suggestions_status_idx" ON "workflow_suggestions" ("company_id", "status");
