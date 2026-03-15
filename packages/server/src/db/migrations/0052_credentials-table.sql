-- Story 16.2: Credentials DB Schema (D23, FR-CM1, FR-CM6)
-- Encrypted API key storage with company-scoped isolation and audit fields

CREATE TABLE credentials (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID        NOT NULL REFERENCES companies(id),
  key_name             TEXT        NOT NULL,
  encrypted_value      TEXT        NOT NULL,
  created_by_user_id   TEXT,
  updated_by_user_id   TEXT,
  created_at           TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Company-scoped index for fast lookups
CREATE INDEX credentials_company_idx ON credentials(company_id);

-- Unique constraint: each company can only have one credential per key_name
ALTER TABLE credentials ADD CONSTRAINT credentials_company_key_uniq UNIQUE (company_id, key_name);
