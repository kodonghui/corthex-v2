# Critic-B (QA + Security) Review — Stage 1 Step 06: Research Synthesis

**Reviewer**: Quinn (QA Engineer)
**Date**: 2026-03-20
**Document**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — "Step 6: Research Synthesis" (L1931-L2107)
**Rubric**: Critic-B weights — D1=10%, D2=25%, D3=15%, D4=10%, D5=15%, D6=25%

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 8 Go/No-Go gates with verification methods, sprint mapping, and architecture inputs. 9 risks with mitigations and residual risk levels. Sprint 0 checklist with status/blocker columns. 6 domain recommendations with key patterns, watch items, architecture inputs. Architecture readiness checklist (7 checked, 3 pending). **Minor**: No consolidated cost summary table (individual costs scattered across domains — $1.80/month Haiku, Scenario.gg free, Neon Pro). |
| D2 완전성 | 8/10 | All 6 subsections present (exec summary, Go/No-Go matrix, risk registry, sprint readiness, domain recommendations, conclusions). Go/No-Go #6 test template exists (L1871). **Gap**: Service file list L2028 claims "6 new service files" but document references 8 unique new files across Steps 1-5. Missing: `memory-reflection.ts` (14 references in doc, cron component, architecture diagram L1198) and `embedding-backfill.ts` (architecture diagram L1205, Step 4 L1331). Listed but not in Step 4: `n8n-proxy` (from Step 3 L627) and `office-state-store` (from Step 1). Architect will plan for 6 files but actually needs 8. |
| D3 정확성 | 8/10 | **Verified against earlier steps**: (1) Go/No-Go gate mapping matches Brief refs ✅. (2) Migration ordering 0061→0065 matches Step 4 Decision 4.6.1 ✅. (3) Risk R7 4-layer sanitization matches Step 4 Decision 4.3 ✅. (4) Score trend table plausible (averages across 3 critics, not individually verifiable). (5) Haiku cost $1.80/mo matches Step 4 L1247 calculation ✅. **BUT**: (1) R6 Docker limits `mem_limit: 2g, cpus: '1.0'` (L1987) contradicts Steps 2/3/4 which consistently say `memory: 4G, cpus: '2'` (L244, L613-614, L1080). 50% resource reduction without explanation. (2) R6 "n8n uses ~7% worst case" with 2GB limit on 15.5GB headroom = 12.9%, not ~7%. Even against 24GB total VPS = 8.3%. |
| D4 실행가능성 | 9/10 | Sprint 0 checklist is actionable with 🔴/🟡/🟢 status indicators. Sprint execution order clear with gates per sprint. Architecture readiness checklist with unchecked items (Neon Pro, PixiJS benchmark, PM approval). Domain recommendations have concrete "Watch" items. |
| D5 일관성 | 8/10 | (1) Service file list Step 6 ≠ Step 4 (different 6 of 8 files). (2) L2100 "Sprint 3 depends on Sprint 1 for personality_traits" — Sprint 3 deliverables (observations table, embedding column, memory services) have no code-level dependency on personality_traits (0063). observation-recorder.ts doesn't query personality. memory-planner.ts doesn't reference personality. The dependency is behavioral (personality affects agent output → affects observations) not technical. Migration 0062 depends on 0061 (enum), which is Sprint 0, not Sprint 1. (3) Docker limits data drift (see D3). (4) PixiJS bundle: all Step 6 references correctly use 200KB (Brief target). CI gate L1919 uses 204800 (=200KB). Consistent within Step 6. Winston's 300KB recommendation acknowledged in cross-talk but not formally adopted in CI — reasonable decision, Brief is authoritative. |
| D6 리스크 | 9/10 | 9 risks properly severity-ordered (Critical→Low). All traced to research step where identified. Mitigations cross-referenced to earlier decisions. 2 "Resolved" risks appropriately closed (R2 iframe, R5 PRD alignment). 0 unmitigated critical. "Zero carry-forward" claim (L2102) mostly valid — Go/No-Go #3/#6 test templates were flagged as incomplete in Step 5 review but Step 5 actually includes test skeletons (L1837-1862 for #3, L1871 for #6). |

---

## 가중 평균

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 8 | 25% | 2.00 |
| D3 정확성 | 8 | 15% | 1.20 |
| D4 실행가능성 | 9 | 10% | 0.90 |
| D5 일관성 | 8 | 15% | 1.20 |
| D6 리스크 | 9 | 25% | 2.25 |
| **합계** | | **100%** | **8.45/10 ✅ PASS** |

---

## 이슈 목록

### Issue 1 — [D3 정확성] Docker resource limits data drift (Medium)
- **L1987**: R6 mitigation says `mem_limit: 2g`, `cpus: '1.0'`
- **Steps 2/3/4**: `memory: 4G`, `cpus: '2'` (L244, L613-614, L1080)
- **영향**: 50% resource reduction without documented decision. Architect receives conflicting spec — which Docker compose values to use?
- **권장**: Either (A) update R6 to match Steps 2/3/4 (`4G, 2 CPUs`), or (B) add explicit decision note "Revised from 4G/2CPU to 2G/1CPU — [rationale]" and update Steps 2/3/4 for consistency.

### Issue 2 — [D3 정확성] R6 VPS percentage math error (Low)
- **L1987**: "VPS has 15.5GB free — n8n uses ~7% worst case"
- **계산**: 2GB / 15.5GB headroom = 12.9%. 2GB / 24GB total = 8.3%. Neither equals ~7%.
- **권장**: Correct to "~8% of total VPS RAM" or "~13% of free headroom".

### Issue 3 — [D2 완전성] Service file count mismatch — 6 claimed, 8 actual (Medium)
- **L2028**: "6 new service files identified (personality-injector, observation-recorder, memory-planner, n8n-client, n8n-proxy, office-state-store)"
- **Step 4 L1326-1332**: personality-injector, observation-recorder, **memory-reflection**, memory-planner, **embedding-backfill**, n8n-client
- **누락**: `memory-reflection.ts` (14 references in doc, cron component), `embedding-backfill.ts` (architecture diagram)
- **Step 6에만 있음**: `n8n-proxy` (Step 3 L627), `office-state-store` (Domain 1)
- **고유 NEW 파일 총계**: 8개 — personality-injector, observation-recorder, memory-reflection, memory-planner, embedding-backfill, n8n-client, n8n-proxy, office-state-store
- **영향**: Architect plans for 6 files, misses 2 critical services (reflection cron, embedding backfill)
- **권장**: Update to "8 new service files" and list all 8.

### Issue 4 — [D5 일관성] Sprint 3 → Sprint 1 false dependency (Low)
- **L2100**: "Sprint 3 (Memory) depends on Sprint 1 only for personality_traits being available"
- **분석**: Sprint 3 deliverables (observations table 0062, embedding column 0064, HNSW 0065, observation-recorder, memory-reflection, memory-planner) have zero code-level dependency on personality_traits (0063)
- observation-recorder: records agent observations — no personality lookup in code (L1417-1475)
- memory-planner: retrieves memories by similarity/recency — no personality reference (L1474-1540)
- migration 0062 depends on 0061 (enum extension) — Sprint 0, not Sprint 1
- **영향**: False dependency could unnecessarily prevent Sprint 1/3 parallelization. If they're truly independent, Sprint 3 could start without waiting for Sprint 1 completion.
- **권장**: Either (A) remove Sprint 3→Sprint 1 dependency claim, or (B) cite specific code-level dependency if one exists.

---

## 자동 불합격 체크

| 조건 | 결과 |
|------|------|
| 할루시네이션 | ✅ CLEAR — Go/No-Go gates match Brief. Migration order matches Step 4. Risk mitigations trace to earlier research. |
| 보안 구멍 | ✅ CLEAR — Synthesis doesn't introduce new security surface. All security mitigations (4-layer, 6-layer, HMAC) correctly referenced. |
| 빌드 깨짐 | ✅ CLEAR — Synthesis is documentation, no code changes. |
| 데이터 손실 위험 | ✅ CLEAR — All migrations confirmed additive (no DROP/ALTER TYPE/RENAME). |
| 아키텍처 위반 (E8) | ✅ CLEAR — E8 boundary integrity noted (L2088). All new services in services/. |

---

## Cross-talk Notes

- **Winston에게**: (1) Docker resource limits: Steps 2/3/4 say 4G/2CPU, Step 6 R6 says 2G/1CPU. Architect needs one authoritative spec. 어느 값이 정확한지 확인 부탁드립니다. (2) Service file count: Step 4 lists 6 new files but excludes n8n-proxy and office-state-store. Step 6 lists 6 different files but excludes memory-reflection and embedding-backfill. Total unique = 8. Architecture Decision 4.6.2 needs update. (3) Sprint 3→Sprint 1 dependency: I can't find a code-level dependency. If there is one, please cite.
- **John에게**: (1) Sprint parallelization opportunity: If Sprint 3→Sprint 1 dependency is false, Sprint 1 (UXUI+Big Five) and Sprint 3 (Memory) could potentially run in parallel, reducing timeline. Worth evaluating. (2) Cost summary suggestion: Scatter costs (Haiku $1.80/mo, Neon Pro $19/mo, Scenario.gg $30 one-time) into one table for PM visibility. (3) Zero carry-forward claim is valid — all research questions resolved, but note Sprint 0 has 3 pending items (Neon Pro, benchmark, PM approval).

---

## Cross-talk Addendum (Post-Review)

### Issue 5 — [D3 정확성] Scenario.gg free vs Pro inconsistency within Step 6 (Medium) — John 발견
- **L1975** (Go/No-Go #8): "Scenario.gg primary tool (**free**, best quality)"
- **L2070** (Domain 5 recommendation): "**Pro tier** ($15/mo × 2 months = $30, per Step 5.3) for 800+ generation volume"
- **Step 5 L1696**: Pro plan = $15/mo (5K gens). Free tier generation limit not specified in doc.
- **영향**: Go/No-Go #8 tells Architect "free tier sufficient" but Domain 5 recommendation says "Pro tier needed." PM budgeting affected.
- **권장**: (A) If 800 gens needed (50 chars × 16 frames), and free tier is insufficient → update L1975 to Pro + cost. (B) If free tier covers 800 gens → update L2070 to remove Pro reference.

### Cross-talk 참고 (점수 미반영)
- **Winston Layer 번호 전치 주장** — **검증 결과: Step 6 CORRECT**. L2020 "Sprint 3 | Layer 4 (Memory)", L2021 "Sprint 4 | Layer 1 (OpenClaw office)". Document 전체에서 Layer 1=PixiJS, Layer 4=Memory 일관 유지 (L46-49, L1001, L1180). 전치 없음.
- **Winston QA coverage gap** — memory-reflection.ts + embedding-backfill.ts 누락은 Issue 3과 동일. Sprint 3 QA test plan에서 반드시 포함 필요. Step 5 L1812에 `memory-reflection.test.ts` 이미 명시되어 있으나 Step 6 체크리스트에서 빠짐.

**총 5개 이슈** (0 HIGH, 3 Medium, 2 Low). 수정 적용 시 8.85+ 예상.

---

## 🔄 Fix Verification (Post-Review)

**Dev 수정 확인 일시**: 2026-03-20

### Issue 1 — Docker resource limits aligned → ✅ VERIFIED
- **L1987**: `memory: 4G`, `cpus: '2'`, "(Steps 2/3/4 consistent)" ✅
- **VPS %**: "~17% of total RAM worst case" (4GB/24GB=16.7%) ✅

### Issue 2 — VPS percentage corrected → ✅ VERIFIED
- Covered by Issue 1 fix — "~17% of total RAM worst case" ✅

### Issue 3 — Service file count → ✅ VERIFIED
- **L2028**: "6 new service files (personality-injector, observation-recorder, memory-reflection, memory-planner, embedding-backfill, n8n-client) per Step 4 §4.6.2" ✅
- memory-reflection and embedding-backfill restored ✅
- Scoped to `services/` directory — n8n-proxy (route) and office-state-store (state) correctly excluded from "service files" label ✅

### Issue 4 — Sprint 3→Sprint 1 false dependency removed → ✅ VERIFIED
- **L2100**: "Sprint 3 (Memory) depends only on Sprint 0 migration 0061 (enum extension) — no dependency on Sprint 1" ✅

### Issue 5 — Scenario.gg free vs Pro → ✅ VERIFIED
- **L1975**: "Scenario.gg primary tool ($15/mo Pro plan, per Step 5.3)" — "free" removed ✅
- **L2070**: "Pro tier ($15/mo × 2 months = $30)" — consistent ✅
- **L2098**: Cost now says "Total incremental **LLM** cost: < $5/month. Total incremental **operational** cost: ~$21/month" — clear scoping ✅
- Zero "free" references for Scenario.gg in document (grep confirmed) ✅

---

## 수정 후 점수 재산정

| 차원 | 기존 | 수정후 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9 | 9 | 변동 없음 |
| D2 완전성 | 8 | **9** | Service file list now complete and properly scoped. Cost summary clarified (LLM vs operational). |
| D3 정확성 | 8 | **9** | Docker limits aligned (4G/2CPU). VPS % corrected (17%). Scenario.gg Pro consistent. |
| D4 실행가능성 | 9 | 9 | 변동 없음 |
| D5 일관성 | 8 | **9** | Sprint dependency corrected. Service file list matches Step 4. All cross-step values consistent. |
| D6 리스크 | 9 | 9 | 변동 없음 |

| 차원 | 점수 | 가중치 | 가중점수 |
|------|------|--------|---------|
| D1 구체성 | 9 | 10% | 0.90 |
| D2 완전성 | 9 | 25% | 2.25 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 9 | 10% | 0.90 |
| D5 일관성 | 9 | 15% | 1.35 |
| D6 리스크 | 9 | 25% | 2.25 |
| **합계** | | **100%** | **9.00/10 ✅ PASS** |

---

## Final Verified 판정

**9.00/10 ✅ PASS (Verified)**

5개 이슈 전부 해결. Docker limits aligned to 4G/2CPU across all steps. Service file list correctly scoped to services/ (6) with Step 4 §4.6.2 reference. Sprint 3→Sprint 1 false dependency removed. Scenario.gg consistently Pro $15/mo. Cost summary clearly separates LLM ($5/mo) vs operational ($21/mo) costs. Zero carry-forwards confirmed valid.
