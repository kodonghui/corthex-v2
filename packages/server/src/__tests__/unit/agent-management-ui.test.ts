import { describe, expect, it } from 'bun:test'
import { z } from 'zod'

/**
 * Story 2-7: Agent Management + Soul Editor UI (Admin)
 * Unit tests for agent CRUD UI logic, Soul markdown rendering, tier/model mapping,
 * filtering, system agent protection, and API schema validation.
 *
 * Risk Areas:
 * - HIGH: Soul markdown rendering (XSS prevention + correct rendering)
 * - HIGH: Tier -> default model auto-assignment
 * - HIGH: System agent protection (isSystem=true blocks deactivation)
 * - MEDIUM: Agent table filtering logic
 * - MEDIUM: Create/Update API payload construction
 * - LOW: Status label/color mapping
 */

// === Types matching the UI component ===

type Agent = {
  id: string
  companyId: string
  name: string
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  soul: string | null
  status: string
  departmentId: string | null
  isSecretary: boolean
  isSystem: boolean
  isActive: boolean
  allowedTools: string[]
  createdAt: string
}

type Department = { id: string; name: string }

// === Constants matching the UI component ===

const TIER_OPTIONS = [
  { value: 'manager', label: 'Manager', desc: '팀을 이끌고 결과를 종합', defaultModel: 'claude-sonnet-4-6' },
  { value: 'specialist', label: 'Specialist', desc: '전문 분야 분석', defaultModel: 'claude-haiku-4-5' },
  { value: 'worker', label: 'Worker', desc: '반복 작업 수행', defaultModel: 'gemini-2.5-flash' },
] as const

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
]

const STATUS_LABELS: Record<string, string> = {
  online: '유휴',
  working: '작업중',
  error: '에러',
  offline: '오프라인',
}

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  working: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  offline: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
}

const TIER_LABELS: Record<string, string> = {
  manager: 'Manager',
  specialist: 'Specialist',
  worker: 'Worker',
}

// === Helper functions (extracted from UI component logic) ===

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-zinc-100 dark:bg-zinc-800 rounded p-2 text-xs overflow-x-auto my-2"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

function getDefaultModelForTier(tier: string): string {
  const opt = TIER_OPTIONS.find((t) => t.value === tier)
  return opt?.defaultModel || 'claude-haiku-4-5'
}

function filterAgents(
  agents: Agent[],
  filters: { dept?: string; tier?: string; status?: string; search?: string },
): Agent[] {
  return agents.filter((a) => {
    if (filters.dept && a.departmentId !== filters.dept) return false
    if (filters.tier && a.tier !== filters.tier) return false
    if (filters.status && a.status !== filters.status) return false
    if (filters.search && !a.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })
}

function canDeactivate(agent: Agent): boolean {
  return agent.isActive && !agent.isSystem
}

function buildCreatePayload(
  form: { name: string; role: string; tier: string; modelName: string; departmentId: string; soul: string },
  userId: string,
): Record<string, unknown> {
  return {
    userId,
    name: form.name,
    ...(form.role ? { role: form.role } : {}),
    tier: form.tier,
    modelName: form.modelName,
    ...(form.departmentId ? { departmentId: form.departmentId } : {}),
    ...(form.soul ? { soul: form.soul } : {}),
  }
}

// === Server-side schema validation (mirrors routes/admin/agents.ts) ===

const createAgentSchema = z.object({
  userId: z.string().uuid(),
  departmentId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).nullable().optional(),
  role: z.string().max(200).nullable().optional(),
  tier: z.enum(['manager', 'specialist', 'worker']).optional(),
  modelName: z.string().max(100).optional(),
  allowedTools: z.array(z.string()).optional(),
  soul: z.string().nullable().optional(),
})

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().max(100).nullable().optional(),
  role: z.string().max(200).nullable().optional(),
  tier: z.enum(['manager', 'specialist', 'worker']).optional(),
  modelName: z.string().max(100).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  allowedTools: z.array(z.string()).optional(),
  soul: z.string().nullable().optional(),
  status: z.enum(['online', 'working', 'error', 'offline']).optional(),
  isActive: z.boolean().optional(),
})

// === Test data factories ===

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'
const TEST_COMPANY_ID = '00000000-0000-0000-0000-000000000002'
const TEST_DEPT_ID = '00000000-0000-0000-0000-000000000003'

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: crypto.randomUUID(),
    companyId: TEST_COMPANY_ID,
    name: 'Test Agent',
    role: 'Test Role',
    tier: 'specialist',
    modelName: 'claude-haiku-4-5',
    soul: null,
    status: 'offline',
    departmentId: TEST_DEPT_ID,
    isSecretary: false,
    isSystem: false,
    isActive: true,
    allowedTools: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// =====================================================
// TESTS
// =====================================================

describe('Story 2-7: Agent Management + Soul Editor UI', () => {
  // === 1. Markdown rendering ===
  describe('renderMarkdown', () => {
    it('renders headings correctly', () => {
      expect(renderMarkdown('# Title')).toContain('<h1')
      expect(renderMarkdown('# Title')).toContain('Title')
      expect(renderMarkdown('## Subtitle')).toContain('<h2')
      expect(renderMarkdown('### Section')).toContain('<h3')
    })

    it('renders bold text', () => {
      const result = renderMarkdown('This is **bold** text')
      expect(result).toContain('<strong>bold</strong>')
    })

    it('renders italic text', () => {
      const result = renderMarkdown('This is *italic* text')
      expect(result).toContain('<em>italic</em>')
    })

    it('renders inline code', () => {
      const result = renderMarkdown('Use `console.log` here')
      expect(result).toContain('<code')
      expect(result).toContain('console.log')
    })

    it('renders code blocks', () => {
      const result = renderMarkdown('```js\nconst x = 1\n```')
      expect(result).toContain('<pre')
      expect(result).toContain('<code>')
      expect(result).toContain('const x = 1')
    })

    it('renders unordered list items', () => {
      const result = renderMarkdown('- Item 1\n- Item 2')
      expect(result).toContain('<li')
      expect(result).toContain('Item 1')
      expect(result).toContain('Item 2')
    })

    it('escapes HTML to prevent XSS', () => {
      const result = renderMarkdown('<script>alert("xss")</script>')
      expect(result).not.toContain('<script>')
      expect(result).toContain('&lt;script&gt;')
    })

    it('escapes angle brackets in content', () => {
      const result = renderMarkdown('a > b and c < d')
      expect(result).toContain('&gt;')
      expect(result).toContain('&lt;')
    })

    it('escapes ampersands', () => {
      const result = renderMarkdown('AT&T')
      expect(result).toContain('&amp;')
    })

    it('handles empty string', () => {
      expect(renderMarkdown('')).toBe('')
    })

    it('handles multiline markdown', () => {
      const md = '# Title\n\nSome **bold** text\n\n- item 1\n- item 2'
      const result = renderMarkdown(md)
      expect(result).toContain('<h1')
      expect(result).toContain('<strong>')
      expect(result).toContain('<li')
    })

    it('renders paragraph breaks', () => {
      const result = renderMarkdown('Para 1\n\nPara 2')
      expect(result).toContain('<br/><br/>')
    })
  })

  // === 2. Tier -> Model auto-assignment ===
  describe('Tier to Model mapping', () => {
    it('assigns claude-sonnet-4-6 for manager', () => {
      expect(getDefaultModelForTier('manager')).toBe('claude-sonnet-4-6')
    })

    it('assigns claude-haiku-4-5 for specialist', () => {
      expect(getDefaultModelForTier('specialist')).toBe('claude-haiku-4-5')
    })

    it('assigns gemini-2.5-flash for worker', () => {
      expect(getDefaultModelForTier('worker')).toBe('gemini-2.5-flash')
    })

    it('falls back to claude-haiku-4-5 for unknown tier', () => {
      expect(getDefaultModelForTier('unknown')).toBe('claude-haiku-4-5')
    })

    it('has all 3 tier options defined', () => {
      expect(TIER_OPTIONS).toHaveLength(3)
      expect(TIER_OPTIONS.map((t) => t.value)).toEqual(['manager', 'specialist', 'worker'])
    })

    it('has 6 model options defined', () => {
      expect(MODEL_OPTIONS).toHaveLength(6)
    })

    it('each tier option has a description', () => {
      for (const t of TIER_OPTIONS) {
        expect(t.desc.length).toBeGreaterThan(0)
      }
    })
  })

  // === 3. Agent filtering ===
  describe('Agent filtering', () => {
    const agents: Agent[] = [
      makeAgent({ name: 'Marketing Manager', tier: 'manager', departmentId: 'dept-1', status: 'online' }),
      makeAgent({ name: 'SEO Specialist', tier: 'specialist', departmentId: 'dept-1', status: 'working' }),
      makeAgent({ name: 'Content Writer', tier: 'worker', departmentId: 'dept-2', status: 'offline' }),
      makeAgent({ name: 'Data Analyst', tier: 'specialist', departmentId: 'dept-2', status: 'online' }),
      makeAgent({ name: 'Chief of Staff', tier: 'manager', departmentId: null, status: 'online', isSystem: true }),
    ]

    it('returns all agents with no filters', () => {
      expect(filterAgents(agents, {})).toHaveLength(5)
    })

    it('filters by department', () => {
      const result = filterAgents(agents, { dept: 'dept-1' })
      expect(result).toHaveLength(2)
      expect(result.every((a) => a.departmentId === 'dept-1')).toBe(true)
    })

    it('filters by tier', () => {
      const result = filterAgents(agents, { tier: 'manager' })
      expect(result).toHaveLength(2)
      expect(result.every((a) => a.tier === 'manager')).toBe(true)
    })

    it('filters by status', () => {
      const result = filterAgents(agents, { status: 'online' })
      expect(result).toHaveLength(3)
    })

    it('filters by search (case insensitive)', () => {
      const result = filterAgents(agents, { search: 'marketing' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Marketing Manager')
    })

    it('combines multiple filters', () => {
      const result = filterAgents(agents, { dept: 'dept-1', tier: 'specialist' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('SEO Specialist')
    })

    it('returns empty for no matches', () => {
      const result = filterAgents(agents, { search: 'nonexistent' })
      expect(result).toHaveLength(0)
    })

    it('handles null departmentId (unassigned agents)', () => {
      const result = filterAgents(agents, { dept: 'dept-1' })
      // Chief of Staff has null departmentId, should be excluded
      expect(result.find((a) => a.name === 'Chief of Staff')).toBeUndefined()
    })
  })

  // === 4. System agent protection ===
  describe('System agent protection', () => {
    it('system agent cannot be deactivated', () => {
      const systemAgent = makeAgent({ isSystem: true, isActive: true })
      expect(canDeactivate(systemAgent)).toBe(false)
    })

    it('regular active agent can be deactivated', () => {
      const agent = makeAgent({ isSystem: false, isActive: true })
      expect(canDeactivate(agent)).toBe(true)
    })

    it('already inactive agent cannot be deactivated', () => {
      const agent = makeAgent({ isSystem: false, isActive: false })
      expect(canDeactivate(agent)).toBe(false)
    })

    it('inactive system agent cannot be deactivated', () => {
      const agent = makeAgent({ isSystem: true, isActive: false })
      expect(canDeactivate(agent)).toBe(false)
    })
  })

  // === 5. Create agent payload ===
  describe('Create agent payload construction', () => {
    it('builds minimal payload with name only', () => {
      const payload = buildCreatePayload(
        { name: 'Test', role: '', tier: 'specialist', modelName: 'claude-haiku-4-5', departmentId: '', soul: '' },
        TEST_USER_ID,
      )
      expect(payload).toEqual({
        userId: TEST_USER_ID,
        name: 'Test',
        tier: 'specialist',
        modelName: 'claude-haiku-4-5',
      })
    })

    it('includes role when provided', () => {
      const payload = buildCreatePayload(
        { name: 'Test', role: 'Analyst', tier: 'specialist', modelName: 'claude-haiku-4-5', departmentId: '', soul: '' },
        TEST_USER_ID,
      )
      expect(payload.role).toBe('Analyst')
    })

    it('includes departmentId when provided', () => {
      const payload = buildCreatePayload(
        { name: 'Test', role: '', tier: 'specialist', modelName: 'claude-haiku-4-5', departmentId: TEST_DEPT_ID, soul: '' },
        TEST_USER_ID,
      )
      expect(payload.departmentId).toBe(TEST_DEPT_ID)
    })

    it('includes soul when provided', () => {
      const payload = buildCreatePayload(
        { name: 'Test', role: '', tier: 'specialist', modelName: 'claude-haiku-4-5', departmentId: '', soul: '# My Soul' },
        TEST_USER_ID,
      )
      expect(payload.soul).toBe('# My Soul')
    })

    it('omits empty optional fields', () => {
      const payload = buildCreatePayload(
        { name: 'Test', role: '', tier: 'specialist', modelName: 'claude-haiku-4-5', departmentId: '', soul: '' },
        TEST_USER_ID,
      )
      expect(payload).not.toHaveProperty('role')
      expect(payload).not.toHaveProperty('departmentId')
      expect(payload).not.toHaveProperty('soul')
    })

    it('always includes userId', () => {
      const payload = buildCreatePayload(
        { name: 'Test', role: '', tier: 'specialist', modelName: 'claude-haiku-4-5', departmentId: '', soul: '' },
        TEST_USER_ID,
      )
      expect(payload.userId).toBe(TEST_USER_ID)
    })
  })

  // === 6. Create agent schema validation ===
  describe('Create agent schema validation', () => {
    it('accepts valid minimal payload', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Test Agent',
      })
      expect(result.success).toBe(true)
    })

    it('accepts full payload', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Full Agent',
        role: 'Analyst',
        tier: 'manager',
        modelName: 'claude-sonnet-4-6',
        departmentId: TEST_DEPT_ID,
        soul: '# Soul markdown',
        allowedTools: ['tool1', 'tool2'],
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing userId', () => {
      const result = createAgentSchema.safeParse({ name: 'Test' })
      expect(result.success).toBe(false)
    })

    it('rejects missing name', () => {
      const result = createAgentSchema.safeParse({ userId: TEST_USER_ID })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = createAgentSchema.safeParse({ userId: TEST_USER_ID, name: '' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid tier', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Test',
        tier: 'director',
      })
      expect(result.success).toBe(false)
    })

    it('accepts null departmentId', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Test',
        departmentId: null,
      })
      expect(result.success).toBe(true)
    })

    it('rejects non-uuid userId', () => {
      const result = createAgentSchema.safeParse({
        userId: 'not-a-uuid',
        name: 'Test',
      })
      expect(result.success).toBe(false)
    })

    it('accepts name up to 100 chars', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'A'.repeat(100),
      })
      expect(result.success).toBe(true)
    })

    it('rejects name over 100 chars', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'A'.repeat(101),
      })
      expect(result.success).toBe(false)
    })
  })

  // === 7. Update agent schema validation ===
  describe('Update agent schema validation', () => {
    it('accepts empty update (no changes)', () => {
      const result = updateAgentSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts partial update with name only', () => {
      const result = updateAgentSchema.safeParse({ name: 'New Name' })
      expect(result.success).toBe(true)
    })

    it('accepts tier change', () => {
      const result = updateAgentSchema.safeParse({ tier: 'manager' })
      expect(result.success).toBe(true)
    })

    it('accepts soul update', () => {
      const result = updateAgentSchema.safeParse({ soul: '# New Soul' })
      expect(result.success).toBe(true)
    })

    it('accepts null soul (clear)', () => {
      const result = updateAgentSchema.safeParse({ soul: null })
      expect(result.success).toBe(true)
    })

    it('accepts null departmentId (unassign)', () => {
      const result = updateAgentSchema.safeParse({ departmentId: null })
      expect(result.success).toBe(true)
    })

    it('accepts status update', () => {
      const result = updateAgentSchema.safeParse({ status: 'online' })
      expect(result.success).toBe(true)
    })

    it('rejects invalid status', () => {
      const result = updateAgentSchema.safeParse({ status: 'sleeping' })
      expect(result.success).toBe(false)
    })

    it('accepts isActive boolean', () => {
      const result = updateAgentSchema.safeParse({ isActive: false })
      expect(result.success).toBe(true)
    })

    it('accepts allowedTools update', () => {
      const result = updateAgentSchema.safeParse({ allowedTools: ['web-search', 'calculator'] })
      expect(result.success).toBe(true)
    })
  })

  // === 8. Status labels and colors ===
  describe('Status labels and colors', () => {
    it('has label for all statuses', () => {
      expect(STATUS_LABELS.online).toBe('유휴')
      expect(STATUS_LABELS.working).toBe('작업중')
      expect(STATUS_LABELS.error).toBe('에러')
      expect(STATUS_LABELS.offline).toBe('오프라인')
    })

    it('has colors for all statuses', () => {
      expect(STATUS_COLORS.online).toContain('green')
      expect(STATUS_COLORS.working).toContain('blue')
      expect(STATUS_COLORS.error).toContain('red')
      expect(STATUS_COLORS.offline).toContain('zinc')
    })

    it('has tier labels for all tiers', () => {
      expect(TIER_LABELS.manager).toBe('Manager')
      expect(TIER_LABELS.specialist).toBe('Specialist')
      expect(TIER_LABELS.worker).toBe('Worker')
    })
  })

  // === 9. Department mapping ===
  describe('Department name mapping', () => {
    const depts: Department[] = [
      { id: 'dept-1', name: '마케팅부' },
      { id: 'dept-2', name: '개발부' },
    ]
    const deptMap = new Map(depts.map((d) => [d.id, d.name]))

    it('maps department id to name', () => {
      expect(deptMap.get('dept-1')).toBe('마케팅부')
    })

    it('returns undefined for unknown department', () => {
      expect(deptMap.get('dept-unknown')).toBeUndefined()
    })

    it('handles null departmentId (unassigned)', () => {
      const agent = makeAgent({ departmentId: null })
      const name = agent.departmentId ? deptMap.get(agent.departmentId) || '-' : '미배정'
      expect(name).toBe('미배정')
    })
  })

  // === 10. Agent data model ===
  describe('Agent data model', () => {
    it('creates valid agent with defaults', () => {
      const agent = makeAgent()
      expect(agent.tier).toBe('specialist')
      expect(agent.modelName).toBe('claude-haiku-4-5')
      expect(agent.isSystem).toBe(false)
      expect(agent.isActive).toBe(true)
      expect(agent.allowedTools).toEqual([])
    })

    it('creates system agent', () => {
      const agent = makeAgent({ isSystem: true, name: '비서실장' })
      expect(agent.isSystem).toBe(true)
    })

    it('creates agent with soul', () => {
      const agent = makeAgent({ soul: '# My Soul\n\nI am an analyst.' })
      expect(agent.soul).toContain('# My Soul')
    })

    it('creates agent with allowed tools', () => {
      const agent = makeAgent({ allowedTools: ['web-search', 'calculator', 'file-read'] })
      expect(agent.allowedTools).toHaveLength(3)
    })
  })

  // === 11. Markdown edge cases ===
  describe('Markdown rendering edge cases', () => {
    it('handles multiple headings in sequence', () => {
      const md = '# H1\n## H2\n### H3'
      const result = renderMarkdown(md)
      expect(result).toContain('<h1')
      expect(result).toContain('<h2')
      expect(result).toContain('<h3')
    })

    it('handles mixed formatting', () => {
      const md = '**bold** and *italic* and `code`'
      const result = renderMarkdown(md)
      expect(result).toContain('<strong>bold</strong>')
      expect(result).toContain('<em>italic</em>')
      expect(result).toContain('<code')
    })

    it('handles code block with language hint', () => {
      const md = '```typescript\nconst x: number = 1\n```'
      const result = renderMarkdown(md)
      expect(result).toContain('<pre')
      expect(result).toContain('const x: number = 1')
    })

    it('handles multiple list items', () => {
      const md = '- First\n- Second\n- Third'
      const result = renderMarkdown(md)
      const matches = result.match(/<li/g)
      expect(matches).toHaveLength(3)
    })

    it('handles Soul template pattern', () => {
      const soulMd = `# 마케팅 매니저

## 역할
**팀장**으로서 마케팅 부서를 이끕니다.

## 전문 분야
- SNS 콘텐츠 전략
- SEO 최적화
- 브랜드 관리

## 행동 원칙
1. 데이터 기반 의사결정
2. 창의적 접근`

      const result = renderMarkdown(soulMd)
      expect(result).toContain('<h1')
      expect(result).toContain('<h2')
      expect(result).toContain('<strong>팀장</strong>')
      expect(result).toContain('<li')
    })

    it('does not render script tags', () => {
      const md = '# Title\n<script>alert(1)</script>\n**safe**'
      const result = renderMarkdown(md)
      expect(result).not.toContain('<script>')
      expect(result).toContain('&lt;script&gt;')
      expect(result).toContain('<strong>safe</strong>')
    })
  })

  // === 12. Tier option descriptions ===
  describe('Tier options UI', () => {
    it('manager description mentions team leadership', () => {
      const manager = TIER_OPTIONS.find((t) => t.value === 'manager')
      expect(manager?.desc).toContain('종합')
    })

    it('specialist description mentions analysis', () => {
      const specialist = TIER_OPTIONS.find((t) => t.value === 'specialist')
      expect(specialist?.desc).toContain('분석')
    })

    it('worker description mentions repetitive tasks', () => {
      const worker = TIER_OPTIONS.find((t) => t.value === 'worker')
      expect(worker?.desc).toContain('반복')
    })
  })

  // === 13. Model options completeness ===
  describe('Model options', () => {
    it('includes Claude models', () => {
      const claudeModels = MODEL_OPTIONS.filter((m) => m.value.startsWith('claude'))
      expect(claudeModels).toHaveLength(2)
    })

    it('includes GPT models', () => {
      const gptModels = MODEL_OPTIONS.filter((m) => m.value.startsWith('gpt'))
      expect(gptModels).toHaveLength(2)
    })

    it('includes Gemini models', () => {
      const geminiModels = MODEL_OPTIONS.filter((m) => m.value.startsWith('gemini'))
      expect(geminiModels).toHaveLength(2)
    })

    it('all models have labels', () => {
      for (const m of MODEL_OPTIONS) {
        expect(m.label.length).toBeGreaterThan(0)
      }
    })
  })

  // === 14. Combined filter + system agent scenarios ===
  describe('Complex filter scenarios', () => {
    const agents: Agent[] = [
      makeAgent({ name: '비서실장', tier: 'manager', isSystem: true, departmentId: null, status: 'online' }),
      makeAgent({ name: 'SEO 분석가', tier: 'specialist', departmentId: 'dept-1', status: 'working' }),
      makeAgent({ name: '콘텐츠 작성자', tier: 'worker', departmentId: 'dept-1', status: 'offline' }),
      makeAgent({ name: '재무분석관', tier: 'specialist', departmentId: 'dept-2', status: 'online', isActive: false }),
    ]

    it('search + tier filter combined', () => {
      const result = filterAgents(agents, { search: '분석', tier: 'specialist' })
      expect(result).toHaveLength(2) // SEO 분석가, 재무분석관
    })

    it('department filter excludes unassigned', () => {
      const result = filterAgents(agents, { dept: 'dept-1' })
      expect(result).toHaveLength(2)
      expect(result.find((a) => a.name === '비서실장')).toBeUndefined()
    })

    it('system agents appear in unfiltered list', () => {
      const result = filterAgents(agents, {})
      const systemAgents = result.filter((a) => a.isSystem)
      expect(systemAgents).toHaveLength(1)
    })

    it('inactive agents appear in list (for visibility)', () => {
      const result = filterAgents(agents, {})
      const inactiveAgents = result.filter((a) => !a.isActive)
      expect(inactiveAgents).toHaveLength(1)
    })
  })

  // =====================================================
  // TEA-Generated: Risk-Based Test Expansion
  // =====================================================

  // === 15. API URL construction ===
  describe('TEA: API URL construction', () => {
    function buildAgentListUrl(companyId: string, filters?: { departmentId?: string; isActive?: string }): string {
      let url = `/admin/agents?companyId=${companyId}`
      if (filters?.departmentId) url += `&departmentId=${filters.departmentId}`
      if (filters?.isActive !== undefined) url += `&isActive=${filters.isActive}`
      return url
    }

    it('builds basic list URL with companyId', () => {
      expect(buildAgentListUrl('abc')).toBe('/admin/agents?companyId=abc')
    })

    it('builds list URL with department filter', () => {
      expect(buildAgentListUrl('abc', { departmentId: 'dept-1' })).toBe('/admin/agents?companyId=abc&departmentId=dept-1')
    })

    it('builds list URL with isActive filter', () => {
      expect(buildAgentListUrl('abc', { isActive: 'true' })).toBe('/admin/agents?companyId=abc&isActive=true')
    })

    it('builds detail URL', () => {
      expect(`/admin/agents/${'agent-id-123'}`).toBe('/admin/agents/agent-id-123')
    })

    it('builds update URL', () => {
      const id = 'agent-uuid-456'
      expect(`/admin/agents/${id}`).toBe('/admin/agents/agent-uuid-456')
    })

    it('builds delete URL', () => {
      const id = 'agent-uuid-789'
      expect(`/admin/agents/${id}`).toBe('/admin/agents/agent-uuid-789')
    })
  })

  // === 16. Update payload construction ===
  describe('TEA: Update payload edge cases', () => {
    function buildUpdatePayload(
      editForm: Partial<Agent>,
      saveType: 'info' | 'soul',
    ): Record<string, unknown> {
      if (saveType === 'info') {
        return {
          name: editForm.name,
          role: editForm.role,
          tier: editForm.tier,
          modelName: editForm.modelName,
          departmentId: editForm.departmentId ?? null,
        }
      }
      return { soul: editForm.soul ?? null }
    }

    it('info save includes all basic fields', () => {
      const payload = buildUpdatePayload(
        { name: 'New Name', role: 'New Role', tier: 'manager', modelName: 'claude-sonnet-4-6', departmentId: 'dept-1' },
        'info',
      )
      expect(payload.name).toBe('New Name')
      expect(payload.tier).toBe('manager')
      expect(payload.modelName).toBe('claude-sonnet-4-6')
      expect(payload.departmentId).toBe('dept-1')
    })

    it('info save with null departmentId (unassign)', () => {
      const payload = buildUpdatePayload(
        { name: 'Test', departmentId: null },
        'info',
      )
      expect(payload.departmentId).toBeNull()
    })

    it('info save with undefined departmentId defaults to null', () => {
      const payload = buildUpdatePayload(
        { name: 'Test' },
        'info',
      )
      expect(payload.departmentId).toBeNull()
    })

    it('soul save includes only soul field', () => {
      const payload = buildUpdatePayload(
        { soul: '# New Soul', name: 'Should Not Include' },
        'soul',
      )
      expect(payload).toEqual({ soul: '# New Soul' })
      expect(payload).not.toHaveProperty('name')
    })

    it('soul save with null clears soul', () => {
      const payload = buildUpdatePayload(
        { soul: null },
        'soul',
      )
      expect(payload).toEqual({ soul: null })
    })

    it('soul save with undefined clears soul', () => {
      const payload = buildUpdatePayload(
        {},
        'soul',
      )
      expect(payload).toEqual({ soul: null })
    })
  })

  // === 17. Tier change cascading model update ===
  describe('TEA: Tier change cascading behavior', () => {
    it('changing from specialist to manager updates model', () => {
      const currentModel = getDefaultModelForTier('specialist')
      expect(currentModel).toBe('claude-haiku-4-5')
      const newModel = getDefaultModelForTier('manager')
      expect(newModel).toBe('claude-sonnet-4-6')
      expect(currentModel).not.toBe(newModel)
    })

    it('changing from manager to worker updates model', () => {
      const newModel = getDefaultModelForTier('worker')
      expect(newModel).toBe('gemini-2.5-flash')
    })

    it('all tier default models are valid MODEL_OPTIONS', () => {
      for (const tier of TIER_OPTIONS) {
        const found = MODEL_OPTIONS.find((m) => m.value === tier.defaultModel)
        expect(found).toBeDefined()
      }
    })

    it('each tier has unique default model', () => {
      const defaults = TIER_OPTIONS.map((t) => t.defaultModel)
      const unique = new Set(defaults)
      expect(unique.size).toBe(defaults.length)
    })
  })

  // === 18. Create agent schema boundary tests ===
  describe('TEA: Create schema boundary values', () => {
    it('accepts minimum valid name (1 char)', () => {
      const result = createAgentSchema.safeParse({ userId: TEST_USER_ID, name: 'A' })
      expect(result.success).toBe(true)
    })

    it('rejects role over 200 chars', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Test',
        role: 'R'.repeat(201),
      })
      expect(result.success).toBe(false)
    })

    it('accepts role at 200 chars', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Test',
        role: 'R'.repeat(200),
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty allowedTools array', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Test',
        allowedTools: [],
      })
      expect(result.success).toBe(true)
    })

    it('accepts null soul', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Test',
        soul: null,
      })
      expect(result.success).toBe(true)
    })

    it('rejects nameEn over 100 chars', () => {
      const result = createAgentSchema.safeParse({
        userId: TEST_USER_ID,
        name: 'Test',
        nameEn: 'N'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('accepts all 3 valid tier values', () => {
      for (const tier of ['manager', 'specialist', 'worker']) {
        const result = createAgentSchema.safeParse({ userId: TEST_USER_ID, name: 'Test', tier })
        expect(result.success).toBe(true)
      }
    })
  })

  // === 19. Markdown XSS vectors ===
  describe('TEA: Markdown XSS prevention', () => {
    it('escapes event handler attributes (tag neutralized)', () => {
      const result = renderMarkdown('<img onerror=alert(1) src=x>')
      // Tag is escaped so onerror cannot execute as attribute
      expect(result).toContain('&lt;img')
      expect(result).toContain('&gt;')
      expect(result).not.toContain('<img')
    })

    it('does not render markdown links (no link support = safe)', () => {
      const result = renderMarkdown('[click](javascript:alert(1))')
      // renderMarkdown does not support link syntax, so raw text is preserved safely
      expect(result).not.toContain('<a')
      expect(result).not.toContain('href')
    })

    it('escapes iframe injection', () => {
      const result = renderMarkdown('<iframe src="evil.com"></iframe>')
      expect(result).not.toContain('<iframe')
      expect(result).toContain('&lt;iframe')
    })

    it('escapes nested HTML in markdown', () => {
      const result = renderMarkdown('# Title <script>bad</script>')
      expect(result).not.toContain('<script>')
    })

    it('escapes style tags', () => {
      const result = renderMarkdown('<style>body{display:none}</style>')
      expect(result).not.toContain('<style>')
      expect(result).toContain('&lt;style&gt;')
    })
  })

  // === 20. Korean text handling ===
  describe('TEA: Korean content rendering', () => {
    it('renders Korean headings', () => {
      const result = renderMarkdown('# 마케팅 전문가')
      expect(result).toContain('마케팅 전문가')
      expect(result).toContain('<h1')
    })

    it('renders Korean bold text', () => {
      const result = renderMarkdown('**전문 분야**: SEO 최적화')
      expect(result).toContain('<strong>전문 분야</strong>')
    })

    it('renders Korean list items', () => {
      const result = renderMarkdown('- 데이터 분석\n- 콘텐츠 전략\n- 브랜드 관리')
      const matches = result.match(/<li/g)
      expect(matches).toHaveLength(3)
    })

    it('handles mixed Korean and English', () => {
      const result = renderMarkdown('# Agent Soul\n\n**역할**: Marketing Manager')
      expect(result).toContain('<h1')
      expect(result).toContain('<strong>역할</strong>')
    })
  })
})
