# Critic-A (Dev) Review — Step 02: Context Analysis

**Reviewed**: `_bmad-output/planning-artifacts/architecture.md` L1233–L1427
**Reviewer**: Dev (Amelia) — Critic-A weights (D3=25%, D4=20%)
**Date**: 2026-03-21

---

## Dimension Scores

| Dimension | Score | Weight | Evidence |
|-----------|-------|--------|----------|
| D1 Specificity | 8/10 | 15% | FR counts exact (49 FR, 16 NFR verified), hex-less but appropriate for context analysis. Two ambiguities: soul-enricher.ts path missing, PostToolUse insertion position incomplete. |
| D2 Completeness | 8/10 | 15% | All step-02 success metrics met. FR/NFR tables, scale assessment, sprint deps, risk registry, cross-cutting, ECC ideas, carry-forward — all present. Minor: no explicit mention of how soul-enricher.ts interacts with existing hub.ts extraVars flow. |
| D3 Accuracy | 6/10 | 25% | **Two factual errors found via code verification.** See issues #1 and #2 below. |
| D4 Implementability | 8/10 | 20% | FIX-3 resolution is crystal clear (3-table model). ECC ideas have file paths and sprint assignments. CallAgentResponse TypeScript interface included. Missing: soul-enricher E8 boundary implication. |
| D5 Consistency | 7/10 | 15% | Consistent with PRD FR/NFR numbering, sprint ordering, Go/No-Go gates. Cross-cutting #4 repeats stale "2파일만" claim. Variable count (6+5+1=12) matches code reality. |
| D6 Risk Awareness | 8/10 | 10% | R1–R9 comprehensive with mitigations. CPU saturation acknowledged. Go/No-Go #9 is a novel capability evaluation gate. Minor: CPU "포화 가능" has no concrete mitigation beyond noting LLM I/O is non-CPU. |

### Weighted Average: 7.3/10 ✅ PASS (borderline)

**Calculation**: (8×0.15) + (8×0.15) + (6×0.25) + (8×0.20) + (7×0.15) + (8×0.10) = 1.2 + 1.2 + 1.5 + 1.6 + 1.05 + 0.8 = **7.35**

---

## Issue List (5 issues, 2 HIGH, 2 MEDIUM, 1 LOW)

### 1. **[HIGH] [D3 Accuracy] E8 boundary claim "2파일만" is factually wrong**
- **Location**: L1381 — `SDK 격리 경계 (E8) — engine/ 공개 API 2파일만`
- **Evidence**: `engine/index.ts` exports from **5 source files**: agent-loop.ts, soul-renderer.ts, model-selector.ts, sse-adapter.ts, types.ts
- **Code proof**: `packages/server/src/engine/index.ts:9-13`
- **Fix**: Change "2파일만" → "engine/index.ts barrel (5 source modules)" or list the exports explicitly. CLAUDE.md also says "agent-loop.ts + types.ts only" but reality diverged during E14/E15 implementation.

### 2. **[HIGH] [D3 Accuracy] FR total count arithmetic error**
- **Location**: L1255 — `v3 Functional Requirements (49개 신규, v2 97개 활성 → 총 116개 활성, 2개 삭제)`
- **Problem**: 97 + 49 - 2 = 144, not 116. The 28 FR gap is unexplained.
- **Likely cause**: Some v3 FRs update/replace existing v2 FRs rather than being purely additive. But this isn't stated.
- **Fix**: Either (a) clarify "49개 신규 중 X개는 v2 FR 업데이트, Y개는 순수 신규" or (b) correct the arithmetic. The reader must know how 144 → 116.

### 3. **[MEDIUM] [D4 Implementability] soul-enricher.ts E8 boundary violation unaddressed**
- **Location**: L1262 references `soul-enricher.ts` without path.
- **PRD says**: `packages/server/src/services/soul-enricher.ts` (PRD L904) — this is **outside engine/**.
- **PRD also says**: agent-loop.ts imports `soulEnricher.enrich()` (PRD L911) — engine/ importing from services/ **violates E8**.
- **Current pattern**: hub.ts (outside engine/) prepares extraVars and passes to renderSoul(). Soul-enricher could follow this caller-side pattern instead.
- **Fix**: Architecture Step 02 should flag this E8 tension and note it as a Step 4 decision: "soul-enricher called FROM caller (hub.ts/call-agent.ts) or FROM engine (agent-loop.ts)? If from engine, E8 boundary check needs amendment."

### 4. **[MEDIUM] [D1 Specificity] PostToolUse hook insertion order incomplete**
- **Location**: L1386 — tool-sanitizer runs "credential-scrubber 이후, delegation-tracker 이전"
- **Problem**: Current chain is `credentialScrubber → outputRedactor → delegationTracker` (verified in agent-loop.ts L226-228, L244-246). Where does tool-sanitizer go relative to outputRedactor?
  - Option A: scrubber → **sanitizer** → redactor → tracker
  - Option B: scrubber → redactor → **sanitizer** → tracker
- **Why it matters**: Sanitizer strips injection payloads. If it runs AFTER redactor, redacted content may mask injection patterns. If BEFORE, sanitizer sees raw-ish output.
- **Fix**: Specify full 4-hook chain order explicitly.

### 5. **[LOW] [D6 Risk] CPU saturation mitigation is hand-wavy**
- **Location**: L1323 — "n8n Docker 2코어 상한이 추가됨... 4코어 포화"
- **Mitigation given**: "Reflection 크론이 LLM API I/O 대기 위주이므로 CPU 부하는 미미"
- **Gap**: No concrete mitigation for the actual saturation scenario (Bun + PG + CI build + n8n all peak simultaneously). Consider: CI build scheduling off-peak, n8n CPU cgroup limit, or accepting degraded CI build times.
- **Severity**: LOW because this is Step 02 context analysis — specific mitigations belong in Step 4/6.

---

## Verification Checks Performed

| Claim | Verified | Method |
|-------|----------|--------|
| 16 WsChannel types | ✅ | `shared/types.ts:484-501` — 16 union members counted |
| call-agent.ts path | ✅ | `packages/server/src/tool-handlers/builtins/call-agent.ts` exists |
| soul-renderer.ts 6 built-in vars | ✅ | Code L34-42 has 6 keys in vars object |
| agent_memories table | ✅ | `db/schema.ts` + migrations reference confirmed |
| memoryTypeEnum | ✅ | `db/schema.ts` contains definition |
| engine/index.ts E8 barrel | ✅ | Exports from 5 files, not 2 |
| model-selector.ts location | ✅ | `packages/server/src/engine/model-selector.ts` exists |
| PostToolUse hook order | ✅ | agent-loop.ts L226-228: scrubber → redactor → tracker |
| FR count 49 | ✅ | 11+6+7+8+11+3+3 = 49 |
| NFR count 16 | ✅ | 5+2+2+3+1+1+1+1 = 16 |
| soul-enricher.ts exists | ❌ | File does not exist (v3 NEW — expected) |

---

## Summary Verdict

Strong context analysis overall. The v2 baseline table, FIX-3 resolution, and ECC ideas are well-structured. The two accuracy issues (#1, #2) prevent a higher score. Issue #1 is straightforward to fix (update "2파일만"). Issue #2 needs arithmetic clarification. Issue #3 should at least be flagged as a Step 4 decision even if not resolved here.
