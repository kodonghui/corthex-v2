# Story 22.6: Neon Pro Upgrade & VPS Resource Verification

## Story

As a platform operator,
I want Neon Pro confirmed and VPS resources verified,
So that all Sprint 1+ prerequisites are unblocked.

**Epic**: 22 — Pre-Sprint Hardening & Infrastructure
**Sprint**: Pre-Sprint (Phase 0)
**Priority**: P0 (blocker for all subsequent sprints)
**References**: AR6, AR7, NFR-COST1, NFR-COST2

---

## Acceptance Criteria

### AC-1: Neon Pro Tier Verification
**Given** Neon is currently on a tier
**When** the verification script runs
**Then** the Neon project tier is confirmed (free/hobby vs Pro)
**And** connection pool limits are documented (≥10 concurrent sessions required for v3)
**And** pgvector extension is available and verified
**And** the verification result is logged and committed

### AC-2: VPS Resource Budget Verification
**Given** the VPS is Oracle ARM64 (expected: 4-core, 24GB RAM)
**When** the verification script runs
**Then** actual CPU cores = 4 (aarch64 architecture confirmed)
**And** total RAM ≥ 23GB (24GiB nominal)
**And** available disk ≥ 100GB
**And** Docker daemon is running with sufficient resources for n8n container (Sprint 2)
**And** ~12GB RAM headroom confirmed (peak usage ~12GB per architecture doc)

### AC-3: Docker Readiness for n8n
**Given** Docker daemon must be running for Sprint 2 n8n container
**When** the verification script runs
**Then** Docker daemon is running and responsive
**And** Docker can pull and run ARM64 images
**And** `--memory=2g` limit is supported (for n8n hard cap per D2)

### AC-4: Voyage AI Migration Status (Go/No-Go #10)
**Given** Stories 22.2 (Voyage SDK) and 22.3 (vector migration 768→1024) are completed
**When** the verification script checks migration status
**Then** Voyage AI SDK is installed and configured (voyageai@0.2.1)
**And** HNSW index dimensions = 1024 (not 768)
**And** Go/No-Go #10 documented as PASS or FAIL with evidence

### AC-5: Infrastructure Cost Estimate
**Given** NFR-COST1 (total ≤$10/month) and NFR-COST2 (embedding ≤$5/month)
**When** cost documentation is generated
**Then** monthly cost breakdown documented:
  - VPS: $0 (Oracle Always Free tier)
  - Neon: $0 (Free tier) or $19/month (Pro tier)
  - Voyage AI: projected embedding cost based on volume estimates
  - Total vs NFR-COST1 threshold
**And** cost estimate committed as test artifact

### AC-6: Verification Test Suite
**Given** all verification checks are implemented
**When** `bun test` runs the verification test file
**Then** all infrastructure assertions pass
**And** results are deterministic (based on actual system state, not mocks)

---

## Tasks

### Task 1: VPS Resource Verification Test

**File**: `packages/server/src/__tests__/unit/infrastructure-verification.test.ts`

**1.1** System resource checks:
- CPU: `os.cpus().length === 4`
- Architecture: `os.arch() === 'arm64'`
- Total RAM: `os.totalmem() >= 23 * 1024 * 1024 * 1024` (23GB+)
- Disk: verify root partition has ≥100GB available via `child_process` `df -B1 /` (parse available bytes)

**1.2** Docker verification:
- Docker daemon responsive: `docker info` exits 0
- Docker architecture matches host: `docker info` shows `Architecture: aarch64`
- Running containers include `corthex-v2`
- Docker supports `--memory` flag (for n8n Sprint 2)

**1.3** RAM headroom calculation:
- Total RAM - current used = available
- Verify available ≥ 12GB (architecture doc target)
- Document peak budget: Bun ~2GB + CI ~4GB + n8n ~2GB + OS ~1GB = ~9GB peak (Neon is cloud-hosted, no local PG)

### Task 2: Neon Database Verification Test

**2.1** Connection test:
- Verify DATABASE_URL env var is set
- Test connection via `@neondatabase/serverless`
- Query `SELECT version()` — confirm PostgreSQL version

**2.2** pgvector verification:
- Query `SELECT extversion FROM pg_extension WHERE extname = 'vector'`
- Verify extension is installed
- Verify vector dimensions in `knowledge_docs.embedding` column = 1024
- Verify vector dimensions in `semantic_cache.query_embedding` column = 1024 (Story 22.3 migrated both tables)

**2.3** Connection pool capacity:
- Document max_connections from `SHOW max_connections`
- Verify ≥10 concurrent session support

**2.4** Neon tier detection:
- Neon doesn't expose tier via SQL — use indirect detection:
  - Check `max_connections` (Free ≤100, Pro ≥100 with pooler)
  - Check compute size hints from `pg_settings` if available
  - Document detected tier as "Free (suspected)" or "Pro (confirmed)" with reasoning
- If Free tier: document that Pro upgrade is pending (AR6 blocker)

### Task 3: Voyage AI Migration Verification

**3.1** SDK installation check:
- Verify `voyageai` package in dependencies (version 0.2.1)
- Verify `@anthropic-ai/sdk` is present (for Claude API)

**3.2** Vector dimension verification:
- Check HNSW index definition in schema
- Verify dimension = 1024 (post-migration from 768)
- Reference Story 22.3 completion

**3.3** Go/No-Go #10 documentation:
- Create `_bmad-output/test-artifacts/go-no-go-10-voyage-migration.md`
- Status: PASS/FAIL with evidence from Stories 22.1-22.3

### Task 4: Infrastructure Cost Estimate Document

**File**: `_bmad-output/test-artifacts/infrastructure-cost-estimate.md`

**4.1** Monthly cost breakdown:
- **VPS**: Oracle Cloud Always Free ARM64 — $0/month
- **Neon DB**: Current tier cost (Free = $0, Pro = $19)
- **Voyage AI**: Embedding cost projection
  - voyage-3: pricing per Voyage AI docs (verify via WebSearch)
  - Estimated monthly volume: knowledge uploads + re-embeds
  - Projected: $0.50-$2.00/month for typical usage
- **Cloudflare**: Free tier — $0/month
- **GitHub Actions**: Self-hosted runner — $0/month
- **Domain**: ~$12/year ≈ $1/month

**4.2** NFR compliance check:
- NFR-COST1: Total ≤ $10/month — document compliance status
  - On Free tier: PASS ($0 + Voyage ≈ $1-2 = well under $10)
  - On Pro tier: CONDITIONAL PASS — Neon Pro $19/month alone exceeds NFR-COST1. Document as "NFR-COST1 met on Free tier; Pro tier requires NFR-COST1 threshold revision to $25/month or cost offset"
- NFR-COST2: Embedding ≤ $5/month — document compliance
- NFR-COST3: Daily cost alert threshold ($0.10/day)

### Task 5: Go/No-Go Summary Document

**File**: `_bmad-output/test-artifacts/pre-sprint-go-no-go.md`

**5.1** Checklist of all Phase 0 prerequisites:
- [ ] Go/No-Go #10: Voyage migration (Stories 22.1-22.3)
- [ ] AR6: Neon Pro upgrade status
- [ ] AR7: VPS resource budget verified
- [ ] NFR-COST1/COST2: Cost projections documented
- [ ] Docker readiness for n8n (Sprint 2)
- [ ] CI pipeline functional (Story 22.5)
- [ ] Security headers deployed (Story 22.4)
- [ ] Dependency versions pinned (Story 22.1)

---

## Dev Notes

- This story is primarily **verification and documentation**, not feature development
- Tests should use `os` module and shell commands for system checks
- Database tests require DATABASE_URL — skip gracefully if not available (CI environment)
- VPS checks are host-specific — tests must run on the actual server, not in Docker
- Cost estimates are projections based on architecture doc and vendor pricing
- Go/No-Go document is the final gate for Sprint 1 readiness

## Test Strategy

- **Unit tests**: Infrastructure verification assertions
- **Integration**: Database connection + pgvector extension check
- **Documentation**: Cost estimate + Go/No-Go summary as committed artifacts
- **Expected test count**: ~20-25 tests

## Dependencies

- Story 22.1 ✅ (dependency verification)
- Story 22.2 ✅ (Voyage AI SDK)
- Story 22.3 ✅ (vector migration)
- Story 22.4 ✅ (security headers)
- Story 22.5 ✅ (CI scanning)
