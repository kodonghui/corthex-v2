CREATE TABLE IF NOT EXISTS "sketches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "name" varchar(200) NOT NULL,
  "graph_data" jsonb DEFAULT '{"nodes":[],"edges":[]}' NOT NULL,
  "created_by" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "sketches_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action,
  CONSTRAINT "sketches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "sketches_company_idx" ON "sketches" USING btree ("company_id");
CREATE INDEX IF NOT EXISTS "sketches_created_by_idx" ON "sketches" USING btree ("created_by");
