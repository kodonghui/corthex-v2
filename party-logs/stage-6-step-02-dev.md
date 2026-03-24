# Critic-A (Dev — Architecture + API) Review — Step 2 Epic Design

**Reviewer**: Amelia (Dev Agent) — Implementation & Code Quality Perspective
**File**: `_bmad-output/planning-artifacts/epics-and-stories.md` (lines 825-1291)
**Weights**: D1=15%, D2=15%, D3=25%, D4=20%, D5=15%, D6=10%

---

## Verification Method

Cross-referenced epic design against live codebase:
- `renderSoul` caller count: `grep -rn renderSoul packages/server/src` (non-test files)
- `agent-loop.ts` tool_result paths: verified line numbers for AR37 sanitizer injection points
- Migration file count: 60 existing (0001-0060), sequence 0061-0064 verified non-conflicting
- WsChannel union: 16 current channels, `/ws/office` as 17th confirmed
- Sprint 2 scope: architecture.md line 1940 flags "Sprint 2 과부하 (15건+)"

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | File paths, migration numbers, Go/No-Go gates, story count ranges, pixel sizes, specific code references in implementation notes. Coverage maps are granular (5 categories × per-epic assignment). |
| D2 완전성 | 8/10 | All 495 requirements mapped. 5 coverage maps. Go/No-Go sequence table. Missing: Sprint 2 overload concern from architecture (Sprint 2/2.5 split decision, arch line 1940). |
| D3 정확성 | 8/10 | Migration sequence 0061-0064 correct. Dependencies verified. 2 minor inaccuracies: renderSoul call site count 10→actual 11, AR37 lines L265/L277→actual L266/L278. |
| D4 실행가능성 | 7/10 | Per-epic implementation notes good. 3 concerns: Epic 23 story count underestimated, Sprint 2 overload unaddressed, Epic 24 dual-change strategy vague. |
| D5 일관성 | 9/10 | Epic 22-29 continues v2 numbering. Sprint assignment matches AR71. Go/No-Go gates match AR62. Theme naming consistent with Step 1 corrections. |
| D6 리스크 | 7/10 | Go/No-Go gates well-distributed. Dependency chain documented. Sprint 2 overload risk NOT flagged. Epic 23 parallel blocking risk unaddressed. |

### 가중 평균: 8.00/10 ✅ PASS

Calculation: (9×0.15) + (8×0.15) + (8×0.25) + (7×0.20) + (9×0.15) + (7×0.10) = 1.35 + 1.20 + 2.00 + 1.40 + 1.35 + 0.70 = **8.00**

---

## 이슈 목록 (7 issues, 3 priority)

### Priority Issues

#### 1. ~~**[D4 실행가능성] Sprint 2 overload**~~ — **WITHDRAWN after Winston cross-talk**
- Architecture L1940 is **stale pre-resolution text**. The actual decision is at L668 Carry-Forward Resolution: "D32: 분할 안 함 (16 FRs, Sprint 1과 유사 볼륨) ✅ 해소"
- Sprint 2/2.5 split was explicitly decided AGAINST. Epic design is correct.
- Recommendation: L1940 should add "해소" tag to avoid future confusion

#### 2. **[D4 실행가능성] Epic 23 story count underestimated: 12-15 stories for ~100 UXRs**
- Epic 23 covers: UXR1-55, UXR63-78, UXR79-95, UXR97, UXR99-100, UXR103-140 ≈ **100+ UXRs**
- Plus: 3 custom components (NexusCanvas, HandoffTracker, StreamingMessage), page consolidation (14→6), Radix UI migration, responsive 4-breakpoint design, accessibility foundations, onboarding redesign
- v2 average: ~4.7 stories/epic (98/21). 12-15 stories for this scope is aggressive
- **Impact**: Story scope explodes when breaking down. Layer 0 deadline (≥60% by Sprint 2) at risk
- **Fix**: Increase estimate to 18-22 stories, or explicitly split into sub-phases (e.g., 23A: tokens+components+shell, 23B: page redesigns, 23C: page consolidation+redirects)

#### 3. **[D4 실행가능성] Epic 24 AR28/AR73 dual-change on `call-agent.ts` — no coordination strategy**
- Line 1115: "AR73: `call-agent.ts` response parsed to `{ status, summary, next_actions, artifacts }` — same file as AR28, coordinate carefully"
- "coordinate carefully" is not a strategy. Two independent stories touching the same 83-line file → merge conflict risk
- Current `call-agent.ts` has 83 lines. AR28 changes lines 67-68 (renderSoul → enrich+renderSoul). AR73 changes lines 79-82 (raw yield → structured response)
- **Fix**: Either (a) single story handles both call-agent.ts changes, or (b) explicit dependency: Story A (AR28 soul-enricher migration) completes before Story B (AR73 response standardization)

### Secondary Issues

#### 4. **[D3 정확성] renderSoul call site count: AR28 says 10, actual is 12** _(updated after Winston cross-talk)_
- Verified 9 callers in non-test files:
  1. `routes/commands.ts:55` — 1 call
  2. `routes/workspace/hub.ts:105-106` — **2 calls** (ternary)
  3. `routes/workspace/presets.ts:45` — 1 call
  4. `tool-handlers/builtins/call-agent.ts:67-68` — **2 calls** (ternary)
  5. `routes/public-api/v1.ts:46` — 1 call
  6. `services/telegram-bot.ts:96` — 1 call
  7. `services/organization.ts:957` — 1 call
  8. `services/argos-evaluator.ts:379` — 1 call
  9. `services/agora-engine.ts:170, 301` — **2 calls** (direct + cache fallback)
- Total: 9 callers, **12 call sites** (hub.ts ×2, call-agent.ts ×2, agora-engine.ts ×2)
- AR28 says "9 callers (10 call sites)" — off by 2
- **Fix**: Update AR28 to "9 callers (12 call sites)"

#### 5. **[D3 정확성] AR37 line references L265/L277 drifted to L266/L278**
- Current `agent-loop.ts` MCP tool_result paths:
  - MCP error path: **L266** (was L265)
  - MCP success path: **L278** (was L277)
- 1-line drift from code changes since architecture was written
- **Severity**: Very low — concept correct (2 MCP paths), line numbers just stale
- **Fix**: Update to L266/L278, or remove specific line numbers and reference "MCP error/success tool_result paths" instead

#### 6. **[D6 리스크] Epic 23 parallel execution risk unaddressed**
- Epic 23 (Layer 0) runs parallel to ALL other sprints
- If Layer 0 falls behind, sprint-specific pages can't be themed → cascading delay
- AR71 sets "≥60% by Sprint 2 end" milestone, but what happens if missed?
- **Fix**: Add fallback plan: "If Layer 0 <60% at Sprint 2 exit, Sprint 3 stories include Layer 0 catch-up. Sprint 4 cannot start with <80% Layer 0"

#### 7. **[D4 실행가능성] Epic 28 AR75 (capability evaluation) mixed with feature stories**
- AR75 (ECC-5, Sprint 3, HIGH): "Standard task corpus (minimum 10 tasks across 5 categories) + automated evaluation pipeline"
- This is a testing/evaluation framework, not a user feature
- Mixed with 14 FRs of memory implementation in the same epic
- **Impact**: Story scoping confusion — test framework stories have different AC patterns than feature stories
- **Fix**: Either separate as an explicit "testing infrastructure" story within Epic 28, or note it as a distinct workstream within the epic

---

## Bob's Specific Questions — Answers

| Question | Answer |
|----------|--------|
| Epic boundaries implementable? | Yes, except Epic 23 is too large (see issue #2) and Sprint 2 is overloaded (see issue #1) |
| Epic 24 AR28/AR73 conflict? | Acknowledged but strategy insufficient (see issue #3) |
| Epic 23 feasible as parallel? | Concept is sound but 12-15 stories underestimated for 100+ UXRs. Need 18-22 or sub-phases |
| Code file touchpoints realistic? | Yes. renderSoul 9 callers verified. AR37 2 MCP paths verified (line drift only) |
| v2 carry-forward FR table? | Correct. FR1-10→E24, FR50-56→E22, FR11-68→E23 touchpoints all verified |
| Migration sequences? | 0061(E22)→0062(E24)→0063-0064(E28) sequential, non-conflicting ✅ |

---

## Cross-talk Summary

- **To Winston (Architect)**: Sprint 2 overload concern, renderSoul call site count, NFR-S11-14 existing status, soul-enricher additive extension safety.
- **From Winston**: Sprint 2 overload was RESOLVED (D32, no split). renderSoul = 12 call sites (not 10 or 11). Both corrections accepted.
- **To Quinn (QA)**: Epic 28 has 4 Go/No-Go gates in one sprint (most of any epic). AR75 capability evaluation framework may need separate test plan.

### Post-cross-talk score adjustment
- Issue #1 (Sprint 2 overload) WITHDRAWN → D2 stays 8, D4 stays 7 (other issues remain)
- Issue #4 (renderSoul count) updated 11→12 → D3 unchanged at 8
- **Mid-review score: 8.00/10 ✅ PASS** (withdrawn issue was D4, but D4 still has issues #2, #3, #7)

### Final verification (all fixes applied)

| # | Issue | Fix Status | Verified |
|---|-------|-----------|----------|
| 1 | Sprint 2 overload | WITHDRAWN (D32) | ✅ Documentation added anyway |
| 2 | Epic 23 story count | 12-15 → **18-22** (L1073) | ✅ + ≥60% measurement (L1094) |
| 3 | AR28/AR73 dual-change | **Single story** (L1120) | ✅ "Single story handles both changes" |
| 4 | renderSoul count | **12 call sites** (AR28 L378) | ✅ AR28 source updated. Epic 24 L1119 still says "11" — minor residual |
| 5 | AR37 line drift | Descriptive in Epic 27 (L1209) | ✅ Epic notes use "error path + success path". AR37 source L390 still has L265/L277 — minor residual |
| 6 | Epic 23 parallel risk | Fallback added (L1095) | ✅ "<60% → Sprint 3 catch-up. <80% blocks Sprint 4" |
| 7 | AR75 mixed workstream | **Distinct testing workstream** (L1240) | ✅ + Early verification strategy (L1241): #7/#9 mid-sprint, #4/#14 exit |

**Final score: 8.55/10 ✅ PASS**

Updated dimensions:
| 차원 | Before | After | Delta |
|------|--------|-------|-------|
| D1 | 9 | 9 | — |
| D2 | 8 | 9 | ≥60% measurement, Sprint 2 documentation |
| D3 | 8 | 8 | AR28 source fixed to 12, minor L1119/L390 residuals |
| D4 | 7 | 8 | Single story strategy, 18-22 estimate, AR75 workstream, parallel fallback |
| D5 | 9 | 9 | — |
| D6 | 7 | 9 | Parallel risk fallback, Epic 28 early verification |

Weighted: (9×0.15)+(9×0.15)+(8×0.25)+(8×0.20)+(9×0.15)+(9×0.10) = 1.35+1.35+2.00+1.60+1.35+0.90 = **8.55**
