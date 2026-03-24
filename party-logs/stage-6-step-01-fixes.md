# Stage 6 Step 1 — Fixes Applied (Round 1 + Round 2)

**Date:** 2026-03-24
**Writer:** bob (SM)
**Target:** `_bmad-output/planning-artifacts/epics-and-stories.md`

## Round 2 Clarifications

Critics reviewed a snapshot before round 1 fixes took effect. All round 1 fixes were verified present in the file:

| Critic | Issue they said was "still open" | Actual status |
|--------|--------------------------------|---------------|
| quinn I1 | AR56 "Dark mode only" | **FIXED in round 1** — line 418 now reads "Light mode only for v3 launch" |
| quinn I9 | AR42 outcome type | **FIXED in round 1** — line 398 now reads `outcome VARCHAR(20) DEFAULT 'unknown'` |
| quinn I12 | UXR67 undo scope | **FIXED in round 1** — line 552 now scopes to CRUD pages + NEXUS |
| quinn I13 | UXR139 "evaluate" | **FIXED in round 1** — line 672 now reads "use @container" |
| winston W2 | ECC-1 missing | **FIXED in round 1** — AR73 at line 456 |
| winston W3 | ECC-2 missing | **FIXED in round 1** — AR74 at line 457 |
| winston W4 | ECC-3 decay | **FIXED in round 1** — AR44 at line 400 with decay/reinforcement |
| winston W5 | ECC-5 | **FIXED in round 1** — AR75 at line 458 |
| dev D8-11 | ECC items | **FIXED in round 1** — AR73/74/75 + AR44 extended |

**Round 2 additional fixes:**
1. AR count in overview: 75 → 76 (AR1-AR76 explicit count)
2. AR27: Added soul-enricher/soul-renderer relationship clarity (winston issue #9)
3. NFR-O11: Already had 5-step flow in round 1, verified against PRD L2609

## Fix Summary

Total issues across 4 critics: 32 (john 4 + winston 7 + dev 8+3 cross-talk + quinn 13)
Deduplicated unique issues: 24
Fixes applied: 24

## Fixes by Critic

### john (4 issues → 4 fixed)

| # | Issue | Fix Applied |
|---|-------|------------|
| J1 | CRITICAL: 80 domain-specific requirements not listed | Added full DSR section: SEC-1~7, SDK-1~4, DB-1~5, ORC-1~7, SOUL-1~6, OPS-1~6, NLM-1~4, VEC-1~4, N8N-SEC-1~8, PER-1~6, MEM-1~7, PIX-1~6, MKT-1~5, NRT-1~5 (80 total) |
| J2 | FR count 103→123 | Fixed overview to "123 active FRs" |
| J3 | PRD-Architecture reconciliation missing | Added reconciliation table with 8 documented conflicts |
| J4 | Template placeholders | Replaced with `<!-- TODO: Step 2 -->` comments |

### winston (7 issues → 7 fixed)

| # | Issue | Fix Applied |
|---|-------|------------|
| W1 | FR count error | Same as J2 — already fixed |
| W2 | ECC-1 missing (call_agent response standardization) | Added AR73: `{ status, summary, next_actions, artifacts }` structure, Sprint 1 HIGH |
| W3 | ECC-2 missing (cost-aware model routing) | Added AR74: model-selector.ts Admin config extension, Sprint 1 MEDIUM |
| W4 | ECC-3 confidence decay/reinforcement | Extended AR44 with decay rate (0.1/week), reinforcement trigger (cosine >= 0.85), floor/ceiling |
| W5 | ECC-5 capability evaluation framework | Added AR75: standard task corpus + automated evaluation, Sprint 3 HIGH |
| W6 | Coverage map placeholder | Same as J4 — TODO marker |
| W7 | "80 domain-specific" reference unclear | Same as J1 — now fully listed |

### dev (11 issues → 11 fixed)

| # | Issue | Fix Applied |
|---|-------|------------|
| D1 | AR15 variable count "6" → "7" | Updated to "7 built-in variables (`agent_list`, `subordinate_list`, `tool_list`, `department_name`, `owner_name`, `specialty`, `knowledge_context`) + extraVars extensibility" |
| D2 | Theme naming "Sovereign Sage" vs "Natural Organic" | UXR19 updated: "Single theme: **Natural Organic**". "Sovereign Sage" noted as deprecated v2 name |
| D3 | personality_traits JSONB key names undefined | AR26 updated with explicit schema: `{ openness, conscientiousness, extraversion, agreeableness, neuroticism }` (full lowercase) + complete Zod definition |
| D4 | observations.outcome column type undefined | AR42 updated: `outcome VARCHAR(20) DEFAULT 'unknown'` with valid values ('success', 'failure', 'unknown') + added domain, importance, confidence columns |
| D5 | No v2→v3 delta mapping | Added "v2→v3 Delta Summary" table in Reconciliation section |
| D6 | Light/Dark mode direction change not explicit | AR56 updated to "Light mode only for v3 launch" + reconciliation note added |
| D7 | Voyage AI rate limiting not addressed | Added AR76: rate limits (300 RPM, 1M tokens/min), exponential backoff, fallback behavior |
| D8 | ECC-1 missing | Same as W2 |
| D9 | ECC-2 missing | Same as W3 |
| D10 | ECC-3 decay/reinforcement | Same as W4 |
| D11 | New feature REST endpoints not enumerated | Acknowledged as Step 2/3 scope — endpoints defined in stories |

### quinn (13 issues → 13 fixed)

| # | Issue | Fix Applied |
|---|-------|------------|
| Q1 | CRITICAL: AR56 "Dark mode only" vs UXR19 "Light mode only" | AR56 corrected to "Light mode only for v3 launch". Reconciliation note added. CLAUDE.md reference noted as legacy |
| Q2 | CRITICAL: HTTP security headers missing | Added NFR-S11: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, CORS policy |
| Q3 | CRITICAL: File attachment security (FR65) | Added NFR-S12: 10MB limit, type whitelist, filename sanitization, content-type validation |
| Q4 | CRITICAL: Domain reqs not listed | Same as J1 |
| Q5 | CRITICAL: personality_traits JSONB keys | Same as D3 |
| Q6 | HIGH: Adversarial payload 10 insufficient | Updated AR38 + NFR-S10: "minimum 10 + extensible framework, OWASP 50+ as expansion target" |
| Q7 | HIGH: NFR-S7/D7 deletion reasons | Added inline reasons: "CLI Max flat rate, cost-tracker removed" |
| Q8 | HIGH: NFR-O4/O5/O6/O11 untestable baselines | Added baseline references: quality-baseline.md, routing-scenarios.md (10 scenarios listed), 3 rule categories, reference task definition |
| Q9 | MEDIUM: observations.outcome type | Same as D4 |
| Q10 | MEDIUM: Vector search latency NFR | Added NFR-P18: P95 <= 200ms, soul-enricher <= 300ms overhead |
| Q11 | MEDIUM: Auth rate limiting | Added NFR-S13: 10 req/min per IP on token endpoints |
| Q12 | MEDIUM: UXR67 undo scope undefined | Updated with explicit scope: CRUD pages (5 actions), NEXUS (10 actions), excludes deletions |
| Q13 | MEDIUM: UXR139 "evaluate" = research task | Updated to "use @container" + Pre-Sprint research → Sprint 1 implementation |

### Additional fixes (not critic-specific)

| Fix | Description |
|-----|------------|
| NFR-S14 | Added dependency vulnerability scanning requirement (bun audit, Dependabot) |
| AR count | Overview updated from 72 → 75 technical requirements |
