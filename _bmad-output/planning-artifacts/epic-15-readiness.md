---
type: implementation-readiness-report
epic: 'Epic 15 — 3-Layer Caching'
date: '2026-03-12'
assessor: BMAD Writer Agent (team worker)
status: draft
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-architecture-consistency
  - step-06-dependency-check
  - step-07-risk-assessment
  - step-08-final-assessment
---

# Implementation Readiness Report: Epic 15 — 3-Layer Caching

**날짜**: 2026-03-12
**프로젝트**: CORTHEX v2
**평가자**: BMAD Writer Agent

---

## 1. Document Discovery

Epic 15 계획 문서 전체 인벤토리:

| 문서 | 파일 경로 | 상태 |
|-----|---------|------|
| Product Brief | `_bmad-output/planning-artifacts/epic-15-caching-brief.md` | ✅ |
| PRD Addendum | `_bmad-output/planning-artifacts/epic-15-prd-addendum.md` | ✅ |
| Architecture Addendum | `_bmad-output/planning-artifacts/epic-15-architecture-addendum.md` | ✅ |
| Base Architecture (D17~D21 반영) | `_bmad-output/planning-artifacts/architecture.md` | ✅ |
| UX Design | `_bmad-output/planning-artifacts/epic-15-ux-design.md` | ✅ |
| Epics & Stories | `_bmad-output/planning-artifacts/epic-15-epics-and-stories.md` | ✅ |
| Story 15.1 | `_bmad-output/implementation-artifacts/stories/15-1-prompt-caching.md` | ✅ |
| Story 15.2 | `_bmad-output/implementation-artifacts/stories/15-2-tool-result-caching.md` | ✅ |
| Story 15.3 | `_bmad-output/implementation-artifacts/stories/15-3-semantic-caching.md` | ✅ |
| Context Snapshot S1~S5 | `_bmad-output/context-snapshots/epic-15-*.md` | ✅ (5개) |
| Research Report | `_research/tool-reports/05-caching-strategy.md` | ✅ |

**중복 문서**: 없음 · **누락 문서**: 없음 · **총 계획 문서**: 11개 전부 존재

---

## 2. PRD Analysis — FR/NFR 커버리지 검증

### Functional Requirements (26개)

#### FR-CACHE-1.x — Prompt Caching (7개)

| FR | 요구사항 요약 | Story 15.1 매핑 |
|----|-------------|----------------|
| FR-CACHE-1.1 | ContentBlock[] + cache_control:ephemeral systemPrompt | AC #2, Task 3A |
| FR-CACHE-1.2 | SDK PoC 선행 필수, 실패 시 messages.create() 전환 | AC #1, Task 1 + Task 3B |
| FR-CACHE-1.3 | 전 에이전트 일괄 적용 (에이전트별 on/off 없음) | AC #2 (스코프 제한 명시) |
| FR-CACHE-1.4 | engine/types.ts cacheReadInputTokens?, cacheCreationInputTokens? 추가 | AC #5, Task 2 |
| FR-CACHE-1.5 | cost-tracker 캐시 토큰 비용 로깅 ($0.30/MTok, $3.75/MTok) | AC #6, Task 4 |
| FR-CACHE-1.6 | ephemeral TTL 5분, 30일 후 수동 결정 | Dev Notes 명시 |
| FR-CACHE-1.7 | Soul 편집 후 최대 5분 자연 만료 허용 | Dev Notes 명시 |

#### FR-CACHE-2.x — Tool Result Caching (7개)

| FR | 요구사항 요약 | Story 15.2 매핑 |
|----|-------------|----------------|
| FR-CACHE-2.1 | lib/tool-cache.ts, withCache(toolName, ttlMs, fn) 신규 생성 | AC #1, Task 1 |
| FR-CACHE-2.2 | Cache key = ${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())} | AC #9, Task 1 |
| FR-CACHE-2.3 | 인메모리 Map, LRU 10,000 항목 상한 | AC #6, Task 1 |
| FR-CACHE-2.4 | 1분 cleanup 타이머, heapUsed ≥ 100MB log.warn | AC #7, #8, Task 1 |
| FR-CACHE-2.5 | lib/tool-cache-config.ts, 7개 도구 TTL 등록 | AC #4, Task 2 |
| FR-CACHE-2.6 | tool_cache_hit/miss log.info 기록 | AC #1, #2, Task 1 |
| FR-CACHE-2.7 | withCache 예외 시 원본 함수 실행 (graceful fallback) | AC #5, Task 1 |

#### FR-CACHE-3.x — Semantic Caching (12개)

| FR | 요구사항 요약 | Story 15.3 매핑 |
|----|-------------|----------------|
| FR-CACHE-3.1 | semantic_cache 테이블 마이그레이션 (VECTOR(768), HNSW, company_id) | AC #1, Task 1 |
| FR-CACHE-3.2 | agents.enable_semantic_cache BOOLEAN DEFAULT FALSE 마이그레이션 | AC #3, Task 1 |
| FR-CACHE-3.3 | AgentEditForm enableSemanticCache 토글 (OFF→TTL 유지) | AC #6, #7, #8, Task 5 |
| FR-CACHE-3.4 | engine/semantic-cache.ts, cosine similarity ≥ 0.95 AND TTL 24h | AC #1, Task 3 |
| FR-CACHE-3.5 | Semantic Cache SQL 반드시 company_id = $1 조건 포함 | AC #4, Task 2 |
| FR-CACHE-3.6 | engine-boundary-check.sh engine/semantic-cache 외부 import 차단 | AC #9, Task 7 |
| FR-CACHE-3.7 | db/scoped-query.ts findSemanticCache + insertSemanticCache 추가 | AC #1, Task 2 |
| FR-CACHE-3.8 | agent-loop.ts L1 통합 (enableSemanticCache 체크 → 히트/미스/저장) | AC #1, #2, #3, Task 4 |
| FR-CACHE-3.9 | Semantic Cache TTL 24시간 고정 (에이전트별 커스터마이징 MVP 범위 외) | Context/Dev Notes 명시 |
| FR-CACHE-3.10 | semantic_cache_hit/miss log.info 기록 (similarity 포함) | AC #1, Task 4 code snippet |
| FR-CACHE-3.11 | 동일 companyId 내 에이전트 간 캐시 공유 (agent_id 컬럼 없음) | Dev Notes 명시 |
| FR-CACHE-3.12 | Library 업데이트 시 즉시 무효화 없음, 24시간 내 구버전 허용 | Dev Notes 명시 |

**FR 커버리지: 26/26 (100%)** — 미커버 FR 없음

### Non-Functional Requirements (25개)

| 그룹 | ID | 스토리 | 상태 |
|-----|----|-------|------|
| 성능 | NFR-CACHE-P1 (TTFT ≥ 85% 단축) | 15.1 AC #4 | ✅ |
| 성능 | NFR-CACHE-P2 (Semantic 히트 ≤ 100ms) | 15.3 Context 명시 | ✅ |
| 성능 | NFR-CACHE-P3 (Tool Cache API 호출 0) | 15.2 AC #1 | ✅ |
| 성능 | NFR-CACHE-P4 (Prompt Cache 히트율 ≥ 70%) | 15.1 AC #4 검증 기반 | ✅ |
| 성능 | NFR-CACHE-P5 (Tool Cache 히트율 ≥ 20%→40%) | 15.2 AC #1 로깅 기반 | ✅ |
| 성능 | NFR-CACHE-P6 (Semantic Cache 히트율 ≥ 15%→40%) | 15.3 AC #1 로깅 기반 | ✅ |
| 성능 | NFR-CACHE-P7 (DB 조회 ≤ 50ms, HNSW 인덱스) | 15.3 Task 1 (HNSW 명시) | ✅ |
| 보안 | NFR-CACHE-S1 (Tool Cache companyId 격리) | 15.2 AC #3 | ✅ |
| 보안 | NFR-CACHE-S2 (Semantic Cache companyId 격리) | 15.3 AC #4 | ✅ |
| 보안 | NFR-CACHE-S3 (saveToSemanticCache callee-side 마스킹) | 15.3 Task 3, Dev Notes | ✅ |
| 보안 | NFR-CACHE-S4 (withCache companyId 타입 강제) | 15.2 Task 1 (타입 강제 명시) | ✅ |
| 확장성 | NFR-CACHE-SC1 (Tool Cache 메모리 ≤ 100MB) | 15.2 AC #8 | ✅ |
| 확장성 | NFR-CACHE-SC2 (LRU 교체 ≤ 1ms) | 15.2 AC #6, Task 4 bun:test | ✅ |
| 확장성 | NFR-CACHE-SC3 (cleanup 블로킹 ≤ 10ms) | 15.2 AC #7 | ✅ |
| 확장성 | NFR-CACHE-SC4 (메모리 에이전트 수 비독립) | 15.2 Dev Notes | ✅ |
| 신뢰성 | NFR-CACHE-R1 (Tool Cache graceful fallback) | 15.2 AC #5 | ✅ |
| 신뢰성 | NFR-CACHE-R2 (Semantic Cache graceful fallback) | 15.3 AC #5 | ✅ |
| 신뢰성 | NFR-CACHE-R3 (전체 비활성 시 서비스 연속성) | 15.1 AC #7 | ✅ |
| 신뢰성 | NFR-CACHE-R4 (SDK PoC 실패 시 대안 보장) | 15.1 AC #3 | ✅ |
| 운영 | NFR-CACHE-O1 (Tool Cache 로깅 100%) | 15.2 AC #1, #2 | ✅ |
| 운영 | NFR-CACHE-O2 (Semantic Cache 로깅 100%, similarity 포함) | 15.3 AC #1, Task 4 | ✅ |
| 운영 | NFR-CACHE-O3 (cost-tracker 캐시 비용 정확도 ≤ 1%) | 15.1 AC #6, Task 4 bun:test | ✅ |
| 운영 | NFR-CACHE-O4 (메모리 초과 경보) | 15.2 AC #8, Task 1 | ✅ |
| 운영 | NFR-CACHE-O5 (semantic_cache 만료 행 ARGOS 정리) | 15.3 AC #11, Task 8 | ✅ |
| 운영 | NFR-CACHE-O6 (응답 품질 무결성 — A/B 비교) | 15.3 Dev Notes (Epic 12 A/B 프레임워크 활용) | ✅ |

**NFR 커버리지: 25/25 (NFR-CACHE-P4~P6 + O6 포함)** — 미커버 NFR 없음

---

## 3. Epic Coverage Validation — 모든 FR이 Task에 명시됐는지

### Story 15.1 태스크 → FR 역추적

| Task | 구현 내용 | 커버 FR/NFR |
|------|---------|----------|
| Task 1 (SDK PoC) | query() ContentBlock[] 지원 검증 | FR-CACHE-1.2, NFR-CACHE-R4 |
| Task 2 (types.ts) | cacheReadInputTokens?, cacheCreationInputTokens? | FR-CACHE-1.4 |
| Task 3A/B (agent-loop.ts) | ContentBlock[] 또는 messages.create() | FR-CACHE-1.1, FR-CACHE-1.3 |
| Task 4 (cost-tracker) | 캐시 비용 로깅 | FR-CACHE-1.5, NFR-CACHE-O3 |
| Task 5 (검증) | tsc + bun:test | FR-CACHE-1.6, FR-CACHE-1.7, NFR-CACHE-R3 |

**15.1 미커버 FR**: 없음

### Story 15.2 태스크 → FR 역추적

| Task | 구현 내용 | 커버 FR/NFR |
|------|---------|----------|
| Task 1 (tool-cache.ts) | withCache(), CacheStore, LRU, cleanup, memory warning | FR-CACHE-2.1~2.4, FR-CACHE-2.7 |
| Task 2 (tool-cache-config.ts) | 7개 도구 TTL, getCacheRecommendation() | FR-CACHE-2.5 |
| Task 3 (도구 핸들러 적용) | withCache 래핑 | FR-CACHE-2.6, NFR-CACHE-O1 |
| Task 4 (검증) | tsc + bun:test | NFR-CACHE-S1, S4, SC1~4, R1 |

**15.2 미커버 FR**: 없음

### Story 15.3 태스크 → FR 역추적

| Task | 구현 내용 | 커버 FR/NFR |
|------|---------|----------|
| Task 1 (DB 마이그레이션) | semantic_cache + agents.enable_semantic_cache | FR-CACHE-3.1, FR-CACHE-3.2 |
| Task 2 (scoped-query.ts) | findSemanticCache({response, similarity}), insertSemanticCache | FR-CACHE-3.5, FR-CACHE-3.7 |
| Task 3 (semantic-cache.ts) | checkSemanticCache, saveToSemanticCache + CREDENTIAL_PATTERNS | FR-CACHE-3.4, NFR-CACHE-S3 |
| Task 4 (agent-loop.ts) | L1 통합, yieldCachedResponse, hit/miss 로깅 | FR-CACHE-3.8, FR-CACHE-3.10, NFR-CACHE-R2 |
| Task 5 (Admin UI) | AgentEditForm Switch, 모달, 추천 표시 (Option A) | FR-CACHE-3.3, FR-CACHE-3.9, FR-CACHE-3.11, FR-CACHE-3.12 |
| Task 6 (Hub spinner) | 300ms setTimeout 오버라이드 | UX 결정 반영 |
| Task 7 (CI 스크립트) | engine-boundary-check.sh semantic-cache 패턴 | FR-CACHE-3.6 |
| Task 8 (ARGOS) | 매일 1회 만료 행 정리 크론 | NFR-CACHE-O5 |
| Task 9 (검증) | tsc + bun:test 전체 | NFR-CACHE-S2, P2, R2 |

**15.3 미커버 FR**: 없음

---

## 4. UX Alignment

| UX 결정 | 근거 문서 | 스토리 반영 위치 | 상태 |
|--------|---------|--------------|------|
| AgentEditForm enableSemanticCache Switch (w-11 h-6, ON:bg-indigo-500, OFF:bg-slate-600) | epic-15-ux-design.md §1.1 | 15.3 Task 5 (구체적 CSS 명시) | ✅ |
| OFF→ON: 즉시 전환 (모달 없음) | ux-design.md §1.1 | 15.3 AC #7, Task 5 | ✅ |
| ON→OFF: 확인 모달 "응답 캐싱을 비활성화하시겠습니까?" | ux-design.md §1.1 | 15.3 AC #6, Task 5 | ✅ |
| 캐시 적합성 추천 (TTL=0→✗ rose-400, TTL≤900,000ms→⚠ amber-400, else→✓ emerald-400) | ux-design.md §1.1 | 15.3 Task 5 (색상 코드 포함) | ✅ |
| Admin UI cross-package 해결: Option A (서버 API에 semanticCacheRecommendation 포함) | 파티 모드 검토 결정 | 15.3 Task 5 명시 | ✅ |
| Hub spinner: setTimeout(showSpinner, 300) — base ux-design-spec 오버라이드 | ux-design.md §1.4 | 15.3 AC #10, Task 6 | ✅ |
| "이전 유사 질문" 안내 MVP 미표시 | ux-design.md §1.4 | Dev Notes (의도적 미구현) | ✅ |
| ⚡ Cache Hit Badge: Deferred Phase 5+ | ux-design.md §1.3 | Epic 15 스코프 외 명시 | ✅ |
| Error UX: 이주임 완전 비가시 | ux-design.md §1.5 | 15.1~15.3 graceful fallback | ✅ |

**UX 정합성 이슈**: 없음

---

## 5. Architecture Consistency — D17~D21 스토리 반영 검증

### D17: Prompt Cache 전략 (ContentBlock[] + cache_control:ephemeral)

- **story 15-1 반영 확인**:
  - Context: "D17 PoC 결정 트리" 코드 블록 포함 (`cache_control: { type:'ephemeral' }`)
  - Task 3A: `[{ type:'text', text: renderedSoul, cache_control: { type:'ephemeral' } }]` 정확히 명시
  - Task 3B: SDK 미지원 시 `anthropic.messages.create()` 직접 호출 대안 명시
  - AC #1~4: PoC → 경로 선택 → 히트 검증 순서 정확
- **D17 반영 상태**: ✅ 완전 반영

### D18: Tool Cache 위치 (lib/tool-cache.ts, E8 밖, Phase 4 Redis 전환)

- **story 15-2 반영 확인**:
  - Context: "E8 경계 외부 — 도구 핸들러에서 직접 import 가능 (D18)"
  - Task 1: `CacheStore` 인터페이스 분리 → "Phase 4 Redis 전환 대비: cacheStore: CacheStore 인터페이스 분리 — 구현체만 교체, withCache() API 유지"
  - Dev Notes: "Phase 4 Redis 전환: CacheStore 인터페이스를 InMemoryMap에서 RedisStore로만 교체"
- **D18 반영 상태**: ✅ 완전 반영

### D19: Semantic Cache 위치 (engine/semantic-cache.ts, E8 준수, agent-loop.ts만 접근)

- **story 15-3 반영 확인**:
  - Context: "E8 경계 준수: agent-loop.ts만 import 가능, 외부 직접 접근 금지 (FR-CACHE-3.6)"
  - Task 3: "E8 준수: 직접 db import 금지 — getDB(companyId) 프록시만 사용"
  - Task 7: `engine-boundary-check.sh`에 `engine/semantic-cache` 외부 import 차단 패턴 추가
  - AC #9: CI 스크립트 E8 검증 AC
- **D19 반영 상태**: ✅ 완전 반영

### D20: companyId 격리 + saveToSemanticCache callee-side CREDENTIAL_PATTERNS

- **story 15-2 반영 확인**:
  - Task 1: `${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}` 정확히 명시
  - Task 1: "companyId 미전달 시 타입 오류 (string 타입 강제 — undefined 불가)"
  - AC #3: 다른 companyId 교차 히트 없음
- **story 15-3 반영 확인**:
  - Task 2: `findSemanticCache`에 `WHERE company_id = $1` 조건 명시
  - Task 3: `saveToSemanticCache` 내부 CREDENTIAL_PATTERNS 마스킹, **복사 금지** 명시
  - AC #4: companyId 격리 검증
- **D20 반영 상태**: ✅ 완전 반영

### D21: Tool Cache Redis 전환 Deferred Phase 4+

- **반영 확인**:
  - 15.2 Context: "Phase 4 Redis 전환 대비: CacheStore 인터페이스 분리"
  - 15.2 Dev Notes: "Phase 4 Redis 전환: CacheStore 인터페이스를 InMemoryMap에서 RedisStore로만 교체 — withCache() 호출부 수정 불필요 (D18, D21)"
  - Epic-15-epics-and-stories.md: D21 Deferred 명시
- **D21 반영 상태**: ✅ 완전 반영

**아키텍처 일관성: D17~D21 전부 스토리에 완전 반영됨**

---

## 6. Dependency Check

### 6.1 Epic 14 완료 여부

Epic 15의 핵심 전제: Hook 파이프라인 연결 + E8 경계 + 단일 엔진

| Story | 제목 | Story 파일 상태 | 코드 실제 상태 |
|-------|------|--------------|------------|
| 14.1 | Hook 5개 agent-loop.ts 연결 | backlog (파일 미업데이트) | ✅ **완료** — `engine/agent-loop.ts`에 5개 Hook import 확인 |
| 14.2 | E8 경계 위반 수정 + engine/index.ts | backlog (파일 미업데이트) | ✅ **완료** — git `ff5880f feat(epic-14): wire engine hooks + fix E8 boundary + remove dual-engine` |
| 14.3 | 이중 엔진 제거 + 옛 서비스 삭제 | backlog (파일 미업데이트) | ✅ **완료** — git 동일 커밋 |

**Epic 14 결론**: 코드베이스 기준 완료 (git `ff5880f`). Story 파일 status가 업데이트 안 됨 — 문서 gap이지만 구현 블로커 아님.

**Epic 15 의존 항목 확인**:
- `engine/agent-loop.ts` 단일 진입점: ✅ (E1)
- Hook 파이프라인 5개 모두 연결: ✅ (`toolPermissionGuard`, `credentialScrubber`, `outputRedactor`, `delegationTracker`, `costTracker`)
- E8 경계 준수: ✅ (`engine-boundary-check.sh` 존재, 기존 위반 수정됨)
- 단일 엔진 (`runAgent`만): ✅

### 6.2 pgvector 준비 상태

| 항목 | 위치 | 상태 |
|-----|-----|------|
| pgvector npm 패키지 | `db/pgvector.ts` import `pgvector` | ✅ |
| `vector` Drizzle customType (768 차원 기본) | `db/pgvector.ts:13-27` | ✅ |
| `cosineDistance()` SQL 헬퍼 | `db/pgvector.ts:33-36` | ✅ `<=>` 연산자 |
| `knowledgeDocs` 테이블에 HNSW 인덱스 선례 | `db/schema.ts` (Epic 10) | ✅ — `semantic_cache` 마이그레이션 패턴 참조 가능 |
| `generateEmbedding(apiKey, text)` 함수 | `services/embedding-service.ts:45-63` | ✅ text-embedding-004, 768차원 |

**pgvector 결론**: ✅ 완전 준비됨

### 6.3 Claude Agent SDK 버전

| 항목 | 확인 내용 | 상태 |
|-----|---------|------|
| 패키지명 | `@anthropic-ai/claude-agent-sdk` | ✅ |
| 버전 | `"0.2.72"` — exact pin (^ 없음) | ✅ CLAUDE.md 요구사항 충족 |
| PoC 대상 | `query()` systemPrompt ContentBlock[] 지원 여부 | ⚠️ 미검증 (Story 15.1 Task 1에서 검증 예정) |

**SDK 결론**: 버전 고정 확인. PoC로 ContentBlock[] 지원 여부 반드시 검증 필요.

### 6.4 기타 인프라 의존성

| 의존 항목 | 위치 | 상태 |
|---------|-----|------|
| `getDB(companyId)` 프록시 | `db/scoped-query.ts:21` | ✅ |
| ARGOS 크론 시스템 | `nightJobSchedules`, `argosEvents` 테이블, `lib/cron-utils.ts` | ✅ |
| `@zapier/secret-scrubber` | `engine/hooks/credential-scrubber.ts:1` | ✅ |
| `PATTERNS` 상수 (추출 대상, **private — export 없음**) | `engine/hooks/credential-scrubber.ts:6-10` | ⚠️ `const PATTERNS` (no export). Story 15.3에서 직접 import 불가. **`lib/credential-patterns.ts`로 추출하여 `export const CREDENTIAL_PATTERNS`으로 재정의 필수** |
| Tool handlers 7개 | `lib/tool-handlers/builtins/kr-stock.ts` 등 | ✅ 전부 존재 |
| `engine-boundary-check.sh` | `.github/scripts/engine-boundary-check.sh` | ✅ (패턴 추가 필요) |

---

## 7. Risk Assessment

| 위험 | 심각도 | 확률 | 완화 방안 |
|-----|--------|------|---------|
| **R-1: SDK PoC 실패** — `query()`가 ContentBlock[] systemPrompt 미지원 | HIGH | 30% | 경로 B(messages.create()) 준비됨. 단, Hook 파이프라인 단절 위험 → 팀 리드와 스코프 재협의. 경로 A 성공 시 위험 소멸 |
| **R-2: generateEmbedding Dev Notes 오기** — Story 15.3이 `getEmbedding()` from `lib/embedding.ts` 참조 (두 파일 모두 존재하지 않음). 실제: `generateEmbedding(apiKey, text)` in `services/embedding-service.ts:45`, apiKey는 `getCredentials(companyId, 'google_ai')` + `extractApiKey()` 획득 (패턴: `services/semantic-search.ts:34~49`) | HIGH | 100% (오기 확인됨) → **수정 완료** (Story 15.3 Dev Notes 업데이트) |
| **R-3: CREDENTIAL_PATTERNS import 불가** — credential-scrubber.ts의 `PATTERNS` 상수는 **private** (no export). Story 15.3이 직접 import 불가 | MEDIUM | 100% (확인됨) | `lib/credential-patterns.ts` 신규 생성, `export const CREDENTIAL_PATTERNS: RegExp[] = [...]` 정의. credential-scrubber.ts + semantic-cache.ts 양쪽 import. 복사 금지 (NFR-CACHE-S3 위반 위험) |
| **R-4: 도구명 불일치** — tool-cache-config.ts의 `kr_stock` 등 underscore 명이 실제 registry 등록명과 다를 수 있음 (`kr-stock.ts` 파일명 kebab-case) | MEDIUM | 50% | Story 15.2 Task 3 시작 전 `registry.list()` 실행하여 실제 등록명 확인 |
| **R-5: VECTOR 차원 오류** — pgvector 768차원 (text-embedding-004) vs 잘못된 1536 사용 | HIGH | 낮음 | Story 15.3 Task 1 SQL에 `VECTOR(768)` 명시됨. `db/pgvector.ts` default 768 확인 |
| **R-6: 경로 B Hook 단절** — messages.create() 선택 시 tool-permission-guard, credential-scrubber, cost-tracker 미발화 | HIGH | 경로 B 선택 시 100% | Story 15.1 Task 3B에 경고 추가됨. 구현자 숙지 필수 |

---

## 8. Final Assessment

### 전체 구현 준비 상태

**결정: ✅ READY** — 즉시 구현 시작 가능

### 판정 근거

| 기준 | 결과 |
|-----|------|
| 계획 문서 완전성 | ✅ 11개 전부 존재 |
| FR 커버리지 | ✅ 26/26 (100%) |
| NFR 커버리지 | ✅ 25/25 (100%) |
| UX 정합성 | ✅ 9개 UX 결정 전부 스토리 반영 |
| 아키텍처 일관성 | ✅ D17~D21 전부 스토리 반영 |
| Epic 14 전제조건 | ✅ 코드 완료 확인 (git ff5880f) |
| pgvector 인프라 | ✅ 768차원, cosineDistance, generateEmbedding 전부 존재 |
| SDK 버전 | ✅ 0.2.72 exact pin |
| 블로킹 이슈 | ✅ 없음 |

### 구현 전 필수 조치 (블로커 아님, 시행착오 방지)

1. **Story 15.3 Dev Notes 수정 (R-2)**: ~~`getEmbedding()` from `lib/embedding.ts`~~ → **수정 완료**: `generateEmbedding(apiKey, text)` from `services/embedding-service.ts:45` + `getCredentials(companyId, 'google_ai')` + `extractApiKey()` 패턴 명시.
2. **Story 15.3 Task 9 NFR-P7 (신규 추가)**: **수정 완료**: Neon DB 실연결 통합 테스트 subtask 추가 — `INTEGRATION_TEST=true bun test`, `findSemanticCache` + `insertSemanticCache` 왕복 ≤ 50ms (p95).
3. **Epic 14 Story 파일 status 업데이트**: 14.1~14.3 story 파일의 `Status: backlog` → `Status: done` 업데이트 권장 (코드는 완료, 문서 gap만 존재).
4. **Story 15.2 Task 3 (R-4)**: 구현 전 `registry.list()` 실행하여 실제 도구명 확인 (`kr_stock` vs `kr-stock` 등).

### 권고 구현 순서

```
Phase A (병렬 가능):
  ① 15.1 (Prompt Cache, 5 SP, P0) — SDK PoC 선행 후 경로 결정
  ② 15.2 (Tool Cache, 8 SP, P1) — lib/ 레이어, 독립 구현

Phase B (15.1 완료 후):
  ③ 15.3 (Semantic Cache, 21 SP, P0) — DB 마이그레이션 → engine/semantic-cache → agent-loop → Admin UI → Hub → CI → ARGOS
```

### Epic 15 완료 기준 (전체)

1. Story 15.1: 동일 에이전트 2회 호출 시 `cache_read_input_tokens > 0` 확인
2. Story 15.2: `kr_stock` 동일 파라미터 2회 호출 시 외부 API 1회만 실행
3. Story 15.3: FAQ 에이전트 동일 질문 2회 시 두 번째 응답 ≤ 100ms
4. 3개 레이어 전부 fallback 상태에서 기존 에이전트 응답 정상
5. companyId 교차 캐시 히트 0건 (bun:test)
6. `npx tsc --noEmit` 오류 0건
7. `engine-boundary-check.sh` 0줄 (E8 OK)

*Epic 15 Implementation Readiness Assessment 완료 — 파티 모드 검토 대기*
