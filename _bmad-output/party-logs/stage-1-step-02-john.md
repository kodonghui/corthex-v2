## Critic-C (John/PM — Product + Delivery) Review — Step 2: Technical Overview

### Review Date
2026-03-21

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 112-484

### Product & Delivery Verification Performed
- [x] Go/No-Go gate coverage mapped: Brief defines 11 gates. Step 2 explicitly references #2 (Big Five injection), #3 (n8n security), #5 (PixiJS bundle), #7 (Reflection cost), #8 (asset quality). Gates #1, #4, #6, #9, #10, #11 not addressed in this step (some appropriately deferred, others not flagged).
- [x] Sprint blocker identification checked: Embedding migration (Gemini→Voyage AI 768→1024d) is implicit but NOT called out as Sprint 0 blocker. R3 Reflection cost correctly identified as Sprint 3 blocker.
- [x] v1 feature parity alignment checked: Step 2 is technology research — v1 parity not directly applicable here, but no reference to how each technology choice serves v1 feature continuity.
- [x] Solo dev delivery feasibility assessed: 6 domains, 4 sprints, ~14 weeks. No learning curve risk quantification per domain. PixiJS = zero team experience (new dependency).
- [x] Cost estimates reviewed: Reflection cron $0.06/day (Haiku) vs $1.31/day (Sonnet) — realistic range. Scenario.gg pricing error noted by Winston.

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 8/10 | **20%** | 1.60 | Strong: Pinned versions (8.17.1, 2.12.3, 0.2.1), exact bundle sizes (770KB min / 216KB gzipped), RAM figures (860MB idle, 2-4GB peak), file paths with line numbers (soul-renderer.ts:34/41/45). **Gaps**: (1) Tree-shaken PixiJS bundle claimed "< 200KB gzipped" without measured figure — this IS the Go/No-Go #5 gate, needs a real number not an estimate. (2) Chrome ARM64 blog URL (line 153) may be fabricated source. (3) Voyage AI API cost per 1M tokens not specified despite mandating a provider change. |
| D2 Completeness | 7/10 | **20%** | 1.40 | All 6 domains covered with version matrix + VPS ranking — solid structure. **Critical gaps from Product/Delivery lens**: (1) **No Go/No-Go gate-to-step mapping table** — Brief defines 11 gates as MVP exit criteria, Step 2 should explicitly state which gates this step addresses and which are deferred. (2) **Embedding migration scope unquantified**: Brief §4 explicitly says "기존 임베딩 마이그레이션 필수" with re-embed of ALL knowledge_docs, but Step 2 Domain 4 doesn't estimate: how many documents exist? How long does re-embedding take? What does Voyage AI cost? This is a hidden Sprint 0 dependency. (3) **Sprint timeline impact missing**: Version matrix is excellent but doesn't address how each domain's learning curve affects the 14-week estimate. Solo dev has zero PixiJS experience — that's not reflected anywhere. (4) **Asset creation timeline not estimated** for Go/No-Go #8 (Sprint 4 prerequisite). |
| D3 Accuracy | 7/10 | 15% | 1.05 | Winston verified most code references accurately (React 19 peer deps, soul-renderer line numbers, memoryTypeEnum values). **Issues**: (1) Embedding dimension conflict: Domain 4 line 329 says "768 (our Gemini Embedding)" but Brief mandates Voyage AI 1024d. This is not a minor mismatch — it's a foundational data pipeline decision left unresolved. (2) Scenario.gg pricing ($15 vs actual $45-99/mo per Winston) — affects cost-benefit analysis. (3) Domain 4 references "Gemini Embedding" as current reality, which is factually accurate for v2 code, but fails to flag the mandatory migration as a constraint affecting THIS step's schema decisions. |
| D4 Implementability | 8/10 | 15% | 1.20 | Version matrix directly usable for package.json. Docker resource table actionable. PixiJS tree-shaking strategy clear with specific `extend()` classes listed. Reflection cron cost model includes actual token counts and $/day estimates. **Gaps**: (1) No install commands or migration steps. (2) No dependency conflict analysis (new packages vs existing v2 deps). (3) Observation table schema is implementable but uses `INTEGER` importance field (1-10) — Stanford paper uses floating point importance scores with cumulative threshold. No discussion of why integer was chosen or if it loses fidelity. |
| D5 Consistency | 5/10 | 10% | 0.50 | **Issues**: (1) Embedding dimension 768 (Domain 4 schema) vs Brief mandate 1024d (Voyage AI) — unresolved contradiction. (2) WebSocket count: audit doc/scope section says 14, actual code shows 16, Brief says 16 — Step 2 uses 14 in scope section. (3) Domain 6 says "Subframe is sole UXUI tool" (line 435) but MEMORY.md says Subframe was deprecated, Phase 6 used Gemini prompts, and Phase 7 used Natural Organic theme from Stitch-generated HTML. UXUI tooling narrative is confused. (4) Big Five scale override 0.0-1.0→0-100 is well-justified but needs formal Brief annotation (correctly noted for Step 4). **(5) [Quinn cross-talk] n8n Docker memory: Brief says `--memory=2g` (3 locations: L408/L490/L507), Step 2 says `--memory=4g` (L200/L244). Direct contradiction.** **(6) [Quinn cross-talk] 3 competing confidence/importance scales: existing `agent_memories.confidence` = 0-100 (schema.ts:1598), Brief observations = 0.3-0.9, Step 2 = 1-10 (Stanford). No reconciliation.** |
| D6 Risk Awareness | 7/10 | **20%** | 1.40 | 9 risks identified with mitigations — good technical coverage. **Missing from Product/Delivery perspective**: (1) **Embedding migration as hidden Sprint 0 work** — potentially 2-3 days of migration + re-embed + testing that isn't in ANY sprint plan. Unscoped work = schedule slip risk. (2) **Solo dev cognitive load**: 6 new technology domains × 4 sprints + Layer 0 interleaving = extreme context-switching. No risk identified, no mitigation (e.g., spike prototyping per domain). (3) **v2 product failure pattern not applied to research methodology**: Brief says v2 had 10,154 tests + 485 API but 0 real usage → "기술 완성도 ≠ 제품 완성도". Step 2 research is 100% technical verification with zero product validation methodology. How will we know the features users actually want vs what we can technically build? (4) **Asset pipeline timeline risk**: Go/No-Go #8 requires Sprint 4 에셋 선행 완료, but no timeline estimate for generating 10 characters × 5 states × animation frames. ComfyUI requires GPU not available on VPS. When does this work happen? Who does it? (5) Quinn's DNS rebinding attack vector — agree this is a real risk for n8n `127.0.0.1:5678`. |

### Weighted Average: 7.15/10 ✅ PASS (barely — D5 adjusted 6→5 after Quinn cross-talk)

### Issue Summary (10 issues: 3 Major, 7 Minor — updated after cross-talk)

1. **[D2 Completeness — MAJOR]** Embedding migration scope unquantified. Brief §4 mandates Gemini→Voyage AI migration (768→1024d) with full re-embed. Step 2 acknowledges Gemini as current ("768 our Gemini Embedding") but doesn't quantify: (a) how many knowledge_docs/semantic_cache entries exist, (b) Voyage AI API cost for re-embedding, (c) migration timeline estimate. This is a hidden Sprint 0 dependency that could add 2-3 days unplanned work.

2. **[D6 Risk — MAJOR]** Asset pipeline timeline not estimated. Go/No-Go #8 requires pixel art assets before Sprint 4, but Step 2 provides no timeline estimate. ComfyUI (Option B, best quality) needs 8GB+ VRAM GPU NOT available on VPS. The "who, when, how long, on what machine" questions are unanswered. For a solo dev, this is a delivery risk that could delay Sprint 4.

3. **[D6 Risk — MAJOR]** v2 product failure pattern not applied. v2 shipped 10,154 tests + 485 APIs but saw 0 real usage and was scrapped. Step 2 research is purely technical — no product validation methodology is proposed. How do we prevent v3 from repeating v2's pattern? Go/No-Go #11 (usability verification) needs research backing in Step 2, not just a gate number.

4. **[D1 Specificity — Minor]** PixiJS tree-shaken bundle size is "< 200KB gzipped" (estimate) when Go/No-Go #5 demands a hard limit. Need a measured figure, not a direction.

5. **[D5 Consistency — Minor]** Domain 6 UXUI tooling narrative contradicts MEMORY.md. Step 2 says "Subframe is sole UXUI tool" but project history shows Subframe was deprecated → Gemini prompts → Stitch 2. Clarify current state.

6. ~~**[D3 Accuracy — Minor]** Scenario.gg pricing error~~ **RETRACTED** — Winston confirms this is Step 5 scope (line 1696), not Step 2. Will track in Step 5 review.

7. **[D5 Consistency — Minor]** WebSocket channel count: 14 (audit/step 2) vs 16 (actual code/Brief). Reconcile.

8. **[D2 Completeness — Minor]** No Go/No-Go gate-to-step mapping. Brief has 11 exit gates — Step 2 should explicitly declare which gates it addresses (5 found) and which are deferred with reasons.

9. **[D5 Consistency — Minor → from Quinn cross-talk]** n8n Docker memory limit: Brief says `--memory=2g` (L408, L490, L507 — "VPS 24GB RAM 중 ~2GB 할당"), Step 2 says `--memory=4g` (L200, L244). n8n idles at ~860MB, peaks at 2-4GB. If Brief's 2GB is enforced, OOM-kill risk during moderate workflows. **PM decision needed**: update Brief to 4GB (matching research recommendation) or accept 2GB with documented OOM risk + restart policy.

10. **[D5 Consistency — Minor → from Quinn cross-talk]** 3 competing confidence/importance scales with no reconciliation: (a) existing `agent_memories.confidence` = integer 0-100 (schema.ts:1598), (b) Brief observations `confidence` = float 0.3-0.9 (ECC 2.3), (c) Step 2 observations `importance` = integer 1-10 (Stanford). These are related but different concepts — Step 2 should clarify which fields serve which purpose and define a normalization strategy.

### Cross-talk
**To Winston (Architect):** Agree with your PixiJS bundle borderline concern. From PM perspective, the tree-shaken "< 200KB" is an estimate, not a measurement. Sprint 0 must include an actual benchmark BEFORE committing to PixiJS — if tree-shaking fails to hit 200KB, we need a pivot decision point documented in advance.

**To Quinn (QA):** Strongly agree on the embedding dimension conflict (768 vs 1024) as a foundational issue. From delivery perspective, this is worse than a technical bug — it's an unscoped Sprint 0 dependency. If we migrate to Voyage AI 1024d, we need to re-embed ALL existing data. That's an unknown amount of work hiding behind a "just add a column" framing. Also agree on n8n DNS rebinding — product credibility depends on security.

**From Winston (Round 1):** (1) Scenario.gg pricing issue ($15 vs $45-99/mo) is NOT in Step 2 — it's Step 5 (line 1696). Correcting my Issue #6 reference. (2) Confirms PixiJS bundle borderline: 216KB full vs 200KB limit. Sprint 0 benchmark is the gate — agrees this is a PM decision point. (3) Winston scored 8.30/10 PASS.
**From Winston (Round 2 — post-ECC):** Revised score 8.30→**7.75**. Confirmed embedding migration as Issue #1 CRITICAL via code + Brief + feedback_no_gemini.md ("사장님이 Gemini API 키를 준 적이 없음"). Not just a dimension change — requires: (1) new vector(1024) column on agent_memories, (2) re-embed ALL knowledge_docs rows, (3) Voyage AI API cost estimation, (4) migration downtime/strategy. **3-critic average now: (7.75 + 7.15 + 5.90) / 3 = 6.93 — BELOW 7.0 threshold.**
**From Quinn:** (1) Voyage AI migration is a hidden Sprint 0 blocker — Step 2 has ZERO Voyage AI research (no SDK, no pricing, no migration plan). Reinforces my Major #1. (2) n8n memory contradiction: Brief says `--memory=2g` (3 locations: L408/L490/L507) but Step 2 says `--memory=4g` (L200/L244). Verified — Brief explicitly says "VPS 24GB RAM 중 ~2GB 할당". n8n idles at ~860MB, peaks at 2-4GB. If 2GB enforced, OOM-kill risk is real. **PM decision needed**: update Brief to 4GB or accept 2GB with OOM risk. (3) 3 competing confidence/importance scales: existing `agent_memories.confidence` = integer 0-100 (schema.ts:1598 verified), Brief observations `confidence` = float 0.3-0.9, Step 2 observations `importance` = integer 1-10 (Stanford). Implementation confusion guaranteed. Quinn scored 5.90/10 FAIL.

### ECC Analysis Addendum (supplementary reference)

Reviewed `.claude/logs/2026-03-21/ecc-analysis-plan.md` (307 lines). Impact on Step 2 scoring:

**ECC §2.2 (Cost-Aware Pipeline)**: Step 2 Domain 4 has Reflection cron cost model ($0.06/day Haiku, $1.31/day Sonnet) — aligns with ECC recommendation. However, ECC's "immutable cost tracking" (frozen dataclass for cost-aggregation.ts) and "Tier별 예산 초과 자동 차단" are Brief requirements (Go/No-Go #7) that Step 2 doesn't research at the technology level. What tech is needed for real-time budget enforcement? (e.g., middleware, DB triggers, background worker).

**ECC §2.3 (Continuous Learning)**: Step 2 observations schema (lines 340-354) is **missing 2 fields the Brief explicitly mandates**:
- `confidence FLOAT (0.3~0.9)` — Brief §4 says "Confidence 기반 우선 처리: confidence ≥ 0.7 관찰을 우선 통합". Step 2 schema has `importance INTEGER DEFAULT 5` (Stanford's 1-10 scale) but NO confidence field. These are different concepts: importance = event significance, confidence = observation reliability.
- `domain VARCHAR` — Brief §4 says "domain (대화/도구/에러)". Step 2 schema has no domain field.

**ECC §2.1 (Agent Security)**: Step 2 Domain 3 covers 4-layer sanitization for personality vars injection path. But ECC §2.1 emphasizes **tool response prompt injection** (84% of agents vulnerable) and **CLI token exfiltration** — these map to Brief Go/No-Go #9 and R5. Step 2 doesn't research tool response sanitization technology at all. This reinforces my D6 issue #3 about incomplete security coverage.

**ECC §2.7 (Agent Harness)**: `call_agent` handoff response standardization `{ status, summary, next_actions, artifacts }` (Brief §4 ECC 2.7) — no research in Step 2 on what protocol changes this requires.

**Score impact**: These findings reinforce existing D2 (Completeness) and D6 (Risk Awareness) gaps. The observations schema missing `confidence` + `domain` fields is a new issue added to the list. **Score unchanged at 7.25/10** — the ECC gaps are real but appropriately deferrable to Steps 3-4 architecture decisions, except the observations schema incompleteness which is a D2 issue.

**New Issue #9**: **[D2 Completeness — Minor]** Observations schema (lines 340-354) missing `confidence` (0.3-0.9) and `domain` fields that Brief §4 and ECC §2.3 both mandate. Step 2 uses Stanford's `importance` (1-10) only — this is a different concept. Both fields are needed for the reflection cron's confidence-based prioritization (Brief: "confidence ≥ 0.7 관찰을 우선 통합").

### Verdict (Pre-Fix)
PASS (barely) — The technical research is thorough and well-sourced for 6 domains, with actionable version matrix and VPS resource analysis. However, the Product/Delivery lens reveals 3 major gaps: (1) unquantified embedding migration scope hiding as Sprint 0 dependency, (2) asset pipeline "who/when/how-long" completely missing, (3) no product validation methodology to prevent v2's "technically complete, practically unused" failure pattern. ECC analysis reinforces completeness gaps in observations schema (missing confidence/domain fields) and security coverage (tool response injection path). Quinn cross-talk revealed 2 additional D5 issues: n8n memory limit contradiction (Brief 2GB vs Research 4GB) and 3 competing confidence scales. **Adjusted score from 7.25 → 7.15** after D5 downgrade (6→5). Still passes but on thin ice — 3 major issues + 7 minor issues need resolution.

---

## Re-Review (Post-Fix) — 2026-03-21

### Fixes Verified (19 applied, per `_bmad-output/party-logs/stage-1-step-02-fixes.md`)

| Issue # | Severity | Fix | Verified |
|---------|----------|-----|----------|
| #1 | MAJOR | FIX-1: Voyage AI migration research added (SDK, pricing $0.06/1M, migration SQL, Sprint 0 blocker 2-3 days, HNSW rebuild) | ✅ Lines 336-344 |
| #2 | MAJOR | FIX-14: Asset pipeline timeline (3 options: 7-20 days, who=solo dev, when=start Sprint 2, risk mitigation=reduced chars) | ✅ Lines 451-458 |
| #3 | MAJOR | FIX-15: v2 failure pattern warning + Go/No-Go gate mapping table (5 covered, 6 deferred) | ✅ Lines 524-536 |
| #4 | Minor | Deferred to Sprint 0 benchmark — cannot measure tree-shaken bundle in planning | ✅ Reasonable deferral |
| #5 | Minor | FIX-9: UXUI tooling narrative corrected — Phase 6 Gemini, Phase 7 Stitch HTML, v3 Phase 0 decision | ✅ Line 472 |
| #6 | RETRACTED | Scenario.gg pricing — not in Step 2 scope (Step 5) | N/A |
| #7 | Minor | WebSocket count — dev says not in Step 2 scope. Acceptable. | ✅ |
| #8 | Minor | FIX-13: Go/No-Go gate-to-step mapping table with 5 covered + 6 deferred | ✅ Lines 524-533 |
| #9 | Minor | FIX-2: `confidence REAL DEFAULT 0.5` (0.3-0.9) + `domain VARCHAR(50)` added. Scale Reconciliation note explains 3 coexisting scales. | ✅ Lines 365-380 |
| #10a | Minor | FIX-3: n8n memory aligned to Brief `--memory=2g`. OOM escalation path documented. `max-old-space-size=1536` for V8 heap. | ✅ Lines 200, 204, 249-251 |
| #10b | Minor | FIX-2: Scale Reconciliation note at lines 376-380 — importance vs observations.confidence vs agent_memories.confidence clearly distinguished | ✅ |

### Remaining Minor Issue
- VPS headroom summary (line 520) still says "~15.5GB headroom" but co-residence table (line 247) now shows 17.5GB after FIX-12 recalculation. Stale summary line — cosmetic.

### Re-Scored Dimensions
| Dimension | Before | After | Weight | Weighted | Evidence |
|-----------|--------|-------|--------|----------|----------|
| D1 Specificity | 8 | **9/10** | 20% | 1.80 | Voyage AI SDK + pricing ($0.06/1M) + migration SQL now explicit. Asset timeline: 3 options with days/character. Go/No-Go gate table specific. Only PixiJS bundle still estimated (Sprint 0 benchmark — acceptable deferral). |
| D2 Completeness | 7 | **8/10** | 20% | 1.60 | All 3 major gaps fixed: embedding migration quantified, asset pipeline timeline added, v2 failure pattern warning + gate mapping. Observations schema complete (confidence + domain). Tool response sanitization correctly deferred to Step 4. VPS headroom summary stale (cosmetic). |
| D3 Accuracy | 7 | **8/10** | 15% | 1.20 | Gemini→Voyage AI transition clearly stated as v2-current→v3-target. Migration SQL accurate. n8n memory aligned with Brief 2GB. OOM risk documented with GitHub issue #16980. Minor: VPS headroom stale number. |
| D4 Implementability | 8 | **9/10** | 15% | 1.35 | Observations schema now copy-paste ready with all fields. Voyage AI migration SQL actionable. n8n `max-old-space-size=1536` directly usable. Asset pipeline with 3 concrete options and risk mitigation. pg_advisory_xact_lock pattern for cron guard. |
| D5 Consistency | 5 | **8/10** | 10% | 0.80 | Embedding dimension: Voyage AI 1024d throughout. n8n memory: 2GB throughout per Brief. UXUI tooling: corrected. Scale reconciliation note resolves 3-scale confusion. Remaining: VPS headroom stale line (cosmetic). |
| D6 Risk Awareness | 7 | **8/10** | 20% | 1.60 | Asset timeline with risk mitigation (reduced character count). v2 failure pattern flagged explicitly. n8n OOM risk + GitHub issue. DNS rebinding defense. Observation purge cron. Reflection concurrency guard. Remaining: solo dev cognitive load risk not mentioned. |

### Weighted Average: 8.35/10 ✅ PASS

### Verdict (Post-Fix)
**PASS — Strong improvement.** All 3 major issues resolved comprehensively. Voyage AI migration now has SDK, pricing, SQL, and Sprint 0 timeline. Asset pipeline answers "who/when/how-long." v2 failure pattern explicitly flagged with gate mapping. The 19 fixes demonstrate responsive, thorough correction. Score improved from 7.15 → 8.35 (+1.20). One cosmetic issue remains (VPS headroom stale summary). Ready to proceed to Step 3.
