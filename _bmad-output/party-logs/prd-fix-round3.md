# PRD Fix — Round 3: Forensic Lens

**Date:** 2026-03-10
**Reviewer:** Forensic audit

## Exact Changes Summary

**File:** `_bmad-output/planning-artifacts/prd.md`
**Original lines:** 1,002 → **New lines:** 1,006 (+4 net lines)
**Git diff:** 6 insertions, 1 deletion (1 modified line + 5 new lines)

### Line-by-line changes:

| Change # | Line (new) | Type | Content |
|----------|-----------|------|---------|
| 1 | 710 | Modified | Added "Oracle VPS 24GB ARM64 4코어 (Neoverse-N1) 서버" and "self-hosted runner" to infra line |
| 2 | 942 | Added | NFR7a: 5단계 핸드오프 체인 메모리 ≤ 200MB (Performance section) |
| 3 | 965 | Added | NFR20a: 동시 CLI 세션 최대 20개 (Scalability section) |
| 4 | 966 | Added | NFR20b: 세션당 메모리 ≤ 200MB (Scalability section) |
| 5 | 967 | Added | NFR20c: 총 메모리 사용량 ≤ 16GB (Scalability section) |
| 6 | 1006 | Added | NFR38: 동시 세션 제한 기본값 20 (Operability section) |

## Internal Consistency Verification

### Math check:
- 200MB/session × 20 sessions = **4,000MB = 4GB** ✅
- 4GB sessions < 16GB total limit ✅ (12GB remaining for OS/DB/Docker/other)
- 200MB / 5-depth chain = **40MB per agent** ✅ (reasonable for CLI agent process)
- CPU 4코어 × 5 = **20 sessions** ✅ (matches architecture rationale)

### Cross-reference check:
| Architecture "수정값" | PRD New Entry | Match? |
|----------------------|---------------|--------|
| 동시 세션 → 20 | NFR20a: 최대 20개 | ✅ |
| 세션 메모리 → ≤ 200MB | NFR20b: ≤ 200MB | ✅ |
| 총 메모리 → ≤ 16GB (24GB 기준) | NFR20c: ≤ 16GB (24GB 서버 기준) | ✅ |
| 5단계 메모리 → ≤ 200MB | NFR7a: ≤ 200MB | ✅ |
| 동시 세션 제한 → 기본 20 | NFR38: 기본값 20 | ✅ |
| Oracle VPS 24GB ARM64 4코어 | Line 710 + NFR20a/NFR38 근거 | ✅ |

### Edge case: CPU 4코어 with 20 sessions
- 20 sessions × 3-depth avg = 60 concurrent agent processes ⚠️
- This is at the CPU boundary but documented in architecture as acceptable
- CLI rate limiting provides additional protection

## Quality Score: **9/10 — PASS**

**Reasoning:**
- All 6 architecture correction items properly reflected in PRD (+1 each = 6/6)
- No stale old values remaining (verified by adversarial grep in Round 2)
- No accidental changes to unrelated NFR entries
- Math is internally consistent
- NFR numbering uses suffixes (7a, 20a/b/c) to avoid renumbering — pragmatic choice (-0.5)
- Server spec properly documented in Resource Requirements and NFR rationale columns (-0.5 for not having a dedicated Infrastructure section, but acceptable for current PRD structure)

**PASS** — All corrections applied correctly. Ready for commit.
