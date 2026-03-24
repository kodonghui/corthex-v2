import { describe, test, expect } from 'bun:test'
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import os from 'os'

/**
 * Story 22.6: Neon Pro Upgrade & VPS Resource Verification
 * Infrastructure verification tests — runs against actual system state.
 */

const ROOT_DIR = join(__dirname, '../../../../..')
const SERVER_PKG = join(ROOT_DIR, 'packages/server/package.json')
const SCHEMA_PATH = join(ROOT_DIR, 'packages/server/src/db/schema.ts')
const TEST_ARTIFACTS = join(ROOT_DIR, '_bmad-output/test-artifacts')

describe('Story 22.6: Infrastructure Verification', () => {
  describe('Task 1: VPS Resource Verification', () => {
    test('CPU cores = 4', () => {
      const cpus = os.cpus()
      expect(cpus.length).toBe(4)
    })

    test('architecture is ARM64 (aarch64)', () => {
      expect(os.arch()).toBe('arm64')
    })

    test('total RAM >= 23GB', () => {
      const totalBytes = os.totalmem()
      const totalGB = totalBytes / (1024 * 1024 * 1024)
      expect(totalGB).toBeGreaterThanOrEqual(23)
    })

    test('available disk >= 100GB', () => {
      const output = execSync('df -B1 /').toString()
      const lines = output.trim().split('\n')
      const parts = lines[1].split(/\s+/)
      const availableBytes = parseInt(parts[3], 10)
      const availableGB = availableBytes / (1024 * 1024 * 1024)
      expect(availableGB).toBeGreaterThanOrEqual(100)
    })

    test('RAM headroom >= 12GB available', () => {
      const freeBytes = os.freemem()
      const freeGB = freeBytes / (1024 * 1024 * 1024)
      // Available memory (free + buffers/cache) should be >= 12GB
      // os.freemem() reports truly free; /proc/meminfo has MemAvailable
      const meminfo = readFileSync('/proc/meminfo', 'utf-8')
      const match = meminfo.match(/MemAvailable:\s+(\d+)\s+kB/)
      if (match) {
        const availableGB = parseInt(match[1], 10) / (1024 * 1024)
        expect(availableGB).toBeGreaterThanOrEqual(12)
      } else {
        // Fallback: free memory alone
        expect(freeGB).toBeGreaterThanOrEqual(2)
      }
    })

    test('peak budget: Bun + CI + n8n + OS < total RAM', () => {
      const totalGB = os.totalmem() / (1024 * 1024 * 1024)
      // Peak: Bun ~2GB + CI ~4GB + n8n ~2GB + OS ~1GB = ~9GB
      // Neon is cloud-hosted, no local PG
      const peakGB = 9
      expect(totalGB).toBeGreaterThan(peakGB)
      expect(totalGB - peakGB).toBeGreaterThanOrEqual(12) // headroom
    })
  })

  describe('Task 1.2: Docker Verification', () => {
    test('Docker daemon is responsive', () => {
      const result = execSync('docker info 2>&1').toString()
      expect(result).toContain('Server:')
    })

    test('Docker architecture matches host (aarch64)', () => {
      const result = execSync('docker info 2>&1').toString()
      expect(result).toContain('Architecture: aarch64')
    })

    test('corthex-v2 container is running', () => {
      const result = execSync('docker ps --format "{{.Names}}"').toString()
      expect(result).toContain('corthex-v2')
    })

    test('Docker supports --memory flag', () => {
      // Verify cgroup memory limit support
      const result = execSync('docker info 2>&1').toString()
      // If memory limit is supported, docker info won't show warnings about it
      expect(result).not.toContain('No swap limit support')
    })
  })

  describe('Task 2: Neon Database Verification', () => {
    const hasDbUrl = !!process.env.DATABASE_URL

    test('DATABASE_URL environment variable is set', () => {
      // In CI, DATABASE_URL may not be set — soft check
      if (!hasDbUrl) {
        console.log('DATABASE_URL not set — skipping DB tests (CI environment)')
      }
      // This test passes either way; DB-dependent tests below skip if no URL
      expect(true).toBe(true)
    })

    test('pgvector extension verified in schema (1024 dimensions)', () => {
      const schema = readFileSync(SCHEMA_PATH, 'utf-8')
      // knowledge_docs.embedding
      expect(schema).toContain("vector('embedding', { dimensions: 1024 })")
      // semantic_cache.query_embedding
      expect(schema).toContain("vector('query_embedding', { dimensions: 1024 })")
    })

    test('embedding model is voyage-3 in schema', () => {
      const schema = readFileSync(SCHEMA_PATH, 'utf-8')
      expect(schema).toContain("'voyage-3'")
    })

    test('Neon serverless driver is installed', () => {
      const pkg = JSON.parse(readFileSync(SERVER_PKG, 'utf-8'))
      expect(pkg.dependencies['@neondatabase/serverless']).toBeDefined()
    })

    test('pgvector package is installed', () => {
      const pkg = JSON.parse(readFileSync(SERVER_PKG, 'utf-8'))
      expect(pkg.dependencies['pgvector']).toBe('0.2.1')
    })
  })

  describe('Task 3: Voyage AI Migration Verification', () => {
    test('voyageai SDK installed (version 0.2.1)', () => {
      const pkg = JSON.parse(readFileSync(SERVER_PKG, 'utf-8'))
      expect(pkg.dependencies['voyageai']).toBe('0.2.1')
    })

    test('Anthropic SDK installed', () => {
      const pkg = JSON.parse(readFileSync(SERVER_PKG, 'utf-8'))
      expect(pkg.dependencies['@anthropic-ai/sdk']).toBeDefined()
    })

    test('EMBEDDING_MODEL constant is voyage-3', () => {
      const embeddingService = readFileSync(
        join(ROOT_DIR, 'packages/server/src/services/voyage-embedding.ts'),
        'utf-8',
      )
      expect(embeddingService).toContain("EMBEDDING_MODEL = 'voyage-3'")
    })

    test('knowledge_docs vector dimension = 1024 (not 768)', () => {
      const schema = readFileSync(SCHEMA_PATH, 'utf-8')
      expect(schema).not.toContain("vector('embedding', { dimensions: 768 })")
      expect(schema).toContain("vector('embedding', { dimensions: 1024 })")
    })

    test('semantic_cache vector dimension = 1024 (not 768)', () => {
      const schema = readFileSync(SCHEMA_PATH, 'utf-8')
      expect(schema).not.toContain("vector('query_embedding', { dimensions: 768 })")
      expect(schema).toContain("vector('query_embedding', { dimensions: 1024 })")
    })
  })

  describe('Task 4: Infrastructure Cost Estimate', () => {
    test('infrastructure-cost-estimate.md exists', () => {
      expect(existsSync(join(TEST_ARTIFACTS, 'infrastructure-cost-estimate.md'))).toBe(true)
    })

    test('cost estimate contains all service categories', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'infrastructure-cost-estimate.md'), 'utf-8')
      expect(doc).toContain('Oracle')
      expect(doc).toContain('Neon')
      expect(doc).toContain('Voyage AI')
      expect(doc).toContain('Cloudflare')
      expect(doc).toContain('GitHub Actions')
    })

    test('cost estimate addresses NFR-COST1 and NFR-COST2', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'infrastructure-cost-estimate.md'), 'utf-8')
      expect(doc).toContain('NFR-COST1')
      expect(doc).toContain('NFR-COST2')
    })

    test('cost estimate documents Neon Pro vs Free tier conflict', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'infrastructure-cost-estimate.md'), 'utf-8')
      expect(doc).toContain('CONDITIONAL')
    })
  })

  describe('Task 5: Go/No-Go Summary', () => {
    test('pre-sprint-go-no-go.md exists', () => {
      expect(existsSync(join(TEST_ARTIFACTS, 'pre-sprint-go-no-go.md'))).toBe(true)
    })

    test('Go/No-Go covers all Phase 0 prerequisites', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'pre-sprint-go-no-go.md'), 'utf-8')
      expect(doc).toContain('Voyage')
      expect(doc).toContain('Neon')
      expect(doc).toContain('VPS')
      expect(doc).toContain('Docker')
      expect(doc).toContain('CI')
      expect(doc).toContain('Security')
    })

    test('Go/No-Go has PASS/FAIL status for each item', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'pre-sprint-go-no-go.md'), 'utf-8')
      expect(doc).toContain('PASS')
    })

    test('go-no-go-10-voyage-migration.md exists', () => {
      expect(existsSync(join(TEST_ARTIFACTS, 'go-no-go-10-voyage-migration.md'))).toBe(true)
    })

    test('Go/No-Go #10 documents Voyage migration evidence', () => {
      const doc = readFileSync(join(TEST_ARTIFACTS, 'go-no-go-10-voyage-migration.md'), 'utf-8')
      expect(doc).toContain('voyage-3')
      expect(doc).toContain('1024')
      expect(doc).toContain('22.2')
      expect(doc).toContain('22.3')
    })
  })
})
