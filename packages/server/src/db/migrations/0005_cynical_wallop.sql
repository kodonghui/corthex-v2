CREATE INDEX "agents_company_idx" ON "agents" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "chat_sessions_company_idx" ON "chat_sessions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "departments_company_idx" ON "departments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "report_lines_company_idx" ON "report_lines" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "tool_definitions_company_idx" ON "tool_definitions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "users_company_idx" ON "users" USING btree ("company_id");