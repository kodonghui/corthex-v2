CREATE TYPE "public"."agent_tier" AS ENUM('manager', 'specialist', 'worker');--> statement-breakpoint
CREATE TYPE "public"."argos_event_status" AS ENUM('detected', 'executing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."classification" AS ENUM('public', 'internal', 'confidential', 'secret');--> statement-breakpoint
CREATE TYPE "public"."command_type" AS ENUM('direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork');--> statement-breakpoint
CREATE TYPE "public"."consensus_result" AS ENUM('consensus', 'dissent', 'partial');--> statement-breakpoint
CREATE TYPE "public"."cron_run_status" AS ENUM('running', 'success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."debate_status" AS ENUM('pending', 'in-progress', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."debate_type" AS ENUM('debate', 'deep-debate');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."memory_type" AS ENUM('learning', 'insight', 'preference', 'fact');--> statement-breakpoint
CREATE TYPE "public"."orchestration_task_status" AS ENUM('pending', 'running', 'completed', 'failed', 'timeout');--> statement-breakpoint
CREATE TYPE "public"."order_side" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending_approval', 'pending', 'submitted', 'executed', 'cancelled', 'rejected', 'failed');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('market', 'limit');--> statement-breakpoint
CREATE TYPE "public"."quality_result" AS ENUM('pass', 'fail');--> statement-breakpoint
CREATE TYPE "public"."trading_mode" AS ENUM('real', 'paper');--> statement-breakpoint
ALTER TYPE "public"."job_status" ADD VALUE 'blocked';--> statement-breakpoint
ALTER TYPE "public"."sns_platform" ADD VALUE 'twitter';--> statement-breakpoint
ALTER TYPE "public"."sns_platform" ADD VALUE 'facebook';--> statement-breakpoint
ALTER TYPE "public"."sns_platform" ADD VALUE 'naver_blog';--> statement-breakpoint
ALTER TYPE "public"."sns_status" ADD VALUE 'scheduled' BEFORE 'rejected';--> statement-breakpoint
CREATE TABLE "agent_delegation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"source_agent_id" uuid NOT NULL,
	"target_agent_id" uuid NOT NULL,
	"condition" jsonb NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"memory_type" "memory_type" DEFAULT 'learning' NOT NULL,
	"key" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"context" text,
	"source" varchar(50) DEFAULT 'manual' NOT NULL,
	"confidence" integer DEFAULT 50 NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archive_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "archive_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"command_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"classification" "classification" DEFAULT 'internal' NOT NULL,
	"content" text,
	"summary" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"folder_id" uuid,
	"quality_score" real,
	"agent_id" uuid,
	"department_id" uuid,
	"command_type" varchar(50),
	"command_text" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "argos_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"trigger_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_data" jsonb,
	"status" "argos_event_status" DEFAULT 'detected' NOT NULL,
	"command_id" uuid,
	"result" text,
	"error" text,
	"duration_ms" integer,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"actor_type" varchar(20) NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50),
	"target_id" uuid,
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"command_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_company_user_command_uniq" UNIQUE("company_id","user_id","command_id")
);
--> statement-breakpoint
CREATE TABLE "commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "command_type" DEFAULT 'direct' NOT NULL,
	"text" text NOT NULL,
	"target_agent_id" uuid,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"result" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_at" timestamp,
	CONSTRAINT "conversation_participants_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"name" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cron_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"cron_job_id" uuid NOT NULL,
	"status" "cron_run_status" DEFAULT 'running' NOT NULL,
	"command_text" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"result" text,
	"error" text,
	"duration_ms" integer,
	"tokens_used" integer,
	"cost_micro" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"debate_type" "debate_type" DEFAULT 'debate' NOT NULL,
	"status" "debate_status" DEFAULT 'pending' NOT NULL,
	"max_rounds" integer DEFAULT 2 NOT NULL,
	"participants" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rounds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"result" jsonb,
	"timeline" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" uuid NOT NULL,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doc_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doc_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text,
	"content_type" varchar(50) DEFAULT 'markdown' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"edited_by" uuid NOT NULL,
	"change_note" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "doc_versions_doc_version_uniq" UNIQUE("doc_id","version")
);
--> statement-breakpoint
CREATE TABLE "employee_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_departments_unique" UNIQUE("user_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"token" varchar(64) NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"invited_by" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "knowledge_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"folder_id" uuid,
	"title" varchar(500) NOT NULL,
	"content" text,
	"content_type" varchar(50) DEFAULT 'markdown' NOT NULL,
	"file_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"parent_id" uuid,
	"department_id" uuid,
	"created_by" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_folders_name_level_uniq" UNIQUE("company_id","name","parent_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"type" varchar(20) DEFAULT 'text' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orchestration_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"command_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"parent_task_id" uuid,
	"type" varchar(30) NOT NULL,
	"input" text,
	"output" text,
	"status" "orchestration_task_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_ms" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"name" varchar(100) NOT NULL,
	"description" text,
	"template_data" jsonb NOT NULL,
	"is_builtin" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"command" text NOT NULL,
	"category" varchar(50),
	"is_global" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_uniq" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "quality_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"command_id" uuid NOT NULL,
	"task_id" uuid,
	"reviewer_agent_id" uuid NOT NULL,
	"conclusion" "quality_result" NOT NULL,
	"scores" jsonb NOT NULL,
	"feedback" text,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sketch_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sketch_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"graph_data" jsonb DEFAULT '{"nodes":[],"edges":[]}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sketch_versions_sketch_version_uniq" UNIQUE("sketch_id","version")
);
--> statement-breakpoint
CREATE TABLE "sketches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"graph_data" jsonb DEFAULT '{"nodes":[],"edges":[]}' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soul_backups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"soul_markdown" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"source" varchar(30) DEFAULT 'soul-gym' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "soul_evolution_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"proposal_text" text NOT NULL,
	"analysis_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "soul_gym_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"round_num" integer DEFAULT 1 NOT NULL,
	"score_before" real DEFAULT 0 NOT NULL,
	"score_after" real DEFAULT 0 NOT NULL,
	"improvement" real DEFAULT 0 NOT NULL,
	"winner" varchar(30) NOT NULL,
	"cost_usd" real DEFAULT 0 NOT NULL,
	"variants_json" jsonb,
	"benchmark_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"portfolio_id" uuid,
	"agent_id" uuid,
	"ticker" varchar(20) NOT NULL,
	"ticker_name" varchar(100) NOT NULL,
	"side" "order_side" NOT NULL,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"order_type" "order_type" DEFAULT 'market' NOT NULL,
	"trading_mode" "trading_mode" DEFAULT 'paper' NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"kis_order_no" varchar(50),
	"executed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy_portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"trading_mode" "trading_mode" DEFAULT 'paper' NOT NULL,
	"initial_cash" integer DEFAULT 50000000 NOT NULL,
	"cash_balance" integer DEFAULT 50000000 NOT NULL,
	"holdings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_value" integer DEFAULT 50000000 NOT NULL,
	"memo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"workflow_id" uuid NOT NULL,
	"status" varchar(20) NOT NULL,
	"total_duration_ms" integer NOT NULL,
	"step_summaries" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"triggered_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "messenger_messages" DROP CONSTRAINT "messenger_messages_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "messenger_reactions" ALTER COLUMN "emoji" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "nexus_workflows" ALTER COLUMN "nodes" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "nexus_workflows" ALTER COLUMN "edges" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "sns_accounts" ALTER COLUMN "credentials" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "soul_templates" ALTER COLUMN "company_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "soul_templates" ALTER COLUMN "category" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "soul_templates" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_calls" ALTER COLUMN "session_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_calls" ALTER COLUMN "agent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_calls" ALTER COLUMN "tool_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "company_id" uuid;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "tier" "agent_tier" DEFAULT 'specialist' NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "name_en" varchar(100);--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "model_name" varchar(100) DEFAULT 'claude-haiku-4-5' NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "report_to" uuid;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "allowed_tools" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "auto_learn" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "attachment_ids" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "settings" jsonb;--> statement-breakpoint
ALTER TABLE "cost_records" ADD COLUMN "is_batch" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messenger_members" ADD COLUMN "last_read_at" timestamp;--> statement-breakpoint
ALTER TABLE "messenger_messages" ADD COLUMN "attachment_ids" text;--> statement-breakpoint
ALTER TABLE "night_job_schedules" ADD COLUMN "name" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "night_job_schedules" ADD COLUMN "last_run_at" timestamp;--> statement-breakpoint
ALTER TABLE "night_job_triggers" ADD COLUMN "name" varchar(200);--> statement-breakpoint
ALTER TABLE "night_job_triggers" ADD COLUMN "cooldown_minutes" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "night_jobs" ADD COLUMN "parent_job_id" uuid;--> statement-breakpoint
ALTER TABLE "night_jobs" ADD COLUMN "chain_id" uuid;--> statement-breakpoint
ALTER TABLE "sns_accounts" ADD COLUMN "account_id" varchar(200) NOT NULL;--> statement-breakpoint
ALTER TABLE "sns_accounts" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sns_accounts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sns_contents" ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sns_contents" ADD COLUMN "is_card_news" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sns_contents" ADD COLUMN "card_series_id" uuid;--> statement-breakpoint
ALTER TABLE "sns_contents" ADD COLUMN "card_index" integer;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN "is_builtin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "strategy_watchlists" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "telegram_configs" ADD COLUMN "webhook_secret" varchar(100);--> statement-breakpoint
ALTER TABLE "telegram_configs" ADD COLUMN "webhook_url" text;--> statement-breakpoint
ALTER TABLE "agent_delegation_rules" ADD CONSTRAINT "agent_delegation_rules_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_delegation_rules" ADD CONSTRAINT "agent_delegation_rules_source_agent_id_agents_id_fk" FOREIGN KEY ("source_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_delegation_rules" ADD CONSTRAINT "agent_delegation_rules_target_agent_id_agents_id_fk" FOREIGN KEY ("target_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_memories" ADD CONSTRAINT "agent_memories_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_memories" ADD CONSTRAINT "agent_memories_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_folders" ADD CONSTRAINT "archive_folders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_items" ADD CONSTRAINT "archive_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_items" ADD CONSTRAINT "archive_items_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_items" ADD CONSTRAINT "archive_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_items" ADD CONSTRAINT "archive_items_folder_id_archive_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."archive_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_items" ADD CONSTRAINT "archive_items_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archive_items" ADD CONSTRAINT "archive_items_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "argos_events" ADD CONSTRAINT "argos_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "argos_events" ADD CONSTRAINT "argos_events_trigger_id_night_job_triggers_id_fk" FOREIGN KEY ("trigger_id") REFERENCES "public"."night_job_triggers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commands" ADD CONSTRAINT "commands_target_agent_id_agents_id_fk" FOREIGN KEY ("target_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cron_runs" ADD CONSTRAINT "cron_runs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cron_runs" ADD CONSTRAINT "cron_runs_cron_job_id_night_job_schedules_id_fk" FOREIGN KEY ("cron_job_id") REFERENCES "public"."night_job_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debates" ADD CONSTRAINT "debates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debates" ADD CONSTRAINT "debates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_versions" ADD CONSTRAINT "doc_versions_doc_id_knowledge_docs_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."knowledge_docs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_versions" ADD CONSTRAINT "doc_versions_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_departments" ADD CONSTRAINT "employee_departments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_departments" ADD CONSTRAINT "employee_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_departments" ADD CONSTRAINT "employee_departments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_docs" ADD CONSTRAINT "knowledge_docs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_docs" ADD CONSTRAINT "knowledge_docs_folder_id_knowledge_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."knowledge_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_docs" ADD CONSTRAINT "knowledge_docs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_docs" ADD CONSTRAINT "knowledge_docs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_folders" ADD CONSTRAINT "knowledge_folders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_folders" ADD CONSTRAINT "knowledge_folders_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_folders" ADD CONSTRAINT "knowledge_folders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orchestration_tasks" ADD CONSTRAINT "orchestration_tasks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orchestration_tasks" ADD CONSTRAINT "orchestration_tasks_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orchestration_tasks" ADD CONSTRAINT "orchestration_tasks_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_templates" ADD CONSTRAINT "org_templates_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_templates" ADD CONSTRAINT "org_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presets" ADD CONSTRAINT "presets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presets" ADD CONSTRAINT "presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_reviews" ADD CONSTRAINT "quality_reviews_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_reviews" ADD CONSTRAINT "quality_reviews_command_id_commands_id_fk" FOREIGN KEY ("command_id") REFERENCES "public"."commands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_reviews" ADD CONSTRAINT "quality_reviews_task_id_orchestration_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."orchestration_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_reviews" ADD CONSTRAINT "quality_reviews_reviewer_agent_id_agents_id_fk" FOREIGN KEY ("reviewer_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketch_versions" ADD CONSTRAINT "sketch_versions_sketch_id_sketches_id_fk" FOREIGN KEY ("sketch_id") REFERENCES "public"."sketches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketches" ADD CONSTRAINT "sketches_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sketches" ADD CONSTRAINT "sketches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soul_backups" ADD CONSTRAINT "soul_backups_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soul_backups" ADD CONSTRAINT "soul_backups_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soul_evolution_proposals" ADD CONSTRAINT "soul_evolution_proposals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soul_evolution_proposals" ADD CONSTRAINT "soul_evolution_proposals_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soul_gym_rounds" ADD CONSTRAINT "soul_gym_rounds_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soul_gym_rounds" ADD CONSTRAINT "soul_gym_rounds_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_orders" ADD CONSTRAINT "strategy_orders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_orders" ADD CONSTRAINT "strategy_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_orders" ADD CONSTRAINT "strategy_orders_portfolio_id_strategy_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."strategy_portfolios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_orders" ADD CONSTRAINT "strategy_orders_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_portfolios" ADD CONSTRAINT "strategy_portfolios_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy_portfolios" ADD CONSTRAINT "strategy_portfolios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_triggered_by_users_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "delegation_rules_company_idx" ON "agent_delegation_rules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "delegation_rules_source_idx" ON "agent_delegation_rules" USING btree ("company_id","source_agent_id");--> statement-breakpoint
CREATE INDEX "agent_memories_company_idx" ON "agent_memories" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "agent_memories_agent_idx" ON "agent_memories" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_memories_type_idx" ON "agent_memories" USING btree ("memory_type");--> statement-breakpoint
CREATE INDEX "archive_folders_company_idx" ON "archive_folders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "archive_folders_parent_idx" ON "archive_folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "archive_items_company_idx" ON "archive_items" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "archive_items_command_uniq" ON "archive_items" USING btree ("company_id","command_id");--> statement-breakpoint
CREATE INDEX "archive_items_classification_idx" ON "archive_items" USING btree ("company_id","classification");--> statement-breakpoint
CREATE INDEX "archive_items_folder_idx" ON "archive_items" USING btree ("company_id","folder_id");--> statement-breakpoint
CREATE INDEX "archive_items_department_idx" ON "archive_items" USING btree ("company_id","department_id");--> statement-breakpoint
CREATE INDEX "argos_events_company_idx" ON "argos_events" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "argos_events_trigger_idx" ON "argos_events" USING btree ("trigger_id");--> statement-breakpoint
CREATE INDEX "argos_events_status_idx" ON "argos_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_logs_company_idx" ON "audit_logs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "audit_logs_company_action_idx" ON "audit_logs" USING btree ("company_id","action");--> statement-breakpoint
CREATE INDEX "audit_logs_company_created_idx" ON "audit_logs" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_company_target_idx" ON "audit_logs" USING btree ("company_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "bookmarks_company_user_idx" ON "bookmarks" USING btree ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "commands_company_idx" ON "commands" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "commands_company_user_idx" ON "commands" USING btree ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "commands_company_created_idx" ON "commands" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "conv_participants_user_conv_idx" ON "conversation_participants" USING btree ("user_id","conversation_id");--> statement-breakpoint
CREATE INDEX "cron_runs_company_idx" ON "cron_runs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "cron_runs_cron_job_idx" ON "cron_runs" USING btree ("cron_job_id");--> statement-breakpoint
CREATE INDEX "cron_runs_status_idx" ON "cron_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "debates_company_idx" ON "debates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "debates_status_idx" ON "debates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "doc_versions_doc_idx" ON "doc_versions" USING btree ("doc_id");--> statement-breakpoint
CREATE INDEX "employee_departments_company_idx" ON "employee_departments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "invitations_company_idx" ON "invitations" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "knowledge_docs_company_idx" ON "knowledge_docs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "knowledge_docs_folder_idx" ON "knowledge_docs" USING btree ("folder_id");--> statement-breakpoint
CREATE INDEX "knowledge_docs_created_by_idx" ON "knowledge_docs" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "knowledge_folders_company_idx" ON "knowledge_folders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "knowledge_folders_parent_idx" ON "knowledge_folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "knowledge_folders_department_idx" ON "knowledge_folders" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "messages_conv_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "orch_tasks_company_idx" ON "orchestration_tasks" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "orch_tasks_company_command_idx" ON "orchestration_tasks" USING btree ("company_id","command_id");--> statement-breakpoint
CREATE INDEX "orch_tasks_company_agent_idx" ON "orchestration_tasks" USING btree ("company_id","agent_id");--> statement-breakpoint
CREATE INDEX "org_templates_company_idx" ON "org_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "presets_company_idx" ON "presets" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "presets_company_user_idx" ON "presets" USING btree ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "quality_reviews_company_idx" ON "quality_reviews" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "quality_reviews_company_command_idx" ON "quality_reviews" USING btree ("company_id","command_id");--> statement-breakpoint
CREATE INDEX "sketch_versions_sketch_idx" ON "sketch_versions" USING btree ("sketch_id");--> statement-breakpoint
CREATE INDEX "sketches_company_idx" ON "sketches" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "sketches_created_by_idx" ON "sketches" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "soul_backups_agent_idx" ON "soul_backups" USING btree ("company_id","agent_id");--> statement-breakpoint
CREATE INDEX "soul_evolution_proposals_company_idx" ON "soul_evolution_proposals" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "soul_evolution_proposals_agent_status_idx" ON "soul_evolution_proposals" USING btree ("company_id","agent_id","status");--> statement-breakpoint
CREATE INDEX "soul_gym_rounds_company_idx" ON "soul_gym_rounds" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "soul_gym_rounds_agent_idx" ON "soul_gym_rounds" USING btree ("company_id","agent_id");--> statement-breakpoint
CREATE INDEX "strategy_orders_company_created_idx" ON "strategy_orders" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "strategy_orders_company_ticker_idx" ON "strategy_orders" USING btree ("company_id","ticker");--> statement-breakpoint
CREATE INDEX "strategy_orders_company_mode_status_idx" ON "strategy_orders" USING btree ("company_id","trading_mode","status");--> statement-breakpoint
CREATE INDEX "strategy_portfolios_company_user_idx" ON "strategy_portfolios" USING btree ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "strategy_portfolios_company_mode_idx" ON "strategy_portfolios" USING btree ("company_id","user_id","trading_mode");--> statement-breakpoint
CREATE INDEX "workflow_executions_company_idx" ON "workflow_executions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "workflow_executions_workflow_idx" ON "workflow_executions" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "workflow_executions_created_idx" ON "workflow_executions" USING btree ("workflow_id","created_at");--> statement-breakpoint
CREATE INDEX "workflows_company_idx" ON "workflows" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "workflows_is_active_idx" ON "workflows" USING btree ("company_id","is_active");--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sns_accounts" ADD CONSTRAINT "sns_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sns_contents" ADD CONSTRAINT "sns_contents_sns_account_id_sns_accounts_id_fk" FOREIGN KEY ("sns_account_id") REFERENCES "public"."sns_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soul_templates" ADD CONSTRAINT "soul_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cost_records_company_created_idx" ON "cost_records" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "cost_records_agent_idx" ON "cost_records" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "sns_accounts_company_idx" ON "sns_accounts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "soul_templates_company_idx" ON "soul_templates" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "tool_calls_company_created_idx" ON "tool_calls" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "tool_calls_agent_idx" ON "tool_calls" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "tool_calls_tool_name_idx" ON "tool_calls" USING btree ("tool_name");--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN "level";--> statement-breakpoint
ALTER TABLE "chat_messages" DROP COLUMN "file_id";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "parent_department_id";--> statement-breakpoint
ALTER TABLE "messenger_channels" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "messenger_channels" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "messenger_messages" DROP COLUMN "file_id";--> statement-breakpoint
ALTER TABLE "messenger_reactions" ADD CONSTRAINT "messenger_reactions_unique" UNIQUE("message_id","user_id","emoji");