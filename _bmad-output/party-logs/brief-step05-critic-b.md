## [Critic-B Review] Step-05: MVP Scope + Future Vision

**File reviewed:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` lines 308–392
**References checked:** architecture.md (D1~D16, E1~E10), prd.md (NFRs), `_research/tool-reports/05-caching-strategy.md`

---

### Agent Discussion (in character, cross-talking)

**Winston (Architect):**
Story 15.3 line 331 says "`engine/semantic-cache.ts` 생성: `checkSemanticCache(companyId, query)` + `saveToSemanticCache(companyId, query, response)`." These functions call `getDB(companyId)` for vector similarity search — but looking at architecture.md E3, the `getDB()` proxy defines `.agents()`, `.departments()`, `.tierConfigs()`, `.insertAgent()`, etc. There is NO vector search method: no `findSimilar()`, no `insertSemanticCache()`, no `findSemanticCache()`. The research report §3.4 shows `db.findSimilar('semantic_cache', { embedding, threshold, maxAge })` — but that's not in the current `getDB()` contract. Story 15.3 requires extending `db/scoped-query.ts` with semantic cache methods. This is a scope gap in the Core Features description that will cause a surprise during implementation.

**Amelia (Dev):**
`packages/server/src/routes/admin/agents.ts` will need a new API endpoint: `PATCH /api/admin/agents/:id` (or similar) to set `enable_semantic_cache`. And `packages/admin` will need a toggle UI component. Line 333 says "Admin 콘솔에서 에이전트별 `enableSemanticCache` 토글 설정 가능" but Core Features describes Story 15.3 as if it's only server-side work. The packages affected aren't listed: packages/server (API + DB migration) + packages/admin (UI toggle) — at minimum 2 packages touched. Sprint planning needs to know this is a full-stack story. Also Story 15.1 line 315: changing `systemPrompt: string` to `ContentBlock[]` in `RunAgentOptions` (engine/types.ts) requires updating the type definition too — that's not "agent-loop.ts 단 1곳"

**Quinn (QA):**
Two ambiguities in the success criteria and scope: (1) Line 349: "stale-on-error fallback — 미설계. 장애 시 graceful fallback(에러 전파)으로 처리" — "에러 전파" implies cache layer errors propagate to users. But Success Criteria line 367: "캐싱 장애 시 서비스 연속성 | 서비스 중단 0건." These two statements conflict. Clarification needed: (A) 외부 API 장애 → 에러 전파 OK (stale-on-error 미적용), (B) 캐시 레이어 자체 예외(semantic-cache.ts throws) → catch + LLM fallback 필수 (서비스 중단 방지). Without this distinction, an implementer might "에러 전파" the semantic cache failure itself, causing service interruption. (2) Success Criteria line 362: Tool Cache test verifies happy path only. Missing test for TTL expiry (call → wait TTL → call again → should miss). The current criteria would PASS even if TTL is ignored entirely (items cached forever).

**Bob (SM):**
Story 15.3 scope needs to list affected packages explicitly. Line 333 "Admin 콘솔 토글" = packages/admin frontend work. Line 329-330 = DB migrations (two separate changes: `semantic_cache` table + `agents.enable_semantic_cache` column — one migration file or two?). Line 331-334 = engine/ server work. This is a multi-package story touching at least: packages/server (2 DB migrations + semantic-cache.ts + agent-loop.ts) + packages/admin (agent edit UI). Without explicit package listing, the sprint board will underestimate Story 15.3 capacity. It's 2-3× larger than Story 15.1 or 15.2.

**Winston (cross-talk with Quinn):**
Quinn, your graceful fallback ambiguity is architecturally critical. If `engine/semantic-cache.ts` throws (e.g., pgvector query error), it's called from `agent-loop.ts`. If the error propagates, the entire agent session fails with `HOOK_PIPELINE_ERROR`. That means a pgvector index failure kills ALL agent sessions that have Semantic Cache enabled. The scope must explicitly say: cache layer errors → try/catch → log warning → proceed to LLM. This is standard defensive programming but it needs to be in scope, not implied.

**Amelia (cross-talk with Bob):**
Bob, on the DB migration question — `semantic_cache` table creation AND `agents.enable_semantic_cache` column addition should be in one Drizzle migration file for atomicity. If split into two migrations, a partial failure could leave the schema in an inconsistent state (table exists but no agent flag, or vice versa). The scope should say "single Drizzle migration" to prevent this.

---

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | **MEDIUM** | Winston | **`getDB()` 벡터 검색 메서드 미스코프 (line 331):** `engine/semantic-cache.ts`가 `getDB(companyId)`로 벡터 유사도 검색 수행하는데, architecture.md E3의 현재 `getDB()` 프록시에 vector search 메서드 없음. `findSimilar()`, `insertSemanticCache()` 등이 `db/scoped-query.ts`에 추가되어야 함. Story 15.3 scope에 미기재. | Core Features Story 15.3에 "`db/scoped-query.ts` 확장: `findSemanticCache(companyId, embedding, threshold)` + `insertSemanticCache(companyId, ...)` 추가 (E3 패턴 준수)" 항목 추가. |
| 2 | **MEDIUM** | Bob, Amelia | **Story 15.3 영향 패키지 미명시 (line 333):** "Admin 콘솔 토글"은 packages/admin 프론트엔드 변경 필요. 현재 Core Features에 패키지 구분 없이 서버 측만 기술됨. 실제 범위: packages/server (semantic-cache.ts + DB migration + API endpoint) + packages/admin (에이전트 편집 UI에 toggle 추가). | Story 15.3 마지막에 "영향 패키지: `packages/server` (API + engine + migration) + `packages/admin` (에이전트 편집 페이지 enableSemanticCache toggle UI)" 명시. DB migration은 단일 파일로 묶어 원자적 적용. |
| 3 | **MEDIUM** | Quinn, Winston | **캐시 레이어 장애 vs 외부 API 장애 구분 부재 (lines 349, 367):** "stale-on-error 에러 전파"와 "서비스 중단 0건" 충돌. 외부 API 장애와 캐시 레이어 자체 예외를 구분하지 않으면 구현자가 semantic-cache.ts 예외를 그대로 전파하여 에이전트 세션 전체가 중단될 수 있음. | Out of Scope 표의 stale-on-error 설명을 "(A) 외부 API 장애 → 에러 전파 (stale-on-error 미적용). (B) 캐시 레이어 자체 예외 → try/catch + 경고 로그 + LLM fallback 필수 (서비스 중단 방지)"로 수정. Story 15.2/15.3 scope에 "캐시 레이어 try/catch graceful fallback" 명시. |
| 4 | **LOW** | Quinn | **`semantic_cache` TTL 만료 항목 정리 미명시 (line 329, 331):** `ttl_hours INT DEFAULT 24` 컬럼 있으나, `checkSemanticCache` 구현 시 `WHERE created_at > NOW() - INTERVAL '24 hours'` 필터가 없으면 오래된 항목도 유사도 검색에 포함됨. 테이블 무한 증가 + 구버전 응답 캐시 히트 위험. | Story 15.3 Core Features에 "`checkSemanticCache`: cosine similarity ≥ 0.95 AND `created_at > NOW() - ttl_hours * INTERVAL '1 hour'` 조건 명시. 주기적 cleanup (예: 일별 cron으로 만료 항목 DELETE)은 MVP Out of Scope로 명시 (테이블 무한 증가 위험 인지)" 추가. |

---

### Architecture Consistency Check

**Checked against: architecture.md decisions D1–D16, patterns E1–E10**

| 항목 | 상태 | 상세 |
|------|------|------|
| D1 (getDB 패턴) | ⚠️ 미완성 | semantic-cache.ts가 getDB() 사용 명시됐으나 vector search 메서드 미정의 (Issue #1) |
| D6 (단일 진입점) | ✅ 준수 | agent-loop.ts에서 Semantic Cache check → LLM → save 흐름 명시 (line 332) |
| E3 (getDB CRUD 격리) | ⚠️ 확장 필요 | vector search + semantic cache CRUD 메서드 추가 필요 |
| E8 (engine/ 경계) | ✅ 준수 | semantic-cache.ts → engine/ 내부. lib/tool-cache.ts → engine/ 밖 lib/. 명확히 구분됨 |
| E10 (engine 경계 CI) | ✅ 언급됨 | MVP Success Criteria에 engine-boundary-check.sh 통과 조건 포함 (line 366) |
| Story 순차성 | ✅ 합리적 | 15.1(P0) → 15.2(P1) → 15.3(P2) 독립 배포·검증 구조 |
| Out of Scope 완성도 | ✅ 우수 | 10개 항목 + 이유 + 재검토 시점. 이전 step들의 결정(stale fallback, 배지, TTL 자동화)이 잘 반영됨 |
| Future Vision | ✅ 적절 | Phase 4~6이 현재 아키텍처(단일 서버 → Redis → 분산) 발전 방향과 일치. LLM 모델 교체 시 자동 무효화 아이디어가 특히 실용적 |

**Contradictions found:**
1. E3 `getDB()` 현재 정의 vs Story 15.3 vector search 요구 — Story 15.3 구현 가능을 위해 E3 패턴 확장 필요.
2. Out of Scope "에러 전파" vs Success Criteria "서비스 중단 0건" — 명시적 구분 필요.

---

### Cross-talk Outcome (Critic-A 응답 반영)

**Critic-A 추가 발견 (HIGH×3, LOW×2):**

1. **[HIGH] `semantic_cache` 테이블 `agent_id` 컬럼 부재 — 동일 companyId 에이전트 간 캐시 암묵적 공유:**
   Sally(UX) 발견: line 329 스키마에 `agent_id` 컬럼 없음. `company_id`만 존재 → 동일 회사 내 비서실장 에이전트와 CIO 에이전트가 유사한 쿼리 시 서로의 캐시 응답을 가져감. Out of Scope #9 "에이전트 간 Semantic Cache 공유 (별도 설계 필요)"가 미래 기능처럼 기술됐으나, 현재 설계는 이미 공유 상태. 의도적 공유라면 명시 필요, 비의도적이라면 `agent_id` 컬럼 추가 + `checkSemanticCache(companyId, **agentId**, query)` 시그니처 수정 필요.

2. **[HIGH] MVP Done 기준에 KPI-2 (비용 절감 실측) 누락:**
   John(PM) 발견: lines 358-369 Success Criteria에 KPI-1(캐시 활성화), KPI-3(Tool Cache 히트율)은 있지만 KPI-2(Soul 토큰 비용 절감율 ≥ 60%) 없음. "캐시가 켜졌다"와 "비용이 줄었다"는 별개 검증. Epic의 핵심 비즈니스 목표($27→$5~8/월) 달성 여부가 Done 기준에서 빠져있어 비용 미검증 상태로 완료 선언 가능.

3. **[HIGH] 7개 외 118개+ 도구 캐시 기본 정책 미명시:**
   Mary(BA) 발견: v1 125개+ 도구 중 7개만 `withCache()` 적용 예정. 나머지 118개+ 도구의 캐시 미적용 = "기존 동작 유지"인지 명시 없음. 신규 도구 추가 시 캐시 적용 여부 기본 정책도 없음 → Epic 16/17 도구 추가 때마다 "이거 캐시 해야 하나?" 반복 문의 발생.

4. **[LOW] Phase 6 LLM 모델 교체 vs 임베딩 모델 교체 혼용:**
   line 390 "LLM 모델 교체 시 자동 무효화" → 실제로는 임베딩 모델(Gemini Embedding) 교체 시만 캐시 무효화 필요. Claude Sonnet→Opus 교체는 임베딩 공간에 영향 없으므로 무효화 불필요.

5. **[LOW] Phase 4 Redis 전환 트리거 "에이전트 50명+" vs "다중 서버" 독립성:**
   두 조건이 병렬 표기됐으나 실제로는 독립 트리거. 단일 서버 + 에이전트 50명 → Redis 불필요. 다중 서버 + 에이전트 10명 → Redis 필요.

**내 크로스토크 입장:**
- Critic-A #1 (agent_id): 이는 내 Issue #1 (`getDB()` 확장 범위)과 연결됨. `findSemanticCache(companyId, agentId, embedding, threshold)` 시그니처에서 `agentId` 포함 여부가 schema 결정과 같이 확정되어야 함. 의도적 공유 설계라면 Out of Scope 항목을 "현재 구현: 동일 companyId 내 에이전트 간 공유 (의도적)" 으로 명확히 기재 필수.
- Critic-A #2 (KPI-2 Done): 완전 동의. 비용 절감이 Epic의 존재 이유인데 Done 기준에 없으면 사업적 가치 검증 불가.
- Critic-A #3 (118+ tools): Story 15.2 Core Features에 "TTL=0 = 캐시 없음 (기본값)" 원칙 명시로 해결 가능.

**합산 이슈 (크로스토크 후 최종):**

| 심각도 | 이슈 | 출처 |
|--------|------|------|
| **HIGH** | `VECTOR(1536)` → 실제 Epic 10 차원 **768** 불일치 — 구현 즉시 pgvector 타입 오류 (`db/schema.ts:1555`, `embedding-service.ts:8` 코드 확인) | 크로스토크 코드 검증 |
| HIGH | `semantic_cache` `agent_id` 부재 — 동일 companyId 에이전트 간 암묵적 캐시 공유 | Critic-A #1 |
| HIGH | MVP Done 기준에 KPI-2 비용 절감 검증 누락 | Critic-A #2 |
| HIGH | 7개 외 118+ 도구 캐시 기본 정책 미명시 | Critic-A #3 |
| MEDIUM | `getDB()` 벡터 검색 메서드 미스코프 (db/scoped-query.ts 확장 미기재) | 내 #1 |
| MEDIUM | Story 15.3 영향 패키지 미명시 (packages/admin 프론트엔드, 단일 migration 원자성) | 내 #2 |
| MEDIUM | 캐시 레이어 예외 vs 외부 API 장애 구분 부재 ("에러 전파" vs "서비스 중단 0건") | 내 #3 |
| LOW | `checkSemanticCache` TTL 만료 WHERE 절 미명시 + cleanup 전략 | 내 #4 |
| LOW | Phase 6 LLM 모델 vs 임베딩 모델 혼용 표현 | Critic-A #4 |
| LOW | Phase 4 Redis 전환 트리거 독립 조건 미분리 | Critic-A #5 |
