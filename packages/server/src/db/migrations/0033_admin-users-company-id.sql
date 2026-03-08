-- Story 9-1: Add companyId and email to admin_users for company_admin association
ALTER TABLE "admin_users" ADD COLUMN "company_id" uuid REFERENCES "companies"("id");
ALTER TABLE "admin_users" ADD COLUMN "email" varchar(255);
