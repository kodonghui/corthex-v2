## Critic-C (John) Review — Step 6: Research Synthesis (Grade A)

### Review Date
2026-03-22

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 2285-2461

### Product/Delivery Verification Performed
- [x] Brief Go/No-Go gate coverage: Brief §4 defines **11 gates**. Step 6 §6.2 synthesizes **only 8** (#1-#8). **Missing #9 (tool response sanitization), #10 (v1 feature parity), #11 (usability flow)**. These are the 3 most product-critical gates — #9 is ECC 2.1 security compliance, #10 prevents repeating v2's "technically complete but unusable" failure, #11 is the explicit v2 lesson gate ("기술 완성도 ≠ 제품 완성도").
- [x] Sprint 0 prerequisites checked: 6 tasks listed. Missing: Voyage AI API key setup, CEO budget approval dependency. "1-2 days" estimate contradicts Step 5 FIX-S5-8 ("2-3 days after CEO approval").
- [x] Cost model checked: "Total incremental LLM cost: < $5/month" — **underestimates by 2-3x**. Omits observation importance scoring (~$9-15/month per Step 5 FIX-S5-9). Also: "existing Gemini pipeline" at L2452 — Gemini is BANNED.
- [x] Carry-forward claim: "NONE" (L2456) — **factually incorrect**. Multiple open items from Steps 2-5 reviews.
- [x] Score trend verification: Step 4 avg shown as 9.07, Step 5 avg shown as 9.03. Actual post-fix averages: Step 4 = ~8.13 (Winston 8.75 + Quinn 7.30 + John 8.35 / 3), Step 5 = ~8.25 (Winston 8.50 + Quinn 7.90 + John 8.35 / 3). **Scores inflated by ~0.8-0.9 points.**
- [x] Brief-to-synthesis alignment: **5 propagation failures** — same root cause as Steps 4-5 (written before fixes applied)

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 7/10 | 20% | 1.40 | Go/No-Go matrix is specific for the 8 gates it includes: verification methods, sprint assignment, architecture input. Risk registry has severity/domain/mitigation/residual for 9 risks. Sprint readiness has task-level status. Cost model has specific dollar figures. Deductions: (1) Only 8 of 11 gates — 3 missing gates have ZERO specification. (2) Cost figures are wrong (Gemini pipeline, importance scoring omitted, Scenario.gg pricing unverified). (3) Sprint 0 "1-2 days" contradicts corrected "2-3 days after CEO approval". |
| D2 Completeness | 4/10 | 20% | 0.80 | **3 of 11 Go/No-Go gates missing from synthesis** — #9 (tool sanitization/ECC 2.1), #10 (v1 feature parity), #11 (usability flow). These are the MOST product-critical gates: #10 is the explicit v1-feature-spec.md checklist ("if it worked in v1, it must work in v2"), #11 is the v2 lesson gate (technical completeness ≠ product completeness). Step 5 FIX-S5-5 added test templates for all 11, but Step 6 synthesis ignores 3 of them. Also: "Carry-Forward: NONE" is false — at minimum: Scenario.gg pricing, embedding migration 768→1024, reflection cron locking formalization, host.docker.internal Linux issue. Sprint 0 prerequisites missing Voyage AI API key setup. No monitoring strategy for 4 new layers. |
| D3 Accuracy | 4/10 | 15% | 0.60 | **5 propagation failures** (all fixed in Steps 4-5 but not carried to Step 6): (1) L2300: "4GB RAM" → should be 2G (Brief mandate, FIX-S4-2). (2) L2404: "6-layer security" → should be 8-layer (FIX-S4-2). (3) L2418: "90-day TTL" → should be 30-day (Brief mandate, FIX-S4-8). (4) L2452: "existing Gemini pipeline" → Gemini BANNED (FIX-S4-1). (5) L2325: "vector(768)" → should be vector(1024) for Voyage AI. Additional: Score trend table inflated (~0.8-0.9 points above actual). Cost model underestimates LLM costs by 2-3x. |
| D4 Implementability | 6/10 | 15% | 0.90 | Sprint readiness table is well-structured with task/status/blocker. Sprint execution order matches Brief. Architecture readiness checklist is practical (13 items, 10 checked, 3 pending actions). But: an Architect reading ONLY Step 6 would (A) think there are 8 gates, not 11, (B) use 4GB instead of 2G, (C) use 90-day TTL instead of 30-day, (D) reference Gemini instead of Voyage AI, (E) build UXUI workflow on Subframe instead of Stitch 2. Step 6 as standalone Architecture input is actively misleading. |
| D5 Consistency | 4/10 | 10% | 0.40 | **5+ specification conflicts** with Brief and Steps 4-5 corrected values: (1) 4GB vs 2G RAM. (2) 90-day vs 30-day TTL. (3) 6-layer vs 8-layer security. (4) Gemini vs Voyage AI. (5) Subframe primary vs Stitch 2 primary (L2327 "Playwright screenshot diff < 5% vs Subframe reference", L2429-2431 "Subframe as primary design tool... Stitch demoted to secondary"). MEMORY.md and CLAUDE.md both say Stitch 2 is primary, Subframe is deprecated (폐기). L2363 Sprint 0: "Design token extraction (Subframe)" — should be Stitch 2. Positive: sprint order matches Brief, DEFAULT_PERSONALITY values consistent. |
| D6 Risk Awareness | 5/10 | 20% | 1.00 | Risk registry exists with 9 risks, proper severity ordering. But: (1) Cost model underestimates LLM by 2-3x — at scale this could blow budget. (2) 3 missing Go/No-Go gates = 3 risks not covered (#9 security, #10 parity, #11 usability). (3) "Carry-Forward: NONE" gives false all-clear to Architecture stage. (4) Sprint 0 timeline doesn't include CEO approval latency (Step 5 FIX-S5-8 identified this). (5) Reflection cron race condition missing from registry (Steps 3-4 identified, FIX-S4-4 mitigated, but not in final registry). (6) R6 "4GB RAM" is wrong — 2G is the limit, which changes the resource contention calculus entirely. |

### Weighted Average: 5.10/10 FAIL

### Issues Found

1. **[D2 Completeness — CRITICAL] 3 of 11 Go/No-Go gates missing from synthesis.** Brief §4 defines 11 gates. Step 6 §6.2 only synthesizes #1-#8. Missing: **#9** (tool response sanitization — ECC 2.1, "에이전트 84% 취약, CORTHEX = root access agent"), **#10** (v1 feature parity — v1-feature-spec.md 체크리스트, slash commands 8종, CEO presets, delegation chains), **#11** (usability flow — Admin onboarding without help, CEO 5-min task completion). These are the v2 lesson gates — v2 had 10,154 tests but was unusable. An Architect proceeding with only 8 gates will miss the 3 gates that prevent repeating v2's failure. Step 5 FIX-S5-5 already wrote test templates for all 11. — **Critical (BLOCKING)**

2. **[D3/D5 Consistency — CRITICAL] Subframe/Stitch INVERTED in §6.5 Domain 6.** L2429: "Subframe as primary design tool (skill-based MCP)". L2431: "Stitch demoted to secondary (screen extraction only)". Brief says "디자인 도구: **Stitch 2**(메인)". MEMORY.md: "Subframe(폐기)". CLAUDE.md: "Stitch MCP가 생성한 HTML = 디자인 기준". Step 5 FIX-S5-4 already corrected this in §5.4. Step 6 regresses. This is the THIRD time this error has been identified and fixed — yet it persists in the synthesis that will feed the Architecture stage. — **Critical**

3. **[D3 Accuracy — CRITICAL] "existing Gemini pipeline" at L2452.** "Embedding generation reuses existing Gemini pipeline (Epic 10)." Gemini is BANNED per Brief Technical Constraints (L493: "Gemini 금지"), CLAUDE.md, feedback_no_gemini.md. Step 3 FIX-S3-1, Step 4 FIX-S4-1, Step 5 FIX-S5-6 all fixed this. Step 6 regresses to the banned provider IN THE COST MODEL — meaning the Architecture stage would build cost projections on a provider that cannot be used. — **Critical**

4. **[D2 Completeness — CRITICAL] "Carry-Forward to Architecture Stage: NONE" is factually incorrect.** L2456 claims all research questions resolved. At minimum 5 open items: (A) Scenario.gg pricing ($15/mo in doc vs $45-99/mo actual per Winston's web verification). (B) Embedding provider migration — all existing embeddings are 768d Gemini, v3 needs 1024d Voyage AI, migration plan needed. (C) host.docker.internal incompatibility on Linux (Docker networking). (D) Reflection cron advisory lock — designed in FIX-S4-4 but not formalized as architecture decision. (E) Go/No-Go #10 v1 feature checklist needs specific v1-feature-spec.md items enumerated. — **Critical**

5. **[D3/D5 Accuracy+Consistency — MAJOR] 5 propagation failures from Steps 4-5.** Same root cause as previous steps — Step 6 written before fixes applied. (1) L2300: "4GB RAM" → 2G. (2) L2404: "6-layer security" → 8-layer. (3) L2418: "90-day TTL" → 30-day. (4) L2325: "vector(768)" → vector(1024). (5) L2452: "Gemini pipeline" → Voyage AI. All were fixed in Steps 4-5 but NOT propagated to the synthesis. — **Major**

6. **[D6 Risk Awareness — MAJOR] Cost model underestimates LLM costs by 2-3x.** L2452: "Total incremental LLM cost: < $5/month". This only counts Haiku reflections ($1.80/mo). Omits: observation importance scoring (~$9-15/month per Step 5 FIX-S5-9, ~30,000 Haiku calls/month for 50 agents). True LLM total: ~$11-17/month. Combined with wrong Scenario.gg pricing ($30 one-time vs $90-198 actual), the total cost model presented to the Architect is significantly wrong. — **Major**

7. **[D3 Accuracy — MAJOR] Score trend table inflated.** L2304-2313: Step 4 avg 9.07, Step 5 avg 9.03. Actual post-fix averages: Step 4 = ~8.13 (W:8.75 + Q:7.30 + J:8.35 ÷ 3). Step 5 = ~8.25 (W:8.50 + Q:7.90 + J:8.35 ÷ 3). Pre-fix averages were both ~5.45 (all FAIL). The table inflates scores by ~0.8-0.9 points, misrepresenting research quality to the Architecture stage. — **Major**

8. **[D4 Implementability — MAJOR] Sprint 0 estimate wrong + missing tasks.** L2357: "1-2 days" contradicts Step 5 FIX-S5-8 which corrected to "2-3 days after CEO approval". Neon Pro requires CEO budget approval (FIX-S4-18). Sprint 0 task list (L2359-2366) also missing: (A) Voyage AI SDK migration + API key setup (Step 5 FIX-S5-8 added this). (B) CEO budget approval step. If approval takes a week, Sprint 1 is blocked. — **Major**

9. **[D5 Consistency — MAJOR] L2327 Gate #6 + L2363 Sprint 0: Subframe references.** Gate #6: "Playwright screenshot diff < 5% vs Subframe reference". Sprint 0: "Design token extraction (Subframe)". Both should reference Stitch 2 per Step 5 FIX-S5-4. — **Major**

10. **[D6 Risk Awareness — MINOR] Risk registry R6 uses wrong RAM figure.** L2341: "2G RAM limit" (correct in registry table) but L2300 executive summary says "4GB RAM" and L2405 Domain 2 says "4GB RAM limit". The Architect gets conflicting resource limits in the same document. — **Minor**

11. **[D2 Completeness — MINOR] No monitoring/observability strategy for 4 new layers.** Concur with Winston. How will team detect: memory-reflection cron failing silently? n8n container memory leak? PixiJS client-side errors? Only ARGOS mentioned for reflections. — **Minor**

12. **[D5 Consistency — MINOR] Neon Pro "$19/month" unverified.** Concur with Winston. Price not web-verified in any step. Neon pricing may have changed. — **Minor**

13. **[D3 Accuracy — MINOR] L2385: "Cost model validated (Haiku reflections ~$1.80/month)".** Architecture readiness checklist claims cost model validated, but the model is incomplete (missing importance scoring, wrong Scenario.gg pricing, wrong embedding provider). The checkbox should be unchecked. — **Minor**

### Cross-talk
**To Winston (Architect):** (1) The 3 missing Go/No-Go gates (#9/#10/#11) are my top concern. #10 is the v1-feature-spec.md gate — v2's core failure was "technically complete but unusable". #11 is the explicit v2 lesson gate. An Architect proceeding with only 8 gates will design a system that can pass technical tests but fail the product. (2) Score trend table: your post-fix Step 4 was 8.75, not contributing to a 9.07 average. How were these scores calculated? (3) Concur with your CRIT-1 ("NONE" carry-forwards) and MAJOR-2 (Scenario.gg pricing).
**To Quinn (QA):** (1) Concur with your CRIT-1 (cost model 2-3x underestimate) and CRIT-2 ("NONE" carry-forwards). (2) Go/No-Go #9 is MISSING from Step 6 — the observation sanitization gate you've been championing since Step 3 doesn't exist in the Architecture input. FIX-S5-5 added the test template, but Step 6 synthesis dropped it. (3) The Gemini reference at L2452 means the cost model is built on a banned provider. (4) Sprint 0 is missing your Voyage AI migration concern from Step 5.
**From Winston:** Confirmed all points. Score 3.80 FAIL (21 factual errors in 176 lines). Key additions: (1) Score trend uses Writer self-assessment averages, NOT critic post-fix verified scores — methodology confirmed as inflated. Corrected Step 4 avg: ~8.57 (Winston 8.85, Quinn ~8.5, John 8.35), Step 5: 8.25. (2) Cost model even worse than my estimate — operational total ~$36/mo (not $21), Scenario.gg $90-198 (not $30). Budget approval based on 3-4x understated costs = delivery risk. (3) Suggested process improvement: "propagation sweep" — grep all previous-step fix values across current step before submission. (4) Aligned on Go/No-Go 3 missing gates as most critical product issue.
**From Quinn:** Confirmed all points. Score 4.30 FAIL. Key additions: (1) Cost model: actual LLM ~$10.80/mo (importance scoring $9/mo from Step 5), operational ~$30/mo not $21. (2) Sprint 0 missing Voyage AI SDK migration — the BIGGEST Sprint 0 task (2-3 days, 12+ files per Step 5 §5.6.1). (3) Confirmed Go/No-Go #9/#10/#11 absent — the exact gates I defined PM criteria for. (4) "NONE" carry-forwards erases all PM action items: Go/No-Go #10/#11 criteria, Scenario.gg pricing, Sprint 0 timeline. (5) Step 5 avg claims 9.03, actual ~8.23. Agrees synthesis needs complete rewrite from post-fix content.

### Verdict
**FAIL (5.10)** — Pre-fix verdict. See post-fix re-verification below.

---

### Post-Fix Re-Verification (2026-03-22)
**Fixes file**: `_bmad-output/party-logs/stage-1-step-06-fixes.md` — 25 fixes (7 CRITICAL + 8 HIGH + 5 MEDIUM + 5 LOW). ALL applied to source document.

#### Re-Verification Results (spot-checked in source document)
| Issue | Fix | Source Doc Verified |
|-------|-----|---------------------|
| CRIT-1: 3 missing Go/No-Go gates | FIX-S6-5: #9/#10/#11 added | ✅ L2316: "11 Gates". L2330: #9 sanitization with 4-layer defense. L2331: #10 v1-feature-spec.md checklist across all sprints. L2332: #11 Admin onboarding + CEO 5-min Playwright E2E. All have verification methods + sprint mapping. |
| CRIT-2: Subframe/Stitch inverted | FIX-S6-3: 6 locations | ✅ L2327: "Stitch 2 reference". L2348: "Stitch 2 MCP generates". L2370: "Design token extraction (Stitch 2)". L2437: "Stitch 2 primary — Subframe deprecated". L2439: "Subframe is deprecated (폐기)". L2442: "Stitch 2 MCP in Sprint 0". |
| CRIT-3: Gemini pipeline | FIX-S6-4: Voyage AI | ✅ L2461: "Embedding generation migrates to Voyage AI (voyage-3, 1024d) — Sprint 0 migration from banned Gemini". No Gemini references remain in cost model. |
| CRIT-4: "NONE" carry-forwards | FIX-S6-7: 5 items | ✅ L2465-2470: Scenario.gg pricing, advisory lock/Neon, sanitization ordering, embedding concurrency, Go/No-Go #10 checklist. L2472: "complete data for all 11 Go/No-Go gates". |
| MAJ-5: 5 propagation failures | FIX-S6-1/8/9/10/4 | ✅ L2300: "memory: 2G". L2412: "8-layer security model". L2426: "30-day TTL per Brief §4 CEO signoff". L2325: "vector(1024) Voyage AI". L2461: "Voyage AI". |
| MAJ-6: Cost model 2-3x underestimate | FIX-S6-6 | ✅ L2461: "~$17/month (reflections $1.80 + importance $15)". Operational "~$36/month". Scenario.gg "$15-99/mo × 2 months, pricing TBD". |
| MAJ-7: Score trend inflated | FIX-S6-2 | ✅ L2304: "(post-fix verified averages)". L2311: Step 4 = 8.57. L2312: Step 5 = 8.25. |
| MAJ-8: Sprint 0 estimate + tasks | FIX-S6-11 | ✅ L2362: "2-3 days after CEO approval". L2366: "CEO budget approval required". L2367: Voyage AI SDK migration (2-3 days, 12+ callers). L2368: API key setup. L2374: Advisory lock test. |
| MAJ-9: Subframe refs | FIX-S6-3 | ✅ Covered by CRIT-2 above. |
| MIN-10: R6 conflicting RAM | FIX-S6-20 | ✅ L2300: "memory: 2G". L2344: "2G RAM". L2413: "memory: 2G". No "4GB" anywhere. |
| MIN-13: Cost checkbox | FIX-S6-13 | ✅ L2393: "[ ] Cost model validated (see §6.6 #4 — needs CEO review: ~$36/mo operational + ~$17/mo LLM)". Correctly unchecked. |

**Minor residuals**: (1) Domain 5 (L2432) still says "Scenario.gg $15/mo × 2 months = $30" while §6.6 carry-forward correctly flags pricing as TBD ($15 vs $45-99). Internal inconsistency, but the carry-forward catches it. (2) Gate #7 mentions "backpressure" but doesn't address Brief requirement for per-tier budget auto-cutoff mechanism ("Tier별 한도 초과 시 자동 차단"). Sufficient for synthesis — details during Architecture. (3) No explicit monitoring/observability strategy for 4 new layers — ARGOS mentioned for R6 only. Acceptable for Grade A synthesis scope.

#### Post-Fix Dimension Scores
| Dimension | Pre-Fix | Post-Fix | Weight | Weighted | Evidence |
|-----------|---------|----------|--------|----------|----------|
| D1 Specificity | 7 | 9/10 | 20% | 1.80 | 11 gates with specific verification methods, sprint mapping, architecture input. 11 risks with severity/mitigation/residual. Sprint 0 has 9 tasks with owners and blockers. Cost model: specific dollar figures ($17/mo LLM, $36/mo operational). Score trend verified. |
| D2 Completeness | 4 | 8/10 | 20% | 1.60 | All 11 Brief Go/No-Go gates synthesized (was 8). 5 carry-forwards documented (was "NONE"). Sprint 0 includes Voyage AI migration + CEO approval. Risk registry 11 risks (was 9). Gate #10 spans all 4 sprints. Minor: monitoring strategy absent, Gate #7 auto-cutoff deferred. |
| D3 Accuracy | 4 | 8/10 | 15% | 1.20 | All 5 propagation errors fixed. Score trend uses post-fix verified averages. Cost model corrected ($17/mo LLM, $36/mo operational). Gemini → Voyage AI. Vector 1024d. 30-day TTL. 2G RAM. 8-layer security. Minor: Domain 5 Scenario.gg $15 inconsistent with §6.6 TBD. |
| D4 Implementability | 7 | 9/10 | 15% | 1.35 | Sprint readiness with 9 tasks, clear blockers, CEO approval dependency. 11 gates with sprint mapping (#10 spans all sprints). Architecture readiness with 4 unchecked actionable items. Domain recommendations are clear PROCEED with WATCH items. An Architect reading Step 6 now gets correct values. |
| D5 Consistency | 4 | 8/10 | 10% | 0.80 | All Brief-to-synthesis conflicts resolved (2G, 30d, 8-layer, Voyage AI, Stitch 2). Score trend matches party-logs. Sprint gate mapping includes #9-#11. Carry-forwards acknowledged. Minor: Scenario.gg $15 in Domain 5 vs TBD in §6.6. |
| D6 Risk Awareness | 5 | 8/10 | 20% | 1.60 | 11 risks (R10 observation poisoning + R11 advisory lock/Neon added). 5 carry-forwards documented. Cost model corrected with CEO review needed. Sprint 0 CEO approval dependency. Sanitization ordering flagged as architecture decision. Minor: monitoring strategy absent, Gate #7 auto-cutoff deferred. |

### Post-Fix Weighted Average: 8.35/10 ✅ PASS

### Final Verdict
**PASS (8.35)** — All 4 Critical and 5 Major issues resolved and verified in source document. The synthesis now correctly represents 11 Go/No-Go gates (matching Brief §4 MVP Success Criteria), Stitch 2 as primary UXUI tool (Subframe deprecated), Voyage AI embeddings (Gemini banned), corrected cost model (~$17/mo LLM + ~$36/mo operational), verified score trend averages, expanded Sprint 0 with Voyage AI migration and CEO approval, and 5 documented carry-forwards for Architecture. The synthesis is now a reliable Architecture-stage input.

Minor residuals (acceptable for Grade A synthesis): Scenario.gg pricing internal inconsistency (Domain 5 $15 vs §6.6 TBD — carry-forward catches it), Gate #7 auto-cutoff mechanism deferred to Architecture, no explicit monitoring strategy for new layers. These should be addressed during Architecture/story dev.
