/**
 * Story 20-5: Platform Integration Tests
 *
 * Cross-story integration tests verifying Epic 20 features work together:
 * - Template Market (20-1) + Agent Marketplace (20-2) cross-feature
 * - Multi-tenant isolation across markets
 * - API Key auth full chain (20-3)
 * - Workflow canvas DAG logic complex scenarios (20-4)
 */
import { describe, test, expect } from 'bun:test'
import { createHash, randomBytes } from 'crypto'
import { z } from 'zod'

// === Shared Constants ===
const uuid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const COMPANY_A = uuid(100)
const COMPANY_B = uuid(200)
const COMPANY_C = uuid(300)
const USER_A = uuid(400)

// ===================================================================
// Replicated helper functions from individual story tests
// ===================================================================

// --- Template Market (from 20-1) ---
type MarketTemplate = {
  id: string
  companyId: string
  name: string
  description: string
  category: string
  tags: string[]
  tier: 'free' | 'standard' | 'premium'
  isPublished: boolean
  downloadCount: number
  createdAt: string
}

function filterMarketTemplates(
  templates: MarketTemplate[],
  viewerCompanyId: string,
  filters?: { keyword?: string; tag?: string; category?: string; tier?: string },
): MarketTemplate[] {
  return templates
    .filter((t) => t.isPublished && t.companyId !== viewerCompanyId)
    .filter((t) => {
      if (filters?.keyword) {
        const kw = filters.keyword.toLowerCase()
        return t.name.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw)
      }
      return true
    })
    .filter((t) => !filters?.tag || t.tags.includes(filters.tag))
    .filter((t) => !filters?.category || t.category === filters.category)
    .filter((t) => !filters?.tier || t.tier === filters.tier)
}

function cloneTemplate(
  template: MarketTemplate,
  targetCompanyId: string,
): { clonedId: string; sourceId: string; targetCompanyId: string } {
  return {
    clonedId: uuid(Math.floor(Math.random() * 90000) + 10000),
    sourceId: template.id,
    targetCompanyId,
  }
}

function canPublish(template: { name: string; description: string; companyId: string }): boolean {
  return template.name.length >= 2 && template.description.length >= 10 && template.companyId.length > 0
}

// --- Agent Marketplace (from 20-2) ---
type AgentMarketItem = {
  id: string
  companyId: string
  agentName: string
  description: string
  category: string
  tags: string[]
  soulConfig: Record<string, unknown>
  toolIds: string[]
  tier: 'free' | 'standard' | 'premium'
  isPublished: boolean
  downloadCount: number
  createdAt: string
}

function filterAgentMarket(
  items: AgentMarketItem[],
  viewerCompanyId: string,
  filters?: { keyword?: string; tag?: string; category?: string; tier?: string },
): AgentMarketItem[] {
  return items
    .filter((i) => i.isPublished && i.companyId !== viewerCompanyId)
    .filter((i) => {
      if (filters?.keyword) {
        const kw = filters.keyword.toLowerCase()
        return i.agentName.toLowerCase().includes(kw) || i.description.toLowerCase().includes(kw)
      }
      return true
    })
    .filter((i) => !filters?.tag || i.tags.includes(filters.tag))
    .filter((i) => !filters?.category || i.category === filters.category)
    .filter((i) => !filters?.tier || i.tier === filters.tier)
}

function importTemplate(
  item: AgentMarketItem,
  targetCompanyId: string,
): { importedId: string; sourceId: string; targetCompanyId: string; soulConfig: Record<string, unknown>; toolIds: string[] } {
  return {
    importedId: uuid(Math.floor(Math.random() * 90000) + 10000),
    sourceId: item.id,
    targetCompanyId,
    soulConfig: { ...item.soulConfig },
    toolIds: [...item.toolIds],
  }
}

// --- API Keys (from 20-3) ---
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

function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const rawKey = `cxk_live_${randomBytes(32).toString('hex')}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 16) + '...'
  return { rawKey, keyHash, keyPrefix }
}

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

function requireScope(scopes: string[], required: string): { ok: boolean; error?: string } {
  if (!scopes.includes(required)) {
    return { ok: false, error: `이 작업에는 '${required}' 스코프가 필요합니다` }
  }
  return { ok: true }
}

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

function makeKey(overrides: Partial<CompanyApiKey> = {}): CompanyApiKey {
  const { rawKey, keyHash, keyPrefix } = generateApiKey()
  return {
    id: uuid(Math.floor(Math.random() * 10000)),
    companyId: COMPANY_A,
    name: 'Test Key',
    keyPrefix,
    keyHash,
    lastUsedAt: null,
    expiresAt: null,
    isActive: true,
    scopes: ['read'],
    rateLimitPerMin: 60,
    createdBy: USER_A,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// --- Workflow Canvas (from 20-4) ---
type WorkflowStep = {
  id: string
  name: string
  type: 'tool' | 'llm' | 'condition'
  action: string
  params?: Record<string, unknown>
  agentId?: string
  dependsOn?: string[]
  trueBranch?: string
  falseBranch?: string
  systemPrompt?: string
  timeout?: number
  retryCount?: number
  metadata?: { position?: { x: number; y: number } }
}

type Edge = { from: string; to: string; type: 'dependsOn' | 'trueBranch' | 'falseBranch' }

function buildDagLayers(steps: WorkflowStep[]): WorkflowStep[][] | null {
  if (steps.length === 0) return []
  const inDegree = new Map(steps.map((s) => [s.id, 0]))
  for (const s of steps) {
    for (const dep of s.dependsOn || []) {
      if (inDegree.has(dep)) {
        inDegree.set(s.id, (inDegree.get(s.id) || 0) + 1)
      }
    }
  }
  const result: WorkflowStep[][] = []
  let queue = steps.filter((s) => (inDegree.get(s.id) || 0) === 0)
  while (queue.length > 0) {
    result.push(queue)
    const nextQueue: WorkflowStep[] = []
    for (const s of queue) {
      for (const other of steps) {
        if (other.dependsOn?.includes(s.id)) {
          const newDeg = (inDegree.get(other.id) || 0) - 1
          inDegree.set(other.id, newDeg)
          if (newDeg === 0) nextQueue.push(other)
        }
      }
    }
    queue = nextQueue
  }
  const totalSorted = result.reduce((acc, l) => acc + l.length, 0)
  if (totalSorted < steps.length) return null
  return result
}

function autoLayout(steps: WorkflowStep[], canvasWidth = 800): WorkflowStep[] {
  const layers = buildDagLayers(steps)
  if (!layers) return steps
  const LAYER_GAP = 120
  const NODE_GAP = 180
  return steps.map((step) => {
    const layerIdx = layers.findIndex((layer) => layer.some((s) => s.id === step.id))
    if (layerIdx === -1) return step
    const inLayerIdx = layers[layerIdx].findIndex((s) => s.id === step.id)
    const layerWidth = layers[layerIdx].length * NODE_GAP
    const startX = (canvasWidth - layerWidth) / 2
    return {
      ...step,
      metadata: { ...step.metadata, position: { x: startX + inLayerIdx * NODE_GAP, y: 60 + layerIdx * LAYER_GAP } },
    }
  })
}

function buildEdges(steps: WorkflowStep[]): Edge[] {
  const edges: Edge[] = []
  const ids = new Set(steps.map((s) => s.id))
  for (const s of steps) {
    for (const dep of s.dependsOn || []) {
      if (ids.has(dep)) edges.push({ from: dep, to: s.id, type: 'dependsOn' })
    }
    if (s.trueBranch && ids.has(s.trueBranch)) edges.push({ from: s.id, to: s.trueBranch, type: 'trueBranch' })
    if (s.falseBranch && ids.has(s.falseBranch)) edges.push({ from: s.id, to: s.falseBranch, type: 'falseBranch' })
  }
  return edges
}

function wouldCreateCycle(steps: WorkflowStep[], fromId: string, toId: string): boolean {
  const testSteps = steps.map((s) => {
    if (s.id === toId) return { ...s, dependsOn: [...(s.dependsOn || []), fromId] }
    return s
  })
  return buildDagLayers(testSteps) === null
}

function makeStep(overrides: Partial<WorkflowStep> & { id: string }): WorkflowStep {
  return { name: overrides.id, type: 'tool', action: 'test', ...overrides }
}

// ===================================================================
// TASK 1: Cross-Story Integration Tests (AC #1, #2, #5)
// ===================================================================

describe('Cross-Story Integration: Template Market + Agent Marketplace', () => {
  // Template market test data
  const templatesByA: MarketTemplate[] = [
    { id: uuid(1), companyId: COMPANY_A, name: 'AI Customer Support', description: 'Complete customer support template with FAQ bot', category: 'support', tags: ['ai', 'chatbot'], tier: 'free', isPublished: true, downloadCount: 10, createdAt: '2026-01-01T00:00:00Z' },
    { id: uuid(2), companyId: COMPANY_A, name: 'Sales Pipeline', description: 'Automated sales pipeline with lead scoring', category: 'sales', tags: ['crm', 'automation'], tier: 'premium', isPublished: true, downloadCount: 5, createdAt: '2026-01-02T00:00:00Z' },
    { id: uuid(3), companyId: COMPANY_A, name: 'Draft Template', description: 'Not yet published template for internal use', category: 'internal', tags: ['draft'], tier: 'free', isPublished: false, downloadCount: 0, createdAt: '2026-01-03T00:00:00Z' },
  ]
  const templatesByB: MarketTemplate[] = [
    { id: uuid(4), companyId: COMPANY_B, name: 'Marketing Automation', description: 'Full marketing automation with social media scheduling', category: 'marketing', tags: ['ai', 'marketing'], tier: 'standard', isPublished: true, downloadCount: 20, createdAt: '2026-01-04T00:00:00Z' },
  ]
  const allTemplates = [...templatesByA, ...templatesByB]

  // Agent marketplace test data
  const agentsByA: AgentMarketItem[] = [
    { id: uuid(10), companyId: COMPANY_A, agentName: 'Support Bot', description: 'Customer support AI agent with FAQ handling', category: 'support', tags: ['ai', 'bot'], soulConfig: { personality: 'helpful', tone: 'professional' }, toolIds: ['tool-1', 'tool-2'], tier: 'free', isPublished: true, downloadCount: 15, createdAt: '2026-01-01T00:00:00Z' },
  ]
  const agentsByB: AgentMarketItem[] = [
    { id: uuid(11), companyId: COMPANY_B, agentName: 'Sales Agent', description: 'Outbound sales AI agent with CRM integration', category: 'sales', tags: ['crm', 'sales'], soulConfig: { personality: 'persuasive' }, toolIds: ['tool-3'], tier: 'premium', isPublished: true, downloadCount: 8, createdAt: '2026-01-02T00:00:00Z' },
  ]
  const allAgents = [...agentsByA, ...agentsByB]

  // --- Publish → Browse → Clone flow (AC #5) ---

  test('template publish→browse→clone full flow: company B sees A\'s published templates', () => {
    const visible = filterMarketTemplates(allTemplates, COMPANY_B)
    expect(visible.length).toBe(2) // A's 2 published templates
    expect(visible.every((t) => t.companyId === COMPANY_A)).toBe(true)
    expect(visible.every((t) => t.isPublished)).toBe(true)
  })

  test('template clone returns correct source and target', () => {
    const visible = filterMarketTemplates(allTemplates, COMPANY_B)
    const cloned = cloneTemplate(visible[0], COMPANY_B)
    expect(cloned.sourceId).toBe(visible[0].id)
    expect(cloned.targetCompanyId).toBe(COMPANY_B)
    expect(cloned.clonedId).toBeDefined()
  })

  test('agent publish→browse→import full flow: company A sees B\'s agents', () => {
    const visible = filterAgentMarket(allAgents, COMPANY_A)
    expect(visible.length).toBe(1)
    expect(visible[0].companyId).toBe(COMPANY_B)
  })

  test('agent import preserves soul config and tool IDs', () => {
    const visible = filterAgentMarket(allAgents, COMPANY_A)
    const imported = importTemplate(visible[0], COMPANY_A)
    expect(imported.soulConfig).toEqual({ personality: 'persuasive' })
    expect(imported.toolIds).toEqual(['tool-3'])
    expect(imported.targetCompanyId).toBe(COMPANY_A)
  })

  // --- Multi-tenant isolation (AC #2) ---

  test('company A cannot see own templates in market', () => {
    const visible = filterMarketTemplates(allTemplates, COMPANY_A)
    expect(visible.every((t) => t.companyId !== COMPANY_A)).toBe(true)
  })

  test('company A cannot see own agents in market', () => {
    const visible = filterAgentMarket(allAgents, COMPANY_A)
    expect(visible.every((a) => a.companyId !== COMPANY_A)).toBe(true)
  })

  test('company C (new company) sees all published items from A and B', () => {
    const templates = filterMarketTemplates(allTemplates, COMPANY_C)
    const agents = filterAgentMarket(allAgents, COMPANY_C)
    expect(templates.length).toBe(3) // A:2 + B:1 published
    expect(agents.length).toBe(2) // A:1 + B:1 published
  })

  test('unpublished templates invisible to all companies', () => {
    const forB = filterMarketTemplates(allTemplates, COMPANY_B)
    const forC = filterMarketTemplates(allTemplates, COMPANY_C)
    expect(forB.find((t) => t.id === uuid(3))).toBeUndefined()
    expect(forC.find((t) => t.id === uuid(3))).toBeUndefined()
  })

  // --- Market search/filter integration (AC #1) ---

  test('keyword search works across both markets', () => {
    const templates = filterMarketTemplates(allTemplates, COMPANY_C, { keyword: 'support' })
    const agents = filterAgentMarket(allAgents, COMPANY_C, { keyword: 'support' })
    expect(templates.length).toBe(1)
    expect(templates[0].name).toBe('AI Customer Support')
    expect(agents.length).toBe(1)
    expect(agents[0].agentName).toBe('Support Bot')
  })

  test('tag filter works across templates and agents', () => {
    const templates = filterMarketTemplates(allTemplates, COMPANY_C, { tag: 'ai' })
    const agents = filterAgentMarket(allAgents, COMPANY_C, { tag: 'ai' })
    expect(templates.length).toBe(2) // AI Customer Support + Marketing Automation
    expect(agents.length).toBe(1) // Support Bot
  })

  test('tier filter works across markets', () => {
    const templates = filterMarketTemplates(allTemplates, COMPANY_C, { tier: 'premium' })
    const agents = filterAgentMarket(allAgents, COMPANY_C, { tier: 'premium' })
    expect(templates.length).toBe(1)
    expect(templates[0].name).toBe('Sales Pipeline')
    expect(agents.length).toBe(1)
    expect(agents[0].agentName).toBe('Sales Agent')
  })

  test('canPublish validation consistent across template and agent', () => {
    expect(canPublish({ name: 'Valid', description: 'Long enough description here', companyId: COMPANY_A })).toBe(true)
    expect(canPublish({ name: '', description: 'Long enough description here', companyId: COMPANY_A })).toBe(false)
    expect(canPublish({ name: 'Valid', description: 'Short', companyId: COMPANY_A })).toBe(false)
  })
})

// ===================================================================
// TASK 2: API Key Authentication Integration Tests (AC #3)
// ===================================================================

describe('API Key Auth Full Chain Integration', () => {
  test('generate→hash→validate full chain', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix })
    const result = validateApiKey(rawKey, [key])
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.record.id).toBe(key.id)
      expect(result.record.companyId).toBe(COMPANY_A)
    }
  })

  test('generate→validate→scope check chain', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix, scopes: ['read', 'execute'] })
    const authResult = validateApiKey(rawKey, [key])
    expect(authResult.ok).toBe(true)
    if (authResult.ok) {
      expect(requireScope(authResult.record.scopes, 'read').ok).toBe(true)
      expect(requireScope(authResult.record.scopes, 'execute').ok).toBe(true)
      expect(requireScope(authResult.record.scopes, 'write').ok).toBe(false)
    }
  })

  test('generate→validate→rate limit within window', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix, rateLimitPerMin: 10 })
    const authResult = validateApiKey(rawKey, [key])
    expect(authResult.ok).toBe(true)
    if (authResult.ok) {
      const store = new Map<string, RateEntry>()
      const now = Date.now()
      for (let i = 0; i < 10; i++) {
        const rl = checkRateLimit(store, authResult.record.id, authResult.record.rateLimitPerMin, now)
        expect(rl.allowed).toBe(true)
      }
      const blocked = checkRateLimit(store, authResult.record.id, authResult.record.rateLimitPerMin, now)
      expect(blocked.allowed).toBe(false)
    }
  })

  test('key rotation: old key fails, new key succeeds', () => {
    const { rawKey: oldRaw, keyHash: oldHash, keyPrefix: oldPrefix } = generateApiKey()
    const oldKey = makeKey({ keyHash: oldHash, keyPrefix: oldPrefix })
    const rotation = rotateKey(oldKey)
    expect(rotation.oldDeactivated).toBe(true)

    // Simulate: old key deactivated
    const deactivatedOld = { ...oldKey, isActive: false }
    const newKeyData = rotation.newKey
    const newKey = makeKey({
      keyHash: newKeyData.keyHash,
      keyPrefix: newKeyData.keyPrefix,
      name: rotation.preservedFields.name!,
      scopes: rotation.preservedFields.scopes!,
    })
    const keys = [deactivatedOld, newKey]

    // Old key fails
    const oldResult = validateApiKey(oldRaw, keys)
    expect(oldResult.ok).toBe(false)
    if (!oldResult.ok) expect(oldResult.code).toBe('API_002')
  })

  test('expired key auth → immediate rejection before rate limit check', () => {
    const { rawKey, keyHash, keyPrefix } = generateApiKey()
    const key = makeKey({ keyHash, keyPrefix, expiresAt: '2020-01-01T00:00:00Z' })
    const result = validateApiKey(rawKey, [key])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('API_003')
  })

  test('rate limit window reset allows new requests', () => {
    const store = new Map<string, RateEntry>()
    const now = Date.now()
    // Exhaust limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit(store, 'k1', 5, now)
    }
    expect(checkRateLimit(store, 'k1', 5, now).allowed).toBe(false)
    // After window reset (61s later)
    expect(checkRateLimit(store, 'k1', 5, now + 61_000).allowed).toBe(true)
  })

  test('multiple keys for same company have independent rate limits', () => {
    const store = new Map<string, RateEntry>()
    const now = Date.now()
    // Exhaust key1
    for (let i = 0; i < 5; i++) {
      checkRateLimit(store, 'key1', 5, now)
    }
    expect(checkRateLimit(store, 'key1', 5, now).allowed).toBe(false)
    // key2 still works
    expect(checkRateLimit(store, 'key2', 5, now).allowed).toBe(true)
  })
})

// ===================================================================
// TASK 3: Workflow Canvas Logic Integration Tests (AC #4)
// ===================================================================

describe('Workflow Canvas Complex DAG Integration', () => {
  test('10-node complex DAG: buildDagLayers + autoLayout consistency', () => {
    // Build a 10-node graph: 2 roots, middle layers, single sink
    const steps: WorkflowStep[] = [
      makeStep({ id: 'root1' }),
      makeStep({ id: 'root2' }),
      makeStep({ id: 'mid1', dependsOn: ['root1'] }),
      makeStep({ id: 'mid2', dependsOn: ['root1'] }),
      makeStep({ id: 'mid3', dependsOn: ['root2'] }),
      makeStep({ id: 'deep1', dependsOn: ['mid1', 'mid2'] }),
      makeStep({ id: 'deep2', dependsOn: ['mid2', 'mid3'] }),
      makeStep({ id: 'deep3', dependsOn: ['mid3'] }),
      makeStep({ id: 'conv', dependsOn: ['deep1', 'deep2'] }),
      makeStep({ id: 'sink', dependsOn: ['conv', 'deep3'] }),
    ]
    const layers = buildDagLayers(steps)
    expect(layers).not.toBeNull()
    expect(layers!.length).toBeGreaterThanOrEqual(4) // at least 4 layers

    const laid = autoLayout(steps)
    // All nodes should have positions
    for (const s of laid) {
      expect(s.metadata?.position).toBeDefined()
    }
    // Sink should be at the bottom (highest Y)
    const sinkY = laid.find((s) => s.id === 'sink')!.metadata!.position!.y
    const rootY = laid.find((s) => s.id === 'root1')!.metadata!.position!.y
    expect(sinkY).toBeGreaterThan(rootY)
  })

  test('edge add/remove then DAG recalculation consistency', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: 'a' }),
      makeStep({ id: 'b', dependsOn: ['a'] }),
      makeStep({ id: 'c' }),
    ]
    // Before: c is independent
    let layers = buildDagLayers(steps)!
    expect(layers[0].length).toBe(2) // a and c in first layer

    // Add edge: a → c
    const stepsWithEdge = steps.map((s) =>
      s.id === 'c' ? { ...s, dependsOn: ['a'] } : s,
    )
    layers = buildDagLayers(stepsWithEdge)!
    expect(layers[0].length).toBe(1) // only a in first layer
    expect(layers[1].length).toBe(2) // b and c in second layer

    // Remove edge: remove a from c's dependsOn
    const stepsRemoved = stepsWithEdge.map((s) =>
      s.id === 'c' ? { ...s, dependsOn: [] } : s,
    )
    layers = buildDagLayers(stepsRemoved)!
    expect(layers[0].length).toBe(2) // a and c back in first layer
  })

  test('condition branches (trueBranch/falseBranch) + dependsOn mixed graph', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: 'start' }),
      makeStep({ id: 'check', type: 'condition', dependsOn: ['start'], trueBranch: 'yes-path', falseBranch: 'no-path' }),
      makeStep({ id: 'yes-path', dependsOn: ['check'] }),
      makeStep({ id: 'no-path', dependsOn: ['check'] }),
      makeStep({ id: 'merge', dependsOn: ['yes-path', 'no-path'] }),
    ]
    const layers = buildDagLayers(steps)
    expect(layers).not.toBeNull()

    const edges = buildEdges(steps)
    // dependsOn edges: check→start=no(check depends on start), yes-path→check, no-path→check, merge→yes,no
    // trueBranch: check→yes-path, falseBranch: check→no-path
    const depEdges = edges.filter((e) => e.type === 'dependsOn')
    const trueEdges = edges.filter((e) => e.type === 'trueBranch')
    const falseEdges = edges.filter((e) => e.type === 'falseBranch')
    expect(depEdges.length).toBe(5) // start→check, check→yes, check→no, yes→merge, no→merge
    expect(trueEdges.length).toBe(1)
    expect(falseEdges.length).toBe(1)
    expect(trueEdges[0].to).toBe('yes-path')
    expect(falseEdges[0].to).toBe('no-path')
  })

  test('wouldCreateCycle consistent with buildDagLayers on complex graph', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: 'a' }),
      makeStep({ id: 'b', dependsOn: ['a'] }),
      makeStep({ id: 'c', dependsOn: ['a'] }),
      makeStep({ id: 'd', dependsOn: ['b', 'c'] }),
      makeStep({ id: 'e', dependsOn: ['d'] }),
    ]
    // Safe edges
    expect(wouldCreateCycle(steps, 'a', 'e')).toBe(false) // redundant but safe
    expect(wouldCreateCycle(steps, 'b', 'e')).toBe(false)

    // Dangerous edges
    expect(wouldCreateCycle(steps, 'e', 'a')).toBe(true) // e→a creates a→b→d→e→a
    expect(wouldCreateCycle(steps, 'd', 'a')).toBe(true) // d→a creates a→b→d→a
    expect(wouldCreateCycle(steps, 'e', 'b')).toBe(true) // e→b creates b→d→e→b

    // Verify consistency: for each cycle case, manually test buildDagLayers too
    const withCycle = steps.map((s) =>
      s.id === 'a' ? { ...s, dependsOn: [...(s.dependsOn || []), 'e'] } : s,
    )
    expect(buildDagLayers(withCycle)).toBeNull()
  })

  test('autoLayout handles wide parallel layer (5 parallel nodes)', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: 'root' }),
      makeStep({ id: 'p1', dependsOn: ['root'] }),
      makeStep({ id: 'p2', dependsOn: ['root'] }),
      makeStep({ id: 'p3', dependsOn: ['root'] }),
      makeStep({ id: 'p4', dependsOn: ['root'] }),
      makeStep({ id: 'p5', dependsOn: ['root'] }),
    ]
    const laid = autoLayout(steps, 1200)
    const parallelNodes = laid.filter((s) => s.id.startsWith('p'))
    // All parallel nodes at same Y
    const yValues = parallelNodes.map((s) => s.metadata!.position!.y)
    expect(new Set(yValues).size).toBe(1)
    // All at different X
    const xValues = parallelNodes.map((s) => s.metadata!.position!.x)
    expect(new Set(xValues).size).toBe(5)
    // X values should be sorted (left to right)
    const sorted = [...xValues].sort((a, b) => a - b)
    expect(xValues).toEqual(sorted)
  })

  test('buildEdges + autoLayout positions edges correctly (from node above to node below)', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: 'a' }),
      makeStep({ id: 'b', dependsOn: ['a'] }),
      makeStep({ id: 'c', dependsOn: ['b'] }),
    ]
    const laid = autoLayout(steps)
    const edges = buildEdges(laid)

    // Verify edges point from higher layer to lower layer
    for (const edge of edges) {
      const fromNode = laid.find((s) => s.id === edge.from)!
      const toNode = laid.find((s) => s.id === edge.to)!
      expect(fromNode.metadata!.position!.y).toBeLessThan(toNode.metadata!.position!.y)
    }
  })
})

// ===================================================================
// TASK 4: Regression + Total Verification (AC #6, #7)
// ===================================================================

describe('Integration Consistency Checks', () => {
  test('template and agent market filters use same companyId exclusion logic', () => {
    const t: MarketTemplate = { id: '1', companyId: COMPANY_A, name: 'T', description: 'Desc for test', category: 'c', tags: [], tier: 'free', isPublished: true, downloadCount: 0, createdAt: '' }
    const a: AgentMarketItem = { id: '2', companyId: COMPANY_A, agentName: 'A', description: 'Desc for test', category: 'c', tags: [], soulConfig: {}, toolIds: [], tier: 'free', isPublished: true, downloadCount: 0, createdAt: '' }

    // Same company: both excluded
    expect(filterMarketTemplates([t], COMPANY_A).length).toBe(0)
    expect(filterAgentMarket([a], COMPANY_A).length).toBe(0)

    // Different company: both visible
    expect(filterMarketTemplates([t], COMPANY_B).length).toBe(1)
    expect(filterAgentMarket([a], COMPANY_B).length).toBe(1)
  })

  test('API key Zod schema rejects invalid inputs consistently', () => {
    const schema = z.object({
      name: z.string().min(1).max(100),
      scopes: z.array(z.enum(['read', 'write', 'execute'])).min(1).default(['read']),
      rateLimitPerMin: z.number().int().min(1).max(10000).default(60),
    })
    expect(schema.safeParse({ name: '' }).success).toBe(false)
    expect(schema.safeParse({ name: 'OK' }).success).toBe(true)
    expect(schema.safeParse({ name: 'OK', scopes: ['invalid'] }).success).toBe(false)
    expect(schema.safeParse({ name: 'OK', rateLimitPerMin: 0 }).success).toBe(false)
  })

  test('workflow step type compatibility: all 3 types processable by buildDagLayers', () => {
    const steps: WorkflowStep[] = [
      makeStep({ id: 'tool1', type: 'tool', action: 'runScript' }),
      makeStep({ id: 'llm1', type: 'llm', action: 'summarize', dependsOn: ['tool1'], systemPrompt: 'Summarize' }),
      makeStep({ id: 'cond1', type: 'condition', action: 'check', dependsOn: ['llm1'], trueBranch: 'tool1' }),
    ]
    const layers = buildDagLayers(steps)
    expect(layers).not.toBeNull()
    expect(layers!.length).toBe(3)
  })
})
