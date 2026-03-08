-- Story 9-2: Employee-Department mapping table
CREATE TABLE IF NOT EXISTS "employee_departments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "department_id" uuid NOT NULL REFERENCES "departments"("id"),
  "company_id" uuid NOT NULL REFERENCES "companies"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "employee_departments_unique" UNIQUE("user_id", "department_id")
);

CREATE INDEX IF NOT EXISTS "employee_departments_company_idx" ON "employee_departments" ("company_id");
