# Critic-B (QA + Security) Implementation Review — Story 25.1

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 Docker Compose sidecar | ✅ | `docker-compose.n8n.yml`: separate compose file, `n8nio/n8n:2.12.3` pinned, named volume for persistence. |
| AC-2 Resource limits (N8N-SEC-5, NFR-SC9) | ✅ | memory 2g, cpus 2, max-old-space-size=1536, memory reservation 512m. |
| AC-3 Localhost binding | ✅ | `127.0.0.1:5678:5678` — no external exposure on host. |
| AC-4 SQLite isolation (N8N-SEC-6) | ✅ | `DB_TYPE=sqlite`, no `DB_POSTGRESDB` or `DATABASE_URL=postgres` present. |
| AC-5 Credential encryption (N8N-SEC-7) | ✅ | `N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY:?}` fail-fast syntax. |
| AC-6 Healthcheck (NFR-O9) | ✅ | `/healthz` every 30s, 3 retries, 10s timeout, 30s start_period. |
| AC-7 Health service (FR-N8N5) | ✅ | `n8n-health.ts`: `checkN8nHealth()` with AbortController 5s timeout, never throws. |
| AC-8 Deploy script | ✅ | `deploy.sh`: 5 commands, preflight checks, auto-key generation, `set -euo pipefail`. |
| AC-9 Security hardening | ✅ | no-new-privileges, telemetry off, community packages off, templates off, execution pruning 7d. |

## Security Assessment

### Docker Container Security

| Item | Status | Evidence |
|------|--------|----------|
| Image version pinning (AR33) | ✅ STRONG | `n8nio/n8n:2.12.3` — no floating tags. |
| Host port binding | ✅ STRONG | `127.0.0.1:5678` — only localhost can reach n8n. |
| Resource limits | ✅ STRONG | Memory 2g + CPU 2 + Node.js 1536m heap cap. Container cannot DoS the host. |
| Database isolation (N8N-SEC-6) | ✅ STRONG | SQLite only. Zero access to CORTHEX PostgreSQL or Neon. |
| Encryption key (N8N-SEC-7) | ✅ STRONG | Required via `${:?}` — compose-up fails if unset. Auto-generated with `openssl rand -hex 32` in deploy.sh. |
| Privilege escalation | ✅ STRONG | `no-new-privileges:true` — container processes cannot gain additional privileges. |
| Telemetry/community | ✅ | All disabled. No data leakage to n8n cloud. |
| Execution data retention | ✅ | Prune after 168h (7 days). Prevents unbounded SQLite growth. |
| .env protection | ✅ | `.gitignore` has `.env` + `.env.*` with `!.env.example` exception. Test verifies `.env` not committed. |
| N8N_HOST=0.0.0.0 | ✅ SAFE | Internal container binding — required for Docker port mapping to work. Host-side restriction is `127.0.0.1` in ports section. |
| WEBHOOK_URL (AR36) | ✅ | `http://host.docker.internal:${CORTHEX_PORT:-3000}/api/n8n/webhook` — HTTP is acceptable for localhost-only traffic via host.docker.internal bridge. |

### Container Network Isolation

| Item | Status | Evidence |
|------|--------|----------|
| Docker network definition | ⚠️ MISSING | No `networks:` section in compose file. Container uses default bridge network. Any other container on the same bridge can access n8n:5678 directly, bypassing the host 127.0.0.1 restriction. |
| read_only filesystem | ⚠️ MISSING | No `read_only: true` on root filesystem. Container can write to any directory. Not critical since n8n needs /home/node/.n8n writable (mapped to volume), but `read_only: true` with explicit `tmpfs` mounts would reduce attack surface. |

### Health Service Security

| Item | Status | Evidence |
|------|--------|----------|
| AbortController timeout | ✅ | 5s timeout prevents hung connections blocking CORTHEX. |
| Never throws (FR-N8N5) | ✅ | catch block returns `{ available: false }` — CORTHEX cannot crash from n8n failure. |
| Error message exposure | ✅ SAFE | `err.message` in health status — internal only, not exposed to API clients. |
| Timer leak on fetch error | ⚠️ NOTE | If `fetch()` throws (connection refused), `clearTimeout(timeout)` is NOT called — timeout fires after 5s calling `controller.abort()` on an already-settled controller. Harmless (abort on settled is no-op) but timer runs unnecessarily for up to 5s per failure. |

### Deploy Script Security

| Item | Status | Evidence |
|------|--------|----------|
| Strict mode | ✅ | `set -euo pipefail` — fails on any error, unset var, or pipe failure. |
| Preflight validation | ✅ | Checks Docker, Compose, .env file, encryption key before starting. |
| Key generation | ✅ | `openssl rand -hex 32` — cryptographically random 256-bit key. Hex output safe for sed substitution. |
| .env sourcing | ⚠️ NOTE | `source "$ENV_FILE"` — if .env is compromised, arbitrary code execution during deploy. Acceptable risk for local operations script. |

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | Image version, resource values, port bindings, timeout values all specific. Security requirements traced to spec refs (N8N-SEC-5~7, NFR-SC9, NFR-O9, FR-N8N5, AR33, AR36). |
| D2 완전성 | 25% | 8/10 | 38 tests covering compose config, health service, and infrastructure files. Missing runtime health check test. No test for memory reservation (512m) or deploy.sh strict mode. |
| D3 정확성 | 15% | 9/10 | Docker Compose syntax correct. Health service AbortController pattern correct. Deploy script logic correct. All security claims verified against source. |
| D4 실행가능성 | 10% | 9/10 | 38/38 pass, 54 assertions. Static verification — no Docker or DB required for tests. Deploy script executable with proper mode bits. |
| D5 일관성 | 15% | 9/10 | Security refs (N8N-SEC-*) consistently traced. Korean timezone default (Asia/Seoul). Separate compose file pattern consistent with CORTHEX architecture. |
| D6 리스크 | 25% | 8/10 | Strong security posture: localhost binding, resource limits, encryption required, no-new-privileges, telemetry off. Two gaps: no Docker network isolation (default bridge), no read_only filesystem. Timer leak in health service is harmless. |

### 가중 평균: 0.10(9) + 0.25(8) + 0.15(9) + 0.10(9) + 0.15(9) + 0.25(8) = 8.50/10 ✅ PASS

---

## Issues (2 medium, 2 low)

### 1. **[D6] No Docker network isolation — default bridge allows inter-container access** (MEDIUM)

```yaml
# docker-compose.n8n.yml — no networks: section
services:
  n8n:
    ports:
      - "127.0.0.1:5678:5678"  # Host side: localhost only
    # BUT: n8n:5678 reachable by ANY container on default bridge network
```

The `127.0.0.1` restriction only applies to host-side port mapping. Other Docker containers on the same bridge network can access `corthex-n8n:5678` directly. If any other container is compromised, it can reach n8n without authentication.

**Recommendation**: Add explicit network with `internal: true` or use a dedicated network so only CORTHEX can reach n8n:

```yaml
networks:
  n8n-net:
    driver: bridge
```

### 2. **[D6] No read_only filesystem on container** (MEDIUM)

n8n only needs write access to `/home/node/.n8n` (mapped to named volume). The rest of the filesystem should be read-only to prevent a compromised n8n from writing to arbitrary paths.

```yaml
# Recommended:
read_only: true
tmpfs:
  - /tmp
  - /run
```

### 3. **[D6] Timer leak in checkN8nHealth() catch path** (LOW)

```typescript
// n8n-health.ts:26-31
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)
const res = await fetch(...)
clearTimeout(timeout)  // ← only called on success, not on error
```

If fetch throws (connection refused), the catch block doesn't call `clearTimeout(timeout)`. The timer runs for up to 5s, then calls `controller.abort()` on a settled controller (no-op). Harmless but unnecessary resource usage during repeated failures.

**Fix**: Move `clearTimeout` to a `finally` block.

### 4. **[D2] No runtime test for checkN8nHealth()** (LOW)

Health service is only verified via static source pattern matching. No test actually calls `checkN8nHealth()` with a mock server to verify:
- Returns `{ available: true }` on 200 OK
- Returns `{ available: false }` on connection refused
- Respects 5s timeout

This is acceptable for Story 25.1 (infrastructure focus) but should be added in a follow-up when n8n proxy routes are implemented.

---

## Observations (non-scoring)

### Deploy Script Auto-Key Generation

```bash
key=$(openssl rand -hex 32)
sed -i "s/^N8N_ENCRYPTION_KEY=$/N8N_ENCRYPTION_KEY=${key}/" "$ENV_FILE"
```

Excellent pattern — generates cryptographic key only when .env is first created. Warning message reminds user that losing the key means losing encrypted n8n credentials. `openssl rand -hex 32` output is always safe for sed (hex chars only).

### N8N_HOST=0.0.0.0 is Correct

Reviewed and confirmed: `N8N_HOST=0.0.0.0` is the INTERNAL container binding. Docker's port mapping requires the process to listen on all interfaces within the container's network namespace. The host-side restriction (`127.0.0.1:5678:5678`) is what controls external access. This is standard Docker practice.

### Execution Data Pruning

`EXECUTIONS_DATA_MAX_AGE=168` (7 days) with `EXECUTIONS_DATA_PRUNE=true` prevents SQLite database from growing unbounded. Good operational practice for a sidecar container.

---

## Verdict

**✅ PASS (8.50/10)**

Strong infrastructure story with comprehensive security hardening. Docker Compose config hits all N8N-SEC requirements: pinned version, localhost binding, resource limits, SQLite isolation, encryption key required, no-new-privileges. Health service properly fault-tolerant (FR-N8N5). Deploy script with proper preflight checks and auto-key generation. Two medium security items: no Docker network isolation (default bridge allows inter-container access) and no read_only filesystem. Both are defense-in-depth improvements for a follow-up — the localhost port restriction and n8n's own authentication layer provide adequate protection for current deployment.
