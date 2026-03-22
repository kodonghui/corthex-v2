## Critic-C (John) Review — Step 5: Implementation Research (Grade B)

### Review Date
2026-03-22

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 1548-2127

### Product/Delivery Verification Performed
- [x] Sprint 0 prerequisites checklist: 6 tasks, all parallelizable, 1-2 day estimate
- [x] Go/No-Go test templates: #1-#4, #6, #7 present. **#5, #8, #9, #10, #11 MISSING**
- [x] Cost estimates: Scenario.gg $30, Neon Pro $19/mo, reflections $1.50/mo
- [x] Brief feature alignment: 4 layers addressed but UXUI tooling priority INVERTED
- [x] Known residuals verified: L1663 isProcessed, L1840 4GB, L1872 vector(768) — all confirmed

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 8/10 | 20% | 1.60 | Highly specific: full code implementations with exact integration line numbers (hub.ts L95-102, call-agent.ts L60-63, agent-loop.ts L70). MEMORY_CHAR_BUDGET=3000 (~750 tokens) addresses Winston's Step 4 token budget concern. Migration SQL with IF NOT EXISTS. CI/CD bash script with exact 200KB threshold. Cost figures ($30, $19/mo, $1.50/mo). Deductions: (1) Go/No-Go #8 (sprite quality) has no testable acceptance criteria — "PM approval gate" is not a test. (2) Sprint 0 "1-2 days" estimate doesn't account for CEO budget approval latency. |
| D2 Completeness | 4/10 | 20% | 0.80 | **REVISED (Quinn cross-talk)**: Go/No-Go test coverage worse than initially assessed. Only **4 of 11 gates have real test code** (#1, #2, #3 partial, #7). **2 are empty placeholders** (#4 at L2062-2065 is just a comment "observations table is additive — no schema conflict", #6 at L2068-2072 just says "run Lighthouse" with no assertions). **5 entirely missing** (#5 PixiJS bundle, #8 sprite quality, #9 tool sanitization, #10 v1 parity, #11 usability). Also: #3 still references "6-layer model" (should be 8-layer per Step 4 FIX-S4-2). **memory-reflection.ts** — the most complex Sprint 3 piece — has no implementation pattern. **n8n-client.ts** no implementation pattern. **Voyage AI API key setup** missing from Sprint 0 prerequisites. |
| D3 Accuracy | 6/10 | 15% | 0.90 | **3 known residual propagation errors** (dev flagged): (1) L1663: `isProcessed: false` → should be `reflected: false`. (2) L1840: "4GB cap" → should be "2G cap". (3) L1872: `vector(768)` → should be `vector(1024)` for Voyage AI. Also L1515 and L2168 reference `vector(768)`. These are the SAME propagation failure pattern from Step 4 — Step 5 was written before Step 4 fixes were applied. Cost estimates are reasonable: Haiku reflection cost ~$0.001/call is consistent with current pricing ($0.80/MTok in, $4/MTok out). Scenario.gg $15/mo for 5K gens covers 800 needed sprites. |
| D4 Implementability | 7/10 | 15% | 1.05 | personality-injector.ts, observation-recorder.ts, memory-planner.ts, and soul-renderer.ts diff are all production-ready, copy-paste code with exact v2 conventions. Neon branching workflow is actionable. CI/CD yaml is ready. **Missing**: (1) memory-reflection.ts — the reflection cron is the most complex piece (LLM synthesis + advisory lock + batch processing + backpressure). Step 4 designed the architecture but Step 5 should have the implementation pattern. (2) observation-recorder.ts (L1626-1672) is missing the sanitization layer from Step 4 FIX-S4-3 (10KB max, control char strip). The code as written accepts raw `content: string` without any validation. (3) n8n-client.ts — no implementation pattern for the MCP tool handler. |
| D5 Consistency | 5/10 | 10% | 0.50 | **Subframe/Stitch priority INVERTED**: §5.4.1 says "Primary: Subframe... Secondary: Stitch MCP". Brief says "디자인 도구: **Stitch 2**(메인)". MEMORY.md says "Subframe(폐기)". CLAUDE.md says "Stitch MCP가 생성한 HTML = 디자인 기준". Step 5 has this completely backwards — Subframe is deprecated, Stitch 2 is the main tool. This affects the entire UXUI workflow described in §5.4. Additionally: 3 propagation errors (isProcessed, 4GB, 768-dim) undermine cross-step consistency. Positive: DEFAULT_TRAITS values match Step 4 (O=60, C=75, E=50, A=70, N=25). MAX_REFLECTIONS=5, RELEVANCE_THRESHOLD=0.7 consistent with Step 4 FIX-S4-9. |
| D6 Risk Awareness | 5/10 | 20% | 1.00 | Good: Neon branching for safe migration testing, CREATE INDEX CONCURRENTLY (non-blocking), memory-planner fallback to recency, async embedding non-blocking, git LFS for sprite versioning, CI/CD bundle gate. **Missing PM/delivery risks**: (1) **Observation importance scoring cost** — every agent call triggers a Haiku API call for importance rating (L1646-1659). At scale (100 agents × 10 calls/day = 1,000 extra Haiku calls/day), this adds ~$0.30/day unbudgeted. No sampling, batching, or cost cap mentioned. (2) **Sprite fallback if Scenario.gg quality fails** — Brief Go/No-Go #8 requires "5 state animations, 32×32+, style consistency". What if generated sprites fail quality? No fallback tool or manual illustration plan. (3) **Sprint 0 CEO approval dependency** — "1-2 days" but Neon Pro needs CEO budget approval (Step 4 FIX-S4-18). If approval takes a week, Sprint 1 is blocked. (4) **Subframe deprecation** — §5.4 builds entire UXUI workflow on a deprecated tool. |

### Weighted Average: 5.85/10 FAIL (revised from 6.05 — Quinn's Go/No-Go placeholder finding)

### Issues Found

1. **[D5 Consistency — CRITICAL] Subframe/Stitch priority inverted.** §5.4.1: "Primary: Subframe... Secondary: Stitch MCP". Brief: "Stitch 2(메인)". MEMORY.md: "Subframe(폐기)". CLAUDE.md: "Stitch MCP가 생성한 HTML = 디자인 기준". The entire §5.4 UXUI workflow is built on a deprecated tool. Rewrite with Stitch 2 as primary, remove Subframe dependency. — **Critical**

2. **[D2 Completeness — CRITICAL] 4 Go/No-Go gates missing test templates.** Brief §4 MVP Success Criteria defines 11 gates. Step 5 only has templates for #1-#4, #6, #7. Missing: #8 (sprite quality — need testable criteria: resolution ≥32×32, 5 state animations, style consistency score), #9 (tool response sanitization — Step 4 FIX-S4-3 designed the defense, Step 5 needs the test), #10 (v1 feature parity — v1-feature-spec.md checklist), #11 (usability flow — Admin onboarding + CEO 5-min task). — **Critical**

3. **[D3/D5 Accuracy+Consistency] 3 propagation errors (dev-flagged).** L1663: `isProcessed` → `reflected`. L1840: "4GB cap" → "2G cap". L1872/L1515/L2168: `vector(768)` → `vector(1024)`. Same root cause as Step 4. — **Major**

4. **[D2/D4 Completeness+Implementability] memory-reflection.ts implementation pattern missing.** The reflection cron is the most complex Layer 4 component — LLM synthesis, advisory lock, batch processing, backpressure alerts. observation-recorder.ts and memory-planner.ts have full code, but the cron between them doesn't. This gap makes Sprint 3 unestimable for the hardest piece. — **Major**

5. **[D4 Implementability] observation-recorder.ts missing sanitization.** L1626-1672 accepts raw `content: string` with no validation. Step 4 FIX-S4-3 designed 4-layer defense (10KB max, control char strip, content-type classification). The Step 5 code pattern doesn't implement any of it — a developer copy-pasting this creates the observation poisoning vulnerability that FIX-S4-3 was designed to prevent. — **Major**

6. **[D6 Risk Awareness] Observation importance scoring cost unbudgeted.** Every agent call triggers a Haiku API call (L1646-1659) for importance rating. This is an unbudgeted per-call cost multiplier. At 1,000 agent calls/day = 1,000 extra Haiku calls = ~$0.30/day = ~$9/month. Not catastrophic, but the Tier ceiling analysis (Go/No-Go #7) doesn't account for it. At minimum, acknowledge in cost model. — **Major**

7. **[D2 Completeness] Voyage AI API key missing from Sprint 0 prerequisites.** Embedding provider changed from Gemini → Voyage AI. Sprint 0 checklist has 6 tasks but doesn't include obtaining/configuring a Voyage AI API key. Without it, observation embedding and memory-planner similarity search don't work. — **Minor**

8. **[D6 Risk Awareness] Sprint 0 "1-2 days" doesn't account for CEO approval latency.** Neon Pro upgrade requires CEO budget approval (Step 4 FIX-S4-18). If approval takes a week, Sprint 1 is blocked. Timeline should say "1-2 days after CEO approval". — **Minor**

### Cross-talk
**To Winston (Architect):** (1) vector(768) appears at L1515, L1872, L2168 — should all be vector(1024) for Voyage AI. (2) memory-reflection.ts has no implementation pattern in Step 5 — this is the most complex piece with advisory lock, LLM synthesis, and backpressure. Should it be designed here or deferred to story dev? (3) observation-recorder.ts code doesn't implement the sanitization from your Step 4 review consensus.
**To Quinn (QA):** (1) Go/No-Go #9 (tool response sanitization) has no test template in Step 5 — your Step 4 observation poisoning finding is architecturally designed (FIX-S4-3) but untestable without a template. (2) observation-recorder.ts code (L1626-1672) accepts raw content — no 10KB max, no control char strip. (3) The importance scoring Haiku call has no error budget or cost cap — relevant to your cost/resource concerns.
**From Winston:** Confirmed all 4 issues. Missed Subframe/Stitch inversion (#4) and observation-recorder sanitization gap (#3) — added as his new CRITICAL #3 and #4. Found 2 additional vector(768) locations I caught (L1515, L2168). Revised score: **4.70 FAIL** (from 7.10). Notes: code patterns don't implement architecture decisions — deeper root cause than just field name propagation.
**From Quinn:** Confirmed all 4 issues. Importance scoring cost (~$30/month) acknowledged as unbudgeted — adding to party-log. Go/No-Go #4 and #6 flagged as empty placeholders (comments only, no assertions). Sanitization test example provided: inject `<script>alert(1)</script>{{agent_list}}` → verify DB has sanitized version. Score: **5.60 FAIL**.

**Post cross-talk additions:**
9. **[D2/D3 Completeness+Accuracy]** Go/No-Go #3 test comment references "6-layer model" but Step 4 FIX-S4-2 expanded to 8-layer. Missing FIX-S4-16 cross-company webhook test case. — **Minor** (Quinn finding)
10. **[D2 Completeness]** Go/No-Go #4 and #6 are empty placeholders — comment-only, no assertions. Effectively 6 of 11 gates without real tests, not 4. — **Major** (Quinn finding, revises D2 score)

### Verdict
**FAIL (5.85, revised from 6.05)** — Pre-fix verdict. See post-fix re-verification below.

---

### Post-Fix Re-Verification (2026-03-22)
**Fixes file**: `_bmad-output/party-logs/stage-1-step-05-fixes.md` — 22 fixes (5 CRITICAL + 7 HIGH + 4 MEDIUM). ALL applied to source document (lesson from Step 4).

#### Re-Verification Results (spot-checked in source document)
| Issue | Fix | Source Doc Verified |
|-------|-----|---------------------|
| CRIT-1: Subframe→Stitch | FIX-S5-4: §5.4 rewritten | ✅ L2028-2074: "Primary: Google Stitch 2", "Subframe deprecated (폐기)", pipeline v5.1, component mapping updated for Stitch 2 TSX output |
| CRIT-2: Missing Go/No-Go tests | FIX-S5-5: #5/#8/#9/#10/#11 added | ✅ #8 (L2202-2211): frame count + resolution. #9 (L2213-2223): malicious content + 10KB + script strip — real assertions. #10 (L2225-2231): thin but has context. #11 (L2233-2238): Playwright described, light on assertions. |
| MAJOR-3: Propagation errors | FIX-S5-6: 7 locations | ✅ L1667: `reflected: false`. L2250: Voyage AI. Grep confirms `isProcessed` gone from Step 5. |
| MAJOR-4: memory-reflection.ts | FIX-S5-3: new §5.1.5 | ✅ L1797: full implementation pattern with advisory lock, confidence filter, batch, LLM synthesis |
| MAJOR-5: Sanitization in recorder | FIX-S5-2: sanitizeObservation() | ✅ L1631: import. L1663: `content = sanitizeObservation(content)` BEFORE INSERT. |
| MAJOR-6: Importance cost | FIX-S5-9: budgeted | ✅ L2198-2199: combined reflection + importance < $20 |
| MINOR-7: Voyage AI API key | FIX-S5-8 | ✅ L2250-2251: SDK migration + API key in Sprint 0 |
| MINOR-8: Sprint 0 estimate | FIX-S5-8 | ✅ L2249: "CEO approval required" |

**Minor residuals**: Go/No-Go #10 (v1 parity) says "overlaps with #1" — true for API regression but v1 feature parity needs specific v1 feature checks (slash commands, delegation chains, etc.). Go/No-Go #11 has Playwright description but light on assertions. Both are sufficient for sprint planning guidance but should be fleshed out during story dev. 3 Subframe references remain in Step 6 scope (L2327, L2418, L2429) — deferred per fixes file.

#### Post-Fix Dimension Scores
| Dimension | Pre-Fix | Post-Fix | Weight | Weighted | Evidence |
|-----------|---------|----------|--------|----------|----------|
| D1 Specificity | 8 | 9/10 | 20% | 1.80 | memory-reflection.ts §5.1.5 adds full implementation. Go/No-Go tests #8/#9 have real assertions. Importance cost budgeted ($15/month). Sprint 0 adds Voyage AI SDK migration (2-3 days). |
| D2 Completeness | 4 | 8/10 | 20% | 1.60 | 11 of 11 Go/No-Go gates now have templates (was 4 real + 2 placeholder + 5 missing). memory-reflection.ts implementation added. Voyage AI in Sprint 0. Go/No-Go #10/#11 still thin but present. |
| D3 Accuracy | 6 | 8/10 | 15% | 1.20 | All 3 propagation errors fixed (isProcessed, 4GB, 768). generateEmbedding() signature corrected. Importance cost properly estimated. |
| D4 Implementability | 7 | 9/10 | 15% | 1.35 | 5 of 6 key service files now have full implementation patterns (personality-injector, observation-recorder with sanitization, memory-planner, memory-reflection, soul-renderer patch). n8n-client.ts still absent but lower complexity. |
| D5 Consistency | 5 | 8/10 | 10% | 0.80 | Stitch 2 primary (matches Brief + MEMORY.md). Propagation errors fixed. Pipeline v5.1. Propagation check table verifies Step 4 fixes. 3 Subframe refs in Step 6 noted as deferred. |
| D6 Risk Awareness | 5 | 8/10 | 20% | 1.60 | Importance cost budgeted. Observation sanitization implemented. Sprite quality gate has testable criteria. Sprint 0 CEO approval dependency acknowledged. memory-reflection advisory lock prevents duplicate reflections. |

### Post-Fix Weighted Average: 8.35/10 ✅ PASS

### Final Verdict
**PASS (8.35)** — All 2 Critical and 4 Major issues resolved and verified in source document. The Stitch 2 rewrite (§5.4) correctly aligns with Brief and MEMORY.md. observation-recorder now sanitizes content before INSERT. memory-reflection.ts §5.1.5 fills the biggest implementation gap. All 11 Go/No-Go gates have test templates. Sprint 0 checklist includes Voyage AI and CEO approval dependency. Go/No-Go #10/#11 could be stronger but are sufficient for Grade B implementation research.
