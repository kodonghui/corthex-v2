---
type: prd-addendum
epic: 'Epic 15 — 3-Layer Caching'
baseDocument: _bmad-output/planning-artifacts/prd.md
inputDocuments:
  - _bmad-output/planning-artifacts/epic-15-caching-brief.md
  - _research/tool-reports/05-caching-strategy.md
author: BMAD Writer Agent
date: '2026-03-12'
status: draft-v2
partyModeRounds: 0
revisions:
  - v2: C-1 FR 포맷 prd.md 단일불릿 형식 전면 재작성, H-1~H-4 + M-1~M-3 + L-1~L-2 반영
---

# PRD Addendum: Epic 15 — 3-Layer Caching

> 기존 PRD(`prd.md`) Functional Requirements 섹션 마지막에 병합할 캐싱 요구사항.
> FR 포맷은 prd.md 기존 스타일(`- FR-CACHE-X.Y: [Phase N] 한 문장`)과 동일.
> 코드 스니펫 · 테이블 · SQL · 스키마는 하단 **Appendix** 참조.

---

## Section 1: Epic 15 Functional Requirements

### 캐싱 (Caching) — Epic 15

CORTHEX v2 에이전트 실행 엔진(`engine/agent-loop.ts`)에 3단계 캐싱 레이어를 추가하여 Claude API 토큰 비용과 외부 도구 API 호출 비용을 구조적으로 절감한다. 기존 Hook 파이프라인(E1~E10)과 보안 아키텍처를 손상시키지 않는다.

#### Prompt Caching (Story 15.1)

- FR-CACHE-1.1: [Phase 1] `agent-loop.ts`가 Soul을 Claude API에 전달할 때 `systemPrompt`를 `ContentBlock[]` 형식(`{ type:'text', text:renderedSoul, cache_control:{ type:'ephemeral' } }`)으로 전달하여 Anthropic 서버 측 Prompt Cache를 활성화한다.
- FR-CACHE-1.2: [Phase 1] 구현 시작 전 Claude Agent SDK `query()`의 `ContentBlock[]` systemPrompt 지원 여부를 PoC로 검증하며, 실패(타입 오류 또는 `cache_read_input_tokens` 미반환) 시 `anthropic.messages.create()` 직접 호출 방식으로 전환하여 동일 효과를 달성한다.
- FR-CACHE-1.3: [Phase 1] Prompt Cache는 모든 에이전트에 일괄 적용된다 (에이전트별 on/off 설정 없음 — 응답 내용에 영향을 주지 않으므로).
- FR-CACHE-1.4: [Phase 1] `engine/types.ts` Stop Hook E2 `usage` 타입에 `cacheReadInputTokens?: number`와 `cacheCreationInputTokens?: number` 필드를 추가한다 (Story 15.1 scope).
- FR-CACHE-1.5: [Phase 1] `cost-tracker` Stop Hook이 `cacheReadInputTokens × $0.30/MTok`(캐시 읽기 비용)과 `cacheCreationInputTokens × $3.75/MTok`(캐시 쓰기 비용)을 세션마다 서버 로그에 기록하도록 업데이트한다 (Story 15.1 scope 포함, Admin UI 미노출).
- FR-CACHE-1.6: [Phase 1] Prompt Cache TTL은 Anthropic `ephemeral` 기본값(5분)으로 시작하며, 배포 30일 후 히트율 데이터 확인 후 1시간 TTL 전환 여부를 수동으로 결정한다 (자동 전환 로직은 MVP 범위 외).
- FR-CACHE-1.7: [Phase 1] Soul 편집 시 Prompt Cache는 최대 5분(ephemeral TTL) 이내 자연 만료된다 (즉시 무효화 없음 — 5분 내 응답 품질 차이 수용 범위).

#### Tool Result Caching (Story 15.2)

- FR-CACHE-2.1: [Phase 1] `packages/server/src/lib/tool-cache.ts`를 신규 생성하고 `withCache(toolName, ttlMs, fn)` 래퍼 함수를 구현한다 (`ttlMs === 0`이면 캐시 없이 원본 함수를 실행).
- FR-CACHE-2.2: [Phase 1] Tool Cache 키는 `${companyId}:${toolName}:${JSON.stringify(Object.entries(params).sort())}` 형식으로 구성하여, 파라미터 순서 차이에 관계없이 동일 파라미터는 동일 키를 생성한다.
- FR-CACHE-2.3: [Phase 1] Tool Cache는 인메모리 `Map` 구현체를 사용하며 최대 10,000 항목 상한을 적용한다 — 상한 도달 시 LRU 정책으로 가장 오래 접근하지 않은 항목을 제거한 뒤 신규 항목을 삽입한다.
- FR-CACHE-2.4: [Phase 1] 1분 간격 cleanup 타이머로 만료 항목을 일괄 정리하며, `process.memoryUsage().heapUsed`가 100MB를 초과하면 `log.warn({ event:'tool_cache_memory_exceeded' })`를 기록하고 LRU 추가 정리를 즉시 실행한다.
- FR-CACHE-2.5: [Phase 1] `packages/server/src/lib/tool-cache-config.ts`에 도구별 TTL 등록 테이블을 관리하며, 7개 도구(`kr_stock` 1분, `search_news` 15분, `search_web` 30분, `dart_api` 1시간, `law_search` 24시간, `get_current_time` 0, `generate_image` 0)를 초기 등록한다 — 미등록 신규 도구는 기본값 "캐시 없음"으로 처리된다.
- FR-CACHE-2.6: [Phase 1] Tool Cache 히트 시 `log.info({ event:'tool_cache_hit', toolName, companyId })`를, 미스 시 `log.info({ event:'tool_cache_miss', toolName, companyId })`를 기록하여 KPI-3 히트율(`hit/(hit+miss)`) 측정을 가능하게 한다.
- FR-CACHE-2.7: [Phase 1] Tool Cache 레이어에서 예외 발생 시 `log.warn({ event:'tool_cache_error', toolName, err })`를 기록하고 원본 도구 함수를 실행한다 (캐시 예외가 에이전트 세션 중단을 유발하지 않음).

#### Semantic Caching (Story 15.3)

- FR-CACHE-3.1: [Phase 1] `semantic_cache` 테이블 생성 DB 마이그레이션을 적용한다 — 컬럼: `id UUID PK`, `company_id UUID NOT NULL`, `query_text TEXT`, `query_embedding VECTOR(768)`, `response TEXT`, `ttl_hours INT DEFAULT 24`, `created_at TIMESTAMPTZ`; hnsw(`vector_cosine_ops`) 인덱스 포함 (스키마 상세: 하단 Appendix A).
- FR-CACHE-3.2: [Phase 1] `agents` 테이블에 `enable_semantic_cache BOOLEAN DEFAULT FALSE` 컬럼을 추가하는 DB 마이그레이션을 단일 파일로 원자 적용한다 (기본값 `false` — 실시간 데이터 에이전트 자동 보호).
- FR-CACHE-3.3: [Phase 1] `packages/admin`의 에이전트 편집 페이지(`AgentEditForm` 컴포넌트)에 `enableSemanticCache` on/off 토글을 추가한다 — 토글을 OFF로 변경하면 신규 캐시 저장만 중단되고, 기존 `semantic_cache` 레코드는 TTL 자연만료(24시간)까지 유지된다 (즉시 삭제 없음).
- FR-CACHE-3.4: [Phase 1] `engine/semantic-cache.ts`를 생성하고 `checkSemanticCache(companyId, query)` 및 `saveToSemanticCache(companyId, query, response)` 두 함수를 구현한다 — `cosine similarity ≥ 0.95 AND created_at > NOW() - ttl_hours * INTERVAL '1 hour'` 조건 적용, Gemini `text-embedding-004`(768차원) 재활용 (SQL: Appendix B).
- FR-CACHE-3.5: [Phase 1] Semantic Cache 조회 SQL은 반드시 `company_id = $1` 조건을 포함하며, 서로 다른 `companyId`의 캐시 데이터는 공유되지 않는다.
- FR-CACHE-3.6: [Phase 1] `.github/scripts/engine-boundary-check.sh`에 `engine/semantic-cache` 외부 import 차단 패턴을 추가하되, `engine/agent-loop.ts`와 `engine/semantic-cache.ts` 자신은 제외한다 (false positive 방지 — grep 패턴: Appendix C).
- FR-CACHE-3.7: [Phase 1] `db/scoped-query.ts`의 `getDB()` 프록시에 `findSemanticCache(embedding, threshold)` 및 `insertSemanticCache(data)` 메서드를 추가하며, `engine/semantic-cache.ts`는 반드시 `getDB(companyId)` 프록시를 통해서만 DB에 접근한다 (직접 `db` import 금지 — E3 패턴).
- FR-CACHE-3.8: [Phase 1] `agent-loop.ts`에 Semantic Cache 레이어를 다음 순서로 통합한다 — (1) `enableSemanticCache=true` 에이전트만 `checkSemanticCache` 실행 → 히트 시 즉시 반환(LLM 미호출), (2) 미스/오류 시 Prompt Cache 적용 LLM 호출, (3) `enableSemanticCache=true`이면 `saveToSemanticCache` 저장.
- FR-CACHE-3.9: [Phase 1] Semantic Cache TTL은 24시간 고정(`ttl_hours DEFAULT 24`)으로 MVP를 진행하며, 에이전트별 TTL 커스터마이징 UI는 구현하지 않는다.
- FR-CACHE-3.10: [Phase 1] Semantic Cache 히트 시 `log.info({ event:'semantic_cache_hit', companyId, agentId, similarity })`를, 미스 시 `log.info({ event:'semantic_cache_miss', companyId, agentId, similarity:bestSimilarity })`를 기록하여 KPI-4 히트율(`hit/(hit+miss)`) 측정을 가능하게 한다.
- FR-CACHE-3.11: [Phase 1] Semantic Cache는 동일 `companyId` 내 에이전트 간 공유된다(`agent_id` 컬럼 없음 — 의도적 설계, FAQ 히트율 향상 목적) — 에이전트별 응답 불일치가 우려되는 에이전트는 Admin이 `enableSemanticCache=false`로 설정하여 개별 제외할 수 있다.
- FR-CACHE-3.12: [Phase 1] Library(지식 베이스) 업데이트 시 Semantic Cache의 즉시 무효화는 수행하지 않으며, 최대 24시간(TTL) 이내 구버전 캐시 응답 반환을 허용한다 — Library 업데이트가 즉각 정확성을 요구하는 에이전트는 Admin이 `enableSemanticCache=false`로 설정한다.

---

## Appendix: 구현 참조 (Story 파일 전달용)

> 아래 내용은 PRD FR 계약의 일부가 아님. Story 파일 및 Architecture 문서 작성 시 참조.

### Appendix A — semantic_cache 테이블 스키마

```sql
CREATE TABLE semantic_cache (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID        NOT NULL,
  query_text      TEXT        NOT NULL,
  query_embedding VECTOR(768) NOT NULL,   -- Gemini text-embedding-004 차원
  response        TEXT        NOT NULL,
  ttl_hours       INT         DEFAULT 24,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- hnsw + vector_cosine_ops (Epic 10 knowledge_docs_embedding_idx와 동일 패턴)
-- ivfflat + vector_l2_ops 조합 금지 → cosine 쿼리 인덱스 미활용
CREATE INDEX semantic_cache_embedding_idx
  ON semantic_cache USING hnsw (query_embedding vector_cosine_ops);
```

### Appendix B — Semantic Cache 조회 SQL

```sql
SELECT response
FROM semantic_cache
WHERE company_id = $1
  AND 1 - (query_embedding <=> $2) >= 0.95
  AND created_at > NOW() - ttl_hours * INTERVAL '1 hour'
ORDER BY query_embedding <=> $2
LIMIT 1
```

### Appendix C — E8 경계 check 패턴 (false positive 방지)

```bash
# engine/semantic-cache.ts를 agent-loop.ts 외부에서 import하면 E8 위반
grep -r 'engine/semantic-cache' packages/server/src --include='*.ts' \
  | grep -v 'engine/agent-loop.ts' \
  | grep -v 'engine/semantic-cache.ts'
# 결과 0줄 = E8 OK. 1줄+ = E8 VIOLATION
```

### Appendix D — 도구별 TTL 등록 테이블

| 도구 이름 | TTL (ms) | 환산 | 근거 |
|-----------|----------|------|------|
| `kr_stock` | 60,000 | 1분 | 장중 실시간, 최소 캐시 단위 |
| `search_news` | 900,000 | 15분 | 뉴스 갱신 주기 |
| `search_web` | 1,800,000 | 30분 | 검색 결과 변경 빈도 낮음 |
| `dart_api` | 3,600,000 | 1시간 | 공시 데이터 갱신 빈도 낮음 |
| `law_search` | 86,400,000 | 24시간 | 법률 데이터 거의 변경 없음 |
| `get_current_time` | 0 | 캐시 없음 | 항상 최신 필요 |
| `generate_image` | 0 | 캐시 없음 | 매 호출 결과 상이 |

### Appendix E — withCache() 내부 예외 처리 패턴

```typescript
// lib/tool-cache.ts
// Phase 4 Redis 전환 대비: cacheStore를 { get, set, delete } 인터페이스로 분리
// 전환 시 cacheStore 구현체만 교체, withCache() API 유지
try {
  const cached = cacheStore.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    log.info({ event: 'tool_cache_hit', toolName, companyId })
    return cached.data
  }
  log.info({ event: 'tool_cache_miss', toolName, companyId })
} catch (e) {
  log.warn({ event: 'tool_cache_error', toolName, err: e })
  // fallback: 원본 함수 실행
}
const result = await fn(params, ctx)
if (ttlMs > 0) cacheStore.set(key, { data: result, expiresAt: Date.now() + ttlMs })
return result
```

### Appendix F — Semantic Cache 적합/부적합 에이전트 유형

| 에이전트 유형 | `enableSemanticCache` | 이유 |
|--------------|----------------------|------|
| FAQ/정책 안내 에이전트 | `true` | 반복 질문 많음, 응답 변동 없음 |
| 보고서 양식/규정 안내 | `true` | 동일 내용 재사용 가능 |
| 주가 조회 에이전트 | `false` | 실시간 데이터 — 캐시 부적합 |
| 뉴스 브리핑 에이전트 | `false` | 시간 의존성 높음 |
| 이미지 생성 에이전트 | `false` | 창의적 결과 — 동일 응답 불가 |
| 다단계 핸드오프 오케스트레이터 | `false` | 맥락 의존성 높음 |
| Library 업데이트 즉각 반영 필요 에이전트 | `false` | 24시간 내 구버전 캐시 허용 불가 |

---

## Section 2: Epic 15 Non-Functional Requirements

> 기존 PRD NFR(NFR-P1~P12, NFR-S1~S7, NFR-SC1~SC7, NFR-AV1~AV3)에 Epic 15 캐싱 전용 NFR을 추가한다.
> 포맷은 기존 prd.md NFR 테이블과 동일.

### 성능 — 캐싱 (Performance: Caching)

| ID | 요구사항 | 목표 | 측정 | 우선순위 | Phase |
|----|---------|------|------|---------|-------|
| NFR-CACHE-P1 | Prompt Cache TTFT 개선 | 캐시 히트 시 TTFT ≥ 85% 단축 (Anthropic 공식: 캐시 읽기 비용 = 기본 × 0.1) | Story 15.1 배포 전 1주 평균 TTFT 베이스라인 측정 후, 배포 후 동일 에이전트 연속 2회 호출 TTFT 비교 | 🔴 P0 | 1 |
| NFR-CACHE-P2 | Semantic Cache 응답 시간 | 캐시 히트 시 전체 응답 완료(done 이벤트) ≤ 100ms | 서버 로그 `semantic_cache_hit` 타임스탬프 기준 응답 완료 시간 | 🔴 P0 | 1 |
| NFR-CACHE-P3 | Tool Cache 외부 API 레이턴시 | 캐시 히트 시 외부 API 호출 횟수 = 0 (레이턴시 기여 $0) | bun:test — TTL 내 동일 파라미터 2회 호출 시 mock 호출 횟수 = 1 확인 | 🔴 P0 | 1 |
| NFR-CACHE-P4 | Prompt Cache 히트율 | 동일 에이전트 5분 내 연속 재호출 세션 기준 ≥ 70% | `usage.cache_read_input_tokens > 0` 호출 수 / 전체 동일 에이전트 호출 수 (서버 로그) | P1 | 1 |
| NFR-CACHE-P5 | Tool Cache 히트율 | 초기(1주) ≥ 20% → 안정기(30일) ≥ 40% | `tool_cache_hit` / (`tool_cache_hit` + `tool_cache_miss`) 서버 로그 집계 | P1 | 1 |
| NFR-CACHE-P6 | Semantic Cache 히트율 | 초기(2주) ≥ 15% → 안정기(30일) ≥ 40% (FAQ 에이전트 기준) | `semantic_cache_hit` / (`semantic_cache_hit` + `semantic_cache_miss`) 서버 로그 집계 | P1 | 1 |
| NFR-CACHE-P7 | Semantic Cache DB 조회 성능 | hnsw 인덱스 적용 후 10,000 레코드 기준 cosine similarity 조회 ≤ 50ms | bun:test 통합 테스트 — 실제 Neon DB 연결 환경(pgvector extension 활성화 필수), CI에서 단위 테스트와 분리 실행 (mock DB 환경에서는 항상 pass → 의미 없음) | P1 | 1 |

### 보안 — 캐싱 (Security: Caching)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-CACHE-S1 | Tool Cache companyId 격리 | 다른 `companyId` 에이전트가 동일 파라미터로 도구 호출 시 캐시 교차 히트 0건 | 🔴 P0 | 1 |
| NFR-CACHE-S2 | Semantic Cache companyId 격리 | 다른 `companyId`에서 동일 쿼리 입력 시 `semantic_cache` 교차 히트 0건 (`company_id = $1` 조건 필수) | 🔴 P0 | 1 |
| NFR-CACHE-S3 | Semantic Cache 저장 전 credential 마스킹 | `saveToSemanticCache`는 LLM `fullResponse`에 `credential-scrubber`와 동일한 `CREDENTIAL_PATTERNS` 정규식(API 키, CLI 토큰 패턴)을 적용한 `sanitizedResponse`만 `semantic_cache` 테이블에 저장한다 — raw LLM 응답 직접 저장 금지 (Stop Hook은 usage 토큰 데이터만 수신하며 LLM 응답 콘텐츠를 sanitize하지 않음) | 🔴 P0 | 1 |
| NFR-CACHE-S4 | Tool Cache 키 companyId 누락 방지 | `withCache()` 호출 시 `companyId` 파라미터 미전달이면 캐싱 없이 원본 함수 실행 (타입 시스템으로 강제) | 🔴 P0 | 1 |

### 확장성 — 캐싱 (Scalability: Caching)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-CACHE-SC1 | Tool Cache 메모리 상한 | 10,000 항목 만재 시 `process.memoryUsage().heapUsed` 증가분 ≤ 100MB (추정 — 평균 10KB/항목 가정; 실측 후 조정 가능. 24GB 서버 기준 0.4%) | P1 | 1 |
| NFR-CACHE-SC2 | LRU 교체 성능 | 10,000 항목 상한 도달 시 LRU 항목 제거 + 신규 항목 삽입 시간 ≤ 1ms | P1 | 1 |
| NFR-CACHE-SC3 | Cleanup 타이머 블로킹 | 1분 주기 만료 항목 일괄 정리 시 이벤트 루프 블로킹 ≤ 10ms | P2 | 1 |
| NFR-CACHE-SC4 | Tool Cache 메모리 에이전트 수 비독립성 | Tool Cache 메모리 증가는 에이전트 수가 아닌 고유 도구 호출 파라미터 수에 비례한다 — 에이전트 50명이 동일 파라미터로 `kr_stock`을 호출해도 캐시 항목 1건; 에이전트 수 증가가 캐시 크기에 선형 비례하지 않는다 | P1 | 1 |

### 신뢰성 — 캐싱 (Reliability: Caching)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-CACHE-R1 | Tool Cache graceful fallback | `withCache()` 내부 예외 발생 시 원본 도구 함수 실행, 에이전트 세션 중단 0건 | 🔴 P0 | 1 |
| NFR-CACHE-R2 | Semantic Cache graceful fallback | `checkSemanticCache` / `saveToSemanticCache` 예외 발생 시 LLM 정상 호출 진행, 에이전트 세션 중단 0건 | 🔴 P0 | 1 |
| NFR-CACHE-R3 | 캐시 전체 비활성 시 서비스 연속성 | 3개 캐싱 레이어 전부 비활성(fallback) 상태에서도 에이전트 정상 응답 — 캐시 의존성 없는 기존 동작 완전 유지 | 🔴 P0 | 1 |
| NFR-CACHE-R4 | Prompt Cache PoC 실패 시 대안 보장 | SDK PoC 실패 시 `anthropic.messages.create()` 직접 호출로 전환해도 동일 에이전트 실행 결과 일치 | 🔴 P0 | 1 |

### 운영 — 캐싱 (Operational: Caching)

| ID | 요구사항 | 목표 | 우선순위 | Phase |
|----|---------|------|---------|-------|
| NFR-CACHE-O1 | Tool Cache hit/miss 로깅 완전성 | 모든 Tool Cache 접근에 `tool_cache_hit` 또는 `tool_cache_miss` 이벤트 로그 100% 기록 (누락 시 KPI-3 히트율 측정 불가) | 🔴 P0 | 1 |
| NFR-CACHE-O2 | Semantic Cache hit/miss 로깅 완전성 | 모든 Semantic Cache 접근에 `semantic_cache_hit` 또는 `semantic_cache_miss` 이벤트 로그 100% 기록 (`similarity` 값 포함 — 임계값 튜닝 기반 데이터) | 🔴 P0 | 1 |
| NFR-CACHE-O3 | cost-tracker 캐시 비용 정확도 | `cacheReadInputTokens × $0.30/MTok` 및 `cacheCreationInputTokens × $3.75/MTok` 계산 오차 ≤ 1% (NFR-S7 기존 기준 동일 적용) | P1 | 1 |
| NFR-CACHE-O4 | 메모리 초과 경보 | `process.memoryUsage().heapUsed` ≥ 100MB 시 `log.warn({ event:'tool_cache_memory_exceeded', usedMB })` 즉시 발행 + LRU 추가 정리 실행 | P1 | 1 |
| NFR-CACHE-O5 | `semantic_cache` 만료 행 정기 정리 | 매일 1회 `created_at < NOW() - ttl_hours * INTERVAL '1 hour'` 조건 행 삭제 (ARGOS 크론 기반) — 삭제 행 수 `log.info({ event:'semantic_cache_cleanup', deletedRows })` 기록 (30일+ 누적 수십만 행 방지, hnsw 인덱스 재구성 비용 관리) | P1 | 1 |
| NFR-CACHE-O6 | Semantic Cache 응답 품질 무결성 | Semantic Cache 히트 응답으로 인한 Hub 사용자 민원 발생률 — 배포 후 2주 기준 0% 증가 (Epic 12 A/B 테스트 프레임워크로 캐시 히트 응답 vs LLM 직접 응답 품질 비교) | P1 | 1 |

*Section 2 작성 완료 — 검토 대기 (lines 160–220 approx.)*
