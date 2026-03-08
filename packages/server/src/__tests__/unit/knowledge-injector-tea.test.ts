import { describe, test, expect, beforeEach, mock } from 'bun:test'

// ============================================================
// TEA: Risk-Based Test Expansion for Story 16-3
// Focus: Edge cases, boundary conditions, security, integration
// ============================================================

let selectResults: unknown[][] = []
let globalCallIndex = 0
let updateCalled = false

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
    limitResult.offset = mock(() => ({
      then: (resolve: (v: unknown) => void) => { resolve(r) },
    }))
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
      set: mock(() => ({
        where: mock(() => {
          updateCalled = true
          return Promise.resolve()
        }),
      })),
    })),
  },
}))

mock.module('../../db/schema', () => ({
  departmentKnowledge: {
    companyId: 'dk.company_id', departmentId: 'dk.department_id',
    title: 'dk.title', content: 'dk.content', category: 'dk.category',
    updatedAt: 'dk.updated_at',
  },
  knowledgeDocs: {
    id: 'kd.id', title: 'kd.title', content: 'kd.content',
    folderId: 'kd.folder_id', isActive: 'kd.is_active', updatedAt: 'kd.updated_at',
  },
  knowledgeFolders: {
    id: 'kf.id', companyId: 'kf.company_id',
    departmentId: 'kf.department_id', isActive: 'kf.is_active',
  },
  agentMemories: {
    id: 'am.id', companyId: 'am.company_id', agentId: 'am.agent_id',
    memoryType: 'am.memory_type', key: 'am.key', content: 'am.content',
    isActive: 'am.is_active', usageCount: 'am.usage_count', lastUsedAt: 'am.last_used_at',
  },
  agents: { id: 'a.id', companyId: 'a.company_id', departmentId: 'a.department_id' },
}))

import {
  collectKnowledgeContext,
  collectAgentMemoryContext,
  collectDepartmentKnowledge,
  collectDepartmentDocs,
  collectAgentMemories,
  getInjectionPreview,
  clearKnowledgeCache,
  clearAllCache,
} from '../../services/knowledge-injector'

const C = 'comp-1'
const D = 'dept-1'
const A = 'agent-1'

describe('TEA: Knowledge Injector Edge Cases & Security', () => {
  beforeEach(() => {
    selectResults = []
    globalCallIndex = 0
    updateCalled = false
    clearAllCache()
  })

  // === Edge Cases: Null/Empty Content ===

  describe('Null and empty content handling', () => {
    test('doc with null content is included with title only', async () => {
      selectResults = [[{ title: '제목만', content: null, updatedAt: new Date() }]]
      const result = await collectDepartmentDocs(C, D, 4000)
      expect(result).toHaveLength(1)
      expect(result[0].content).toBeNull()
    })

    test('doc with empty string content is included', async () => {
      selectResults = [[{ title: '빈 문서', content: '', updatedAt: new Date() }]]
      const result = await collectDepartmentDocs(C, D, 4000)
      expect(result).toHaveLength(1)
      expect(result[0].content).toBe('')
    })

    test('department knowledge with empty content', async () => {
      selectResults = [[{ title: '빈 참고', content: '', category: null }]]
      const result = await collectDepartmentKnowledge(C, D)
      expect(result).toHaveLength(1)
      expect(result[0].content).toBe('')
    })

    test('memory with empty content still counted', async () => {
      selectResults = [[{ id: 'm1', key: '키', content: '', memoryType: 'learning' }]]
      const result = await collectAgentMemories(C, A, 2000)
      expect(result).toHaveLength(1)
    })
  })

  // === Boundary: Budget Exhaustion ===

  describe('Exact budget boundary conditions', () => {
    test('doc exactly at budget limit is included', async () => {
      // A doc with title "X" (1 char + 10 overhead = 11) + content of exactly remaining budget
      const budget = 100
      const content = 'a'.repeat(budget - 11) // 89 chars
      selectResults = [[{ title: 'X', content, updatedAt: new Date() }]]
      const result = await collectDepartmentDocs(C, D, budget)
      expect(result).toHaveLength(1)
    })

    test('doc at budget+1 triggers truncation', async () => {
      const budget = 100
      const content = 'a'.repeat(budget) // Way over budget with title overhead
      selectResults = [[{ title: 'X', content, updatedAt: new Date() }]]
      const result = await collectDepartmentDocs(C, D, budget)
      // Should either be truncated or excluded
      if (result.length > 0) {
        expect(result[0].content!.length).toBeLessThanOrEqual(budget)
      }
    })

    test('zero budget returns empty', async () => {
      selectResults = [[{ title: '문서', content: 'content', updatedAt: new Date() }]]
      const result = await collectDepartmentDocs(C, D, 0)
      expect(result).toHaveLength(0)
    })

    test('negative budget returns empty', async () => {
      selectResults = [[{ title: '문서', content: 'content', updatedAt: new Date() }]]
      const result = await collectDepartmentDocs(C, D, -1)
      expect(result).toHaveLength(0)
    })

    test('memory budget exactly reached stops adding', async () => {
      const mems = [
        { id: 'm1', key: 'k', content: 'x'.repeat(980), memoryType: 'learning' },
        { id: 'm2', key: 'k', content: 'x'.repeat(980), memoryType: 'learning' },
        { id: 'm3', key: 'k', content: 'x'.repeat(980), memoryType: 'learning' },
      ]
      selectResults = [mems]
      const result = await collectAgentMemories(C, A, 2000)
      expect(result.length).toBeLessThan(3) // Can't fit all 3
      expect(result.length).toBeGreaterThan(0)
    })
  })

  // === Unicode & Special Characters ===

  describe('Unicode and special characters', () => {
    test('Korean content in department knowledge', async () => {
      selectResults = [
        [{ title: '한국어 규칙', content: '할인율은 최대 20%입니다. 🎉', category: '운영' }],
        [],
      ]
      const result = await collectKnowledgeContext(C, A, D)
      expect(result).toContain('한국어 규칙')
      expect(result).toContain('할인율은 최대 20%')
    })

    test('markdown special chars in content', async () => {
      selectResults = [
        [{ title: '특수문자', content: '**bold** | `code` | [link](url)', category: null }],
        [],
      ]
      const result = await collectKnowledgeContext(C, A, D)
      expect(result).toContain('**bold**')
    })

    test('emoji in memory key', async () => {
      selectResults = [[{ id: 'm1', key: '🔑 중요 학습', content: '내용', memoryType: 'learning' }]]
      const result = await collectAgentMemories(C, A, 2000)
      expect(result[0].key).toBe('🔑 중요 학습')
    })
  })

  // === Cache Edge Cases ===

  describe('Cache edge cases', () => {
    test('null result is cached (not just truthy values)', async () => {
      // First call: no data -> returns null
      selectResults = [[], []]
      const r1 = await collectKnowledgeContext(C, A, D)
      expect(r1).toBeNull()

      // Second call: should return cached null without DB hit
      // If it hits DB, globalCallIndex would advance
      const prevIndex = globalCallIndex
      const r2 = await collectKnowledgeContext(C, A, D)
      expect(r2).toBeNull()
      expect(globalCallIndex).toBe(prevIndex) // No DB call happened
    })

    test('different departments have separate cache entries', async () => {
      selectResults = [
        [{ title: '부서1 지식', content: '내용1', category: null }],
        [],
        [{ title: '부서2 지식', content: '내용2', category: null }],
        [],
      ]

      const r1 = await collectKnowledgeContext(C, A, 'dept-1')
      const r2 = await collectKnowledgeContext(C, A, 'dept-2')
      expect(r1).toContain('부서1 지식')
      expect(r2).toContain('부서2 지식')
    })

    test('different agents have separate memory cache', async () => {
      selectResults = [
        [{ id: 'm1', key: '에이전트1', content: '기억1', memoryType: 'learning' }],
        [{ id: 'm2', key: '에이전트2', content: '기억2', memoryType: 'learning' }],
      ]

      const r1 = await collectAgentMemoryContext(C, 'agent-1')
      const r2 = await collectAgentMemoryContext(C, 'agent-2')
      expect(r1).toContain('에이전트1')
      expect(r2).toContain('에이전트2')
    })
  })

  // === Memory Usage Tracking ===

  describe('Memory usage tracking', () => {
    test('collectAgentMemoryContext triggers usage update', async () => {
      selectResults = [[{ id: 'm1', key: '학습', content: '내용', memoryType: 'learning' }]]
      await collectAgentMemoryContext(C, A)
      // Give fire-and-forget time to execute
      await new Promise(r => setTimeout(r, 50))
      expect(updateCalled).toBe(true)
    })

    test('empty memories do not trigger usage update', async () => {
      selectResults = [[]]
      await collectAgentMemoryContext(C, A)
      await new Promise(r => setTimeout(r, 50))
      expect(updateCalled).toBe(false)
    })
  })

  // === AgentRunner Integration Context ===

  describe('Context format for AgentRunner', () => {
    test('knowledge context has expected section headers', async () => {
      selectResults = [
        [{ title: '규칙', content: '내용', category: '카테고리' }],
        [{ title: '문서', content: '문서 내용', updatedAt: new Date() }],
      ]
      const result = await collectKnowledgeContext(C, A, D)
      expect(result).toContain('### 부서 참고 자료')
      expect(result).toContain('### 관련 문서')
    })

    test('memory context has formatted entries', async () => {
      selectResults = [[
        { id: 'm1', key: '핵심', content: '중요한 학습', memoryType: 'insight' },
      ]]
      const result = await collectAgentMemoryContext(C, A)
      expect(result).toContain('**핵심** (insight): 중요한 학습')
    })

    test('category is shown in brackets when present', async () => {
      selectResults = [
        [{ title: '규칙', content: '내용', category: '운영' }],
        [],
      ]
      const result = await collectKnowledgeContext(C, A, D)
      expect(result).toContain('[운영]')
    })

    test('no category bracket when category is null', async () => {
      selectResults = [
        [{ title: '규칙', content: '내용', category: null }],
        [],
      ]
      const result = await collectKnowledgeContext(C, A, D)
      expect(result).not.toContain('[]')
      expect(result).not.toContain('[null]')
    })
  })

  // === Injection Preview ===

  describe('Injection preview response shape', () => {
    test('preview has all required fields', async () => {
      selectResults = [
        [{ title: '지식', content: '내용', category: 'cat' }],
        [{ title: '문서', content: '문서 내용', updatedAt: new Date() }],
        [{ id: 'm1', key: '기억', content: '기억 내용', memoryType: 'learning' }],
      ]
      const preview = await getInjectionPreview(C, A, D)
      expect(preview).toHaveProperty('departmentKnowledge')
      expect(preview).toHaveProperty('knowledgeDocs')
      expect(preview).toHaveProperty('agentMemories')
      expect(preview).toHaveProperty('totalChars')
      expect(preview).toHaveProperty('truncated')
      expect(typeof preview.totalChars).toBe('number')
      expect(typeof preview.truncated).toBe('boolean')
    })

    test('preview excerpt is max 200 chars', async () => {
      const longContent = 'x'.repeat(500)
      selectResults = [
        [],
        [{ title: '긴 문서', content: longContent, updatedAt: new Date() }],
        [],
      ]
      const preview = await getInjectionPreview(C, A, D)
      expect(preview.knowledgeDocs[0].excerpt.length).toBeLessThanOrEqual(200)
    })

    test('preview without department returns empty dept arrays', async () => {
      selectResults = [[]] // only memories query
      const preview = await getInjectionPreview(C, A, null)
      expect(preview.departmentKnowledge).toHaveLength(0)
      expect(preview.knowledgeDocs).toHaveLength(0)
    })
  })

  // === Layer Priority ===

  describe('Layer 1 priority over Layer 2', () => {
    test('when Layer 1 fills budget, Layer 2 is skipped', async () => {
      // Fill Layer 1 with enough content to exhaust 4000 char budget
      const largeItems = Array.from({ length: 20 }, (_, i) => ({
        title: `규칙 ${i}`,
        content: 'x'.repeat(300),
        category: null,
      }))
      selectResults = [
        largeItems, // Layer 1 fills budget
        // Layer 2 should not add much
        [{ title: 'doc', content: 'y'.repeat(500), updatedAt: new Date() }],
      ]
      const result = await collectKnowledgeContext(C, A, D)
      expect(result).toContain('부서 참고 자료')
      // Result should exist and be within budget
      expect(result!.length).toBeLessThanOrEqual(5000) // 4000 + formatting overhead
    })
  })

  // === Doc Truncation ===

  describe('Document content truncation', () => {
    test('doc over 2000 chars gets truncated marker', async () => {
      const longDoc = 'a'.repeat(3000)
      selectResults = [[{ title: '긴 문서', content: longDoc, updatedAt: new Date() }]]
      const result = await collectDepartmentDocs(C, D, 10000)
      expect(result[0].content).toContain('[...truncated]')
      expect(result[0].content!.length).toBeLessThan(3000)
    })

    test('doc under 2000 chars is not truncated', async () => {
      const shortDoc = 'a'.repeat(500)
      selectResults = [[{ title: '짧은 문서', content: shortDoc, updatedAt: new Date() }]]
      const result = await collectDepartmentDocs(C, D, 10000)
      expect(result[0].content).toBe(shortDoc)
      expect(result[0].content).not.toContain('[...truncated]')
    })
  })
})
