import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 25.1: n8n Docker Container Deployment — Verification Tests
 *
 * Validates docker-compose.n8n.yml meets all architecture requirements:
 * AR33, AR36, N8N-SEC-5~7, NFR-SC9, NFR-O9, FR-N8N5
 *
 * Uses string-based verification (no yaml parser dependency needed).
 */

const COMPOSE_PATH = 'docker-compose.n8n.yml'
const composeSrc = fs.readFileSync(COMPOSE_PATH, 'utf-8')

describe('Story 25.1: n8n Docker Container Deployment', () => {
  // === AR33: Pinned version ===
  describe('AR33: Image version pinning', () => {
    test('image is n8nio/n8n:2.12.3 (not :latest)', () => {
      expect(composeSrc).toContain('n8nio/n8n:2.12.3')
    })

    test('no :latest tag anywhere in compose', () => {
      expect(composeSrc).not.toContain(':latest')
    })
  })

  // === N8N-SEC-5 + NFR-SC9: Resource limits ===
  describe('N8N-SEC-5 + NFR-SC9: Resource limits', () => {
    test('memory limit is 2g', () => {
      expect(composeSrc).toMatch(/memory:\s*2g/)
    })

    test('CPU limit is 2', () => {
      expect(composeSrc).toMatch(/cpus:\s*["']?2["']?/)
    })

    test('NODE_OPTIONS max-old-space-size=1536', () => {
      expect(composeSrc).toContain('--max-old-space-size=1536')
    })
  })

  // === Localhost binding ===
  describe('Localhost only binding', () => {
    test('port bound to 127.0.0.1:5678', () => {
      expect(composeSrc).toContain('127.0.0.1:5678')
    })

    test('no 0.0.0.0 binding', () => {
      // Should not have 0.0.0.0 in ports section
      expect(composeSrc).not.toMatch(/ports:[\s\S]*?0\.0\.0\.0:\d+:\d+/)
    })
  })

  // === N8N-SEC-6: SQLite database ===
  describe('N8N-SEC-6: SQLite database (not PostgreSQL)', () => {
    test('DB_TYPE is sqlite', () => {
      expect(composeSrc).toContain('DB_TYPE=sqlite')
    })

    test('SQLite database path configured', () => {
      expect(composeSrc).toContain('DB_SQLITE_DATABASE=')
    })

    test('no PostgreSQL configuration', () => {
      expect(composeSrc).not.toContain('DB_POSTGRESDB')
      expect(composeSrc).not.toContain('DATABASE_URL=postgres')
    })
  })

  // === N8N-SEC-7: Credential encryption ===
  describe('N8N-SEC-7: AES-256-GCM credential encryption', () => {
    test('N8N_ENCRYPTION_KEY is required', () => {
      expect(composeSrc).toContain('N8N_ENCRYPTION_KEY')
    })

    test('encryption key uses required syntax (:?)', () => {
      // ${VAR:?message} = required, fail if unset
      expect(composeSrc).toMatch(/N8N_ENCRYPTION_KEY.*:?\?/)
    })
  })

  // === NFR-O9: Healthcheck ===
  describe('NFR-O9: Healthcheck configuration', () => {
    test('healthcheck hits /healthz', () => {
      expect(composeSrc).toMatch(/healthcheck:[\s\S]*?\/healthz/)
    })

    test('interval is 30s', () => {
      expect(composeSrc).toMatch(/interval:\s*30s/)
    })

    test('retries is 3', () => {
      expect(composeSrc).toMatch(/retries:\s*3/)
    })

    test('start_period allows initialization', () => {
      expect(composeSrc).toMatch(/start_period:\s*\d+s/)
    })
  })

  // === AR36: host.docker.internal ===
  describe('AR36: host.docker.internal for callbacks', () => {
    test('extra_hosts includes host.docker.internal:host-gateway', () => {
      expect(composeSrc).toContain('host.docker.internal:host-gateway')
    })

    test('WEBHOOK_URL uses host.docker.internal', () => {
      expect(composeSrc).toMatch(/WEBHOOK_URL=.*host\.docker\.internal/)
    })
  })

  // === FR-N8N5: Isolation ===
  describe('FR-N8N5: n8n failure isolation', () => {
    test('restart policy is unless-stopped', () => {
      expect(composeSrc).toContain('restart: unless-stopped')
    })

    test('container name is corthex-n8n', () => {
      expect(composeSrc).toContain('container_name: corthex-n8n')
    })

    test('no-new-privileges security opt', () => {
      expect(composeSrc).toContain('no-new-privileges:true')
    })

    test('read-only root filesystem', () => {
      expect(composeSrc).toContain('read_only: true')
    })

    test('tmpfs mounts for writable paths', () => {
      expect(composeSrc).toMatch(/tmpfs:[\s\S]*?\/tmp/)
    })

    test('explicit network isolation (not default bridge)', () => {
      expect(composeSrc).toContain('n8n_internal')
      expect(composeSrc).toMatch(/networks:\s*\n\s*n8n_internal:/)
    })

    test('data persisted in named volume', () => {
      expect(composeSrc).toContain('n8n_data:')
      expect(composeSrc).toMatch(/volumes:\s*\n\s*n8n_data:/)
    })
  })

  // === Security hardening ===
  describe('Security hardening', () => {
    test('telemetry disabled', () => {
      expect(composeSrc).toContain('N8N_DIAGNOSTICS_ENABLED=false')
    })

    test('version notifications disabled', () => {
      expect(composeSrc).toContain('N8N_VERSION_NOTIFICATIONS_ENABLED=false')
    })

    test('community packages disabled', () => {
      expect(composeSrc).toContain('N8N_COMMUNITY_PACKAGES_ENABLED=false')
    })

    test('templates disabled', () => {
      expect(composeSrc).toContain('N8N_TEMPLATES_ENABLED=false')
    })

    test('execution data prunes', () => {
      expect(composeSrc).toContain('EXECUTIONS_DATA_PRUNE=true')
      expect(composeSrc).toContain('EXECUTIONS_DATA_MAX_AGE=')
    })
  })
})

// === n8n-health.ts service ===

describe('Story 25.1: n8n Health Check Service', () => {
  test('n8n-health.ts exists', () => {
    expect(fs.existsSync('packages/server/src/services/n8n-health.ts')).toBe(true)
  })

  test('exports checkN8nHealth and isN8nAvailable', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-health.ts', 'utf-8')
    expect(src).toMatch(/export\s+async\s+function\s+checkN8nHealth/)
    expect(src).toMatch(/export\s+async\s+function\s+isN8nAvailable/)
  })

  test('uses /healthz endpoint', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-health.ts', 'utf-8')
    expect(src).toContain('/healthz')
  })

  test('has timeout protection (FR-N8N5)', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-health.ts', 'utf-8')
    expect(src).toContain('AbortController')
    expect(src).toContain('HEALTH_TIMEOUT_MS')
  })

  test('never throws — returns error in status object', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-health.ts', 'utf-8')
    expect(src).toContain('catch')
    expect(src).toContain('available: false')
  })

  test('N8nHealthStatus interface defined', () => {
    const src = fs.readFileSync('packages/server/src/services/n8n-health.ts', 'utf-8')
    expect(src).toContain('N8nHealthStatus')
    expect(src).toContain('available: boolean')
    expect(src).toContain('responseTimeMs')
  })
})

// === Infrastructure files ===

describe('Story 25.1: Infrastructure files', () => {
  test('deploy.sh exists and is executable', () => {
    const deployPath = 'infrastructure/n8n/deploy.sh'
    expect(fs.existsSync(deployPath)).toBe(true)
    const stat = fs.statSync(deployPath)
    expect(stat.mode & 0o111).toBeGreaterThan(0)
  })

  test('deploy.sh supports up/down/restart/status/logs commands', () => {
    const script = fs.readFileSync('infrastructure/n8n/deploy.sh', 'utf-8')
    expect(script).toContain('cmd_up')
    expect(script).toContain('cmd_down')
    expect(script).toContain('cmd_restart')
    expect(script).toContain('cmd_status')
    expect(script).toContain('cmd_logs')
  })

  test('.env.example exists with required vars', () => {
    const envExample = fs.readFileSync('infrastructure/n8n/.env.example', 'utf-8')
    expect(envExample).toContain('N8N_ENCRYPTION_KEY')
    expect(envExample).toContain('CORTHEX_PORT')
  })

  test('.env is not committed', () => {
    expect(fs.existsSync('infrastructure/n8n/.env')).toBe(false)
  })

  test('docker-compose.n8n.yml is separate from main Dockerfile', () => {
    expect(fs.existsSync('docker-compose.n8n.yml')).toBe(true)
    expect(fs.existsSync('Dockerfile')).toBe(true)
    const dockerfile = fs.readFileSync('Dockerfile', 'utf-8')
    expect(dockerfile).not.toContain('n8n')
  })
})
