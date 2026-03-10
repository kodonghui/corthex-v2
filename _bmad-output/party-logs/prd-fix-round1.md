# PRD Fix — Round 1: Collaborative Lens

**Date:** 2026-03-10
**Reviewer:** John (PM) + Winston (Architect)

## Situation Assessment

The architecture.md "PRD 수정 대기 목록" listed 6 correction items with identifiers NFR-SC1, NFR-SC2, NFR-SC7, NFR-P7, OPS-1, and "4GB" references. However, upon thorough reading of the entire PRD (1,002 lines), **none of these values existed in the PRD**. The PRD had NFR1-NFR37 but did not contain any session limit, session memory, total memory, or server spec entries.

**Action taken:** Instead of "editing" non-existent values, **new NFR entries were added** with the architecture-validated correct values directly (i.e., the "수정값" column, not the old "현재값").

## Corrections Applied (6 items → architecture "수정값" directly)

| # | Architecture Item | Action | PRD Location | Value Applied |
|---|------------------|--------|-------------|---------------|
| 1 | NFR-SC1 동시 세션 | **Added** NFR20a | Line 965 (Scalability) | 최대 20개 |
| 2 | NFR-SC2 세션 메모리 | **Added** NFR20b | Line 966 (Scalability) | ≤ 200MB |
| 3 | NFR-SC7 총 메모리 | **Added** NFR20c | Line 967 (Scalability) | ≤ 16GB (24GB 기준) |
| 4 | NFR-P7 5단계 메모리 | **Added** NFR7a | Line 942 (Performance) | ≤ 200MB |
| 5 | OPS-1 동시 세션 제한 | **Added** NFR38 | Line 1006 (Operability) | 기본 20 |
| 6 | "4GB" → "24GB" | **Added** server spec | Line 710 (Resource Req) | Oracle VPS 24GB ARM64 4코어 (Neoverse-N1) |

## John (PM) — Requirement Consistency Check
- ✅ NFR20a (20 sessions) aligns with architecture D4 decision
- ✅ NFR20b (200MB/session) consistent with 24GB RAM spec
- ✅ NFR20c (16GB total) consistent: 24GB - OS/DB overhead = 16GB usable
- ✅ NFR7a (200MB handoff chain) consistent with NFR20b
- ✅ NFR38 (default 20) consistent with NFR20a
- ✅ Server spec in Resource Requirements section provides clear infra context

## Winston (Architect) — Numbers Verification
- 200MB × 20 sessions = 4GB < 16GB total ✅
- 200MB / 5 depth = 40MB per agent in chain ✅ (reasonable)
- CPU 4코어 × 5 = 20 sessions ✅ (matches architecture rationale)
- No stale "4GB" references found (only "24GB" contexts) ✅

## Issues Found: 0
## Issues Fixed: 0

**Round 1 Score: 9/10** — All 6 items properly applied. Minor note: NFR numbering uses "a/b/c" suffixes to avoid renumbering existing NFR20-25 (Reliability section). This is a practical choice but could be cleaned up in future PRD revision.
