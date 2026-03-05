CREATE TABLE "strategy_watchlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"stock_code" varchar(20) NOT NULL,
	"stock_name" varchar(100) NOT NULL,
	"market" varchar(10) DEFAULT 'KOSPI' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "strategy_watchlists_user_stock_uniq" UNIQUE("company_id","user_id","stock_code")
);
--> statement-breakpoint
ALTER TABLE "strategy_watchlists" ADD CONSTRAINT "strategy_watchlists_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_watchlists" ADD CONSTRAINT "strategy_watchlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strategy_watchlists_company_idx" ON "strategy_watchlists" USING btree ("company_id");