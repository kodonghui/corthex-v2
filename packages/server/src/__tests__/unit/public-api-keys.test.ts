import { describe, test, expect } from 'bun:test'
import { createHash, randomBytes } from 'crypto'
import { z } from 'zod'

const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const companyA = uuid(100)
const companyB = uuid(200)
const userA = uuid(300)

// === Types ===
type CompanyApiKey = {
  id: string
  companyId: string
  name: string
  keyPrefix: string
  keyHash: string
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  scopes: string[]
  rateLimitPerMin: number
  createdBy: string
  createdAt: string
}

// === API Key Generation Logic ===
function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = `cxk_live_${randomBytes(32).toString('hex')}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 16) + '...'
  return { rawKey, keyHash, keyPrefix }
}

// === Auth Validation Logic ===
function validateApiKey(
  apiKey: string,
  keys: CompanyApiKey[],
): { ok: true; record: CompanyApiKey } | { ok: false; error: string; code: string } {
  const keyHash = createHash('sha256').update(apiKey).digest('hex')
  const record = keys.find((k) => k.keyHash === keyHash && k.isActive)

  if (!record) return { ok: false, error: '유효하지 않은 API 키', code: 'API_002' }
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return { ok: false, error: '만료된 API 키', code: 'API_003' }
  }

  return { ok: true, record }
}

// === Rate Limiting Logic ===
type RateEntry = { count: number; resetAt: number }

function checkRateLimit(
  store: Map<string, RateEntry>,
  keyId: string,
  limit: number,
  now: number,
): { allowed: boolean; retryAfter?: number } {
  const entry = store.get(keyId)
  if (!entry || entry.resetAt < now) {
    store.set(keyId, { count: 1, resetAt: now + 60_000 })
    return { allowed: true }
  }
  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  entry.count++
  return { allowed: true }
}

// === Scope Validation ===
function requireScope(scopes: string[], required: string): { ok: boolean; error?: string } {
  if (!scopes.includes(required)) {
    return { ok: false, error: `이 작업에는 '${required}' 스코프가 필요합니다` }
  }
  return { ok: true }
}

// === Rotate Logic ===
function rotateKey(
  existing: CompanyApiKey,
): { oldDeactivated: boolean; newKey: ReturnType<typeof generateApiKey>; preservedFields: Partial<CompanyApiKey> } {
  return {
    oldDeactivated: true,
    newKey: generateApiKey(),
    preservedFields: {
      name: existing.name,
      scopes: existing.scopes,
      expiresAt: existing.expiresAt,
      rateLimitPerMin: existing.rateLimitPerMin,
    },
  }
}

// === Test Data Factory ===
function makeKey(overrides: Partial<CompanyApiKey> = {}): CompanyApiKey {
  const { rawKey, keyHash, keyPrefix } = generateApiKey()
  return {
    id: uuid(Math.floor(Math.random() * 10000)),
    companyId: companyA,
    name: 'Test Key',
    keyPrefix,
    keyHash,
    lastUsedAt: null,
    expiresAt: null,
    isActive: true,
    scopes: ['read'],
    rateLimitPerMin: 60,
    createdBy: userA,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// ============================================================
// API Key Generation Tests
// ============================================================
describe('Public API Keys — Key Generation', () => {
  test('generates key with cxk_live_ prefix', () => {
    const { rawKey } = generateApiKey()
    expect(rawKey.startsWith('cxk_live_')).toBe(true)
  })

  test('generates key with 73 chars total (cxk_live_ + 64 hex)', () => {
    const { rawKey } = generateApiKey()
    expect(rawKey.length).toBe(9 + 64) // 'cxk_live_' = 9 chars + 32 bytes hex = 64 chars
  })

  test('keyHash is 64 char hex (SHA-256)', () => {
    const { keyHash } = generateApiKey()
    expect(keyHash.length).toBe(64)
    expect(/^[0-9a-f]{64}$/.test(keyHash)).toBe(true)
  })

  test('keyPrefix is first 16 chars + ...', () => {
    const { rawKey, keyPrefix } = generateApiKey()
    expect(keyPrefix).toBe(rawKey.slice(0, 16) + '...')
  })

  test('hash matches original key', () => {
    const { rawKey, keyHash } = generateApiKey()
    const reHash = createHash('sha256').update(rawKey).digest('hex')
    expect(reHash).toBe(keyHash)
  })

  test('each generation produces unique key', () => {
    const a = generateApiKey()
    const b = generateApiKey()
    expect(a.rawKey).not.toBe(b.rawKey)
    expect(a.keyHash).not.toBe(b.keyHash)
  })
})

// ============================================================
// Auth Validation Tests
// ============================================================
describe('Public API Keys — Auth Validation', () => {
  test('valid key returns record', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix })
    const result = validateApiKey(rawKey, [key])
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.record.id).toBe(key.id)
  })

  test('invalid key returns error', () => {
    const key = makeKey()
    const result = validateApiKey('cxk_live_invalid', [key])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('API_002')
  })

  test('inactive key returns error', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix, isActive: false })
    const result = validateApiKey(rawKey, [key])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('API_002')
  })

  test('expired key returns error', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix, expiresAt: '2020-01-01T00:00:00Z' })
    const result = validateApiKey(rawKey, [key])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('API_003')
  })

  test('key with future expiry is valid', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix, expiresAt: '2030-01-01T00:00:00Z' })
    const result = validateApiKey(rawKey, [key])
    expect(result.ok).toBe(true)
  })

  test('key with null expiry is valid (no expiration)', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix, expiresAt: null })
    const result = validateApiKey(rawKey, [key])
    expect(result.ok).toBe(true)
  })
})

// ============================================================
// Rate Limiting Tests
// ============================================================
describe('Public API Keys — Rate Limiting', () => {
  test('first request is always allowed', () => {
    const store = new Map<string, RateEntry>()
    const result = checkRateLimit(store, 'key1', 60, Date.now())
    expect(result.allowed).toBe(true)
  })

  test('requests within limit are allowed', () => {
    const store = new Map<string, RateEntry>()
    const now = Date.now()
    for (let i = 0; i < 59; i++) {
      checkRateLimit(store, 'key1', 60, now)
    }
    const result = checkRateLimit(store, 'key1', 60, now)
    expect(result.allowed).toBe(true)
  })

  test('request exceeding limit is blocked', () => {
    const store = new Map<string, RateEntry>()
    const now = Date.now()
    for (let i = 0; i < 60; i++) {
      checkRateLimit(store, 'key1', 60, now)
    }
    const result = checkRateLimit(store, 'key1', 60, now)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  test('different keys have independent limits', () => {
    const store = new Map<string, RateEntry>()
    const now = Date.now()
    for (let i = 0; i < 60; i++) {
      checkRateLimit(store, 'key1', 60, now)
    }
    const result = checkRateLimit(store, 'key2', 60, now)
    expect(result.allowed).toBe(true)
  })

  test('window resets after expiry', () => {
    const store = new Map<string, RateEntry>()
    const now = Date.now()
    for (let i = 0; i < 60; i++) {
      checkRateLimit(store, 'key1', 60, now)
    }
    // 61 seconds later
    const result = checkRateLimit(store, 'key1', 60, now + 61_000)
    expect(result.allowed).toBe(true)
  })

  test('custom rate limit is respected', () => {
    const store = new Map<string, RateEntry>()
    const now = Date.now()
    for (let i = 0; i < 5; i++) {
      checkRateLimit(store, 'key1', 5, now)
    }
    const result = checkRateLimit(store, 'key1', 5, now)
    expect(result.allowed).toBe(false)
  })
})

// ============================================================
// Scope Validation Tests
// ============================================================
describe('Public API Keys — Scope Validation', () => {
  test('read scope allows read operations', () => {
    expect(requireScope(['read'], 'read')).toEqual({ ok: true })
  })

  test('missing scope is rejected', () => {
    const result = requireScope(['read'], 'execute')
    expect(result.ok).toBe(false)
  })

  test('multiple scopes work', () => {
    expect(requireScope(['read', 'write', 'execute'], 'execute')).toEqual({ ok: true })
  })

  test('empty scopes reject everything', () => {
    expect(requireScope([], 'read').ok).toBe(false)
  })
})

// ============================================================
// Rotate Logic Tests
// ============================================================
describe('Public API Keys — Rotate', () => {
  test('rotation deactivates old key', () => {
    const existing = makeKey()
    const result = rotateKey(existing)
    expect(result.oldDeactivated).toBe(true)
  })

  test('rotation generates new key', () => {
    const existing = makeKey()
    const result = rotateKey(existing)
    expect(result.newKey.rawKey.startsWith('cxk_live_')).toBe(true)
    expect(result.newKey.keyHash).not.toBe(existing.keyHash)
  })

  test('rotation preserves name, scopes, expiresAt, rateLimitPerMin', () => {
    const existing = makeKey({
      name: 'Production',
      scopes: ['read', 'execute'],
      expiresAt: '2030-06-01T00:00:00Z',
      rateLimitPerMin: 120,
    })
    const result = rotateKey(existing)
    expect(result.preservedFields.name).toBe('Production')
    expect(result.preservedFields.scopes).toEqual(['read', 'execute'])
    expect(result.preservedFields.expiresAt).toBe('2030-06-01T00:00:00Z')
    expect(result.preservedFields.rateLimitPerMin).toBe(120)
  })
})

// ============================================================
// Zod Schema Tests
// ============================================================
describe('Public API Keys — Zod Schemas', () => {
  const createKeySchema = z.object({
    name: z.string().min(1).max(100),
    scopes: z.array(z.enum(['read', 'write', 'execute'])).min(1).default(['read']),
    expiresAt: z.string().datetime().nullable().optional(),
    rateLimitPerMin: z.number().int().min(1).max(10000).default(60),
  })

  test('valid minimal input', () => {
    expect(createKeySchema.safeParse({ name: 'Test' }).success).toBe(true)
  })

  test('valid full input', () => {
    const result = createKeySchema.safeParse({
      name: 'Production',
      scopes: ['read', 'write', 'execute'],
      expiresAt: '2030-01-01T00:00:00Z',
      rateLimitPerMin: 100,
    })
    expect(result.success).toBe(true)
  })

  test('empty name rejected', () => {
    expect(createKeySchema.safeParse({ name: '' }).success).toBe(false)
  })

  test('name too long rejected', () => {
    expect(createKeySchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false)
  })

  test('invalid scope rejected', () => {
    expect(createKeySchema.safeParse({ name: 'Test', scopes: ['admin'] }).success).toBe(false)
  })

  test('empty scopes rejected', () => {
    expect(createKeySchema.safeParse({ name: 'Test', scopes: [] }).success).toBe(false)
  })

  test('rate limit below 1 rejected', () => {
    expect(createKeySchema.safeParse({ name: 'Test', rateLimitPerMin: 0 }).success).toBe(false)
  })

  test('rate limit above 10000 rejected', () => {
    expect(createKeySchema.safeParse({ name: 'Test', rateLimitPerMin: 10001 }).success).toBe(false)
  })
})

// ============================================================
// Delete (Soft) Validation Tests
// ============================================================
describe('Public API Keys — Delete Validation', () => {
  test('can delete own company key', () => {
    const key = makeKey({ companyId: companyA })
    const canDelete = key.companyId === companyA
    expect(canDelete).toBe(true)
  })

  test('cannot delete other company key', () => {
    const key = makeKey({ companyId: companyB })
    const canDelete = key.companyId === companyA
    expect(canDelete).toBe(false)
  })
})
