---
type: epics-and-stories
epic: 'Epic 15 — 3-Layer Caching'
inputDocuments:
  - _bmad-output/planning-artifacts/epic-15-caching-brief.md
  - _bmad-output/planning-artifacts/epic-15-prd-addendum.md
  - _bmad-output/planning-artifacts/epic-15-architecture-addendum.md
  - _bmad-output/planning-artifacts/epic-15-ux-design.md
  - _research/tool-reports/05-caching-strategy.md
author: BMAD Writer Agent
date: '2026-03-12'
status: draft
partyModeRounds: 0
---

# Epics & Stories: Epic 15 — 3-Layer Caching

> 기존 에픽·스토리 목록(`_bmad-output/planning-artifacts/epics-and-stories.md`)에
> Epic 15 캐싱 레이어를 추가하는 공식 문서.

---

## Epic 15 개요

**목표**: CORTHEX v2 에이전트 실행 엔진에 3단계 캐싱 레이어를 추가하여 Claude API 토큰 비용($27/월 Prompt Cache 즉각 절감)과 외부 도구 API 중복 호출을 구조적으로 제거한다.

**핵심 원칙**:
- 3개 캐시 레이어 모두 실패(fallback) 상태에서도 에이전트 정상 응답 유지 (NFR-CACHE-R1~R3)
- 모든 캐시 레이어에 `companyId` 격리 필수 (D20, NFR-CACHE-S1~S4)
- 이주임(Hub 사용자)에게 캐시 존재 비가시 — 에러 · 히트 모두 투명 처리
- Hook 파이프라인(E1~E10) 무손상 — credential-scrubber PostToolUse 도구 출력 전용 유지

**비용 절감 목표** (PRD brief 기준):
| 레이어 | 절감 항목 | 기대 효과 |
|--------|---------|---------|
| Prompt Cache (Story 15.1) | Soul 반복 토큰 | $27/월 즉각 절감, TTFT 85% 단축 |
| Tool Cache (Story 15.2) | 외부 API 중복 호출 | kr_stock, search_web 등 중복 호출 제거 |
| Semantic Cache (Story 15.3) | LLM 유사 쿼리 재추론 | 캐시 히트 시 비용 $0, 응답 ≤ 100ms |

---

## 런타임 실행 순서 (3-레이어)

```
사용자 메시지 → agent-loop.ts
  [L1] Semantic Cache 확인 (enableSemanticCache=true만)
       → 히트(similarity ≥ 0.95 + TTL 24h): 즉시 반환 (LLM 미호출)
       → 미스/오류: 계속
  [L2] Prompt Cache 적용 LLM 호출 (전 에이전트 일괄)
       → systemPrompt: ContentBlock[] + cache_control:{type:'ephemeral'}
       → 도구 호출 발생 시
  [L3] Tool Cache 확인 (도구별 TTL)
       → 히트: 외부 API 미호출
       → 미스/오류: 원본 도구 실행
  LLM 응답 완성
       → enableSemanticCache=true → saveToSemanticCache (내부 CREDENTIAL_PATTERNS 마스킹)
  사용자 반환
```

---

## Story 목록

| # | Story | 아키텍처 결정 | 주요 FR | 상태 |
|---|-------|------------|--------|------|
| 15.1 | Prompt Caching (Claude API cache_control) | D17 | FR-CACHE-1.1~1.7 | backlog |
| 15.2 | Tool Result Caching (인메모리 Map) | D18, D20, D21 | FR-CACHE-2.1~2.7 | backlog |
| 15.3 | Semantic Caching (pgvector + Admin UX) | D19, D20, FR-CACHE-3.x | FR-CACHE-3.1~3.12 | backlog |

---

## Story 15.1: Prompt Caching (Claude API cache_control)

**한 줄 요약**: `agent-loop.ts`의 systemPrompt를 `ContentBlock[]` 형식으로 변환해 Anthropic 서버 측 Prompt Cache를 활성화한다.

**전제 조건**: SDK PoC 선행 필수 (D17 — SDK가 ContentBlock[] systemPrompt를 지원하지 않으면 `anthropic.messages.create()` 직접 호출로 전환)

**스코프**:
- `engine/agent-loop.ts`: systemPrompt `string` → `ContentBlock[]` 변경 (또는 messages.create() 직접 호출)
- `engine/types.ts`: Stop Hook usage 타입에 `cacheReadInputTokens?`, `cacheCreationInputTokens?` 추가
- `engine/hooks/cost-tracker.ts`: 캐시 토큰 비용 로깅 추가

**영향 없음**: 응답 내용 변경 없음 — 에이전트별 on/off 설정 없음, 전 에이전트 일괄 적용

**story 파일**: `_bmad-output/implementation-artifacts/stories/15-1-prompt-caching.md`

---

## Story 15.2: Tool Result Caching (인메모리 Map)

**한 줄 요약**: `lib/tool-cache.ts`와 `lib/tool-cache-config.ts`를 신규 생성하여 도구별 TTL 기반 인메모리 캐시를 제공한다.

**스코프**:
- `packages/server/src/lib/tool-cache.ts`: `withCache()` 구현 (LRU 10,000 상한, 1분 cleanup)
- `packages/server/src/lib/tool-cache-config.ts`: 7개 도구 TTL 등록 테이블
- 기존 도구 핸들러 7개: `withCache()` 적용

**E8 경계**: `lib/` 레이어 — engine/ 밖, 도구 핸들러에서 직접 import 가능 (D18)

**Phase 4 Redis 대비**: `cacheStore: CacheStore` 인터페이스 분리 — 구현체만 교체, `withCache()` API 유지

**story 파일**: `_bmad-output/implementation-artifacts/stories/15-2-tool-result-caching.md`

---

## Story 15.3: Semantic Caching (pgvector + Admin UX)

**한 줄 요약**: pgvector cosine similarity ≥ 0.95 기반 Semantic Cache와 Admin `enableSemanticCache` 토글을 구현한다.

**스코프**:
- DB 마이그레이션 2개: `semantic_cache` 테이블 + `agents.enable_semantic_cache` 컬럼
- `engine/semantic-cache.ts`: `checkSemanticCache()` + `saveToSemanticCache()` (callee-side CREDENTIAL_PATTERNS)
- `db/scoped-query.ts`: `findSemanticCache()` + `insertSemanticCache()` 메서드 추가
- `engine/agent-loop.ts`: L1 Semantic Cache 레이어 통합
- `packages/admin`: `AgentEditForm` enableSemanticCache 토글 (shadcn Switch)
- `hub`: 300ms spinner delay 오버라이드 (base ux-design-spec 업데이트 포함)
- CI: `engine-boundary-check.sh` E8 패턴 추가
- ARGOS: 매일 1회 `semantic_cache` 만료 행 정리 크론

**E8 경계**: `engine/semantic-cache.ts`는 `agent-loop.ts`만 접근 가능 (D19, FR-CACHE-3.6)

**블로킹**: Story 15.1 완료 후 시작 권장 (Semantic Cache가 LLM 호출을 건너뛰므로 Prompt Cache가 선행 적용된 상태에서 동작 검증)

**story 파일**: `_bmad-output/implementation-artifacts/stories/15-3-semantic-caching.md`

---

## 스토리 간 의존성

```
15.1 (Prompt Cache)
  └── 15.3 (Semantic Cache) — 블로킹 (권장)

15.2 (Tool Cache) — 하드 블로킹 없음 (15.1, 15.3과 병렬 개발 가능)
  └──> 15.3 Task 5 (소프트 의존성 — getCacheRecommendation() 활용)
```

- **15.1 → 15.3 블로킹 근거**: Semantic Cache 히트 시 LLM 미호출 → Prompt Cache 히트율 측정에 영향. 15.1 배포 후 베이스라인 TTFT 측정 1주일 후 15.3 시작 권장.
- **15.2 독립 (하드)**: `lib/tool-cache.ts`는 `engine/` 밖 `lib/` 레이어 — 15.1/15.3과 E8 경계 무충돌.
- **15.2 → 15.3 소프트 의존성**: 15.3 Task 5 Admin UI 추천 표시가 15.2의 `tool-cache-config.ts` `getCacheRecommendation()` 함수를 서버 API를 통해 활용. 15.2 미완료 시 15.3 Task 5에서 임시 하드코딩 가능 (TTL=0→'none', TTL≤900,000ms→'warning', else→'safe').

---

## FR/NFR 커버리지 매핑

| 요구사항 | Story |
|---------|-------|
| FR-CACHE-1.1~1.7 | 15.1 |
| FR-CACHE-2.1~2.7 | 15.2 |
| FR-CACHE-3.1~3.12 | 15.3 |
| NFR-CACHE-P1 (Prompt Cache TTFT ≥ 85%) | 15.1 |
| NFR-CACHE-P2 (Semantic Cache ≤ 100ms) | 15.3 |
| NFR-CACHE-P3 (Tool Cache API 호출 0) | 15.2 |
| NFR-CACHE-R1 (Tool graceful fallback) | 15.2 |
| NFR-CACHE-R2 (Semantic graceful fallback) | 15.3 |
| NFR-CACHE-R3 (전체 비활성 연속성) | 15.1+15.2+15.3 |
| NFR-CACHE-R4 (SDK PoC 실패 대안) | 15.1 |
| NFR-CACHE-S1 (Tool Cache companyId 격리) | 15.2 |
| NFR-CACHE-S2 (Semantic Cache companyId 격리) | 15.3 |
| NFR-CACHE-S3 (Semantic Cache credential 마스킹) | 15.3 |
| NFR-CACHE-S4 (withCache companyId 타입 강제) | 15.2 |
| NFR-CACHE-SC1~SC4 (메모리 상한 · LRU) | 15.2 |
| NFR-CACHE-O1 (Tool Cache 로깅 100%) | 15.2 |
| NFR-CACHE-O2 (Semantic Cache 로깅 100%) | 15.3 |
| NFR-CACHE-O3 (cost-tracker 캐시 비용 정확도) | 15.1 |
| NFR-CACHE-O4 (메모리 초과 경보) | 15.2 |
| NFR-CACHE-O5 (semantic_cache 만료 행 정기 정리) | 15.3 |

---

## 완료 기준 (Epic 15 전체)

1. Story 15.1 배포 후 동일 에이전트 2회 연속 호출 시 `cache_read_input_tokens > 0` 확인
2. Story 15.2 배포 후 `kr_stock` 동일 파라미터 2회 호출 시 외부 API 1회만 호출 확인
3. Story 15.3 배포 후 FAQ 에이전트 동일 질문 2회 호출 시 두 번째 응답 ≤ 100ms 확인
4. 3개 레이어 전부 fallback 상태에서 기존 에이전트 응답 정상 확인
5. companyId 교차 캐시 히트 0건 확인 (bun:test)
6. `npx tsc --noEmit` 오류 0건 (전체 스토리)
7. `engine-boundary-check.sh` 0줄 (E8 위반 없음)

*Epic 15 Epics & Stories 작성 완료 — 검토 대기*
