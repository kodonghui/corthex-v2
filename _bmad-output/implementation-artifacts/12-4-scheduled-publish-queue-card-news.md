# Story 12.4: 예약 발행 큐 + 카드뉴스

Status: done

## Story

As a CEO/관리자,
I want 예약 발행 큐를 모니터링하고 카드뉴스 시리즈(5~10장)를 생성/일괄 발행할 수 있기를,
so that SNS 콘텐츠를 시간별로 관리하고 캐러셀/시리즈 형태로 효과적인 마케팅을 할 수 있다.

## Acceptance Criteria

1. **예약 큐 대시보드 API**: 예약된/대기중/완료/실패 콘텐츠를 상태별/플랫폼별로 조회할 수 있다
2. **큐 우선순위**: priority 필드로 같은 시간대 콘텐츠의 발행 순서를 제어한다
3. **배치 예약**: 여러 콘텐츠를 한 번에 예약하고 일괄 상태 변경이 가능하다
4. **카드뉴스 시리즈 생성**: 5~10장의 카드를 하나의 시리즈로 생성한다 (제목, 이미지, 캡션 개별 설정)
5. **AI 카드뉴스 자동 생성**: 주제 입력 → AI가 시리즈 전체(커버/내용/클로징) 자동 생성
6. **카드뉴스 플랫폼별 발행**: Instagram=캐러셀, Tistory/Naver Blog=포스트 내 이미지 순열, Twitter/Facebook=첫 이미지+링크
7. **카드뉴스 예약 발행**: 카드뉴스 시리즈도 scheduledAt으로 예약 발행 가능
8. **시리즈 상태 관리**: 시리즈 전체가 하나의 발행 단위로 승인/반려/발행된다

## Tasks / Subtasks

- [x] Task 1: 스키마 확장 (AC: #1, #2, #4)
  - [x] 1.1 snsContents 테이블에 priority (integer, default 0), isCardNews (boolean), cardSeriesId (uuid self-ref), cardIndex (integer) 추가
  - [x] 1.2 마이그레이션 파일 생성
  - [x] 1.3 shared types 업데이트

- [x] Task 2: 예약 큐 대시보드 API (AC: #1, #2, #3)
  - [x] 2.1 GET /api/workspace/sns/queue — 예약 큐 조회 (status=scheduled, 정렬: scheduledAt+priority)
  - [x] 2.2 GET /api/workspace/sns/queue/stats — 큐 통계 (상태별/플랫폼별 카운트, 다음 발행 시간)
  - [x] 2.3 POST /api/workspace/sns/batch-schedule — 여러 콘텐츠 일괄 예약 (ids[] + scheduledAt)
  - [x] 2.4 POST /api/workspace/sns/batch-cancel — 여러 콘텐츠 일괄 예약 취소

- [x] Task 3: 카드뉴스 시리즈 CRUD (AC: #4, #8)
  - [x] 3.1 POST /api/workspace/sns/card-series — 카드뉴스 시리즈 생성 (title, description, cards[{imageUrl, caption, layout}])
  - [x] 3.2 GET /api/workspace/sns/card-series/:id — 시리즈 상세 (모든 카드 포함)
  - [x] 3.3 PUT /api/workspace/sns/card-series/:id/cards/:index — 개별 카드 수정
  - [x] 3.4 DELETE /api/workspace/sns/card-series/:id — 시리즈 삭제 (draft만)
  - [x] 3.5 POST /api/workspace/sns/card-series/:id/reorder — 카드 순서 변경

- [x] Task 4: AI 카드뉴스 자동 생성 (AC: #5)
  - [x] 4.1 POST /api/workspace/sns/card-series/generate — 주제+플랫폼+장수 → AI 시리즈 생성
  - [x] 4.2 슬라이드 타입별 생성: cover(볼드 제목) → content(핵심 포인트) → closing(CTA)
  - [x] 4.3 DALL-E 이미지 생성: 시리즈 전체 시각 일관성 유지 프롬프트
  - [x] 4.4 metadata.cards[] 배열에 각 카드 정보 저장

- [x] Task 5: 카드뉴스 플랫폼별 발행 (AC: #6, #7)
  - [x] 5.1 Instagram: 캐러셀 발행 (container per image → carousel container → publish)
  - [x] 5.2 Tistory: HTML 포스트에 이미지 순열 삽입
  - [x] 5.3 Naver Blog: SmartEditor HTML에 이미지 순열 삽입
  - [x] 5.4 Twitter: 첫 이미지만 발행 (캐러셀 미지원)
  - [x] 5.5 Facebook: 첫 이미지+링크 발행
  - [x] 5.6 PublishEngine에 카드뉴스 분기 로직 추가
  - [x] 5.7 sns-schedule-checker에서 카드뉴스 시리즈 발행 지원

- [x] Task 6: 시리즈 승인 플로우 (AC: #8)
  - [x] 6.1 POST /api/workspace/sns/card-series/:id/submit — 시리즈 전체 승인 요청
  - [x] 6.2 POST /api/workspace/sns/card-series/:id/approve — 시리즈 전체 승인
  - [x] 6.3 POST /api/workspace/sns/card-series/:id/reject — 시리즈 전체 반려

## Dev Notes

### 기존 구현 현황 (수정/확장 대상)

**이미 완료된 것:**
- `packages/server/src/routes/workspace/sns.ts` (1048줄) — 전체 SNS CRUD + 승인 플로우 + A/B 테스트
- `packages/server/src/lib/sns-schedule-checker.ts` — 60초 폴링, scheduled+scheduledAt<=now 자동 발행
- `packages/server/src/lib/sns-publishers/publish-engine.ts` — 5개 플랫폼 publisher 레지스트리, credential 복호화, rate limit, 3회 재시도
- `packages/server/src/lib/sns-image-generator.ts` — DALL-E 3 이미지 생성
- `packages/server/src/db/schema.ts` — snsContents(id, companyId, platform, title, body, hashtags, imageUrl, status, scheduledAt, metadata jsonb 등), snsAccounts

**아직 없는 것 (이번 스토리에서 구현):**
- 카드뉴스 시리즈 (다중 이미지/캡션 콘텐츠)
- 발행 큐 대시보드 API (큐 조회/통계)
- 우선순위 + 배치 예약
- 플랫폼별 캐러셀/시리즈 발행 로직

### 스키마 확장 가이드

```typescript
// packages/server/src/db/schema.ts — snsContents 테이블에 추가
priority: integer('priority').default(0),           // 높을수록 먼저 발행
isCardNews: boolean('is_card_news').default(false),  // 카드뉴스 여부
cardSeriesId: uuid('card_series_id'),                // 시리즈 루트 콘텐츠 ID (self-ref)
cardIndex: integer('card_index'),                    // 시리즈 내 순서 (0-based)

// metadata jsonb 활용 (카드뉴스 시리즈일 때):
// {
//   "cards": [
//     { "index": 0, "imageUrl": "...", "caption": "커버 슬라이드", "layout": "cover" },
//     { "index": 1, "imageUrl": "...", "caption": "핵심 포인트 1", "layout": "content" },
//     ...
//     { "index": 9, "imageUrl": "...", "caption": "CTA", "layout": "closing" }
//   ],
//   "totalCards": 10,
//   "seriesTitle": "시리즈 제목"
// }
```

### API 패턴 (기존 sns.ts 패턴 따르기)

- 모든 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 페이지네이션: `{ success: true, data: [], pagination: { page, limit, total } }`
- 인증: `authMiddleware` → `c.get('user')` → companyId 테넌트 격리
- 상태 전이: draft → pending → approved/scheduled → published/failed
- 카드뉴스 상태: 시리즈 루트 콘텐츠(isCardNews=true, cardIndex=null)의 상태가 전체 상태를 대표
- 개별 카드(cardSeriesId=루트ID, cardIndex=0,1,2...)는 루트 상태 따라감

### v1 카드뉴스 핵심 로직 (반드시 참고)

**v1 위치:** `/home/ubuntu/CORTHEX_HQ/src/tools/gemini_image_generator.py` (lines 338-470)

1. **시리즈 생성 패턴**: cover(볼드 제목) → content(핵심 포인트, 여러 장) → closing(CTA)
2. **시각 일관성 프롬프트**: "Slide X of N, IMPORTANT: Maintain consistent visual identity — same color palette, typography style, layout structure, design language across ALL slides"
3. **Instagram 캐러셀**: `/home/ubuntu/CORTHEX_HQ/src/tools/sns/instagram_publisher.py`
   - `_publish_carousel()`: 각 이미지당 container 생성(is_carousel_item=true) → carousel container → publish
   - 최대 10장, 60초 timeout
4. **media_urls 배열**: 카드뉴스와 SNS 발행의 브릿지 — 이미지 URL 배열로 전달

### 플랫폼별 카드뉴스 발행 전략

| 플랫폼 | 전략 | 구현 방식 |
|--------|------|----------|
| Instagram | 캐러셀 (최대 10장) | Graph API: image containers → carousel container → publish |
| Tistory | 블로그 포스트 + 이미지 순열 | Open API: HTML 본문에 `<img>` 태그 순서대로 삽입 |
| Naver Blog | 블로그 포스트 + 이미지 순열 | Selenium: SmartEditor HTML에 이미지 삽입 |
| Twitter | 첫 이미지 + 본문 | OAuth API: 단일 이미지 첨부 (캐러셀 미지원) |
| Facebook | 첫 이미지 + 본문 | Graph API: photos endpoint 단일 이미지 |

### 기존 Publisher 확장 포인트

- `packages/server/src/lib/sns-publishers/types.ts` — PlatformPublisher 인터페이스에 `publishCarousel?(input, credentials)` 추가
- `packages/server/src/lib/sns-publishers/instagram-publisher.ts` — Graph API v21.0 캐러셀 로직 추가
- `packages/server/src/lib/sns-publishers/publish-engine.ts` — isCardNews 분기: cards[] → 플랫폼별 처리

### sns-schedule-checker 확장

```typescript
// packages/server/src/lib/sns-schedule-checker.ts 수정:
// 1. 카드뉴스 시리즈도 조회 대상에 포함 (isCardNews=true AND cardIndex IS NULL)
// 2. 시리즈 발행 시 모든 카드 이미지 URL을 배열로 수집
// 3. PublishEngine에 카드 배열 전달
// 4. priority 정렬 추가: ORDER BY scheduledAt ASC, priority DESC
```

### 테스트 전략

- 단위 테스트 위치: `packages/server/src/__tests__/unit/`
- 테스트 프레임워크: bun:test
- 기존 SNS 테스트 참고: `sns-content-management.test.ts` (78), `sns-publishers.test.ts` (56), `marketing-tools.test.ts` (66)
- 테스트 대상:
  - 카드뉴스 시리즈 CRUD (생성/조회/수정/삭제/순서변경)
  - AI 카드뉴스 생성 (시리즈 구조 검증)
  - 플랫폼별 발행 분기 (Instagram 캐러셀, Tistory HTML, 등)
  - 예약 큐 조회/통계/배치
  - 우선순위 정렬 검증
  - 시리즈 승인 플로우 (submit→approve→scheduled→published)
  - 에지 케이스: 빈 시리즈, 11장 이상 거부, 이미지 없는 카드

### Project Structure Notes

- 라우트: `packages/server/src/routes/workspace/sns.ts` 기존 파일에 엔드포인트 추가
- Publisher: `packages/server/src/lib/sns-publishers/` 디렉토리 내 기존 publisher 확장
- 스키마: `packages/server/src/db/schema.ts` snsContents 테이블 확장
- 마이그레이션: `packages/server/src/db/migrations/` 새 마이그레이션 파일
- 공유 타입: `packages/shared/src/types/` SNS 관련 타입 업데이트
- 테스트: `packages/server/src/__tests__/unit/` 새 테스트 파일

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Epic 12 SNS Publishing]
- [Source: _bmad-output/planning-artifacts/architecture.md - routes/sns.ts, tools/marketing/]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - CEO #8 SNS 통신국, Hootsuite/Buffer 영감]
- [Source: _bmad-output/planning-artifacts/prd.md - FR65 SNS 5개 플랫폼 발행]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/src/tools/gemini_image_generator.py - card_news_series 구현]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/src/tools/sns/instagram_publisher.py - _publish_carousel]
- [Source: v1 /home/ubuntu/CORTHEX_HQ/src/tools/sns/sns_manager.py - 승인 플로우]
- [Source: Story 12-1 구현 노트 - SNS 콘텐츠 API 전체 기능]
- [Source: Story 12-2 구현 노트 - Marketing 도구 3종]
- [Source: Story 12-3 구현 노트 - 5개 플랫폼 publisher + PublishEngine]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Build: server+shared 빌드 성공 (654 modules bundled)
- Tests: 54 신규 + 78 기존 SNS + 56 publisher + 66 marketing = 254 테스트, 0 실패

### Completion Notes List

- Task 1: snsContents 스키마에 priority, isCardNews, cardSeriesId, cardIndex 추가. 마이그레이션 0043 생성. shared types에 CardNewsCard, CardSeriesMetadata, QueueStats 타입 추가. SnsPlatform에 twitter/facebook/naver_blog 추가.
- Task 2: 예약 큐 조회(GET /sns/queue), 큐 통계(GET /sns/queue/stats), 배치 예약(POST /sns/batch-schedule), 배치 취소(POST /sns/batch-cancel) 구현. priority DESC + scheduledAt ASC 정렬.
- Task 3: 카드뉴스 시리즈 CRUD — 생성(POST /sns/card-series), 상세(GET /sns/card-series/:id), 카드 수정(PUT /sns/card-series/:id/cards/:index), 삭제(DELETE /sns/card-series/:id), 순서변경(POST /sns/card-series/:id/reorder). metadata.cards[] 배열로 카드 정보 저장.
- Task 4: AI 카드뉴스 생성(POST /sns/card-series/generate) — cover→content→closing 구조, DALL-E 시각 일관성 프롬프트, JSON 파싱 실패 시 기본 구조 생성.
- Task 5: Instagram 캐러셀 발행(carousel_item containers → carousel container → publish, 최대 10장). PublishEngine에 isCardNews 분기 + mediaUrls 전달. sns-schedule-checker에서 cardSeriesId=null 필터 + priority 정렬 + mediaUrls 수집.
- Task 6: 시리즈 승인 플로우 — submit(draft→pending), approve(pending→approved/scheduled), reject(pending→rejected). scheduledAt 유무에 따른 상태 분기.

### File List

- `packages/server/src/db/schema.ts` (수정 — snsContents에 priority/isCardNews/cardSeriesId/cardIndex 추가, 릴레이션 추가)
- `packages/server/src/db/migrations/0043_sns-card-news-queue.sql` (신규 — 마이그레이션)
- `packages/shared/src/types.ts` (수정 — SnsPlatform 확장, SnsContent 필드 추가, CardNewsCard/CardSeriesMetadata/QueueStats 타입 추가)
- `packages/server/src/routes/workspace/sns.ts` (수정 — 큐 대시보드 4개 + 카드뉴스 CRUD 5개 + AI 생성 1개 + 승인 플로우 3개 = 13개 엔드포인트 추가)
- `packages/server/src/lib/sns-publishers/types.ts` (수정 — PublishInput에 mediaUrls 추가)
- `packages/server/src/lib/sns-publishers/instagram-publisher.ts` (수정 — publishCarousel 함수 추가, 캐러셀 발행 지원)
- `packages/server/src/lib/sns-publishers/publish-engine.ts` (수정 — isCardNews 분기 + mediaUrls 수집)
- `packages/server/src/lib/sns-publisher.ts` (수정 — SnsContentInput에 account/mediaUrls 추가)
- `packages/server/src/lib/sns-schedule-checker.ts` (수정 — priority 정렬 + cardSeriesId=null 필터 + 카드뉴스 mediaUrls 전달)
- `packages/server/src/__tests__/unit/sns-card-news-queue.test.ts` (신규 — 54개 단위 테스트)
- `packages/server/src/__tests__/unit/sns-card-news-queue-tea.test.ts` (신규 — 53개 TEA 리스크 기반 테스트)
