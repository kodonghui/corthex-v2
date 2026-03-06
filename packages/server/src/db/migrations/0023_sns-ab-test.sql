ALTER TABLE sns_contents ADD COLUMN variant_of UUID REFERENCES sns_contents(id) ON DELETE SET NULL;
CREATE INDEX sns_contents_variant_of_idx ON sns_contents(variant_of);
