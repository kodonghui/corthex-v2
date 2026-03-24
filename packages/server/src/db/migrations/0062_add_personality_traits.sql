-- Story 24.1: Add personality_traits JSONB to agents table
-- Big Five (OCEAN): openness, conscientiousness, extraversion, agreeableness, neuroticism
-- Each value: integer 0-100. NULL allowed for backward compatibility.
-- Rollback: ALTER TABLE agents DROP COLUMN IF EXISTS personality_traits;
-- Note: ::int cast silently truncates floats (3.7→3). API Zod enforces .int() upstream,
-- but direct SQL inserts should use integer literals only.

ALTER TABLE agents ADD COLUMN IF NOT EXISTS personality_traits JSONB
  CONSTRAINT chk_personality_traits_valid CHECK (personality_traits IS NULL OR (
    jsonb_typeof(personality_traits) = 'object'
    AND personality_traits ?& ARRAY['openness','conscientiousness','extraversion','agreeableness','neuroticism']
    AND (SELECT count(*) FROM jsonb_object_keys(personality_traits)) = 5
    AND (personality_traits->>'openness')::int BETWEEN 0 AND 100
    AND (personality_traits->>'conscientiousness')::int BETWEEN 0 AND 100
    AND (personality_traits->>'extraversion')::int BETWEEN 0 AND 100
    AND (personality_traits->>'agreeableness')::int BETWEEN 0 AND 100
    AND (personality_traits->>'neuroticism')::int BETWEEN 0 AND 100
  ));
