# PRD Fix — Round 2: Adversarial Lens

**Date:** 2026-03-10
**Reviewer:** Quinn (QA) + Mary (BA)

## Quinn (QA) — Missed Occurrence Hunt

### Search: Remaining old values
| Pattern | Matches | Status |
|---------|---------|--------|
| `50MB` or `≤ 50` | 0 | ✅ No stale 50MB references |
| `≤ 3GB` or `3GB` | 0 | ✅ No stale 3GB references |
| `기본 10` (session limit) | 0 | ✅ No stale "기본 10" |
| `Oracle VPS 4GB` | 0 | ✅ No stale 4GB server references |
| `4GB RAM` or `4GB 메모리` | 2 matches | ✅ False positives — both in "24GB RAM" context (lines 942, 966) |

### Search: "4GB" as standalone value
| Line | Context | Should change? |
|------|---------|---------------|
| 942 | "24GB RAM 기준" (within NFR7a) | No — this IS the correct new value |
| 966 | "200MB × 20세션 = 4GB" (within NFR20b) | No — this is a calculated value, not a server spec |

**Result: No missed occurrences.**

## Mary (BA) — Accidental Change Check

### Items that should NOT have been changed:
| Item | Expected | Actual | Status |
|------|---------|--------|--------|
| NFR7: 동시 에이전트 작업 부서당 최대 10명 | Unchanged (this is per-dept agent limit, not session limit) | Line 941: "부서당 최대 10명" | ✅ Correctly preserved |
| NFR17: 회사당 부서 최대 20개, 에이전트 최대 100명 | Unchanged | Line 961 | ✅ Correctly preserved |
| NFR18: WebSocket 동시 연결 회사당 최대 50개 | Unchanged | Line 962 | ✅ Correctly preserved |
| Agent tier names (Manager/Specialist/Worker) | Unchanged | Multiple lines | ✅ Correctly preserved |

### Business impact assessment:
- New NFR entries add server capacity specifications that were missing from original PRD
- Values align with architecture decisions (D4 Oracle VPS 24GB ARM64)
- No business logic or existing requirements were altered

## Issues Found: 0
## Issues Fixed: 0

**Round 2 Score: 9/10** — No missed occurrences, no accidental changes. Clean pass.
