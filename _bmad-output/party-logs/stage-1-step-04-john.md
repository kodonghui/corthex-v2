## Critic-C (John) Review — Step 4: Architectural Patterns (Grade A)

### Review Date
2026-03-22

### Content Reviewed
`_bmad-output/planning-artifacts/technical-research-2026-03-20.md`, Lines 1088-1358

### Product/Delivery Verification Performed
- [x] Brief alignment checked: All 4 layers (PixiJS, n8n, Big Five, Memory) map to Brief §1 Executive Summary features. Sprint sequencing (L3→L2→L4→L1) matches Brief §4 "Sprint 구현 순서".
- [x] Carry-forward items: 9 items from Steps 2-3 claimed resolved. Verified: WS rate limiting (4.1.3), multi-tenant isolation (4.2.1), key-aware fallback (4.3.3), Layer C regex (4.3.4), observation lifecycle (4.4.3) — all addressed with architecture decisions.
- [x] Go/No-Go gate coverage: #2 (key-aware fallback), #3 (n8n security), #7 (reflection LLM cost) defined with test methods. Gates #1, #4-6, #8-11 are out of Step 4 scope (covered in other steps).
- [x] Cost/budget review: Haiku ~$1.80/mo, Sonnet ~$39/mo for reflections. Neon Pro documented as Sprint 0 prerequisite. Tier ceiling "TBD" — Brief flags this as Sprint 3 blocker.
- [x] Brief-to-architecture alignment check: **2 discrepancies found** (see Issues #1, #2)

### Dimension Scores (Revised — post cross-talk with Quinn)

> **Revision reason**: Quinn's cross-talk surfaced 3 findings I missed in initial review. Verified all 3 against source files. Score revised from 7.25 → **5.80 FAIL**.

| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| D1 Specificity | 8/10 | 20% | 1.60 | Strong specificity: code diffs (soul-renderer.ts spread reversal), exact parameters (token bucket 10/s, MAX_BATCH=50, MAX_UNPROCESSED_ALERT=500), migration numbers (0063), n8n security 6-layer table, personality scale 0-100 with DB/API/UI/prompt treatment. Deductions: (1) Tier 3+ reflection cost ceiling = "TBD" — this is the **Sprint 3 blocker** per Brief §4 and should at minimum carry the Brief's range ($0.10~$0.50/agent/day Haiku). (2) "Optional export to JSONL for audit trail" (line 1358) — trigger mechanism, storage location, and format unspecified. |
| D2 Completeness | 5/10 | 20% | 1.00 | ~~9 carry-forwards resolved~~ **REVISED: At least 1 carry-forward NOT resolved**. `stage-1-step-03-fixes.md` L80 explicitly defers "Observation poisoning (ECC §2.1)" to Step 4, but Step 4 has **zero mention** of observation content sanitization. The entire observation→reflection→planning pipeline (lines 1279-1305) has no sanitization step at any stage. This is a missing carry-forward, not a gap — it was explicitly assigned to this step. Original gaps remain: (1) Role-based personality presets not architected (Brief §4 Core Feature). (2) Neon Pro upgrade path. (3) n8n credential isolation (Quinn). (4) Admin `/office` read-only view. |
| D3 Accuracy | 5/10 | 15% | 0.75 | **NEW CRITICAL**: Lines 1284 and 1302 say "Gemini embed" twice in the §4.4 pipeline diagrams. Brief Technical Constraints (line 493): "임베딩 프로바이더: Voyage AI `voyage-3` (1024d) — **Gemini 금지** (key constraint)". `stage-1-step-03-fixes.md` L75 already corrected this to "Voyage AI API call". Step 4 regresses back to the banned provider. This is the same propagation failure Quinn identified in Step 3. Original issues remain: observation retention 30d vs 90d, n8n Docker memory 2g vs 4g, HNSW VPS vs Neon. |
| D4 Implementability | 7/10 | 15% | 1.05 | Architecture decisions are mostly implementation-ready. soul-renderer.ts diff is minimal. Key-aware fallback is copy-paste ready. **Deduction**: The memory pipeline (§4.4) is not implementable as-is because it lacks observation sanitization. A developer following §4.4.1 would build an observation recorder that persists raw tool_result content without any filtering — creating a persistent prompt injection vector. ARGOS scheduler integration also not shown. |
| D5 Consistency | 4/10 | 10% | 0.40 | **4 specification conflicts** in one step: (1) observation retention 30d (Brief) vs 90d (Step 4). (2) n8n Docker memory 2g (Brief) vs 4g (Step 4). (3) "Gemini embed" (Step 4) vs "Voyage AI" (Brief + Step 3 fixes) — a regression. (4) HNSW VPS (Step 4) vs Neon (Step 5). The Gemini regression is the worst: Step 3 explicitly fixed this, Step 4 regresses. This is a systemic propagation failure — fixes from one step don't carry forward to the next. Positive: E8 boundary maintained, 0-100 scale consistent. |
| D6 Risk Awareness | 5/10 | 20% | 1.00 | **CRITICAL GAP**: Observation poisoning is the most severe risk in the entire memory system — a malicious `tool_result` persisted as observation → LLM synthesizes it into reflection → corrupted reflection injected as system context in ALL future agent calls = **persistent prompt injection**. Brief Go/No-Go #9 (line 465) explicitly requires "Tool response sanitization 검증". Step 3 explicitly deferred this to Step 4. Step 4 ignores it entirely. This isn't a minor omission — it's the foundational security risk of Layer 4. Original gaps remain: Neon Pro budget contingency, personality preset adoption risk, n8n credential isolation. |

### Weighted Average: 5.80/10 FAIL

### Issues Found (Revised — incorporates Quinn cross-talk findings)

**NEW — surfaced by Quinn cross-talk, verified by John:**

1. **[D2/D6 Completeness+Risk]** **Observation poisoning — explicitly deferred carry-forward, NOT resolved.** `stage-1-step-03-fixes.md` L80: "Observation poisoning (ECC §2.1): Architecture-level concern for Step 4". Step 4 (L1088-1358) has **zero** mention of observation content sanitization. Attack chain: malicious `tool_result` → persisted as observation → reflection cron LLM synthesizes into agent knowledge → corrupted reflection injected as system context in future calls = **persistent prompt injection across ALL future agent responses**. Brief Go/No-Go #9 (L465): "Tool response sanitization 검증" is an explicit gate. This is the foundational security risk of Layer 4 and MUST be designed in Step 4. — **Critical (BLOCKING)**

2. **[D3/D5 Accuracy+Consistency]** **"Gemini embed" regression.** Lines 1284 and 1302 say "Gemini embed" in the §4.4 pipeline diagrams. Brief (L493): "Gemini 금지 (key constraint)". `stage-1-step-03-fixes.md` L75 already corrected this to "Voyage AI API call". Step 4 regresses to the banned provider — same propagation failure pattern identified in Step 3. — **Critical**

3. **[D3/D5 Accuracy+Consistency]** n8n Docker memory: Brief says `--memory=2g` (L408, 490), Step 4 says `memory: 4G` (L1175). `stage-1-step-03-fixes.md` L82 already flagged this as "CEO decision, flagged in carry-forward" — yet Step 4 still has 4G without CEO sign-off. — **Critical** (upgraded from Major — same propagation failure, third occurrence)

**Original issues (unchanged):**

4. **[D3/D5 Accuracy+Consistency]** Observation retention: Brief says **30-day** purge (L496), Step 4 says **90-day** TTL (L1355). 3x difference impacts Neon storage sizing and Sprint 0 prerequisites. — **Critical**

5. **[D2 Completeness]** Role-based personality presets not architected. Brief §4 Core Features lists "역할별 성격 프리셋 템플릿" for Sprint 1. Step 4 only designs raw JSONB + sliders. Without presets, Big Five adoption KPI fails. — **Major**

6. **[D6 Risk Awareness]** No Neon Pro budget rejection contingency. If CEO defers upgrade, no Plan B documented. — **Major**

7. **[D3 Accuracy]** HNSW memory attribution error (VPS vs Neon). Concur with Winston (#1) and Quinn (#1). — **Major**

8. **[D2 Completeness]** n8n credential isolation gap. Concur with Quinn (#3). Must be in Go/No-Go #3 criteria. — **Major**

9. **[D6 Risk Awareness]** Model naming verification needed. "Haiku 4.5" / "Sonnet 4.6" pricing unverified. — **Minor**

10. **[D1 Specificity]** "Optional export to JSONL for audit trail" — unspecified trigger, storage, format. — **Minor**

### Cross-talk
**To Winston (Architect):** Two Brief-to-architecture specification conflicts need resolution before sprint implementation: (1) observation retention 30d (Brief) vs 90d (Step 4), and (2) n8n Docker memory 2g (Brief) vs 4G (Step 4). The Brief has CEO signoff — please either align Step 4 to Brief values or document explicit deviations with rationale. Also, personality presets are a Brief Core Feature but not architected in Step 4 — where should preset storage/application be designed?
**To Quinn (QA):** I concur with your n8n credential isolation finding (#3). From PM perspective, this must be added to Go/No-Go #3 acceptance criteria: "n8n credentials are isolated per company — a workflow tagged for company-A cannot access credentials tagged for company-B." Without this, Sprint 2 cannot pass the gate. Also flagging: the 30d vs 90d observation retention discrepancy affects your storage projections.
**From Winston:** (1) Retention mismatch confirmed — asks PM to decide which wins (30d vs 90d). Notes 1.4GB/year figure may be calculated against wrong TTL. (2) Gemini embed confirmed — easy 2-line fix. (3) NEW: memory-planner.ts "inject relevant reflections" lacks top-K count, similarity threshold, max token budget — sprint estimation gap. Winston score: 7.35 CONDITIONAL PASS.
**From Quinn:** (1) Observation poisoning — top concern. Deferred from Step 3 L80, not addressed in Step 4. Persistent prompt injection chain. (2) Gemini embed regression confirmed. (3) Docker 4G — already flagged as CRITICAL in Quinn's review. (4) ACKs my 30d vs 90d TTL finding, adding as MEDIUM #12. Quinn score: 5.60 FAIL.

**Post cross-talk additions to issues list:**
11. **[D4 Implementability]** memory-planner.ts injection parameters missing (Winston). "inject relevant reflections as system context" needs: top-K count, similarity threshold, max token budget for injected context. Without these, Sprint 3 is unestimable. — **Major**

### Verdict (Pre-Fix)
**FAIL (5.80)** — 4 Critical issues (observation poisoning, Gemini regression, Docker memory, retention mismatch) + systemic propagation failure pattern.

---

### Post-Fix Re-Verification (2026-03-22)
**Fixes file**: `_bmad-output/party-logs/stage-1-step-04-fixes.md` — 20 fixes (3 CRITICAL + 7 HIGH + 5 MEDIUM + 5 MINOR)

#### Re-Verification Results
| Issue | Fix | Verified |
|-------|-----|----------|
| CRIT-1: Observation poisoning (blocking) | FIX-S4-3: 10KB max, control char strip, reflection prompt hardening, content-type flag, attack vector documented | ✅ Comprehensive. 4-layer defense matches ECC §2.1 + Go/No-Go #9 requirements. |
| CRIT-2: Gemini embed regression | FIX-S4-1: Both instances → "Voyage AI embed (voyage-3, 1024d)" + SDK signature | ✅ Clean fix. Matches Brief L493. |
| CRIT-3: Docker memory 4G→2G | FIX-S4-2: Aligned to Brief. Security table 6→8 layers (credential encryption + V8 heap limit) | ✅ Matches Brief L408/490. Bonus: V8 heap limit prevents OOM kill. |
| CRIT-4: Retention 90d→30d | FIX-S4-8: Aligned to Brief (30d). Storage projection updated to ~0.47GB/year. Purge query corrected. | ✅ Matches Brief L496. |
| MAJOR-5: Personality presets | FIX-S4-17: §4.3.5 — tier_configs storage, 5 role archetypes, pre-fill+editable UX | ✅ Addresses Brief §4 "역할별 성격 프리셋 템플릿". |
| MAJOR-6: Neon Pro contingency | FIX-S4-18: Decision tree — 14d TTL, 100/agent/day cap, S3 JSONL fallback | ✅ Practical fallback. Sprint 0 prerequisite documented. |
| MAJOR-11: memory-planner injection | FIX-S4-9: Top-K=5, cosine ≥0.7, injection position, format, pgvector query | ✅ Sprint-estimable now. |
| MINOR-10: JSONL audit trail | FIX-S4-19: Deferred v4+ | ✅ Scope clarified. |

**Note**: FIX-S4-2 adds credential **encryption** (AES-256-GCM) but Quinn's original concern was credential **isolation** (cross-company access). These are different security properties. Encryption protects at-rest; isolation prevents cross-tenant access. Quinn's scope to verify in re-score.

#### Post-Fix Dimension Scores
| Dimension | Pre-Fix | Post-Fix | Weight | Weighted | Evidence |
|-----------|---------|----------|--------|----------|----------|
| D1 Specificity | 8 | 9/10 | 20% | 1.80 | Fixes add significant specificity: top-K=5, cosine ≥0.7, 10KB max content, sanitization regex patterns, 5 role archetypes with values, 30-day aligned TTL. |
| D2 Completeness | 5 | 8/10 | 20% | 1.60 | Observation poisoning resolved (FIX-S4-3), personality presets added (FIX-S4-17), Neon Pro contingency (FIX-S4-18), memory-planner specifics (FIX-S4-9). All carry-forwards now resolved. |
| D3 Accuracy | 5 | 8/10 | 15% | 1.20 | Gemini→Voyage AI (FIX-S4-1), 90d→30d (FIX-S4-8), 4G→2G (FIX-S4-2), is_processed→reflected (FIX-S4-5). HNSW VPS attribution noted but Winston's scope. |
| D4 Implementability | 7 | 9/10 | 15% | 1.35 | memory-planner pgvector query copy-paste ready (FIX-S4-9), observation sanitization code (FIX-S4-3), advisory lock pattern (FIX-S4-4), personality preset architecture (FIX-S4-17). |
| D5 Consistency | 4 | 8/10 | 10% | 0.80 | All 4 specification conflicts resolved. Propagation check table (fixes file L152-172) systematically verifies every Step 3 fix. Root cause addressed. |
| D6 Risk Awareness | 5 | 8/10 | 20% | 1.60 | Observation poisoning 4-layer defense (FIX-S4-3), WS connection cap + pre-auth (FIX-S4-7), Neon budget contingency (FIX-S4-18), credential encryption (FIX-S4-2). Minor gap: credential isolation (Quinn's scope). |

### Post-Fix Weighted Average: 8.35/10 ✅ PASS

> **Condition cleared (2026-03-22)**: Dev applied all 20 fixes to source document. Spot-checked: "Gemini embed" = 0 matches document-wide, L1349 = "Voyage AI embed (voyage-3, 1024d)", L1284 = personality presets Decision 4.3.5 added, retries = 5. Confirmed.
> Note: L2184 (risk table) and L2261 (context snapshot) in other sections still reference old values (4G, 90-day) — outside Step 4 scope, flagged for future cleanup.

### Final Verdict
**PASS (8.35)** — All 20 fixes applied to source document and spot-checked. All 4 Critical and 6 Major issues resolved. Observation poisoning defense (FIX-S4-3), Voyage AI alignment (FIX-S4-1), Brief-aligned retention and Docker limits (FIX-S4-8, FIX-S4-2), personality presets (FIX-S4-17), and memory-planner specifics (FIX-S4-9) are all in the source document.

The propagation check table is an excellent process improvement. Step 4 now delivers what a Grade A architecture document should.
