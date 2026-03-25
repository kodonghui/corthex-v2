# Story 25.1 Phase B Review — Critic-C (John, Product + Delivery)

## AC Verification

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | AR33 pinned image `n8nio/n8n:2.12.3` | PASS | `docker-compose.n8n.yml:12` — exact match with architecture. Test verifies no `:latest` tag present. |
| AC-2 | Localhost only `127.0.0.1:5678` | PASS | Compose line 28: `"127.0.0.1:5678:5678"`. Test verifies no `0.0.0.0` port binding. |
| AC-3 | N8N-SEC-6 SQLite | PASS | Compose line 32: `DB_TYPE=sqlite`, line 33: SQLite path. Test verifies no `DB_POSTGRESDB` or `DATABASE_URL=postgres` present. |
| AC-4 | N8N-SEC-5 + NFR-SC9 resource limits | PASS | Compose lines 19-24: `memory: 2g`, `cpus: "2"`, line 39: `--max-old-space-size=1536`. All three architecture mandates met. Memory reservation at 512m is a nice touch. |
| AC-5 | N8N-SEC-7 credential encryption | PASS | Compose line 36: `${N8N_ENCRYPTION_KEY:?N8N_ENCRYPTION_KEY is required}`. Deploy.sh auto-generates via `openssl rand -hex 32`. |
| AC-6 | NFR-O9 healthcheck | PASS | Compose lines 71-76: `/healthz`, interval 30s, retries 3, start_period 30s, timeout 10s. |
| AC-7 | AR36 host.docker.internal | PASS | Compose line 80: `host.docker.internal:host-gateway`, line 42: `WEBHOOK_URL=http://host.docker.internal:${CORTHEX_PORT:-3000}/api/n8n/webhook`. |
| AC-8 | FR-N8N5 isolation | PASS | Compose line 14: `restart: unless-stopped`, line 84: `no-new-privileges:true`, separate compose file from main Dockerfile (test line 225-230 verifies). |

## Dimension Scores (Critic-C Weights)

| Dim | Dimension | Score | Weight | Notes |
|-----|-----------|-------|--------|-------|
| D1 | Specificity | 9 | 20% | All 8 ACs map to named architecture decisions (AR33, AR36, N8N-SEC-5~7, NFR-SC9, NFR-O9, FR-N8N5). Compose file has inline `# AR33:` references for traceability. Health service has typed `N8nHealthStatus` interface with `available`, `responseTimeMs`, `error`. |
| D2 | Completeness | 9 | 20% | 38 tests cover compose config (27), health service (6), infrastructure (5). Security hardening beyond ACs: telemetry off, community packages off, templates off, execution prune 7 days. Deploy script: up/down/restart/status/logs + auto-env + auto-key-gen. |
| D3 | Accuracy | 9 | 15% | All values match architecture exactly: `2.12.3`, `2g`, `2 CPUs`, `1536`, `127.0.0.1:5678`, `sqlite`, `host-gateway`. WEBHOOK_URL correctly uses `${CORTHEX_PORT:-3000}` for port flexibility. n8n-health.ts `AbortController` + 5s timeout matches FR-N8N5 "never crash CORTHEX" requirement. |
| D4 | Implementability | 9 | 15% | Ready to deploy: `./infrastructure/n8n/deploy.sh up` handles preflight checks, env generation, key generation, container startup, and health wait. Health service is 59 lines, zero dependencies beyond `fetch`. Compose file works standalone (`docker compose -f docker-compose.n8n.yml up -d`). |
| D5 | Consistency | 9 | 10% | Follows CORTHEX patterns: service in `services/`, exported async functions, typed interface. Named volume `n8n_data` for persistence. Timezone defaults to `Asia/Seoul` (matches project locale). `.env.example` + `.env` pattern consistent with standard practice. |
| D6 | Risk Awareness | 8 | 20% | FR-N8N5 isolation well-handled (separate container + restart + resource caps). Architecture flags `host.docker.internal` Linux 미작동 as known risk — compose uses `host-gateway` mapping which works on modern Docker, but no runtime fallback to `172.17.0.1` if resolution fails. Deploy.sh health wait loop (50s max) may timeout before Docker healthcheck reports healthy (start_period 30s + 3×30s = potential 120s). |

## Weighted Score

(9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (8×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.60 = **8.80 / 10**

## Issues

| # | Severity | Description |
|---|----------|-------------|
| 1 | LOW | **Deploy.sh health wait timing mismatch**: `cmd_up` waits max 50s (`sleep 5` × 10 attempts) for healthy status. But Docker healthcheck is `start_period: 30s` + `interval: 30s` × `retries: 3` = up to 120s before healthy. The deploy script may always report "not yet passing" warning on first deployment. Mitigation: increase `max_attempts` to 20 or sleep interval to 10s. |
| 2 | LOW | **host.docker.internal fallback**: Architecture document flags "`host.docker.internal` Linux 미작동 → `172.17.0.1` 또는 `host-gateway` 사용" as known risk. Compose uses `host-gateway` extra_hosts (correct for modern Docker), but if resolution fails at runtime there's no fallback. Consider documenting `172.17.0.1` as manual override in `.env.example` or adding `WEBHOOK_HOST` as configurable var. |
| 3 | NITS | **Compose `EXECUTIONS_DATA_MAX_AGE=168` units**: Comment says "7 days" but `168` is hours (168h = 7d). n8n docs confirm this is hours, so technically correct, but the implicit unit could confuse operators. A `# 168 hours = 7 days` comment would help. |

## Product Assessment

Excellent first story for Epic 25. The Docker compose file is production-quality: pinned version, localhost binding, SQLite isolation, credential encryption, resource limits, healthcheck, security hardening — all 8 ACs verified against named architecture decisions.

The three deliverables (compose file, health service, deploy script) form a clean deployment package. The health service is appropriately minimal (59 lines, no external dependencies, never throws). The deploy script handles the full lifecycle including first-time setup with auto-generated encryption keys.

The N8N-SEC 8-layer architecture defines 8 security layers for the full n8n integration — this story correctly implements layers 5-7 (resource limits, SQLite isolation, credential encryption) which belong to the Docker deployment scope. Layers 1-4 and 8 (auth, rate limiting, multi-tenancy, path traversal, execution throttling) will come in subsequent stories 25.2-25.6.

38 tests is solid for a deployment story. Good attention to negative cases (no `:latest`, no PostgreSQL, no `0.0.0.0`, no `.env` committed, no n8n in main Dockerfile).

## Cross-Talk Notes

- **Winston/Amelia (Critic-A, Architecture)**: Compose file correctly implements AR33 (pinned version) and AR36 (host-gateway). The architecture mentions "Hono `proxy()` reverse proxy `/admin/n8n/*`" as part of FR-N8N — this is not in 25.1 (Docker only) and should be verified in story 25.2 or 25.3.
- **Quinn/Dana (Critic-B, QA/Security)**: `no-new-privileges:true` is good. Note that the compose file doesn't set `read_only: true` for the root filesystem — commented as "where possible" but not enabled. Likely because n8n writes to `/home/node/.n8n/` which is volume-mounted, but the rest of the filesystem is writable. Consider adding `read_only: true` + explicit tmpfs mounts in a hardening pass.

---

**Verdict: PASS (8.80/10)**

Epic 25 Critic-C: 25.1=8.80 (1/6 stories reviewed)
