-- Story 5.1: Add owner_user_id to agents + unique partial index for secretary

-- Add owner_user_id column (nullable FK to users)
ALTER TABLE "agents" ADD COLUMN "owner_user_id" uuid REFERENCES "users"("id");--> statement-breakpoint

-- Unique partial index: max 1 secretary per company
CREATE UNIQUE INDEX "agents_secretary_unique" ON "agents" ("company_id") WHERE "is_secretary" = true;
