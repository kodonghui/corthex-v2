-- SNS 멀티 계정 지원 (Story 14-4)

CREATE TABLE IF NOT EXISTS sns_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  platform sns_platform NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_id VARCHAR(200) NOT NULL,
  credentials TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sns_accounts_company_idx ON sns_accounts(company_id);

ALTER TABLE sns_contents ADD COLUMN IF NOT EXISTS sns_account_id UUID REFERENCES sns_accounts(id);
