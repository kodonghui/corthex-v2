# Stage 2 Step 04 — Bob (Critic-C, Scrum Master)

**Section:** PRD lines 273–459 (Executive Summary)
**Grade:** B
**Date:** 2026-03-22

---

## Scoring

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| D1 Specificity | 15% | 8 | Audit numbers with file locations, personas with pain points, risk registry with IDs/severity/mitigations, Go/No-Go with verification methods |
| D2 Completeness | 20% | 7 | Covers v2 scale/vision/personas/metrics/risks/roadmap/gates. But: Go/No-Go missing 2 confirmed gates, Pre-Sprint missing Voyage AI blocker |
| D3 Accuracy | 15% | 7 | L447 "8개" wrong (lists 9, should be 11). Go/No-Go #9 numbering conflicts with confirmed decisions. Memory/personality references accurate |
| D4 Implementability | 15% | 8 | Sprint roadmap clear with dependencies and gating. Risk mitigations actionable. Missing gates don't block implementation directly |
| D5 Consistency | 15% | 6 | L447 "8개" vs 9 listed vs confirmed 11 = triple mismatch. Pre-Sprint items differ between Discovery (L168-170) and Exec Summary (L425-428) |
| D6 Risk Awareness | 20% | 7 | Good risk registry with 7+2 risks. But Voyage migration not in registry despite being a Go/No-Go gate. Cost ceiling gate missing |

**Weighted Score: 7.15/10 — PASS ✅ (barely)**

Calculation: (8×0.15)+(7×0.20)+(7×0.15)+(8×0.15)+(6×0.15)+(7×0.20) = 1.20+1.40+1.05+1.20+0.90+1.40 = 7.15

---

## Must-Fix (Critical) — 1 item

### #1: Go/No-Go Gate Count, Missing Gates, Numbering Conflict
**Lines:** L447-458
**Severity:** Critical (D2, D3, D5)
**Evidence:**
- L447: "Go/No-Go 게이트 **8개** (Brief §4)"
- Actually lists 9 gates (#1-#9)
- Confirmed-decisions #11: "8 → **11** gates (added: #9 observation poisoning, #10 Voyage migration, #11 cost ceiling)"
- PRD's #9 = "Capability Evaluation" ≠ confirmed decisions' #9 = "observation poisoning"

**3 sub-issues:**
1. **Count wrong**: L447 says "8개" but 9 are listed, should be 11
2. **Missing gates**: No gate for observation poisoning (confirmed #9), Voyage migration (confirmed #10), cost ceiling (confirmed #11)
3. **Numbering conflict**: PRD #9 (Capability Evaluation) is a valid gate but collides with confirmed-decisions #9 (observation poisoning). Both should exist as separate gates.

**Impact:** Go/No-Go gates are project-level quality checkpoints. Missing Voyage migration gate means Sprint 0 completion has no formal verification. Missing cost ceiling gate means $17/month budget has no enforcement checkpoint.
**Fix:** Update L447 to "11개" (or 12 if both Capability Evaluation and observation poisoning are kept). Add:
- `#10: Voyage AI 임베딩 마이그레이션 완료 | Pre-Sprint | 768→1024 re-embed + HNSW rebuild 검증`
- `#11: 비용 상한 | 전체 | 월 $17 이내 (reflection $1.80 + importance $9 + operational $6.20)`
- `#9: Observation Poisoning 방어 | 3 | 4-layer sanitization E2E 검증 (10KB cap + control char + prompt tag + classification)`
- Renumber PRD's current #9 (Capability Evaluation) → #12 (or integrate into #4 Memory Zero Regression)

---

## Should-Fix (Major) — 3 items

### #2: Pre-Sprint Missing Voyage AI Migration Blocker
**Lines:** L425-428
**Severity:** Major (D5, D6)
**Evidence:**
- Discovery Pre-Sprint (L168-170): Neon Pro + **Voyage AI migration (2-3일, 🔴 NOT STARTED)** + 사이드바 IA
- Exec Summary Pre-Sprint (L425-428): Neon Pro + 사이드바 IA + **테마 결정** (no Voyage AI)
**Impact:** The Exec Summary is the first thing stakeholders read. Omitting the 🔴 Voyage AI migration blocker (2-3 days, all vector dimensions must change) from the Sprint roadmap gives a false impression of Pre-Sprint scope. Discovery section has it, but Exec Summary doesn't.
**Fix:** Add to L425-428: `→ Voyage AI 임베딩 마이그레이션 (768→1024d, 2-3일, 🔴 전 Sprint 블로커)`

### #3: Risk Registry Missing Voyage Migration Risk
**Lines:** L397-413
**Severity:** Major (D6)
**Evidence:**
- Voyage AI migration is a Go/No-Go gate (#10 per confirmed decisions)
- All existing vectors must be re-embedded (768→1024) + HNSW indexes rebuilt
- 2-3 day effort, 🔴 NOT STARTED
- Not in risk registry despite being a Sprint 0 blocker
**Impact:** Risk registry has R1-R9 + 2 additional, but the most time-critical blocker isn't listed.
**Fix:** Add: `| R10 | Voyage AI 임베딩 마이그레이션 (768→1024, re-embed 필수) | 🔴 Critical | Pre-Sprint | 기존 데이터 전수 re-embed (2-3일), HNSW rebuild, Go/No-Go #10 | High (일정 리스크) |`

### #4: Pre-Sprint Item Mismatch Between Discovery and Exec Summary
**Lines:** L168-170 vs L425-428
**Severity:** Major (D5)
**Evidence:**
- Discovery (L168-170): Neon Pro, Voyage AI migration, 사이드바 IA (3 items)
- Exec Summary (L425-428): Neon Pro, 사이드바 IA, 테마 결정 (3 items)
- Discovery has Voyage AI but no 테마 결정
- Exec Summary has 테마 결정 but no Voyage AI
**Impact:** Two sections define Pre-Sprint differently. Devs checking either section get incomplete picture.
**Fix:** Unify both to 4 items: Neon Pro + Voyage AI migration + 사이드바 IA + 테마 결정

---

## Observations (Minor) — 2 items

### #5: v2 Audit Numbers Don't Note v3 Deltas
**Lines:** L279-289
**Observation:** v2 snapshot correctly shows 16 WS channels, 6 workers, 86 tables. Product Scope (Step 3) specifies v3 additions (17 channels, 7 workers, 87 tables). Exec Summary doesn't mention v3 will change these numbers. Not wrong (section says "v2 현재 규모"), but reader may confuse as project totals.
**Suggestion:** Add a one-line note: "v3 추가: +1 WS 채널(/ws/office), +1 워커(memory-reflection), +1 테이블(observations), +3 enum 값, +2 컬럼"

### #6: CLI Max Risk Doesn't Mention Cost Ceiling Gate
**Lines:** L412
**Observation:** L412 correctly identifies CLI Max pricing model as a risk. But the related Go/No-Go #11 (cost ceiling $17/month from confirmed-decisions) isn't listed. These are related — if pricing changes, cost ceiling gate becomes critical.
**Suggestion:** Link L412 risk to the cost ceiling gate when #11 is added.

---

## Cross-Reference Verification

| Source | Exec Summary Status | Notes |
|--------|-------------------|-------|
| Memory Option B | L318-319 ✅ | "agent_memories 테이블을 확장(Option B)" — matches Step 3 fix |
| Personality 4-layer Key Boundary | L316, L402 ✅ | "Key Boundary→API Zod→extraVars strip→Template regex" — matches Decision 4.3.2 |
| n8n Docker 2G | L401 ✅ | "2G RAM cap" |
| Stitch 2 | L455 ✅ | "Stitch 2 디자인 토큰 추출 완료" |
| Sprint order | L430-442 ✅ | Pre-Sprint→S1(Big Five)→S2(n8n)→S3(Memory)→S4(OpenClaw) + Layer 0 병행 |
| Go/No-Go count | L447 ❌ | "8개" → should be 11, lists 9 |
| Voyage AI blocker | L425-428 ❌ | Missing from Pre-Sprint roadmap (present in Discovery L169) |
| Go/No-Go observation poisoning | ❌ | Not listed as gate |
| Go/No-Go Voyage migration | ❌ | Not listed as gate |
| Go/No-Go cost ceiling | ❌ | Not listed as gate |

---

## Strengths

1. **v2 audit numbers** — sourced from actual code audit with file locations, not estimates
2. **Vision statement** — concise, ties all 4 layers to specific user problems
3. **Risk registry** — well-structured with IDs, severity gradient, sprint assignment, and mitigation strategies
4. **Persona pain-point mapping** — each v3 feature directly addresses a named persona's specific problem
5. **Sprint roadmap** — clear dependency chain with gating conditions between sprints
6. **"What Makes This Special"** — 6 items with competitive positioning (AI Town comparison, CrewAI/LangGraph differentiation)
7. **v3 tech metrics** — measurable, sprint-assigned, with specific numbers (200KB, 2s, 90%+)

---

## Summary

Executive Summary is well-structured with strong vision statement, detailed personas, and good risk awareness. The primary issue is **Go/No-Go gate incompleteness**: L447 says "8개" but 9 are listed and should be 11 per confirmed-decisions #11. Three confirmed gates (observation poisoning, Voyage migration, cost ceiling) are missing. Additionally, the Pre-Sprint roadmap omits the Voyage AI migration blocker (2-3 days, 🔴) that the Discovery section includes — a cross-section inconsistency that would mislead stakeholders reading only the Exec Summary.

**Estimated post-fix score: 8.3+** if must-fix + should-fix addressed.

---

## Verified Post-Fix Score (R2 FINAL)

**11 fixes applied** — verified against PRD lines 273–470+.

### Fix Verification

| Fix | Status | Verification |
|-----|--------|-------------|
| #1 Go/No-Go 8→14 gates | ✅ | L453 "14개", gates #1-14 listed at L456-469. #9 poisoning, #10 Voyage, #11 security, #12 v1 parity, #13 usability added. Old #9→#14 renumbered. Brief §4 원본 11 + Stage 1 3개 = 14 |
| #2 Gate #6 Brief alignment | ✅ | L461 "ESLint 하드코딩 색상 0 + Playwright dead button 0" |
| #3 Gate #7 auto-blocking | ✅ | L462 "비용 한도 초과 시 크론 자동 일시 중지 (ECC 2.2)" |
| #4 Pre-Sprint Voyage AI | ✅ | L432 "Voyage AI 임베딩 마이그레이션 (768d→1024d, re-embed + HNSW rebuild, 2-3일, 🔴)". Period L430 "2~4일" |
| #5 테마→디자인 토큰 | ✅ | L434 "디자인 토큰 확정 (Stitch 2 DESIGN.md 기반)" |
| #6 Risk registry R10-R15 | ✅ | L413-418: R10 poisoning 🟠, R11 Voyage 🔴, R12 reflection concurrency 🟡, R13 CLI Max 🟡, R14 solo dev 🟠, R15 /ws/office 🟢 |
| #7 Sprint 3 roadmap Option B | ✅ | L443 "+ agent_memories 확장 (embedding 컬럼, Option B)" |
| #8 R7 stale reference | ✅ | L403 "What Makes This Special #2와 동일 순서" |
| #9 Reflection trigger | ✅ | L376 "일 1회 크론 실행 + reflected=false 관찰 20개 이상 조건 충족 시" (Product Scope L910 정합) |
| #10 UXUI ≥60% measurement | ✅ | L441 "(토큰 적용 페이지 수 / 전체 페이지 수)" |
| #11 Accessibility baseline | ✅ | L392 "Big Five 슬라이더 키보드 조작 가능 + /office aria-live 에이전트 상태 텍스트 대안" |

### Post-Fix Scoring

| Dimension | Weight | R1 (pre-fix) | R2 (post-fix) | Delta | Notes |
|-----------|--------|-------------|---------------|-------|-------|
| D1 Specificity | 15% | 8 | 9 | +1 | 14 gates with verification methods, risk registry R10-R15 with IDs/severity, reflection trigger precise, UXUI measurement defined |
| D2 Completeness | 20% | 7 | 9 | +2 | All Brief §4 gates now present (14), Pre-Sprint 4 blockers unified, risk registry comprehensive (R1-R15), accessibility metric added |
| D3 Accuracy | 15% | 7 | 9 | +2 | Gate count correct (14), Pre-Sprint aligned with Discovery, reflection trigger matches Product Scope, gate #6/#7 Brief-aligned |
| D4 Implementability | 15% | 8 | 9 | +1 | Sprint 3 roadmap includes Option B work, gate #7 has auto-blocking mechanism, gate #10 has SQL verification, Pre-Sprint scoped at 2-4 days |
| D5 Consistency | 15% | 6 | 9 | +3 | Gate count matches Brief+Stage 1, Pre-Sprint unified with Discovery (4 items), reflection trigger matches Product Scope, risk registry linked to gates |
| D6 Risk Awareness | 20% | 7 | 9 | +2 | R10-R15 added, Voyage migration 🔴 in both risk + gate + Pre-Sprint, auto-blocking for cost, poisoning attack chain documented |

**R2 FINAL: 9.00/10 — PASS ✅**

Calculation: (9×0.15)+(9×0.20)+(9×0.15)+(9×0.15)+(9×0.15)+(9×0.20) = 1.35+1.80+1.35+1.35+1.35+1.80 = 9.00
