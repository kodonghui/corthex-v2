CREATE TYPE "public"."activity_phase" AS ENUM('start', 'end', 'error');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('superadmin', 'admin');--> statement-breakpoint
CREATE TYPE "public"."api_key_scope" AS ENUM('company', 'user');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"in_app" boolean DEFAULT true NOT NULL,
	"email" boolean DEFAULT false NOT NULL,
	"push" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tool_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"name" varchar(100) NOT NULL,
	"description" text,
	"scope" "tool_scope" DEFAULT 'platform' NOT NULL,
	"input_schema" jsonb,
	"handler" varchar(100),
	"config" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tools" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tools" CASCADE;--> statement-breakpoint
ALTER TABLE "agent_tools" DROP CONSTRAINT "agent_tools_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "tool_calls" DROP CONSTRAINT "tool_calls_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "event_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "agent_id" uuid;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD COLUMN "phase" "activity_phase" NOT NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "credentials" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "scope" "api_key_scope" NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_definitions" ADD CONSTRAINT "tool_definitions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_prefs_company_idx" ON "notification_preferences" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sessions_company_idx" ON "sessions" USING btree ("company_id");--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tools" ADD CONSTRAINT "agent_tools_tool_id_tool_definitions_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tool_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_calls" ADD CONSTRAINT "tool_calls_tool_id_tool_definitions_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tool_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_company_created_idx" ON "activity_logs" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_type_idx" ON "activity_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "activity_metadata_gin_idx" ON "activity_logs" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "agent_tools_company_idx" ON "agent_tools" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "api_keys_company_idx" ON "api_keys" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "chat_messages_session_created_idx" ON "chat_messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "chat_messages_company_idx" ON "chat_messages" USING btree ("company_id");--> statement-breakpoint
ALTER TABLE "api_keys" DROP COLUMN "encrypted_key";--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_event_id_unique" UNIQUE("event_id");