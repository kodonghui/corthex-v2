-- Story 12-4: 예약 발행 큐 + 카드뉴스 스키마 확장
ALTER TABLE sns_contents ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0;
ALTER TABLE sns_contents ADD COLUMN IF NOT EXISTS is_card_news boolean NOT NULL DEFAULT false;
ALTER TABLE sns_contents ADD COLUMN IF NOT EXISTS card_series_id uuid;
ALTER TABLE sns_contents ADD COLUMN IF NOT EXISTS card_index integer;

-- 인덱스: 예약 큐 조회 최적화 (scheduled 상태 + scheduledAt + priority)
CREATE INDEX IF NOT EXISTS idx_sns_scheduled_queue ON sns_contents (status, scheduled_at, priority DESC) WHERE status = 'scheduled';

-- 인덱스: 카드뉴스 시리즈 조회
CREATE INDEX IF NOT EXISTS idx_sns_card_series ON sns_contents (card_series_id, card_index) WHERE card_series_id IS NOT NULL;
