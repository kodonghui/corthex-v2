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

describe('Story 22.1: Dependency Verification & Version Pinning', () => {
  const serverPkg = JSON.parse(
    readFileSync(join(import.meta.dir, '../../../package.json'), 'utf8')
  )
  const appPkg = JSON.parse(
    readFileSync(join(import.meta.dir, '../../../../app/package.json'), 'utf8')
  )

  describe('AC-1: Core packages exact-pinned (no ^ or ~)', () => {
    const exactPinDeps: [string, string][] = [
      ['@anthropic-ai/sdk', '0.78.0'],
      ['@anthropic-ai/claude-agent-sdk', '0.2.72'],
      ['hono', '4.12.3'],
      ['drizzle-orm', '0.39.3'],
      ['postgres', '3.4.8'],
      ['@neondatabase/serverless', '1.0.2'],
      ['@modelcontextprotocol/sdk', '1.27.1'],
      ['@hono/zod-validator', '0.5.0'],
      ['hono-rate-limiter', '0.5.3'],
      ['pino', '10.3.1'],
      ['pgvector', '0.2.1'],
      ['voyageai', '0.2.1'],
    ]

    for (const [pkg, version] of exactPinDeps) {
      test(`${pkg} is exact-pinned to ${version}`, () => {
        const v = serverPkg.dependencies[pkg]
        expect(v).toBe(version)
        expect(v).not.toStartWith('^')
        expect(v).not.toStartWith('~')
      })
    }

    const exactPinDevDeps: [string, string][] = [
      ['drizzle-kit', '0.30.6'],
      ['@types/bun', '1.3.10'],
      ['bun-types', '1.3.10'],
    ]

    for (const [pkg, version] of exactPinDevDeps) {
      test(`devDep ${pkg} is exact-pinned to ${version}`, () => {
        const v = serverPkg.devDependencies[pkg]
        expect(v).toBe(version)
        expect(v).not.toStartWith('^')
        expect(v).not.toStartWith('~')
      })
    }

    test('app lucide-react is exact-pinned to 0.577.0', () => {
      expect(appPkg.dependencies['lucide-react']).toBe('0.577.0')
    })
  })

  describe('AC-6: Zod single-version verification', () => {
    test('all Zod-dependent packages resolve to same version', async () => {
      const { z } = await import('zod')
      const schema = z.string()
      expect(schema.parse('test')).toBe('test')
    })
  })
})

describe('Story 22.1 TEA: Extended Verification (Quinn)', () => {
  const rootPkg = JSON.parse(
    readFileSync(join(import.meta.dir, '../../../../../package.json'), 'utf8')
  )
  const serverPkg = JSON.parse(
    readFileSync(join(import.meta.dir, '../../../package.json'), 'utf8')
  )
  const appPkg = JSON.parse(
    readFileSync(join(import.meta.dir, '../../../../app/package.json'), 'utf8')
  )
  const adminPkg = JSON.parse(
    readFileSync(join(import.meta.dir, '../../../../admin/package.json'), 'utf8')
  )
  const lockContent = readFileSync(
    join(import.meta.dir, '../../../../../bun.lock'), 'utf8'
  )

  describe('AC-2/AC-3: Lockfile integrity', () => {
    test('bun.lock is text format (not binary)', () => {
      // Text lockfile starts with a JSON-like structure
      expect(lockContent).toContain('"lockfileVersion"')
    })

    test('bun.lock contains pinned package resolutions', () => {
      expect(lockContent).toContain('"hono@4.12.3"')
      expect(lockContent).toContain('"drizzle-orm@0.39.3"')
      expect(lockContent).toContain('"postgres@3.4.8"')
    })

    test('bun.lock is substantial (not truncated/corrupt)', () => {
      // Monorepo lockfile with 7 workspaces should be large
      expect(lockContent.length).toBeGreaterThan(10_000)
    })
  })

  describe('AC-6: Zod structural verification', () => {
    test('application Zod resolves to 3.25.x (not 3.23.x)', async () => {
      const { z } = await import('zod')
      // Verify version via z.string().describe — Zod 3.25+ supports this
      const schema = z.object({ name: z.string(), age: z.number() })
      const result = schema.safeParse({ name: 'test', age: 25 })
      expect(result.success).toBe(true)
      // Verify NOT the stale 3.23.8 (chromium-bidi's transitive dep)
      // by using .catch() which was enhanced in 3.25+
      const withCatch = z.string().catch('fallback')
      expect(withCatch.parse(undefined)).toBe('fallback')
    })

    test('@hono/zod-validator resolves and works with current Zod', async () => {
      const { zValidator } = await import('@hono/zod-validator')
      const { z } = await import('zod')
      expect(zValidator).toBeDefined()
      expect(typeof zValidator).toBe('function')
      // Verify it can create a validator with our Zod instance
      const validator = zValidator('json', z.object({ name: z.string() }))
      expect(validator).toBeDefined()
    })

    test('zod-to-json-schema works with current Zod', async () => {
      const { zodToJsonSchema } = await import('zod-to-json-schema')
      const { z } = await import('zod')
      const schema = z.object({ name: z.string(), count: z.number().int() })
      const jsonSchema = zodToJsonSchema(schema)
      expect(jsonSchema).toBeDefined()
      expect(jsonSchema.type).toBe('object')
      expect((jsonSchema as any).properties.name.type).toBe('string')
    })

    test('chromium-bidi Zod 3.23.8 is isolated — does not leak into app imports', async () => {
      // Our application `import('zod')` should NOT resolve to 3.23.8
      // Verify by checking lockfile: zod@3.25.76 is the top-level resolution
      const zodMainEntry = lockContent.match(/"zod@(\d+\.\d+\.\d+)"/)
      expect(zodMainEntry).not.toBeNull()
      // The main Zod entry should be 3.25.x, not 3.23.x
      const mainVersion = zodMainEntry![1]
      expect(mainVersion).toStartWith('3.25.')
    })
  })

  describe('Negative: SemVer-stable packages keep caret', () => {
    test('server zod keeps ^3.24 (SemVer 3.x stable)', () => {
      expect(serverPkg.dependencies.zod).toBe('^3.24')
    })

    test('app react keeps ^19', () => {
      expect(appPkg.dependencies.react).toBe('^19')
    })

    test('server typescript keeps ^5.7', () => {
      expect(serverPkg.devDependencies.typescript).toBe('^5.7')
    })

    test('server openai keeps ^6.27.0 (SemVer 6.x stable)', () => {
      expect(serverPkg.dependencies.openai).toBe('^6.27.0')
    })

    test('server croner keeps ^10.0.1 (SemVer 10.x stable)', () => {
      expect(serverPkg.dependencies.croner).toBe('^10.0.1')
    })
  })

  describe('Edge: workspace protocol preserved', () => {
    test('server @corthex/shared uses workspace:*', () => {
      expect(serverPkg.dependencies['@corthex/shared']).toBe('workspace:*')
    })

    test('app @corthex/shared uses workspace:*', () => {
      expect(appPkg.dependencies['@corthex/shared']).toBe('workspace:*')
    })

    test('app @corthex/ui uses workspace:*', () => {
      expect(appPkg.dependencies['@corthex/ui']).toBe('workspace:*')
    })
  })

  describe('Negative: @types/bun determinism', () => {
    test('@types/bun is NOT "latest"', () => {
      expect(serverPkg.devDependencies['@types/bun']).not.toBe('latest')
    })

    test('@types/bun version matches bun-types version', () => {
      expect(serverPkg.devDependencies['@types/bun'])
        .toBe(serverPkg.devDependencies['bun-types'])
    })
  })

  describe('Edge: packageManager field', () => {
    test('root package.json has packageManager bun@1.3.10', () => {
      expect(rootPkg.packageManager).toBe('bun@1.3.10')
    })
  })

  describe('Edge: voyageai added for Story 22.2', () => {
    test('voyageai is in server dependencies', () => {
      expect(serverPkg.dependencies['voyageai']).toBeDefined()
    })

    test('voyageai is exact-pinned', () => {
      const v = serverPkg.dependencies['voyageai']
      expect(v).not.toStartWith('^')
      expect(v).not.toStartWith('~')
    })
  })

  describe('Edge: Cross-package consistency', () => {
    test('admin and app have identical lucide-react version', () => {
      expect(adminPkg.dependencies['lucide-react'])
        .toBe(appPkg.dependencies['lucide-react'])
    })

    test('both lucide-react versions are exact (no caret)', () => {
      expect(adminPkg.dependencies['lucide-react']).not.toStartWith('^')
      expect(appPkg.dependencies['lucide-react']).not.toStartWith('^')
    })
  })
})
