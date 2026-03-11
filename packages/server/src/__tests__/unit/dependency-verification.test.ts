import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('TEA P0: Story 1.1 — Phase 1 dependency verification', () => {
  const pkgJson = JSON.parse(
    readFileSync(join(import.meta.dir, '../../../package.json'), 'utf8')
  )

  describe('AC #1: SDK exact pin version', () => {
    test('claude-agent-sdk is pinned to exactly 0.2.72 (no caret)', () => {
      const sdkVersion = pkgJson.dependencies['@anthropic-ai/claude-agent-sdk']
      expect(sdkVersion).toBe('0.2.72')
      expect(sdkVersion).not.toStartWith('^')
      expect(sdkVersion).not.toStartWith('~')
    })
  })

  describe('AC #2: secret-scrubber installed and functional', () => {
    test('scrub() censors sensitive values', async () => {
      const { scrub } = await import('@zapier/secret-scrubber')
      const secret = 'my-secret-api-key-12345'
      const result = scrub(`token=${secret}`, [secret])
      expect(result).not.toContain(secret)
      expect(result).toContain(':censored:')
    })
  })

  describe('AC #3: hono-rate-limiter installed', () => {
    test('rateLimiter can be imported', async () => {
      const mod = await import('hono-rate-limiter')
      expect(mod.rateLimiter).toBeDefined()
      expect(typeof mod.rateLimiter).toBe('function')
    })
  })

  describe('AC #4: croner Bun native compatible', () => {
    test('Cron job can be created and stopped', async () => {
      const { Cron } = await import('croner')
      let called = false
      const job = new Cron('*/5 * * * * *', () => { called = true })
      expect(job).toBeDefined()
      job.stop()
      // Job was stopped before it could fire
      expect(called).toBe(false)
    })
  })

  describe('AC #5: pino Bun compatible with structured JSON', () => {
    test('pino creates logger with JSON output', async () => {
      const pino = (await import('pino')).default
      const log = pino({ level: 'info' })
      expect(log).toBeDefined()
      expect(typeof log.info).toBe('function')
      expect(typeof log.error).toBe('function')
      expect(typeof log.child).toBe('function')
    })

    test('pino child logger inherits context', async () => {
      const pino = (await import('pino')).default
      const log = pino({ level: 'silent' })
      const child = log.child({ sessionId: 'test-session-123', companyId: 'test-company' })
      expect(child).toBeDefined()
      expect(typeof child.info).toBe('function')
    })
  })
})

describe('TEA P1: Zod v4 backwards compatibility', () => {
  test('import { z } from zod works with v3 API', async () => {
    const { z } = await import('zod')
    // Core v3 API operations
    const schema = z.object({
      name: z.string(),
      age: z.number().min(0),
      email: z.string().email().optional(),
    })
    expect(schema).toBeDefined()

    const valid = schema.safeParse({ name: 'test', age: 25 })
    expect(valid.success).toBe(true)

    const invalid = schema.safeParse({ name: 123, age: -1 })
    expect(invalid.success).toBe(false)
  })

  test('z.enum works (used in drizzle schemas)', async () => {
    const { z } = await import('zod')
    const roleEnum = z.enum(['admin', 'user', 'guest'])
    expect(roleEnum.parse('admin')).toBe('admin')
    expect(() => roleEnum.parse('invalid')).toThrow()
  })
})

describe('TEA P1: lockfile tracking (V11)', () => {
  test('bun.lock exists and is not empty', () => {
    const lockPath = join(import.meta.dir, '../../../../../bun.lock')
    const content = readFileSync(lockPath, 'utf8')
    expect(content.length).toBeGreaterThan(1000)
  })
})
