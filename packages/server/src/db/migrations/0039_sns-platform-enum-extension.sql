-- Story 12-3: Extend sns_platform enum with twitter, facebook, naver_blog
-- These must be outside a transaction (Drizzle handles this)

ALTER TYPE sns_platform ADD VALUE IF NOT EXISTS 'twitter';
ALTER TYPE sns_platform ADD VALUE IF NOT EXISTS 'facebook';
ALTER TYPE sns_platform ADD VALUE IF NOT EXISTS 'naver_blog';
