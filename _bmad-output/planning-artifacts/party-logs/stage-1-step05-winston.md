# Critic-A (Architecture) Review — Step 5: Implementation Research

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Step 5: Implementation Research" (L1349-1864)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Full TypeScript implementation for 4 new services with typed signatures, integration points with line numbers (hub.ts L95-102), migration SQL with `CREATE INDEX CONCURRENTLY` + HNSW parameters (`m = 16, ef_construction = 64`). Sprint 0 checklist with owner/blocker mapping. CI/CD yaml with exact byte threshold (307200). Cost model ($30 sprites, $1.50/mo reflections). Test templates with expected assertion values. **Gap**: knowledge-injector.ts described as "40 lines" — actually **533 lines** (code-verified). Misleading size claim doesn't affect architecture but undermines credibility. |
| D2 완전성 | 8/10 | All 6 subsections cover implementation, migration, sprites, UXUI, testing, workflow. Step 4 carry-forward (HNSW Neon attribution) resolved cleanly in 5.2.3. Testing organized by layer with Go/No-Go templates. Sprint 0 prerequisites complete. **Gaps**: (1) `call-agent.ts` listed as integration point (L1400) but only hub.ts pattern shown — no call-agent.ts example. (2) `recordObservation` takes `apiKey` parameter but no documentation of how `agent-loop.ts` provides it to the service. |
| D3 정확성 | 7/10 | **Multiple factual errors**: (1) knowledge-injector.ts "40 lines" → 533 lines (hallucination). (2) `@tanstack/react-table` "Already in use" (L1754) → NOT found in any package.json (code-verified: `grep` across all packages returns no match). (3) hub.ts import path `'../services/personality-injector'` (L1404) → should be `'../../services/personality-injector'` (hub.ts is at `routes/workspace/hub.ts`, 2 levels from `src/`). Copy-paste this import = build error. (4) Section 5.4.1 "Subframe MCP Integration Pattern" uses Stitch MCP tool names (`mcp__stitch__get_project`, `mcp__stitch__get_screen`) — these are Stitch tools, not Subframe. Subframe uses `subframe:design`/`subframe:develop` skills or `mcp__plugin_subframe_subframe-docs__search_subframe_docs`. Stitch is deprecated (Phase 6 폐기). ✅ Correct: `generateEmbedding` from `embedding-service.ts:45` ✅, `getDB(companyId)` from `scoped-query.ts:26` ✅, `cosineDistance` from `pgvector.ts:33` ✅, `@corthex/ui` package name ✅. |
| D4 실행가능성 | 8/10 | personality-injector.ts is near copy-paste ready. observation-recorder.ts has complete Haiku integration with default-5 fallback. memory-planner.ts dual-path (semantic + recency) is clean with char budget control. soul-renderer diff format is excellent — smallest possible change surface. Migration SQL with CONCURRENTLY is correct. CI/CD yaml functional. **But**: import path error (L1404) would break build on copy-paste. |
| D5 일관성 | 8/10 | E8 boundary respected — all 5 new services in `services/`. `getDB(companyId)` pattern followed correctly. `generateEmbedding` from existing `embedding-service.ts`. 0-100 integer scale consistent. Go/No-Go templates match Step 4 gate definitions. Migration ordering matches 5.2.4. **Issue**: Section 5.4 uses Stitch MCP names while Section 4.5 established Subframe as the UXUI tool. Naming inconsistency. Also Stitch is deprecated per MEMORY.md. |
| D6 리스크 | 8/10 | HNSW Neon attribution corrected (5.2.3) ✅. Zero Regression guarantee (L1575) with verification reasoning. CREATE INDEX CONCURRENTLY for non-blocking. Embedding failure → backfill cron catch. Importance default 5 on API failure. **Missing**: (1) `recordObservation` called with `.catch(() => {})` (L1469) — persistent recording failure has no alert. If Haiku API is down for hours, observations silently never score. (2) `new Anthropic({ apiKey })` instantiated per `recordObservation` call — should reuse client instance for connection pooling. (3) Neon branching workflow (5.2.1) shows `neon branches delete` — what if branch has pending changes? No safety check. |

### 가중 평균: 7.75/10 ✅ PASS

Calculation: (8×0.15) + (8×0.15) + (7×0.25) + (8×0.20) + (8×0.15) + (8×0.10) = 1.20 + 1.20 + 1.75 + 1.60 + 1.20 + 0.80 = **7.75**

---

## 이슈 목록

### Critical

1. **[D3 정확성] Import path 빌드 에러** — L1404 `import { buildPersonalityVars } from '../services/personality-injector'` — hub.ts는 `routes/workspace/hub.ts` (src 기준 2단계 깊이). 올바른 경로: `'../../services/personality-injector'`. 현재 hub.ts L10의 knowledge-injector import 참조: `import { collectKnowledgeContext } from '../../services/knowledge-injector'`. Copy-paste하면 빌드 깨짐 — **Rubric 자동 불합격 #3 근접**.

### Major

2. **[D3 정확성] knowledge-injector.ts "40 lines" 할루시네이션** — L1362 "Following existing `knowledge-injector.ts` (services/, 40 lines, cache + budget pattern)" — 실제: **533 lines** (`wc -l` 검증). 40라인 서비스를 참조 패턴으로 제시하면 복잡도 기대치가 왜곡됨. "Following existing `knowledge-injector.ts` budget pattern" 으로 수정 (라인 수 제거).

3. **[D3 정확성] `@tanstack/react-table` 미설치 의존성** — L1754 "`@tanstack/react-table` — Already in use" — 전체 `packages/` 대상 grep 결과 0건. v2에 설치되지 않은 의존성. "Already in use" 제거, 또는 v2에서 실제로 사용하는 Table 구현체로 교체.

4. **[D3 정확성] Stitch MCP → Subframe 혼동** — Section 5.4.1 "Subframe MCP Integration Pattern"이라 명명하면서 L1720 `mcp__stitch__get_project`, L1726 `mcp__stitch__get_screen` 사용. Stitch는 Phase 6에서 폐기 (MEMORY.md). Subframe workflow는 `subframe:design`/`subframe:develop` 스킬 사용. MCP 도구 이름을 정정하거나, Subframe 스킬 기반 workflow로 재작성.

### Minor

5. **[D2 완전성] `call-agent.ts` 통합 패턴 누락** — L1400 "hub.ts and `call-agent.ts` (existing extraVars injection sites)" 명시하지만, call-agent.ts 패턴은 미제공. call-agent.ts는 `tool-handlers/builtins/call-agent.ts`에 위치 — import 경로가 hub.ts와 다름 (`../../services/` vs hub의 `../../services/`). 둘 다 같은 depth이므로 경로는 동일하지만 통합 코드 스니펫 추가 필요.

6. **[D6 리스크] `recordObservation` 무음 실패** — L1469 `.catch(() => {})` — agent-loop.ts에서 observation 기록 실패를 완전히 무시. Haiku API 장시간 중단 시 모든 observation의 importance가 default 5로 설정되나 실패 패턴 감지 불가. `catch((e) => log.warn({ agentId, error: e.message }, 'Observation recording failed'))` 권장.

7. **[D6 리스크] Anthropic 클라이언트 재사용** — L1437 `new Anthropic({ apiKey })` — recordObservation 호출마다 새 인스턴스 생성. 기존 v2에서 agent-loop.ts가 Anthropic 클라이언트를 어떻게 관리하는지 참조하여 재사용 패턴 적용.

8. **[D1 구체성] `recordObservation` apiKey 전달 경로** — L1432 `apiKey: string` 파라미터가 있으나, agent-loop.ts에서 어떻게 전달하는지 미문서. agent-loop.ts의 apiKey 접근 패턴 (ctx? env? credential-vault?) 한 줄 명시 필요.

---

## Cross-talk 요청

- **Quinn**: (1) Import path 빌드 에러 (`../` vs `../../`) — QA 관점에서 copy-paste 검증. (2) `@tanstack/react-table` 미설치 — v2에서 Table 컴포넌트가 어떻게 구현되었는지 QA 확인. (3) `recordObservation` 무음 실패 — 테스트에서 failure path 커버리지 관점.
- **John**: (1) Stitch MCP vs Subframe 혼동 — delivery 관점에서 UXUI 파이프라인 도구 확정. Stitch 폐기 후 어떤 MCP/스킬로 디자인 추출하는지. (2) Sprint 0 prerequisites 현실성 — 체크리스트 6개 항목의 우선순위와 blocking 관계.

## Cross-talk Additions (post-review)

9. **[D3 Critical] agent_memories.embedding 컬럼 부재** (Quinn cross-talk, Winston schema 검증) — `agent_memories` schema (schema.ts:1589-1608)에 embedding 컬럼 없음. Migration 0064가 존재하지 않는 컬럼에 HNSW 인덱스 생성 시도 → migration 실패. **Step 4 (4.6.1)에서 0064→0065 분리 수정 완료** (0064=컬럼 추가, 0065=HNSW 인덱스). 하지만 Step 5 (5.2.4)는 여전히 구 버전 — 동기화 필요.

10. **[D5 Minor] PixiJS 번들 타겟** (John cross-talk) — 200KB target (Brief §4) 복원 ✅.

11. **[D2 Minor] Sprint 0 병렬 표시** (John cross-talk) — 체크리스트에 병렬 가능 여부 미표시.

---

## Verified Score (Post-Fix)

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 8 | 9 | "40 lines" 할루시네이션 제거. apiKey source 문서화 (ctx.cliToken L70). Import path depth 명시. |
| D2 완전성 | 8 | 9 | call-agent.ts 통합 코드 추가. agent-loop.ts integration snippet 완성. Sprint 0 체크리스트 병렬 표시 미적용 (minor). |
| D3 정확성 | 7 | 9 | Import path `../../` 수정 ✅. @tanstack/react-table → "Native HTML table" ✅. Stitch/Subframe 역할 분리 ✅. Step 4의 0064→0065 분리 반영 ✅. **But**: Step 5 5.2.4가 Step 4의 migration 분리와 비동기 — L1667 여전히 `0064_agent-memories-embedding-hnsw.sql` (구 버전). |
| D4 실행가능성 | 8 | 9 | hub.ts + call-agent.ts 통합 코드 모두 copy-paste 준비 완료. Import paths 검증됨. apiKey 전달 경로 명확. |
| D5 일관성 | 8 | 9 | Stitch/Subframe 역할 명확. PixiJS 200KB Brief 준수. Migration 0064→0065 분리는 Step 4에 반영되었으나 Step 5 5.2.4 미동기화 (minor). |
| D6 리스크 | 8 | 9 | Silent failure → log.warn 추가. Anthropic per-call 문서화. Embedding backfill catch with log. |

**가중 평균: 9.00/10 ✅ PASS**

Calculation: (9×0.15) + (9×0.15) + (9×0.25) + (9×0.20) + (9×0.15) + (9×0.10) = 1.35 + 1.35 + 2.25 + 1.80 + 1.35 + 0.90 = **9.00**

**Round 2 verification**: 3 remaining cross-talk items resolved:
- #9: Step 5 5.2.4 migration ordering synced with Step 4 — 0064 (ADD COLUMN embedding) + 0065 (HNSW INDEX), SQL blocks both updated ✅
- #10: PixiJS 200KB target confirmed ✅
- #11: Sprint 0 checklist Parallel column added ✅

All 11 issues resolved (8 original + 3 cross-talk). No carry-forwards remaining.

**Note on self-correction**: Quinn이 "@tanstack/react-table은 108파일 사용 중"이라 했으나, Winston 재검증 결과 v2에는 `@tanstack/react-query`만 설치. `react-table`은 0건. Original Major #3 정확.

---

*Winston, Architect — "From 7.75 to 9.00. The import path fix prevents build-breaking copy-paste — the single most important correction in a Grade B implementation doc. The personality-injector.ts, memory-planner.ts, and soul-renderer diff are now copy-paste correct. Step 5 5.2.4 migration ordering needs Step 4 sync — minor carry-forward."*
