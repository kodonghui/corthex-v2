CREATE TABLE "strategy_backtest_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"stock_code" varchar(20) NOT NULL,
	"strategy_type" varchar(50) NOT NULL,
	"strategy_params" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"signals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"data_range" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "strategy_backtest_results" ADD CONSTRAINT "strategy_backtest_results_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_backtest_results" ADD CONSTRAINT "strategy_backtest_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strategy_backtest_company_idx" ON "strategy_backtest_results" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "strategy_backtest_user_stock_idx" ON "strategy_backtest_results" USING btree ("company_id","user_id","stock_code");