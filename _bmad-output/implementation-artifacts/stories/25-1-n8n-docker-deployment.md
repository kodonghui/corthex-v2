# Story 25.1: n8n Docker Container Deployment

Status: implemented

## Story

As a platform operator,
I want n8n running as an isolated Docker container,
So that workflow automation is available without affecting the main application.

## Acceptance Criteria

1. **AC-1: AR33 pinned image**
   **Given** docker-compose.n8n.yml
   **When** image tag is specified
   **Then** `n8nio/n8n:2.12.3` (no floating tags)

2. **AC-2: Localhost only**
   **Given** port mapping
   **When** n8n binds
   **Then** 127.0.0.1:5678 only (no external exposure)

3. **AC-3: N8N-SEC-6 SQLite**
   **Given** DB configuration
   **When** n8n starts
   **Then** DB_TYPE=sqlite (not CORTHEX PostgreSQL)

4. **AC-4: N8N-SEC-5 + NFR-SC9 resource limits**
   **Given** deploy resources
   **When** container runs
   **Then** memory 2g, cpus 2, NODE_OPTIONS max-old-space-size=1536

5. **AC-5: N8N-SEC-7 credential encryption**
   **Given** environment
   **When** N8N_ENCRYPTION_KEY
   **Then** required (:? syntax), AES-256-GCM

6. **AC-6: NFR-O9 healthcheck**
   **Given** healthcheck config
   **When** /healthz polled
   **Then** interval 30s, retries 3, start_period 30s

7. **AC-7: AR36 host.docker.internal**
   **Given** extra_hosts + WEBHOOK_URL
   **When** n8n needs CORTHEX callback
   **Then** host.docker.internal:host-gateway

8. **AC-8: FR-N8N5 isolation**
   **Given** n8n failure
   **When** container crashes
   **Then** restart unless-stopped, no impact on CORTHEX

## Dev Notes

### Docker Compose: `docker-compose.n8n.yml`
- Image: `n8nio/n8n:2.12.3` (ARM64 verified)
- Port: `127.0.0.1:5678:5678`
- DB: SQLite at `/home/node/.n8n/database.sqlite`
- Resource limits: memory 2g, cpus 2, max-old-space-size=1536
- Encryption: N8N_ENCRYPTION_KEY required via `${:?}` syntax
- Healthcheck: wget /healthz every 30s, 3 retries, 30s start_period
- Callbacks: host.docker.internal:host-gateway + WEBHOOK_URL
- Security: no-new-privileges, telemetry off, community packages off, templates off
- Execution prune: 7 days

### Health Check Service: `services/n8n-health.ts`
- `checkN8nHealth()`: fetch /healthz with 5s timeout, returns N8nHealthStatus
- `isN8nAvailable()`: boolean shorthand
- Never throws (FR-N8N5) — returns `{ available: false, error }` on failure

### Deploy Script: `infrastructure/n8n/deploy.sh`
- Commands: up, down, restart, status, logs
- Auto-generates .env from .env.example if missing
- Auto-generates N8N_ENCRYPTION_KEY if empty

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- docker-compose.n8n.yml with all 8 ACs
- n8n-health.ts fault-tolerant health service
- deploy.sh with auto-env generation
- 38 verification tests, all passing

### File List
- `docker-compose.n8n.yml` — n8n Docker Compose (NEW)
- `infrastructure/n8n/.env.example` — environment template (NEW)
- `infrastructure/n8n/deploy.sh` — deployment script (NEW)
- `packages/server/src/services/n8n-health.ts` — health check service (NEW)
- `packages/server/src/__tests__/unit/n8n-docker-deployment.test.ts` — 38 tests (NEW)
