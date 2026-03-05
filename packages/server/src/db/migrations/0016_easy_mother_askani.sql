ALTER TABLE "agents" ADD COLUMN "level" varchar(20) DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "file_id" uuid;--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "parent_department_id" uuid;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;