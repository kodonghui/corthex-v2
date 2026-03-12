---
type: architecture-addendum
epic: 'Epic 15 — 3-Layer Caching'
baseDocument: _bmad-output/planning-artifacts/architecture.md
inputDocuments:
  - _bmad-output/planning-artifacts/epic-15-caching-brief.md
  - _bmad-output/planning-artifacts/epic-15-prd-addendum.md
  - _research/tool-reports/05-caching-strategy.md
  - _bmad-output/context-snapshots/epic-15-prd-s1-complete.md
  - _bmad-output/context-snapshots/epic-15-prd-s2-complete.md
author: BMAD Writer Agent
date: '2026-03-12'
status: draft
partyModeRounds: 0
---

# Architecture Addendum: Epic 15 — 3-Layer Caching

> 기존 architecture.md(D1~D16)에 Epic 15 캐싱 아키텍처 결정을 추가하는 공식 문서.
> 포맷은 architecture.md 기존 결정 테이블과 동일.

---

## Section 1: Architecture Decisions Update

### D8 Extension — DB 쿼리 캐싱 → 캐싱 전략 명확화

**기존 D8 (수정 전):**

| # | 결정 | 선택 | 근거 |
|---|------|------|------|
| D8 | 캐싱 | **없음** (Phase 1~4) | 24GB 서버, 12쿼리 × 1ms = 12ms (LLM 응답 대비 0.1%) |

**수정 후 D8:**

| # | 결정 | 선택 | 근거 |
|---|------|------|------|
| D8 | DB 쿼리 캐싱 | **없음** (Phase 1~4 유지) | 24GB 서버, 12쿼리 × 1ms = 12ms (LLM 응답 대비 0.1%). **Epic 15의 Claude API 토큰 캐싱 · 도구 결과 캐싱 · Semantic 캐싱은 D8 적용 범위(DB 쿼리 캐싱) 밖 별도 레이어로 추가 — D8 위반 아님.** D8 "캐싱 없음"은 DB 쿼리에 한정된 결정임이 명확. |

**수정 근거:**
D8 원문은 DB 쿼리 응답 시간(12ms)이 LLM 응답 대비 무시할 수준이라는 이유로 DB 캐싱 불필요를 결정한 것이다. Claude API 토큰 비용($27/월 Soul 반복 과금), 외부 도구 API 중복 호출, 유사 쿼리 LLM 재추론은 D8 결정 시점에 고려하지 않은 별개 레이어이다. Epic 15 캐싱 도입은 D8 결정의 전제(DB 쿼리 캐싱 불필요)를 유지하면서 Claude API 레이어 효율화를 추가한다.

---

### D13 조기 해제 — Deferred → Epic 15 구현

**기존 D13 (수정 전):**

| # | 결정 | 이유 |
|---|------|------|
| D13 | 캐싱 전략 | 에이전트 100명+ 시 재검토 |

**수정 후 D13 — Important Decisions로 이동 (더 이상 Deferred 아님):**

| # | 결정 | 선택 | 근거 |
|---|------|------|------|
| D13 | Claude API · 도구 · Semantic 캐싱 전략 | **Epic 15에서 조기 구현** (Phase 1~3 전체 적용) | 조기 해제 근거: Prompt Cache는 에이전트 수와 무관, 단 1줄 수정으로 $27/월 즉각 절감 가능. "에이전트 100명+" 조건 폐기. D8(DB 쿼리 캐싱 없음) 위반 아님 — 별개 레이어. Phase 4+ Redis 전환은 D21로 별도 Deferred 등록 |

**D21 신규 Deferred (Phase 4+):**

| # | 결정 | 이유 |
|---|------|------|
| D21 | Tool Cache Redis 전환 | 단일 서버(Phase 1~3)에서는 인메모리 Map으로 충분. 다중 서버 배포(Phase 4+) 전환 시 프로세스 간 캐시 공유 필요 → Redis 도입. `lib/tool-cache.ts`의 `cacheStore` 구현체만 교체, `withCache()` API 유지 |

---

### 신규 아키텍처 결정 D17~D20

> **번호 갭 설명:** D13(Epic 15 조기 구현 — 위 참조), D14(토큰 풀 — 현재 1:1 매핑 충분, Phase 5+ Deferred), D15(크로스 프로바이더 폴백 — Phase 1~4 Claude 전용, Deferred), D16(API 버저닝 — Phase 1~4 단일 버전, Deferred)은 기존 `architecture.md` Deferred Decisions 참조. D17~D20은 Epic 15 신규 결정.

기존 Important Decisions (D7~D13) 목록에 추가:

| # | 결정 | 선택 | 근거 |
|---|------|------|------|
| D17 | Prompt Cache 전략 | **`cache_control: { type: 'ephemeral' }` ContentBlock 형식** — `agent-loop.ts`의 `systemPrompt`를 `string` → `ContentBlock[]`으로 변경. TTL ephemeral(5분) 기본, 배포 30일 후 히트율 기반 1시간 전환 수동 결정 | Claude Agent SDK `query()`가 `ContentBlock[]` systemPrompt를 지원하는지 PoC 선행 필수. 실패 시 `anthropic.messages.create()` 직접 호출로 동일 효과 달성. Soul + 도구 정의 토큰 비용 85% 절감, TTFT 85% 단축 (Anthropic 공식 수치). 전체 에이전트 일괄 적용 — 에이전트별 on/off 없음 (응답 내용에 영향 없음) |
| D18 | Tool Cache 위치 | **`packages/server/src/lib/tool-cache.ts`** — `engine/` 밖 `lib/`에 배치 | `lib/`는 순수 유틸리티 레이어 — E8 engine 경계 적용 범위 외, 도구 핸들러에서 직접 import 가능. Phase 4 Redis 전환 시 `withCache()` API 유지, `cacheStore = { get, set, delete }` 구현체만 교체. `engine/` 내부 배치 시 E8 경계 위반 발생 (도구 핸들러가 engine 내부를 직접 import해야 하므로) |
| D19 | Semantic Cache 위치 | **`packages/server/src/engine/semantic-cache.ts`** — `engine/` 내부, `agent-loop.ts`를 통해서만 접근 | E8 경계 준수: `engine/` 공개 API는 `agent-loop.ts` + `types.ts`만 허용. `engine/semantic-cache.ts`는 `agent-loop.ts` 전용 내부 모듈. CI `engine-boundary-check.sh`에 위반 탐지 패턴 추가 필수. `getDB(companyId)` E3 패턴 강제: `engine/semantic-cache.ts`는 `db/scoped-query.ts` 프록시를 통해서만 DB 접근 |
| D20 | 캐시 companyId 격리 | **모든 캐시 레이어에 `companyId` 포함 필수** — Tool Cache 키: `${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}`, Semantic Cache: `getDB(companyId)` + SQL `WHERE company_id = $1` | 멀티테넌시 핵심 원칙(D1)의 캐싱 레이어 적용. `companyId` 누락 시 Tool Cache는 원본 함수 실행(타입 시스템 강제), Semantic Cache는 쿼리 실패. 회사 간 캐시 교차 접근 구조적 불가 |

---

### D17 PoC 결정 트리

```
Story 15.1 시작 전:
  SDK PoC: query({ systemPrompt: [{ type:'text', text:soul, cache_control:{ type:'ephemeral' } }] })
  ├── 성공 (두 번째 호출 cache_read_input_tokens > 0)
  │   └── agent-loop.ts systemPrompt string → ContentBlock[] 변경
  └── 실패 (타입 오류 또는 cache_read_input_tokens = 0)
      └── anthropic.messages.create() 직접 호출로 전환
          └── 동일 cache_control 효과, SDK 없이 Anthropic HTTP API 직접
```

### D18 Phase 4 Redis 전환 경계

```typescript
// lib/tool-cache.ts — Phase 4 전환 설계
// 현재 구현 (Phase 1~3):
const cacheStore: CacheStore = new InMemoryMap()  // Map 기반

// Phase 4 전환 시 (다중 서버 배포):
const cacheStore: CacheStore = new RedisStore(redisClient)  // 구현체만 교체

// withCache() API는 동일 — 호출부 수정 없음
export function withCache(toolName: string, ttlMs: number, fn: ToolHandler): ToolHandler
```

### D19 E8 경계 검증

```bash
# CI engine-boundary-check.sh 추가 패턴 (Story 15.3 scope)
grep -r 'engine/semantic-cache' packages/server/src --include='*.ts' \
  | grep -v 'engine/agent-loop.ts' \
  | grep -v 'engine/semantic-cache.ts'
# 0줄 = E8 OK. 1줄+ = E8 VIOLATION → Story 완료 불가
```

### D20 Credential Sanitization (D4 Hook 파이프라인 연계)

D4 Hook 파이프라인 순서 (architecture.md D4 기준):
`PreToolUse: tool-permission-guard` → `PostToolUse: credential-scrubber → output-redactor → delegation-tracker` → `Stop: cost-tracker`

**중요:** 어떤 Hook도 LLM 최종 응답 텍스트(`fullResponse`)를 sanitize하지 않는다:
- `tool-permission-guard` (PreToolUse): 도구 **실행 허가** 판단 (비허용 도구 차단)
- `credential-scrubber` (**PostToolUse**, @zapier/secret-scrubber 기반): 도구 **출력** 결과의 민감 패턴 마스킹
- `output-redactor` (PostToolUse): 도구 **출력** 추가 패턴 마스킹
- Stop Hook (`cost-tracker`): usage 토큰 데이터(`inputTokens`, `outputTokens`)만 수신

따라서 `saveToSemanticCache(fullResponse)` 직접 호출 시 `sk-ant-cli-*` 등 credential이 `semantic_cache` 테이블에 그대로 저장되는 보안 구멍 발생. `engine/semantic-cache.ts`의 `saveToSemanticCache` 함수 **내부**에서 `credential-scrubber`와 동일한 `CREDENTIAL_PATTERNS` 정규식을 `fullResponse`에 직접 적용한 `sanitizedResponse`를 저장해야 한다 — caller(agent-loop.ts)가 마스킹 후 전달하는 방식이 아닌, **callee(saveToSemanticCache) 내부 처리**.

---

### 3-레이어 런타임 실행 순서 (D17~D20 통합 흐름도)

```
사용자 메시지 수신 → agent-loop.ts
  ↓
[Layer 1] Semantic Cache 확인 (D19, D20 — agent.enableSemanticCache=true만)
  → engine/semantic-cache.ts → getDB(companyId).findSemanticCache()
  → cosine similarity ≥ 0.95 AND TTL 24h 내: 즉시 반환 (LLM 미호출, 비용 $0)
  → 미스: 계속 진행
  → 오류: graceful fallback → 계속 진행 (NFR-CACHE-R2)
  ↓
[Layer 2] Prompt Cache 적용 LLM 호출 (D17)
  → systemPrompt: ContentBlock[] + cache_control: { type:'ephemeral' }
  → Anthropic 서버 캐시 히트: TTFT 85% 단축, 비용 기본 × 0.1
  → 도구 호출 발생 시 ↓
[Layer 3] Tool Cache 확인 (D18, D20)
  → lib/tool-cache.ts → withCache(toolName, ttlMs, fn)
  → 히트: 외부 API 미호출, 캐시 결과 반환
  → 미스: 외부 API 호출 → 캐시 저장
  → 오류: graceful fallback → 원본 함수 직접 실행 (NFR-CACHE-R1)
  ↓
LLM 응답 완성
  → enableSemanticCache=true?
     → saveToSemanticCache (내부에서 CREDENTIAL_PATTERNS 마스킹 후 저장 — D20 callee 처리)
     → 오류: 무시 + log.warn (NFR-CACHE-R2, 세션 중단 없음)
  ↓
사용자에게 반환
```

*Section 1 작성 완료 v2 — 검토 대기*
