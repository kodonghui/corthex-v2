# Story 12.2: Marketing Tools 3종 구현 (hashtag_generator, content_calendar, engagement_analyzer)

Status: done

## Story

As a 마케팅 부서 AI 에이전트,
I want SNS 마케팅에 특화된 3가지 도구(해시태그 생성기, 콘텐츠 캘린더 플래너, 참여도 분석기)를 사용할 수 있기를,
so that 콘텐츠의 노출을 극대화하고 최적 게시 시간을 계획하며 게시물 성과를 체계적으로 분석할 수 있다.

## Acceptance Criteria

1. **해시태그 생성기 (hashtag_generator)**: 콘텐츠 텍스트와 플랫폼(instagram/youtube/tiktok/linkedin)을 입력하면 카테고리별(대형/중형/소형) 최적 해시태그 세트를 추천한다. action: recommend(추천), analyze(분석), trending(인기).
2. **콘텐츠 캘린더 플래너 (content_calendar)**: 플랫폼별 최적 게시 시간대를 기반으로 주간/월간 콘텐츠 게시 일정을 자동 생성한다. action: plan(일정 생성), optimal_times(최적 시간대), weekly(주간 계획), monthly(월간 계획).
3. **참여도 분석기 (engagement_analyzer)**: 게시물의 성과 지표(좋아요/공유/댓글/도달/클릭)를 분석하여 참여율, 성장률, 콘텐츠 유형별 비교를 제공한다. action: analyze(단일 분석), compare(비교), trend(추이), benchmark(벤치마크).
4. **ToolPool 레지스트리 등록**: 3개 도구가 `registry.register()`로 등록되어 에이전트가 사용 가능하다.
5. **기존 도구 패턴 준수**: 각 도구는 `ToolHandler` 타입 시그니처(input, ctx) → Promise<string> | string을 따르며, JSON.stringify로 구조화된 결과를 반환한다.
6. **v1 기능 커버**: v1 hashtag_recommender의 카테고리 매칭, 플랫폼별 규칙(max_tags, ratio), 주제 기반 커스텀 해시태그 생성 기능을 모두 포함한다.
7. **에러 처리**: 필수 파라미터 누락 시 명확한 안내 메시지를 JSON으로 반환한다.

## Tasks / Subtasks

- [x] Task 1: 해시태그 생성기 구현 (AC: #1, #5, #6, #7)
  - [x] `packages/server/src/lib/tool-handlers/builtins/hashtag-generator.ts` 생성
  - [x] HASHTAG_DB: 카테고리별(교육/금융/기술/라이프스타일/마케팅/건강) 대형/중형/소형 해시태그 DB (v1 포트)
  - [x] PLATFORM_RULES: 플랫폼별 max_tags, optimal_tags, 대형/중형/소형 ratio, tip (v1 포트 + linkedin 추가)
  - [x] action="recommend": topic + platform → 카테고리 매칭 → ratio 기반 해시태그 조합 → JSON 결과
  - [x] action="analyze": 쉼표 구분 해시태그 → 카테고리/규모 분류 → 효용성 평가
  - [x] action="trending": 카테고리별 인기 해시태그 목록 반환
  - [x] _findCategory(): 주제 키워드 → 카테고리 매칭 (v1 로직 포트)
  - [x] _generateTopicHashtags(): 주제에서 커스텀 해시태그 생성 (v1 로직 포트)
- [x] Task 2: 콘텐츠 캘린더 플래너 구현 (AC: #2, #5, #7)
  - [x] `packages/server/src/lib/tool-handlers/builtins/content-calendar.ts` 생성
  - [x] OPTIMAL_POSTING_TIMES: 플랫폼별 요일+시간대 최적 게시 시간 데이터 (업계 연구 기반)
  - [x] CONTENT_TYPE_FREQUENCY: 콘텐츠 유형별 권장 게시 빈도
  - [x] action="plan": topic + platform + period(week/month) + postsPerWeek → 게시 일정 자동 생성
  - [x] action="optimal_times": platform → 요일/시간별 최적 게시 시간대 반환
  - [x] action="weekly": startDate + platforms + topics → 주간 캘린더 생성
  - [x] action="monthly": month + platforms → 월간 캘린더 + 특별일(마케팅 이벤트) 포함
- [x] Task 3: 참여도 분석기 구현 (AC: #3, #5, #7)
  - [x] `packages/server/src/lib/tool-handlers/builtins/engagement-analyzer.ts` 생성
  - [x] action="analyze": metrics(likes/shares/comments/reach/clicks/followers) → 참여율, 바이럴 계수, 클릭률 계산
  - [x] action="compare": 다수 게시물 metrics 비교 → 성과 순위, 카테고리별 평균
  - [x] action="trend": 시계열 metrics 배열 → 성장률, 추세선, 이상치 감지
  - [x] action="benchmark": metrics + platform → 업계 평균 대비 등급 (상위 10%/25%/50%/하위)
  - [x] 참여율 공식: (likes + comments + shares) / reach * 100
  - [x] 바이럴 계수: shares / (likes + comments) (1 이상이면 바이럴)
- [x] Task 4: ToolPool 레지스트리 등록 (AC: #4)
  - [x] `packages/server/src/lib/tool-handlers/index.ts` 수정
  - [x] import 3개 도구 추가
  - [x] registry.register('hashtag_generator', hashtagGenerator)
  - [x] registry.register('content_calendar', contentCalendar)
  - [x] registry.register('engagement_analyzer', engagementAnalyzer)

## Dev Notes

### v1 참고 파일 (필수)

| v1 파일 | v2 포트 대상 | 핵심 기능 |
|---------|-------------|----------|
| `/home/ubuntu/CORTHEX_HQ/src/src/src/src/tools/hashtag_recommender.py` | hashtag-generator.ts | HASHTAG_DB, PLATFORM_RULES, _find_category, _generate_topic_hashtags, recommend/analyze/trending |
| `/home/ubuntu/CORTHEX_HQ/src/src/src/src/tools/content_quality_scorer.py` | engagement-analyzer.ts | 참여도 계산 패턴, 구조적 분석 패턴 |
| `/home/ubuntu/CORTHEX_HQ/src/src/src/src/tools/marketing_attribution.py` | engagement-analyzer.ts | 채널별 성과 분석 패턴 |

### 도구 핸들러 패턴 (반드시 준수)

```typescript
// 타입: packages/server/src/lib/tool-handlers/types.ts
export type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolExecContext,
) => Promise<string> | string

// 레지스트리: packages/server/src/lib/tool-handlers/registry.ts
// 등록: packages/server/src/lib/tool-handlers/index.ts

// 모든 도구는:
// 1. ToolHandler 타입 준수 (input, ctx) → string | Promise<string>
// 2. 결과는 JSON.stringify()로 반환
// 3. 에러는 { success: false, message: '...' } 형태
// 4. 성공은 { success: true, ...data } 형태
// 5. action 패턴: String(input.action || 'default')
```

### 기존 유사 도구 참고

- `sentiment-analyzer.ts` — 한국어 사전 기반 분석, action 분기 패턴
- `get-instagram-insights.ts` — ctx.getCredentials 사용, async 패턴
- `search-web.ts` — 외부 API 호출 패턴

### 이 스토리에서 외부 API 호출 없음

3개 도구 모두 **로컬 계산** 기반. 외부 API 호출 없음. v1의 Instagram 게시물 수 조회 (`_fetch_instagram_tag_count`)는 제외 — 차단 위험 + 불필요.

### v1 대비 v2 개선점

| v1 | v2 |
|----|-----|
| Python (BaseTool 상속) | TypeScript (ToolHandler 함수) |
| LLM 호출 (`_llm_call`) 포함 | 순수 로컬 계산 (LLM은 AgentRunner에서 처리) |
| Instagram API 직접 조회 | 로컬 DB만 사용 (외부 의존성 제거) |
| hashtag_recommender만 존재 | hashtag_generator + content_calendar + engagement_analyzer 3종 |
| 없음 | 콘텐츠 캘린더 (플랫폼별 최적 시간) |
| 없음 | 참여도 분석 (참여율, 바이럴 계수, 벤치마크) |

### Project Structure Notes

- 도구 파일 위치: `packages/server/src/lib/tool-handlers/builtins/`
- 파일명 규칙: kebab-case (예: `hashtag-generator.ts`)
- export 규칙: named export (예: `export const hashtagGenerator: ToolHandler`)
- 등록 파일: `packages/server/src/lib/tool-handlers/index.ts`
- 테스트 위치: `packages/server/src/__tests__/unit/`
- 테스트 프레임워크: bun:test

### 12-1 스토리 인텔리전스

- Story 12-1에서 SNS 콘텐츠 관리 API 완료 (974줄 라우트, 450 테스트)
- `snsContents` 테이블에 hashtags 컬럼, platform enum 이미 존재
- AI 생성 시 해시태그 자동 생성 기능이 이미 있지만 도구로는 미등록
- 이 스토리는 API 라우트가 아닌 **도구 시스템에 마케팅 도구 추가**가 핵심
- 라우트 수정 불필요 — tool-handlers만 작업

### References

- [Source: packages/server/src/lib/tool-handlers/types.ts] — ToolHandler 타입 정의
- [Source: packages/server/src/lib/tool-handlers/registry.ts] — HandlerRegistry 클래스
- [Source: packages/server/src/lib/tool-handlers/index.ts] — 전체 등록 목록
- [Source: packages/server/src/lib/tool-handlers/builtins/sentiment-analyzer.ts] — 한국어 사전 기반 분석 패턴
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/tools/hashtag_recommender.py] — v1 해시태그 추천기
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/tools/marketing_attribution.py] — v1 마케팅 기여도 분석
- [Source: /home/ubuntu/CORTHEX_HQ/src/src/src/src/tools/content_quality_scorer.py] — v1 콘텐츠 품질 채점
- [Source: _bmad-output/planning-artifacts/epics.md#Epic12] — Epic 12 스펙
- [Source: _bmad-output/implementation-artifacts/12-1-sns-content-management-api.md] — Story 12-1 완료 기록

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 2026-03-08: 3개 마케팅 도구 구현 완료, 66 테스트 전부 통과

### Completion Notes List

- hashtag_generator: v1 HASHTAG_DB/PLATFORM_RULES/카테고리매칭 완전 포트 + 마케팅/건강 카테고리 추가 + linkedin 플랫폼 추가
- content_calendar: 플랫폼 4종(instagram/youtube/tiktok/linkedin) 요일+시간대 최적 게시 시간 데이터, 마케팅 이벤트 캘린더, 콘텐츠 유형별 빈도 가이드
- engagement_analyzer: 참여율/바이럴계수/클릭률 계산, 다수 게시물 비교, 시계열 추세 분석(이상치 감지), 플랫폼별 업계 벤치마크(5플랫폼)
- 3개 도구 모두 ToolHandler 패턴 준수 (input, ctx) → string, JSON.stringify 반환
- 외부 API 호출 없음 — 모든 계산 로컬
- 66개 단위 테스트 작성, 0 실패

### Change Log

- 2026-03-08: dev-story 완료 — 3개 마케팅 도구 구현 + 레지스트리 등록 + 66 테스트
- 2026-03-08: TEA 완료 — 37 추가 엣지케이스 테스트 (총 103)
- 2026-03-08: code-review 완료 — 0 HIGH, 3 MEDIUM (모두 수용), 3 LOW, File List 업데이트

### File List

- `packages/server/src/lib/tool-handlers/builtins/hashtag-generator.ts` (신규, 해시태그 생성기)
- `packages/server/src/lib/tool-handlers/builtins/content-calendar.ts` (신규, 콘텐츠 캘린더 플래너)
- `packages/server/src/lib/tool-handlers/builtins/engagement-analyzer.ts` (신규, 참여도 분석기)
- `packages/server/src/lib/tool-handlers/index.ts` (수정, 3개 도구 import + register)
- `packages/server/src/__tests__/unit/marketing-tools.test.ts` (신규, 66 테스트)
- `packages/server/src/__tests__/unit/marketing-tools-tea.test.ts` (신규, TEA 37 테스트)
