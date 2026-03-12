# Story 15.3: Semantic Caching (pgvector + Admin UX)
Status: done
Story Points: 21
Priority: P0
blockedBy: 15.1 (권장 — Prompt Cache 베이스라인 TTFT 측정 후 시작)

## Story
As a platform operator,
I want similar user questions to return cached LLM responses when cosine similarity ≥ 0.95,
so that repeated/similar queries respond in ≤ 100ms at $0 LLM cost, with per-agent on/off control via Admin toggle.

## Context

**아키텍처 결정 D19** (`epic-15-architecture-addendum.md` 참조):
- Semantic Cache 위치: `packages/server/src/engine/semantic-cache.ts` — `engine/` 내부
- E8 경계 준수: `agent-loop.ts`만 import 가능, 외부 직접 접근 금지 (FR-CACHE-3.6)
- DB 접근: `getDB(companyId)` 프록시 전용 — 직접 `db` import 금지 (E3 패턴, FR-CACHE-3.7)

**결정 D20** — companyId 격리 + credential 마스킹:
- Semantic Cache SQL: 반드시 `WHERE company_id = $1` 조건 포함 (NFR-CACHE-S2)
- **`saveToSemanticCache` 내부(callee)에서** `CREDENTIAL_PATTERNS` 정규식 직접 적용 후 `sanitizedResponse`만 저장 — caller(agent-loop.ts)가 마스킹 후 전달하는 방식 금지 (NFR-CACHE-S3)
- 마스킹 패턴: `credential-scrubber` Hook의 `CREDENTIAL_PATTERNS`와 동일 (`sk-ant-cli-*` 등 API 키/CLI 토큰 패턴)

**에이전트 간 캐시 공유 (FR-CACHE-3.11)**:
- `semantic_cache` 테이블에 `agent_id` 컬럼 없음 — 동일 `companyId` 내 에이전트 간 공유 (의도적 설계)
- FAQ 히트율 향상 목적 — 에이전트별 분리 제외는 Admin이 `enableSemanticCache=false`로 개별 제외

**UX 결정** (`epic-15-ux-design.md` 참조):
- Admin: `AgentEditForm` 내 `enableSemanticCache` 토글
  - shadcn/ui `<Switch>`, `w-11 h-6`, ON: `bg-indigo-500`, OFF: `bg-slate-600`, 기본값: OFF
  - ON→OFF 전환: 확인 모달 표시
  - OFF→ON 전환: 즉시 전환 (모달 없음)
  - 캐시 적합성 추천 표시 (Story 15.2의 `tool-cache-config.ts` TTL 기반):
    - TTL=0 도구 포함 → ✗ `text-rose-400` (의미: "실시간 데이터, 캐시 부적합")
    - TTL ≤ 900,000ms 도구 포함 → ⚠ `text-amber-400` (의미: "단기 갱신 도구 포함")
    - 그 외 → ✓ `text-emerald-400` (의미: "캐시 적합")
    - 우선순위: ✗ > ⚠ > ✓ (가장 낮은 적합성 아이콘 표시)
    - 오케스트레이터/Library 즉각 반영 에이전트: 자동 감지 불가 → 별도 수동 안내 텍스트 표시
  - OFF 전환 확인 모달: "각 응답의 저장 시점부터 24시간이 지나면 자동 만료됩니다. (즉시 삭제 아님)"
- Hub (이주임): Semantic Cache 히트 여부 완전 비가시
  - **스피너 오버라이드**: `setTimeout(showSpinner, 300)` — base ux-design-spec 기존 패턴(`accepted` 이벤트 즉시 스피너) 오버라이드
  - "이전 유사 질문" 안내 MVP 미표시 (불안감 > 투명성 이점)
  - ⚡ Cache Hit Badge: Deferred Phase 5+ (SSE cacheHit/similarity 필드 미전송)

**TTL: 24시간 고정** (FR-CACHE-3.9):
- `semantic_cache.ttl_hours DEFAULT 24` — 에이전트별 TTL 커스터마이징 MVP 범위 외

**NFR 핵심**:
- NFR-CACHE-P2: Semantic Cache 히트 시 응답 완료 ≤ 100ms
- NFR-CACHE-R2: `checkSemanticCache` / `saveToSemanticCache` 예외 → LLM 정상 호출 진행 (세션 중단 0건)
- NFR-CACHE-O5: ARGOS 매일 1회 만료 행 정리

## Acceptance Criteria

1. **Given** `semantic_cache` 테이블이 존재하고 `agents.enable_semantic_cache=true` 에이전트에 사용자 메시지가 입력될 때, **When** DB에 cosine similarity ≥ 0.95 AND `created_at > NOW() - 24h` 캐시 항목이 존재하면, **Then** LLM 호출 없이 캐시 응답을 반환하며 `log.info({ event:'semantic_cache_hit', companyId, agentId, similarity })`가 기록된다

2. **Given** Semantic Cache 미스(similarity < 0.95 또는 TTL 만료), **When** LLM이 응답을 생성하면, **Then** `saveToSemanticCache()`가 호출되어 `CREDENTIAL_PATTERNS`로 마스킹된 `sanitizedResponse`가 `semantic_cache`에 저장된다 (raw LLM 응답 직접 저장 금지 — NFR-CACHE-S3)

3. **Given** `agents.enable_semantic_cache=false` 에이전트, **When** 사용자 메시지가 입력되면, **Then** `checkSemanticCache`와 `saveToSemanticCache` 모두 호출되지 않는다

4. **Given** 서로 다른 companyId A, B에서 동일 쿼리가 입력될 때, **When** A의 캐시 항목이 존재해도, **Then** B는 A의 캐시를 히트하지 않는다 — SQL `WHERE company_id = $1` 조건 검증 (NFR-CACHE-S2)

5. **Given** `checkSemanticCache` 또는 `saveToSemanticCache`에서 DB 예외 발생, **When** agent-loop.ts가 처리하면, **Then** LLM 정상 호출이 진행되고 에이전트 세션이 중단되지 않는다 (NFR-CACHE-R2)

6. **Given** Admin이 `AgentEditForm`에서 `enableSemanticCache` 토글을 ON→OFF로 변경, **When** 확인 모달에서 "확인"을 클릭하면, **Then** `agents.enable_semantic_cache=false`로 저장되고, 기존 `semantic_cache` 레코드는 즉시 삭제 없이 TTL 자연만료(24시간)까지 유지된다

7. **Given** Admin이 `AgentEditForm`에서 `enableSemanticCache` 토글을 OFF→ON으로 변경, **When** 토글을 클릭하면, **Then** 모달 없이 즉시 `agents.enable_semantic_cache=true`로 저장된다

8. **Given** 에이전트의 도구 목록에 TTL=0 도구가 포함되어 있으면, **When** Admin이 `AgentEditForm`을 열면, **Then** `enableSemanticCache` 토글 옆에 ✗ (`text-rose-400`) 아이콘이 표시된다 (우선순위: ✗ > ⚠ > ✓)

9. **Given** `.github/scripts/engine-boundary-check.sh`, **When** CI에서 실행되면, **Then** `engine/semantic-cache` import가 `engine/agent-loop.ts` 외부에서 감지되면 0이 아닌 exit code를 반환한다 (E8 위반 탐지)

10. **Given** Hub 사용자(이주임)가 메시지를 전송, **When** 서버로부터 `accepted` 이벤트를 수신해도, **Then** 스피너가 `setTimeout(showSpinner, 300)` — 300ms 후에 표시된다 (base ux-design-spec 오버라이드)

11. **Given** ARGOS 크론이 매일 실행, **When** `created_at < NOW() - ttl_hours * INTERVAL '1 hour'` 조건의 만료 행이 존재하면, **Then** 해당 행이 삭제되고 `log.info({ event:'semantic_cache_cleanup', deletedRows })`가 기록된다 (NFR-CACHE-O5)

12. **Given** 모든 변경 완료 후, **When** `npx tsc --noEmit -p packages/server/tsconfig.json`을 실행하면, **Then** 타입 오류 0건이다

## Tasks / Subtasks

- [ ] Task 1: DB 마이그레이션 2개 (AC: #1, #3, #4)
  - [ ] 마이그레이션 A: `semantic_cache` 테이블 생성
    ```sql
    CREATE TABLE semantic_cache (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id      UUID        NOT NULL,
      query_text      TEXT        NOT NULL,
      query_embedding VECTOR(768) NOT NULL,
      response        TEXT        NOT NULL,
      ttl_hours       INT         DEFAULT 24,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX semantic_cache_embedding_idx
      ON semantic_cache USING hnsw (query_embedding vector_cosine_ops);
    ```
  - [ ] 마이그레이션 B: `agents` 테이블 컬럼 추가
    ```sql
    ALTER TABLE agents ADD COLUMN enable_semantic_cache BOOLEAN DEFAULT FALSE NOT NULL;
    ```
  - [ ] Drizzle 스키마 파일 업데이트 + 마이그레이션 SQL 파일 생성 (기존 Epic 10 마이그레이션 패턴 참조)
  - [ ] `shared/types.ts`의 `Agent` 타입에 `enableSemanticCache: boolean` 추가

- [ ] Task 2: db/scoped-query.ts 업데이트 (AC: #1, #2, #4)
  - [ ] `findSemanticCache(embedding: number[], threshold: number): Promise<{ response: string; similarity: number } | null>` 메서드 추가
    - SQL: Appendix B (PRD addendum) — `SELECT response, 1-(query_embedding <=> $2) AS similarity FROM semantic_cache WHERE company_id = $1 AND 1-(query_embedding <=> $2) >= $3 AND created_at > NOW() - ttl_hours * INTERVAL '1 hour' ORDER BY query_embedding <=> $2 LIMIT 1`
    - 반드시 `company_id = $1` 조건 포함 (격리 보장)
    - `similarity` 값 반환 필수 — KPI-4 로깅 및 캐시 미스 시 `bestSimilarity` 기록에 필요 (FR-CACHE-3.10)
  - [ ] `insertSemanticCache(data: { queryText, queryEmbedding, response, ttlHours }): Promise<void>` 메서드 추가

- [ ] Task 3: engine/semantic-cache.ts 생성 (AC: #1, #2, #5)
  - [ ] `checkSemanticCache(companyId: string, query: string): Promise<{ response: string; similarity: number } | null>`
    - `getDB(companyId).findSemanticCache(embedding, 0.95)` 호출 → `{ response, similarity }` 또는 `null` 반환
    - 오류 시: `log.warn({ event:'semantic_cache_error', op:'check', err })` + `null` 반환
  - [ ] `saveToSemanticCache(companyId: string, query: string, response: string): Promise<void>`
    - **callee-side 마스킹**: `CREDENTIAL_PATTERNS` 정규식으로 `response` → `sanitizedResponse` 변환 후 저장
    - `CREDENTIAL_PATTERNS`: **`packages/server/src/lib/credential-patterns.ts`에서 import** (복사 절대 금지 — 패턴 불일치 시 NFR-CACHE-S3 위반, 아래 Dev Notes 참조)
    - `getDB(companyId).insertSemanticCache({ queryText: query, queryEmbedding: embedding, response: sanitizedResponse, ttlHours: 24 })` 호출
    - 오류 시: `log.warn({ event:'semantic_cache_error', op:'save', err })` + 무시 (세션 중단 없음)
  - [ ] Gemini `text-embedding-004` 재활용: `generateEmbedding(apiKey, text)` from `services/embedding-service.ts` → `number[] | null` (768차원, null 시 graceful fallback — NFR-CACHE-R2). apiKey 획득: Dev Notes Google API key 패턴 참조
  - [ ] E8 준수: 직접 `db` import 금지 — `getDB(companyId)` 프록시만 사용

- [ ] Task 4: agent-loop.ts Semantic Cache 레이어 통합 (AC: #1, #2, #3, #5)
  - [ ] `yieldCachedResponse(response: string)` 구현 (agent-loop.ts 내부 헬퍼 또는 별도 함수):
    - 기존 agent-loop.ts의 SSE 방출 패턴 파악 후 동일 방식으로 구현
    - 방출 순서: `accepted` → `processing` → `message(response)` → `done(costUsd: 0)`
    - `done` 이벤트에 `costUsd: 0` 전달 — cost-tracker Stop Hook이 캐시 히트 세션 비용을 $0으로 기록
  - [ ] 메시지 처리 진입부에 L1 Semantic Cache 확인 추가:
    ```typescript
    if (agent.enableSemanticCache) {
      try {
        const result = await checkSemanticCache(companyId, userMessage)
        if (result) {
          log.info({ event:'semantic_cache_hit', companyId, agentId, similarity: result.similarity })
          return yieldCachedResponse(result.response)
        }
        log.info({ event:'semantic_cache_miss', companyId, agentId, similarity: result?.similarity ?? 0 })
      } catch (e) {
        // graceful fallback — 계속 진행 (NFR-CACHE-R2)
      }
    }
    ```
  - [ ] LLM 응답 완료 후 저장:
    ```typescript
    if (agent.enableSemanticCache) {
      try {
        await saveToSemanticCache(companyId, userMessage, fullResponse)
      } catch (e) {
        // 무시 + log.warn 내부 처리됨 (NFR-CACHE-R2)
      }
    }
    ```
  - [ ] 캐시 히트 시 SSE 이벤트: `accepted` → `processing` → `message` (캐시 내용) → `done` (`costUsd: 0`)

- [ ] Task 5: Admin UI — AgentEditForm enableSemanticCache 토글 (AC: #6, #7, #8)
  - [ ] `packages/admin/src/components/AgentEditForm.tsx` (또는 실제 경로 확인) 수정
  - [ ] shadcn/ui `<Switch>` 추가: `className="w-11 h-6"`, ON: `data-[state=checked]:bg-indigo-500`, OFF: `bg-slate-600`
  - [ ] 배치 위치: Soul 섹션 아래, 도구 권한 섹션 위 (캐싱 설정 섹션)
  - [ ] OFF→ON: 즉시 저장 (모달 없음)
  - [ ] ON→OFF: shadcn/ui `<AlertDialog>` 확인 모달
    - 제목: "응답 캐싱을 비활성화하시겠습니까?"
    - 내용: "각 응답의 저장 시점부터 24시간이 지나면 자동 만료됩니다. (즉시 삭제 아님)"
    - 버튼: "확인" (비활성화 진행) / "취소" (토글 상태 원복)
  - [ ] 캐시 적합성 추천 표시 — **Option A: 서버에서 계산 후 API 응답에 포함** (packages/admin은 packages/server/src/lib/ 직접 import 불가 — cross-package boundary 위반):
    - `GET /api/admin/agents/:id` 응답에 `semanticCacheRecommendation: 'safe' | 'warning' | 'none'` 필드 추가
    - 서버(Admin API 핸들러)에서 에이전트 도구 목록 기준 `getCacheRecommendation()` 계산 후 포함
    - 프론트엔드: 응답 필드 기준 아이콘 표시
      - `'none'` → ✗ `text-rose-400` (TTL=0 도구 포함)
      - `'warning'` → ⚠ `text-amber-400` (TTL ≤ 900,000ms 도구 포함)
      - `'safe'` → ✓ `text-emerald-400`
    - 오케스트레이터/Library 즉각 반영 에이전트: 자동 감지 불가 → `"오케스트레이터 또는 Library 즉각 반영 에이전트는 OFF를 권장합니다"` 안내 텍스트 별도 표시 (수동 판단 필요)
  - [ ] Admin API 업데이트:
    - `GET /api/admin/agents/:id` 응답에 `semanticCacheRecommendation` 필드 추가 (위 계산 로직 포함)
    - `PATCH /api/admin/agents/:agentId` — `enableSemanticCache` 필드 포함 확인 (기존 에이전트 편집 API 활용)

- [ ] Task 6: Hub 스피너 300ms 오버라이드 (AC: #10)
  - [ ] Hub SSE 이벤트 핸들러에서 `accepted` 이벤트 수신 시 스피너 표시 로직 수정
  - [ ] 기존: `accepted` 이벤트 수신 즉시 스피너 표시 → 변경: `setTimeout(showSpinner, 300)`
  - [ ] `_bmad-output/planning-artifacts/ux-design-specification.md` Hub 로딩 섹션 업데이트: "300ms delay (Epic 15 오버라이드)" 주석 추가

- [ ] Task 7: CI engine-boundary-check.sh 업데이트 (AC: #9)
  - [ ] `.github/scripts/engine-boundary-check.sh`에 E8 Semantic Cache 패턴 추가:
    ```bash
    violations=$(grep -r 'engine/semantic-cache' packages/server/src --include='*.ts' \
      | grep -v 'engine/agent-loop.ts' \
      | grep -v 'engine/semantic-cache.ts')
    if [ -n "$violations" ]; then
      echo "E8 VIOLATION: engine/semantic-cache imported outside agent-loop.ts"
      echo "$violations"
      exit 1
    fi
    ```

- [ ] Task 8: ARGOS 만료 행 정리 크론 (AC: #11)
  - [ ] 기존 ARGOS 크론 등록 방식 확인 (cron-jobs 테이블 또는 코드 기반)
  - [ ] 매일 1회 실행 크론 등록: `DELETE FROM semantic_cache WHERE created_at < NOW() - ttl_hours * INTERVAL '1 hour'` + 삭제 행 수 로깅

- [ ] Task 9: 검증 (AC: #12)
  - [ ] `npx tsc --noEmit -p packages/server/tsconfig.json` — 오류 0건
  - [ ] bun:test 작성:
    - 캐시 히트: similarity ≥ 0.95 + TTL 내 → 캐시 응답 반환, LLM 미호출
    - 캐시 미스: similarity < 0.95 → LLM 호출 진행
    - TTL 만료: `created_at > 24h` → 캐시 미스 처리
    - companyId 격리: 다른 companyId → 교차 히트 없음
    - enableSemanticCache=false: 완전 바이패스
    - graceful fallback: DB 예외 → LLM 정상 호출
    - CREDENTIAL_PATTERNS 마스킹: `sk-ant-cli-*` 패턴이 저장 전 마스킹됨
  - [ ] `engine-boundary-check.sh` 실행 — 0줄 (E8 OK)
  - [ ] 기존 agent-loop 테스트 전부 통과 확인
  - [ ] **NFR-P7 통합 테스트** (Neon DB 실계 연결, CI 분리): `INTEGRATION_TEST=true bun test` — `findSemanticCache()` + `insertSemanticCache()` 왕복 레이턴시 ≤ 50ms (p95)

## Dev Notes

- **pgvector 확인**: `packages/server` DB에 pgvector extension 활성화 여부 확인 (`SELECT * FROM pg_extension WHERE extname='vector'`) — Epic 10에서 이미 활성화됨
- **Embedding 함수**: `packages/server/src/services/embedding-service.ts` line 45의 `generateEmbedding(apiKey: string, text: string): Promise<number[] | null>` 사용 — `text-embedding-004`, 768차원. `getEmbedding()` 또는 `lib/embedding.ts`는 존재하지 않음 (오류)
- **Google API key 획득 패턴** (`packages/server/src/services/semantic-search.ts` lines 34~49 동일 패턴):
  ```typescript
  const credentials = await getCredentials(companyId, 'google_ai')
  const apiKey = extractApiKey(credentials)
  if (!apiKey) {
    log.warn({ event: 'semantic_cache_error', op: 'embedding', reason: 'no_google_api_key' })
    return null
  }
  const embedding = await generateEmbedding(apiKey, text)
  if (!embedding) return null
  ```
- **CREDENTIAL_PATTERNS 공유 방식 결정**: `packages/server/src/lib/credential-patterns.ts`로 추출 후 `credential-scrubber.ts`와 `engine/semantic-cache.ts` 양쪽에서 import. **복사(copy) 절대 금지** — 향후 패턴 업데이트 시 복사본 불일치 → `semantic_cache` 테이블에 credential 저장 보안 취약점(NFR-CACHE-S3 위반). `engine/` 내부 모듈 간 직접 import 불필요 — `lib/` 공유 상수로 해결
- **getDB 프록시 확인**: `packages/server/src/db/scoped-query.ts` 현재 메서드 목록 확인 후 `findSemanticCache`, `insertSemanticCache` 추가
- **hnsw vs ivfflat**: PRD Appendix A 주석 — `ivfflat + vector_l2_ops` 금지, `hnsw + vector_cosine_ops` 사용 (cosine similarity 쿼리 인덱스 최적화)
- **cosine similarity 공식**: pgvector에서 cosine distance = `<=>` 연산자 → similarity = `1 - distance`. SQL: `1 - (query_embedding <=> $2) >= 0.95`
- **enableSemanticCache 기본값**: `DEFAULT FALSE` (DB) + `false` (shared/types.ts) — 실시간 데이터 에이전트 자동 보호
- **FR-CACHE-3.11 공유 설계**: `semantic_cache`에 `agent_id` 컬럼 없음 — 의도적. 추후 에이전트별 격리 요구 시 D22로 별도 결정
- **blocked_by**: Story 15.1 완료 후 시작 권장 (Semantic Cache 히트 시 LLM 미호출 → Prompt Cache 베이스라인 측정 선행 필요)
