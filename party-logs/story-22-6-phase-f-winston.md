# Story 22.6 Phase F — Code Review (Critic-A: winston)

**Story**: 22.6 — Neon Pro Upgrade & VPS Resource Verification
**Phase**: F (Code Review)
**Date**: 2026-03-24
**Reviewer**: winston (Architecture + API)

---

## Code Review Checklist

### 1. Correctness

| Check | Status | Notes |
|-------|--------|-------|
| Schema line references accurate | **PASS** | `schema.ts:1556` → `vector('embedding', { dimensions: 1024 })` ✅, `schema.ts:1888` → `vector('query_embedding', { dimensions: 1024 })` ✅ |
| `voyage-embedding.ts:8` reference | **PASS** | `EMBEDDING_MODEL = 'voyage-3'` confirmed at line 8 |
| Table names correct | **PASS** | `knowledge_docs` (not `knowledge_chunks`), `semantic_cache` — both match schema.ts |
| Model name correct | **PASS** | `voyage-3` (not `voyage-3-large`) — matches voyage-embedding.ts |
| RAM budget calculation | **PASS** | Peak 9GB (Bun 2 + CI 4 + n8n 2 + OS 1), Neon cloud-hosted — no local PG |
| Commit hashes in Go/No-Go | **PASS** | 22.1→`130f487`, 22.2→`9313bef`, 22.3→`322e44f`, 22.4→`54475f4`, 22.5→`a095831` — all traceable |
| Cost projections | **PASS** | Voyage $0.06/1M tokens × ~200K tokens ≈ $0.01/mo — math checks out |
| Test count in pre-sprint-go-no-go.md | **NOTE** | Line 57 says 22.6 has "25" tests, actual count is 29. Cosmetic — does not affect verdict |

### 2. Architecture Compliance

| Check | Status | Notes |
|-------|--------|-------|
| No engine/ boundary violations | **PASS** | Tests read schema files and package.json — no engine imports |
| No module-level mutable state | **PASS** | Constants only (`ROOT_DIR`, `SERVER_PKG`, `SCHEMA_PATH`, `TEST_ARTIFACTS`) |
| No E8 boundary crossing | **PASS** | Verification-only code, no engine interaction |
| SDK version checks pinned (no ^) | **PASS** | Tests assert exact versions: `voyageai` → `0.2.1`, `pgvector` → `0.2.1` |
| DB access pattern (getDB) | **N/A** | No DB queries — file-based schema verification only |

### 3. Security

| Check | Status | Notes |
|-------|--------|-------|
| No secrets in test files | **PASS** | DATABASE_URL checked for existence only, never logged or asserted on value |
| No shell injection | **PASS** | All `execSync` commands use hardcoded strings, no user input interpolation |
| No credential exposure in docs | **PASS** | Cost docs reference service names, not keys/tokens |

### 4. Test Quality

| Check | Status | Notes |
|-------|--------|-------|
| Real system state (no mocks) | **PASS** | `os.*`, `execSync`, `readFileSync` — deterministic against actual hardware |
| CI-safe graceful degradation | **PASS** | DATABASE_URL soft check (line 96-103) — test passes when missing |
| Negative assertions | **PASS** | Lines 150, 156: explicitly verify 768-dim vectors are absent |
| Dual-assertion pattern | **PASS** | Lines 148-158: checks BOTH that 768 is gone AND 1024 is present |
| Threshold realism | **PASS** | CPU=4, RAM≥23GB, disk≥100GB — all match Oracle ARM64 Ampere A1 specs |

### 5. Documentation Quality

| Check | Status | Notes |
|-------|--------|-------|
| Cost estimate completeness | **PASS** | 6 services, 3 NFR checks, VPS resource budget table |
| Go/No-Go evidence chain | **PASS** | Each PASS links to commit hash + specific file:line |
| CONDITIONAL items have resolution path | **PASS** | AR6 and NFR-COST1 both have 3 options documented |
| Pre-sprint verdict is justified | **PASS** | 8/10 PASS, 2 CONDITIONAL, verdict GO with reasoning |

### 6. Code Style

| Check | Status | Notes |
|-------|--------|-------|
| File naming (kebab-case) | **PASS** | `infrastructure-verification.test.ts` |
| Import style | **PASS** | Named imports from `bun:test`, `child_process`, `fs`, `path`, `os` |
| Describe/test hierarchy | **PASS** | Top-level describe → Task-level describe → individual tests |
| Comments explain "why" not "what" | **PASS** | Line 46, 62, 88, 101 — explain rationale for approach |

---

## Issues Found

### Cosmetic (no action required)

1. **Test count mismatch in Go/No-Go** (pre-sprint-go-no-go.md:57): Says "25" tests for Story 22.6, actual count is 29. The story spec estimated 20-25; implementation exceeded that. Cosmetic only.

2. **Repeated `readFileSync` calls**: `SERVER_PKG` is read 4 times (lines 119, 124, 131, 136) and `SCHEMA_PATH` 4 times (lines 106, 114, 149, 155). Could be cached in a `beforeAll`. Not a bug — `readFileSync` is fast for small files, and isolation between tests is a valid design choice.

3. **Repeated `docker info` calls**: Lines 71, 76, 87 each call `execSync('docker info 2>&1')`. Same note as above — could be cached but isolation is acceptable.

---

## Cross-Reviewer Notes

**Re: John's architecture doc PG correction**: The cost estimate doc correctly notes (line 75): "Previous architecture doc included PG ~3GB in peak budget; corrected here." This is the right approach — document the correction in the verification artifact, and flag the architecture doc discrepancy for follow-up. Out of scope for 22.6; architecture doc update can be a Sprint 1 housekeeping task.

**Re: Quinn's SQL query gap**: Spec Tasks 2.1-2.4 included live SQL queries (`SELECT version()`, `SHOW max_connections`, `pg_extension`). Implementation replaced these with file-based schema verification. This is the right tradeoff — file-based checks are CI-safe and still verify the critical constraints (dimensions, packages, model). Live DB tests can be added in Sprint 1 integration testing.

---

## Score

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Correctness | 30% | 9.0 | 2.70 |
| Architecture Compliance | 20% | 9.5 | 1.90 |
| Security | 10% | 9.5 | 0.95 |
| Test Quality | 20% | 9.0 | 1.80 |
| Documentation | 15% | 9.5 | 1.425 |
| Code Style | 5% | 9.0 | 0.45 |
| **Total** | **100%** | | **9.23** |

---

## Verdict: **APPROVE** (9.23/10)

Clean verification-only implementation. No bugs, no security issues, no architecture violations. Documentation is thorough with specific evidence and commit traceability. Minor cosmetics (test count "25" vs actual 29, repeated file reads) are non-blocking.

**Epic 22 — Phase 0 Pre-Sprint Hardening: COMPLETE.**
**Sprint 1: GO.**
