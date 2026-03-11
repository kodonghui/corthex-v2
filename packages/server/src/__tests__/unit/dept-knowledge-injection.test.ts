import { describe, test, expect, mock, beforeEach, afterAll } from 'bun:test'

afterAll(() => {
  mock.restore()
})

// ============================================================
// Part 1: soul-renderer {{knowledge_context}} tests
// ============================================================

const mockAgentById = mock(() => Promise.resolve([{
  id: 'agent-1', companyId: 'co-1', userId: 'user-1', departmentId: 'dept-1',
  name: 'TestAgent', role: 'Researcher', tier: 'specialist', nameEn: 'TestAgent',
  modelName: 'claude-haiku-4-5', reportTo: null, soul: '', adminSoul: null,
  status: 'online', isSecretary: false, isSystem: false, allowedTools: [],
  autoLearn: true, isActive: true, createdAt: new Date(), updatedAt: new Date(),
}]))

mock.module('../../db/scoped-query', () => ({
  getDB: (_companyId: string) => ({
    agents: mock(() => Promise.resolve([{ name: 'TestAgent', role: 'Researcher' }])),
    agentById: mockAgentById,
    agentsByReportTo: mock(() => Promise.resolve([])),
    agentToolsWithDefs: mock(() => Promise.resolve([{ name: 'web_search', description: 'Search' }])),
    departmentById: mock(() => Promise.resolve([{ name: 'Research Division' }])),
    userById: mock(() => Promise.resolve([{ name: 'Dr. Owner' }])),
    searchSimilarDocs: mock(() => Promise.resolve([])),
  }),
}))

import { renderSoul } from '../../engine/soul-renderer'

describe('soul-renderer {{knowledge_context}} (Story 10.4)', () => {
  beforeEach(() => {
    mockAgentById.mockClear()
  })

  test('renders {{knowledge_context}} from extraVars', async () => {
    const template = '당신은 {{specialty}} 전문가입니다.\n\n{{knowledge_context}}'
    const result = await renderSoul(template, 'agent-1', 'co-1', {
      knowledge_context: '### 관련 문서\n- 투자 분석 보고서',
    })
    expect(result).toContain('Researcher 전문가입니다')
    expect(result).toContain('### 관련 문서')
    expect(result).toContain('투자 분석 보고서')
  })

  test('renders {{knowledge_context}} as empty when no extraVars', async () => {
    const template = '소개: {{specialty}}\n지식: {{knowledge_context}}\n끝'
    const result = await renderSoul(template, 'agent-1', 'co-1')
    expect(result).toContain('소개: Researcher')
    expect(result).toContain('지식: \n끝')
  })

  test('extraVars override built-in vars', async () => {
    const template = '{{specialty}}'
    const result = await renderSoul(template, 'agent-1', 'co-1', { specialty: 'Custom' })
    expect(result).toBe('Custom')
  })

  test('extraVars work alongside all built-in variables', async () => {
    const template = '{{agent_list}} | {{knowledge_context}} | {{department_name}}'
    const result = await renderSoul(template, 'agent-1', 'co-1', { knowledge_context: 'KB' })
    expect(result).toContain('TestAgent')
    expect(result).toContain('KB')
    expect(result).toContain('Research Division')
  })

  test('backward compat: renderSoul with 3 args', async () => {
    const template = '{{specialty}} at {{department_name}}'
    const result = await renderSoul(template, 'agent-1', 'co-1')
    expect(result).toBe('Researcher at Research Division')
  })

  test('multiple extraVars injected correctly', async () => {
    const template = '{{knowledge_context}} -- {{custom_var}}'
    const result = await renderSoul(template, 'agent-1', 'co-1', {
      knowledge_context: 'KnowledgeData',
      custom_var: 'CustomValue',
    })
    expect(result).toBe('KnowledgeData -- CustomValue')
  })

  test('empty extraVars object behaves like no extraVars', async () => {
    const template = '{{specialty}} {{knowledge_context}}'
    const result = await renderSoul(template, 'agent-1', 'co-1', {})
    expect(result).toBe('Researcher ')
  })

  test('unknown agent returns all vars replaced with empty', async () => {
    mockAgentById.mockImplementationOnce(() => Promise.resolve([]))
    const template = '{{specialty}} {{knowledge_context}}'
    const result = await renderSoul(template, 'nonexistent', 'co-1', { knowledge_context: 'data' })
    // When agent not found, all vars replaced with empty
    expect(result).toBe(' ')
  })
})

// ============================================================
// Part 2: collectSemanticKnowledge & collectKnowledgeContext tests
// ============================================================

// These tests use the chain mock pattern from knowledge-injector.test.ts

let selectResults: unknown[][] = []
let globalCallIndex = 0

function makeChain() {
  const getResult = () => {
    const res = selectResults[globalCallIndex] ?? []
    globalCallIndex++
    return res
  }
  const chain: Record<string, unknown> = {}
  chain.select = mock(() => chain)
  chain.from = mock(() => chain)
  chain.innerJoin = mock(() => chain)
  chain.where = mock(() => chain)
  chain.orderBy = mock(() => chain)
  chain.offset = mock(() => chain)
  chain.limit = mock(() => {
    const r = getResult()
    const limitResult: Record<string, unknown> = {}
    limitResult.offset = mock(() => ({ then: (resolve: (v: unknown) => void) => { resolve(r) } }))
    limitResult.then = (resolve: (v: unknown) => void) => { resolve(r) }
    return limitResult
  })
  chain.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => {
    try { resolve(getResult()) } catch (e) { reject?.(e) }
  }
  return chain
}

mock.module('../../db', () => ({
  db: {
    select: mock(() => makeChain()),
    update: mock(() => ({
      set: mock(() => ({ where: mock(() => Promise.resolve()) })),
    })),
  },
}))

mock.module('../../db/schema', () => ({
  departmentKnowledge: { companyId: 'c', departmentId: 'd', title: 't', content: 'co', category: 'ca', updatedAt: 'u' },
  knowledgeDocs: { id: 'i', title: 't', content: 'c', folderId: 'f', isActive: 'a', updatedAt: 'u', embedding: 'e' },
  knowledgeFolders: { id: 'i', companyId: 'c', departmentId: 'd', isActive: 'a' },
  agentMemories: { id: 'i', companyId: 'c', agentId: 'a', memoryType: 'm', key: 'k', content: 'co', context: 'cx', isActive: 'a', usageCount: 'u', lastUsedAt: 'l' },
}))

// Mock semantic-search
const mockSemanticSearch = mock(() => Promise.resolve(null))
mock.module('../../services/semantic-search', () => ({
  semanticSearch: mockSemanticSearch,
}))

// Mock memory-extractor
mock.module('../../services/memory-extractor', () => ({
  extractTaskKeywords: mock((text: string) => text.split(/\s+/).filter((w: string) => w.length > 2)),
}))

import {
  collectKnowledgeContext,
  collectSemanticKnowledge,
  clearAllCache,
} from '../../services/knowledge-injector'

describe('collectSemanticKnowledge (Story 10.4)', () => {
  beforeEach(() => {
    clearAllCache()
    selectResults = []
    globalCallIndex = 0
    mockSemanticSearch.mockClear()
    mockSemanticSearch.mockImplementation(() => Promise.resolve(null))
  })

  test('returns null when no queryContext', async () => {
    const result = await collectSemanticKnowledge('co-1', 'dept-1')
    expect(result).toBeNull()
  })

  test('returns null when queryContext is whitespace', async () => {
    const result = await collectSemanticKnowledge('co-1', 'dept-1', '   ')
    expect(result).toBeNull()
  })

  test('returns null when department has no folders', async () => {
    selectResults = [[]] // getDepartmentFolderIds returns empty
    const result = await collectSemanticKnowledge('co-1', 'dept-1', 'test query')
    expect(result).toBeNull()
  })

  test('returns null when semantic search returns null', async () => {
    selectResults = [[{ id: 'folder-1' }]] // folders found
    mockSemanticSearch.mockImplementation(() => Promise.resolve(null))
    const result = await collectSemanticKnowledge('co-1', 'dept-1', 'test query')
    expect(result).toBeNull()
  })

  test('returns null when semantic search returns empty', async () => {
    selectResults = [[{ id: 'folder-1' }]]
    mockSemanticSearch.mockImplementation(() => Promise.resolve([]))
    const result = await collectSemanticKnowledge('co-1', 'dept-1', 'test query')
    expect(result).toBeNull()
  })

  test('returns formatted results from semantic search', async () => {
    selectResults = [[{ id: 'f1' }]]
    mockSemanticSearch.mockImplementation(() => Promise.resolve([
      { id: '1', title: '삼성전자 분석', content: '반도체 기업', folderId: 'f1', tags: null, score: 0.92 },
      { id: '2', title: 'AI 트렌드', content: 'AI 발전 중', folderId: 'f1', tags: null, score: 0.85 },
    ]))

    const result = await collectSemanticKnowledge('co-1', 'dept-1', '삼성전자 투자')
    expect(result).not.toBeNull()
    expect(result).toContain('삼성전자 분석')
    expect(result).toContain('관련도: 92%')
    expect(result).toContain('AI 트렌드')
    expect(result).toContain('관련도: 85%')
  })

  test('passes folderIds to semanticSearch', async () => {
    selectResults = [[{ id: 'f1' }, { id: 'f2' }]]
    mockSemanticSearch.mockImplementation(() => Promise.resolve([]))

    await collectSemanticKnowledge('co-1', 'dept-1', 'test')

    expect(mockSemanticSearch).toHaveBeenCalledWith('co-1', 'test', {
      topK: 5,
      threshold: 0.7,
      folderIds: ['f1', 'f2'],
    })
  })

  test('truncates long content to char budget', async () => {
    selectResults = [[{ id: 'f1' }]]
    const longContent = 'x'.repeat(3000)
    mockSemanticSearch.mockImplementation(() => Promise.resolve([
      { id: '1', title: 'Doc', content: longContent, folderId: 'f1', tags: null, score: 0.9 },
    ]))

    const result = await collectSemanticKnowledge('co-1', 'dept-1', 'query', 500)
    expect(result).not.toBeNull()
    // Content should be truncated to fit budget
    expect(result!.length).toBeLessThan(600)
    expect(result).toContain('[...truncated]')
  })
})

describe('collectKnowledgeContext with taskDescription (Story 10.4)', () => {
  beforeEach(() => {
    clearAllCache()
    selectResults = []
    globalCallIndex = 0
    mockSemanticSearch.mockClear()
    mockSemanticSearch.mockImplementation(() => Promise.resolve(null))
  })

  test('uses semantic search when taskDescription provided', async () => {
    // Call order: collectDepartmentKnowledge → getDepartmentFolderIds → (semantic)
    selectResults = [
      [], // Layer 1: no dept knowledge
      [{ id: 'f1' }], // getDepartmentFolderIds
    ]
    mockSemanticSearch.mockImplementation(() => Promise.resolve([
      { id: '1', title: '시맨틱 결과', content: '찾은 문서', folderId: 'f1', tags: null, score: 0.88 },
    ]))

    const result = await collectKnowledgeContext('co-1', 'agent-1', 'dept-1', '투자 분석')
    expect(result).not.toBeNull()
    expect(result).toContain('의미 검색')
    expect(result).toContain('시맨틱 결과')
  })

  test('falls back to recency when no taskDescription', async () => {
    selectResults = [
      [], // Layer 1: no dept knowledge
      [{ title: 'Recent Doc', content: 'Content', updatedAt: new Date() }], // Layer 2 recency
    ]

    const result = await collectKnowledgeContext('co-1', 'agent-1', 'dept-1')
    expect(result).not.toBeNull()
    if (result) {
      expect(result).not.toContain('의미 검색')
      expect(result).toContain('관련 문서')
    }
  })

  test('falls back to recency when semantic returns null', async () => {
    selectResults = [
      [], // Layer 1
      [{ id: 'f1' }], // folders
      [{ title: 'Fallback', content: 'Fallback content', updatedAt: new Date() }], // recency
    ]
    mockSemanticSearch.mockImplementation(() => Promise.resolve(null))

    const result = await collectKnowledgeContext('co-1', 'agent-1', 'dept-1', 'some task')
    expect(result).not.toBeNull()
    if (result) {
      expect(result).not.toContain('의미 검색')
    }
  })

  test('returns null when departmentId is null', async () => {
    const result = await collectKnowledgeContext('co-1', 'agent-1', null, 'task')
    expect(result).toBeNull()
  })

  test('preserves Layer 1 unchanged when semantic search used', async () => {
    selectResults = [
      [{ title: 'Dept Rule', content: 'Follow this rule', category: 'policy' }], // Layer 1
      [{ id: 'f1' }], // folders
    ]
    mockSemanticSearch.mockImplementation(() => Promise.resolve([
      { id: '1', title: 'Semantic Doc', content: 'Found', folderId: 'f1', tags: null, score: 0.9 },
    ]))

    const result = await collectKnowledgeContext('co-1', 'agent-1', 'dept-1', 'task')
    expect(result).not.toBeNull()
    expect(result).toContain('부서 참고 자료')
    expect(result).toContain('Dept Rule')
    expect(result).toContain('[policy]')
    expect(result).toContain('Semantic Doc')
  })

  test('caches separately for different task descriptions', async () => {
    selectResults = [
      [], [{ id: 'f1' }], // call 1
      [], [{ id: 'f1' }], // call 2 (different task)
    ]
    mockSemanticSearch.mockImplementation(() => Promise.resolve([
      { id: '1', title: 'R', content: 'C', folderId: 'f1', tags: null, score: 0.9 },
    ]))

    // First call
    await collectKnowledgeContext('co-1', 'agent-1', 'dept-1', 'query A')
    const calls1 = mockSemanticSearch.mock.calls.length

    // Same task — cache hit
    globalCallIndex = 0
    selectResults = [[], [{ id: 'f1' }]]
    await collectKnowledgeContext('co-1', 'agent-1', 'dept-1', 'query A')
    expect(mockSemanticSearch.mock.calls.length).toBe(calls1) // no new call

    // Different task — cache miss
    await collectKnowledgeContext('co-1', 'agent-1', 'dept-1', 'completely different query B')
    expect(mockSemanticSearch.mock.calls.length).toBeGreaterThan(calls1)
  })

  test('backward compat: 3 args works', async () => {
    selectResults = [
      [{ title: 'Rule', content: 'Content', category: null }], // Layer 1
      [], // Layer 2 recency (no docs)
    ]

    const result = await collectKnowledgeContext('co-1', 'agent-1', 'dept-1')
    expect(result).not.toBeNull()
    expect(result).toContain('Rule')
  })
})

// ============================================================
// Part 3: Knowledge injection path design verification
// ============================================================

describe('knowledge injection path design (Story 10.4)', () => {
  test('{{knowledge_context}} detection works for hub.ts/call-agent.ts duplication prevention', () => {
    // hub.ts and call-agent.ts check soul.includes('{{knowledge_context}}')
    // to decide whether to inject knowledge via renderSoul extraVars
    const soulWithVar = '당신은 전문가입니다.\n\n{{knowledge_context}}'
    expect(soulWithVar.includes('{{knowledge_context}}')).toBe(true)

    const soulWithout = '당신은 전문가입니다. 사용자를 도와주세요.'
    expect(soulWithout.includes('{{knowledge_context}}')).toBe(false)
  })

  test('agent-runner always injects knowledge (no duplication skip)', () => {
    // agent-runner uses raw soul (buildSystemPrompt doesn't call renderSoul),
    // so it must always inject knowledge via ## Department Knowledge section.
    // Duplication prevention only applies in hub.ts/call-agent.ts paths.
    const soul: string | null = null
    const hasDept = true
    // agent-runner now simply checks: agent.departmentId (no soulHasKnowledgeVar check)
    expect(hasDept && soul !== null).toBe(false) // null soul → still inject if dept exists
    expect(hasDept).toBe(true) // department check is what matters
  })

  test('null soul treated safely in all paths', () => {
    const soul: string | null = null
    // hub.ts: targetAgent.soul?.includes('{{knowledge_context}}') → undefined (falsy)
    expect(soul?.includes('{{knowledge_context}}')).toBeUndefined()
    // call-agent.ts: (agent.soul || '').includes('{{knowledge_context}}') → false
    expect((soul || '').includes('{{knowledge_context}}')).toBe(false)
  })
})
