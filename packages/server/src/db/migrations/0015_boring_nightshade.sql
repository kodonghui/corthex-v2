CREATE TABLE "strategy_note_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"shared_with_user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "strategy_note_shares_unique" UNIQUE("note_id","shared_with_user_id")
);
--> statement-breakpoint
ALTER TABLE "strategy_note_shares" ADD CONSTRAINT "strategy_note_shares_note_id_strategy_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."strategy_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_note_shares" ADD CONSTRAINT "strategy_note_shares_shared_with_user_id_users_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_note_shares" ADD CONSTRAINT "strategy_note_shares_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "strategy_note_shares_user_idx" ON "strategy_note_shares" USING btree ("company_id","shared_with_user_id");