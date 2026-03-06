ALTER TYPE "public"."job_status" ADD VALUE 'blocked';--> statement-breakpoint
ALTER TABLE "mcp_servers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messenger_reactions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "nexus_executions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "nexus_workflows" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sns_accounts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "soul_templates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "mcp_servers" CASCADE;--> statement-breakpoint
DROP TABLE "messenger_reactions" CASCADE;--> statement-breakpoint
DROP TABLE "nexus_executions" CASCADE;--> statement-breakpoint
DROP TABLE "nexus_workflows" CASCADE;--> statement-breakpoint
DROP TABLE "sns_accounts" CASCADE;--> statement-breakpoint
DROP TABLE "soul_templates" CASCADE;--> statement-breakpoint
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "messenger_messages" DROP CONSTRAINT "messenger_messages_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "night_jobs" ADD COLUMN "parent_job_id" uuid;--> statement-breakpoint
ALTER TABLE "night_jobs" ADD COLUMN "chain_id" uuid;--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN "level";--> statement-breakpoint
ALTER TABLE "chat_messages" DROP COLUMN "file_id";--> statement-breakpoint
ALTER TABLE "departments" DROP COLUMN "parent_department_id";--> statement-breakpoint
ALTER TABLE "messenger_channels" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "messenger_channels" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "messenger_messages" DROP COLUMN "parent_message_id";--> statement-breakpoint
ALTER TABLE "messenger_messages" DROP COLUMN "file_id";--> statement-breakpoint
ALTER TABLE "sns_contents" DROP COLUMN "sns_account_id";--> statement-breakpoint
ALTER TABLE "sns_contents" DROP COLUMN "variant_of";--> statement-breakpoint
ALTER TABLE "sns_contents" DROP COLUMN "scheduled_at";