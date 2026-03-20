# Critic-A (Architecture) Review — Step 6: Research Synthesis

**Reviewer:** Winston (Architect)
**Date:** 2026-03-20
**File:** `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Step 6: Research Synthesis" (L1931-2107)

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | Go/No-Go matrix with 7 columns per gate — verification method, sprint, architecture input all specified. Risk registry with severity/mitigation/residual risk. Sprint 0 checklist with status indicators. Domain recommendations with key patterns and watch items. PixiJS "120-150KB gzipped" estimate sourced from Step 2 (L529). Strategic conclusions concrete. Overall excellent for a synthesis step. |
| D2 완전성 | 7/10 | All 8 Go/No-Go gates present. All 9 risks from Steps 1-5. 6 domain recommendations. Sprint readiness. Strategic conclusions. **Gap**: Architecture Readiness Checklist (L2028) lists 6 new service files but the list is **wrong**: missing `memory-reflection.ts` and `embedding-backfill.ts` (both in Step 4 4.6.2), replaced with `n8n-proxy` and `office-state-store` which are NOT in Step 4's service file organization. If Architecture stage uses this checklist, 2 critical ARGOS cron services may be omitted from sprint planning. |
| D3 정확성 | 7/10 | **5 factual errors**: (1) Scenario.gg described as "free" (L1975, L2070) but Step 5 5.3.1 says "$15/mo (5K gens)" and cost estimate says "$15/mo × 2 months = $30" (L1734). Self-contradiction. (2) n8n Docker limits in R6 (L1987): `mem_limit: 2g, cpus: '1.0'` — contradicts Step 2 (L244: `memory: 4G, cpus: '2'`), Step 3 (L613-614: `memory: 4G, cpus: '2'`), Step 4 (L1080: `memory: 4G, cpus: '2'`). Three steps say 4G/2CPU, R6 says 2G/1CPU. (3-4) Layer transposition in Sprint table: Sprint 3 says "Layer 1 (Memory)" but Step 4 defines Memory as "Layer 4" (L1180). Sprint 4 says "Layer 4 (OpenClaw)" but Step 4 defines PixiJS as "Layer 1" (L1001). (5) Sprint dependency (L2100): "Sprint 3 depends on Sprint 1 only for personality_traits" — incorrect. Memory pipeline (observations, reflections) has zero dependency on personality_traits. Sprint 3 depends on Sprint 0 (migration 0061 for enum), not Sprint 1. ✅ Correct: 8 Go/No-Go gates present, migration count (0061-0065), cost model ($1.80/mo Haiku), E8 boundary claim, additive architecture claim. |
| D4 실행가능성 | 8/10 | Go/No-Go matrix is immediately actionable — Architecture agent can consume this directly. Risk registry mitigations are specific. Sprint execution order clear. Sprint 0 checklist with status provides a launch roadmap. But service file list error could cause Architecture to miss 2 services. |
| D5 일관성 | 6/10 | **Multiple inconsistencies with prior steps**: (1) Layer numbering transposed in 3 places — Sprint 3 "Layer 1" (should be 4), Sprint 4 "Layer 4" (should be 1), Domain 1 recommendation "Layer 4 — OpenClaw Office" (should be Layer 1). (2) n8n Docker limits: R6 says 2G/1CPU, Steps 2/3/4 all say 4G/2CPU. (3) Service file list differs from Step 4 (4.6.2): missing memory-reflection.ts, embedding-backfill.ts; added n8n-proxy, office-state-store. (4) Scenario.gg cost: "free" vs "$15/mo". (5) Sprint 3 dependency on Sprint 1 — not supported by migration design (0062/0064/0065 are independent of 0063). |
| D6 리스크 | 8/10 | "0 unmitigated critical risks" is correct — all 9 risks have mitigations. Residual risk assessment (R1 medium, R8 medium) is reasonable. HNSW on Neon correctly noted (L2065). Neon Pro as prerequisite. Sprint independence mostly correct (except Sprint 3→1 false dependency). Risk ordering by severity appropriate. n8n R6 uses conservative limits (2G < 4G) which errs on safe side. |

### 가중 평균: 7.30/10 ✅ PASS (borderline)

Calculation: (8×0.15) + (7×0.15) + (7×0.25) + (8×0.20) + (6×0.15) + (8×0.10) = 1.20 + 1.05 + 1.75 + 1.60 + 0.90 + 0.80 = **7.30**

---

## 이슈 목록

### Critical

1. **[D5 일관성] Layer 번호 전치 — 3곳** — Synthesis가 Layer 번호를 뒤바꿈:
   - L2020 Sprint 3: "Layer 1 (Memory)" → should be **Layer 4** (per Step 4 L1180: "4.4 Layer 4 Architecture — Agent Memory System")
   - L2021 Sprint 4: "Layer 4 (OpenClaw office)" → should be **Layer 1** (per Step 4 L1001: "4.1 Layer 1 Architecture — PixiJS Virtual Office")
   - L2040 Domain 1: "Layer 4 — OpenClaw Office" → should be **Layer 1**

   Architecture stage가 이 numbering을 사용하면 Sprint-Layer 매핑이 전부 틀림.

### Major

2. **[D2 완전성] Service file checklist 오류** — L2028 "6 new service files: personality-injector, observation-recorder, memory-planner, n8n-client, **n8n-proxy**, **office-state-store**". Step 4 (4.6.2) 정의:
   - ✅ personality-injector, observation-recorder, memory-planner, n8n-client
   - ❌ **n8n-proxy** — Step 4에 없음 (proxy는 routes/workspace/ Hono 라우트)
   - ❌ **office-state-store** — Step 4에 없음 (OfficeStateStore는 인라인 클래스, 별도 서비스 파일 아님)
   - ❌ **MISSING**: `memory-reflection.ts` (ARGOS cron reflection synthesizer)
   - ❌ **MISSING**: `embedding-backfill.ts` (ARGOS cron embedding retry)

   Architecture stage가 이 리스트로 서비스 파일을 생성하면 2개 누락.

3. **[D3 정확성] Scenario.gg "free" vs "$15/mo" 자기모순** — L1975 Go/No-Go #8: "free, best quality". L2070 Domain 5: "Free tier sufficient". 하지만 Step 5 L1696: "$15/mo (5K gens)" + L1734: "$15/mo × 2 months = $30". 같은 문서 내 자기모순.

4. **[D3/D5] n8n Docker limits 자기모순** — R6 (L1987): `mem_limit: 2g, cpus: '1.0'`. Step 2 (L244), Step 3 (L613-614), Step 4 (L1080): 모두 `memory: 4G, cpus: '2'`. 3개 Step이 4G/2CPU, R6만 2G/1CPU. **어느 것이 권위**? 4G/2CPU가 3회 반복되었으므로 이쪽이 맞을 가능성 높음.

5. **[D3 정확성] Sprint 3 → Sprint 1 의존성 오류** — L2100: "Sprint 3 (Memory) depends on Sprint 1 only for personality_traits being available." Sprint 3 migrations (0062 observations, 0064 embedding column, 0065 HNSW index)는 Sprint 1 migration (0063 personality_traits)와 **무관**. Memory pipeline은 personality와 독립. Sprint 3는 Sprint 0 (0061 enum)에만 의존.

### Minor

6. **[D5 일관성] Domain 6 제목** — L2075 "Domain 6: Subframe + Stitch UXUI Tooling". Step 5에서 "UXUI Tooling Integration (Subframe docs + Stitch screen generation)"으로 정리됨. Minor naming 불일치.

---

## Cross-talk 요청

- **Quinn**: (1) Service file checklist 오류 — QA 관점에서 테스트 대상 서비스 리스트 영향. memory-reflection.ts, embedding-backfill.ts 누락 시 테스트 계획에서도 빠질 위험. (2) Layer 번호 전치 — Sprint-Layer 매핑 혼동 시 테스트 scope 오류.
- **John**: (1) Scenario.gg free vs $15/mo — Sprint 0 예산 영향. PM이 "free"로 승인하면 실제 비용 발생 시 blocker. (2) Sprint 3→Sprint 1 의존성 — delivery 순서에 영향. 실제로 독립이면 Sprint 3 병렬 착수 가능.

---

## Cross-talk Additions (post-review)

7. **[D3/D5 Minor] Docker limits residual — 2곳** (Winston verification 발견) — R6 (L1987)은 "memory: 4G, cpus: '2'"로 정정됨 ✅. 하지만 Executive Summary (L1946) "hard resource limits (2GB RAM, 1 CPU)"와 Domain 2 Watch (L2051) "R6 — 2GB RAM limit"에 구 값 잔존. R6 자체가 권위이므로 Architecture 소비에 지장 없음. Minor carry-forward.

---

## Verified Score (Post-Fix)

| 차원 | Before | After | 근거 |
|------|--------|-------|------|
| D1 구체성 | 8 | 9 | Service file list now matches Step 4 §4.6.2 (6 files, correct names). Sprint readiness checklist complete. Go/No-Go matrix with verification methods. Cost model with $30 one-time + $21/mo operational breakdown (L2098). |
| D2 완전성 | 7 | 9 | Service file checklist corrected: n8n-proxy/office-state-store removed, memory-reflection/embedding-backfill added. All 8 gates present. All 9 risks. 6 domain recommendations. Sprint readiness with 3 unchecked action items. |
| D3 정확성 | 7 | 9 | All 5 factual errors fixed: (1) Scenario.gg "$15/mo Pro" in both Go/No-Go #8 and Domain 5 ✅. (2) Docker R6 "memory: 4G, cpus: '2'" matching Steps 2/3/4 ✅. (3-4) Layer numbers corrected Sprint 3=Layer 4, Sprint 4=Layer 1 ✅. (5) Sprint 3 depends on Sprint 0 only ✅. **Residual**: Executive Summary L1946 and Domain 2 L2051 still reference "2GB/1CPU" — superseded by R6 but text not updated. Minor. |
| D4 실행가능성 | 8 | 9 | Go/No-Go matrix immediately consumable by Architecture. Service file list actionable — 6 files to create in `services/`. Sprint 0 checklist provides launch roadmap with blocker mapping. |
| D5 일관성 | 6 | 8 | Layer numbers corrected in all 3 places ✅. Service file list matches Step 4 §4.6.2 ✅. Scenario.gg cost consistent ✅. Sprint dependency consistent ✅. Docker limits: R6 corrected but Executive Summary (L1946) and Domain 2 Watch (L2051) retain old "2GB/1CPU" values — 2 residual inconsistencies prevent 9. |
| D6 리스크 | 8 | 9 | Sprint independence correctly stated (Sprint 3 depends only on Sprint 0). "0 unmitigated critical risks" verified. Residual medium risks (R1, R8) reasonable. HNSW on Neon compute correctly attributed (L2065). |

**가중 평균: 8.85/10 ✅ PASS**

Calculation: (9×0.15) + (9×0.15) + (9×0.25) + (9×0.20) + (8×0.15) + (9×0.10) = 1.35 + 1.35 + 2.25 + 1.80 + 1.20 + 0.90 = **8.85**

All 6 original issues resolved. 1 new minor residual (Docker limits text at L1946/L2051 not updated to match corrected R6). Not blocking — R6 is the authoritative spec and it's correct.

**Cross-talk verification**:
- Quinn's Docker limits question → answered: 4G/2CPU is authoritative (R6 corrected) ✅
- Quinn's service count → 6 service files per Step 4 §4.6.2, correctly reflected ✅
- Quinn's Sprint 3→1 dependency → confirmed no dependency, now "Sprint 0 only" ✅
- John's Layer numbers → confirmed corrected in all 3 places ✅
- John's Scenario.gg residual in Go/No-Go #8 → now "$15/mo Pro plan" ✅
- John's Sprint 3 fix → confirmed already applied ✅

---

*Winston, Architect — "From 7.30 to 8.85. The largest improvement was D5 consistency — Layer number transposition (3 places), service file list (4 errors), and Docker limits all corrected. The synthesis now serves its purpose: a single source of truth that Architecture can consume without cross-referencing Steps 1-5 for corrections. Two Docker text residuals (L1946, L2051) are superseded by R6's corrected values. Stage 1 Technical Research: 6 steps reviewed, all verified PASS. Ready for Architecture."*
