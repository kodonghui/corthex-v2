# Stage 0 Step 01 — Fixes Applied

Date: 2026-03-20
Writer: analyst (Mary)
Avg score before fix: 7.05/10 (John 6.8 ❌, Bob 7.1 ✅, Winston 7.6 ✅, Sally 6.7 ❌)

---

## Fixes Applied

### John Issue 1 [HIGH — D3] ✅ FIXED
**Issue:** `critic-rubric.md` was listed in inputDocuments — scoring meta-tool should not be a product input.
**Fix:** Removed `critic-rubric.md` from inputDocuments entirely. It is a pipeline tool, not a product requirement document.

### John Issue 2 [MEDIUM — D2] ✅ FIXED
**Issue:** No `stepsPlanned` field in frontmatter.
**Fix:** Added `stepsPlanned: [1, 2, 3, 4, 5, 6]` to frontmatter.

### John Issue 3 [MEDIUM — D5] ✅ FIXED
**Issue:** No document priority / conflict resolution order defined.
**Fix:** Added `documentPriority` frontmatter field with numbered priority order + role description for each document.

### Bob Issue 1 [HIGH — D6] ✅ FIXED
**Issue:** No VPS resource constraint signal despite v3-vps-prompt.md being in inputDocuments.
**Fix:** Added `<!-- ⚠️ VPS RESOURCE CONSTRAINT -->` comment block with specific constraints:
- PixiJS 8 bundle target < 200KB gzipped
- n8n Docker: separate container, API-only
- pgvector on existing Neon instance
- +1 WebSocket channel only
- No new infrastructure beyond n8n Docker

### Bob Issue 2 [MEDIUM — D1] ✅ FIXED
**Issue:** inputDocuments listed paths only, no role tags.
**Fix:** Converted each inputDocument entry to `path:` + `role:` format with explicit purpose label (PRIMARY, AUTHORITY, BASELINE, CONSTRAINT, SCOPE BOUNDARY, STRUCTURE, EXECUTION CONTEXT).

### Winston Issue 1 [HIGH — D3] ✅ ADDRESSED
**Issue:** prd.md had critic score 4.8/10 with 7 known issues — unclear if fixed.
**Fix:** Added `NOTE:` warning in prd.md inputDocument role entry: "last critic review scored 4.8/10 with 7 known issues; consume with caution, verify against audit doc." Also added to known risks comment block.

### Winston Issue 2 [MEDIUM — D2] ✅ FIXED
**Issue:** epics.md (v2 21-epic structure) missing from inputDocuments.
**Fix:** Added `epics.md` as inputDocument with role `SCOPE BOUNDARY — v2 21개 Epic 구조`.

### Sally Issue 1 [HIGH — D2] ❌ NOT APPLIED (HALLUCINATION)
**Issue:** Sally requested adding `_corthex_full_redesign/phase-6-generated/web/` to inputDocuments.
**Finding:** This path does not exist on disk (verified with Glob). Furthermore, CLAUDE.md states v3 폐기 기존 테마 전부. Adding a non-existent file would violate critic-rubric.md auto-fail condition: "할루시네이션: 존재하지 않는 API/파일/함수를 참조".
**Action:** Not applied. Known risks comment includes "UXUI: 428 color-mix incident → full theme reset" to capture the design intent.

### Sally Issue 2 [MEDIUM — D6] ✅ FIXED
**Issue:** Zero risk awareness at init.
**Fix:** Added `<!-- ⚠️ KNOWN RISKS -->` comment block listing: PixiJS learning curve, n8n complexity, pgvector status, UXUI incident history, prd.md known issues.

### Sally Issue 3 [LOW — D1] ✅ FIXED
**Issue:** Step comments incomplete — only showed steps up to 4.
**Fix:** All 6 steps now listed in PIPELINE comment block with status indicators (✅/⏳) and GATE/AUTO labels.

---

## Summary
- 9 out of 10 issues addressed
- 1 issue rejected (Sally's phase-6-generated/web/ — non-existent path, hallucination risk)
- Document now has: priority ordering, role tags, VPS constraints, risk flags, full step plan
