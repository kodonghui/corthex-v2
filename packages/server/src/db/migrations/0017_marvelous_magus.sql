CREATE TABLE "sns_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"platform" "sns_platform" NOT NULL,
	"account_name" varchar(100) NOT NULL,
	"credentials" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sns_contents" ADD COLUMN "sns_account_id" uuid;--> statement-breakpoint
ALTER TABLE "sns_contents" ADD COLUMN "variant_of" uuid;--> statement-breakpoint
ALTER TABLE "sns_contents" ADD COLUMN "scheduled_at" timestamp;--> statement-breakpoint
ALTER TABLE "sns_accounts" ADD CONSTRAINT "sns_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;