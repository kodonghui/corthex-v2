ALTER TABLE "telegram_configs" ADD COLUMN "webhook_secret" varchar(100);
ALTER TABLE "telegram_configs" ADD COLUMN "webhook_url" text;
