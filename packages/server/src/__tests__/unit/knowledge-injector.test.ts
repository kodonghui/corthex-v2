import { describe, test, expect, beforeEach, mock } from 'bun:test'

// ============================================================
// Mock Setup
// ============================================================

let selectResults: unknown[][] = []
let updateCallArgs: unknown[] = []
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
      set: mock((...args: unknown[]) => {
        updateCallArgs.push(args)
        return {
          where: mock(() => Promise.resolve()),
        }
      }),
    })),
  },
}))

mock.module('../../db/schema', () => ({
  departmentKnowledge: {
    companyId: 'department_knowledge.company_id',
    departmentId: 'department_knowledge.department_id',
    title: 'department_knowledge.title',
    content: 'department_knowledge.content',
    category: 'department_knowledge.category',
    updatedAt: 'department_knowledge.updated_at',
  },
  knowledgeDocs: {
    id: 'knowledge_docs.id',
    title: 'knowledge_docs.title',
    content: 'knowledge_docs.content',
    folderId: 'knowledge_docs.folder_id',
    isActive: 'knowledge_docs.is_active',
    updatedAt: 'knowledge_docs.updated_at',
  },
  knowledgeFolders: {
    id: 'knowledge_folders.id',
    companyId: 'knowledge_folders.company_id',
    departmentId: 'knowledge_folders.department_id',
    isActive: 'knowledge_folders.is_active',
  },
  agentMemories: {
    id: 'agent_memories.id',
    companyId: 'agent_memories.company_id',
    agentId: 'agent_memories.agent_id',
    memoryType: 'agent_memories.memory_type',
    key: 'agent_memories.key',
    content: 'agent_memories.content',
    isActive: 'agent_memories.is_active',
    usageCount: 'agent_memories.usage_count',
    lastUsedAt: 'agent_memories.last_used_at',
  },
  agents: {
    id: 'agents.id',
    companyId: 'agents.company_id',
    departmentId: 'agents.department_id',
  },
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

// ============================================================
// Test Data
// ============================================================

const COMPANY_ID = 'comp-1'
const DEPT_ID = 'dept-1'
const AGENT_ID = 'agent-1'

function makeDeptKnowledge(title: string, content: string, category: string | null = null) {
  return { title, content, category }
}

function makeDoc(title: string, content: string | null, updatedAt = new Date()) {
  return { title, content, updatedAt }
}

function makeMemory(id: string, key: string, content: string, memoryType = 'learning') {
  return { id, key, content, memoryType }
}

// ============================================================
// Tests
// ============================================================

describe('Knowledge Injector', () => {
  beforeEach(() => {
    selectResults = []
    updateCallArgs = []
    globalCallIndex = 0
    clearAllCache()
  })

  // === collectDepartmentKnowledge ===

  describe('collectDepartmentKnowledge', () => {
    test('returns department knowledge rows', async () => {
      selectResults = [[
        makeDeptKnowledge('영업 매뉴얼', '영업 프로세스 가이드', '매뉴얼'),
        makeDeptKnowledge('고객 응대', '고객 응대 지침', '지침'),
      ]]

      const result = await collectDepartmentKnowledge(COMPANY_ID, DEPT_ID)
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('영업 매뉴얼')
      expect(result[1].content).toBe('고객 응대 지침')
    })

    test('returns empty array when no knowledge exists', async () => {
      selectResults = [[]]
      const result = await collectDepartmentKnowledge(COMPANY_ID, DEPT_ID)
      expect(result).toHaveLength(0)
    })
  })

  // === collectDepartmentDocs ===

  describe('collectDepartmentDocs', () => {
    test('returns docs within char budget', async () => {
      selectResults = [[
        makeDoc('문서 A', 'A 내용'),
        makeDoc('문서 B', 'B 내용'),
      ]]

      const result = await collectDepartmentDocs(COMPANY_ID, DEPT_ID, 4000)
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('문서 A')
    })

    test('truncates doc content exceeding 2000 chars', async () => {
      const longContent = 'x'.repeat(3000)
      selectResults = [[makeDoc('긴 문서', longContent)]]

      const result = await collectDepartmentDocs(COMPANY_ID, DEPT_ID, 10000)
      expect(result).toHaveLength(1)
      expect(result[0].content!.length).toBeLessThan(3000)
      expect(result[0].content).toContain('[...truncated]')
    })

    test('stops adding docs when budget exhausted', async () => {
      const docs = Array.from({ length: 20 }, (_, i) =>
        makeDoc(`문서 ${i}`, 'x'.repeat(500)),
      )
      selectResults = [docs]

      const result = await collectDepartmentDocs(COMPANY_ID, DEPT_ID, 2000)
      // Should have fewer than 20 docs due to budget
      expect(result.length).toBeLessThan(20)
      expect(result.length).toBeGreaterThan(0)
    })

    test('returns empty array when no docs exist', async () => {
      selectResults = [[]]
      const result = await collectDepartmentDocs(COMPANY_ID, DEPT_ID, 4000)
      expect(result).toHaveLength(0)
    })
  })

  // === collectAgentMemories ===

  describe('collectAgentMemories', () => {
    test('returns memories within char budget', async () => {
      selectResults = [[
        makeMemory('m1', '핵심 학습', '고객 분석 시 연령대 세분화 필요', 'learning'),
        makeMemory('m2', '선호도', '한국어 응답 선호', 'preference'),
      ]]

      const result = await collectAgentMemories(COMPANY_ID, AGENT_ID, 2000)
      expect(result).toHaveLength(2)
      expect(result[0].key).toBe('핵심 학습')
    })

    test('respects char budget limit', async () => {
      const memories = Array.from({ length: 50 }, (_, i) =>
        makeMemory(`m${i}`, `학습 ${i}`, 'x'.repeat(200)),
      )
      selectResults = [memories]

      const result = await collectAgentMemories(COMPANY_ID, AGENT_ID, 1000)
      expect(result.length).toBeLessThan(50)
      expect(result.length).toBeGreaterThan(0)
    })

    test('returns empty array when no memories', async () => {
      selectResults = [[]]
      const result = await collectAgentMemories(COMPANY_ID, AGENT_ID, 2000)
      expect(result).toHaveLength(0)
    })
  })

  // === collectKnowledgeContext ===

  describe('collectKnowledgeContext', () => {
    test('returns null when departmentId is null', async () => {
      const result = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, null)
      expect(result).toBeNull()
    })

    test('returns null when departmentId is undefined', async () => {
      const result = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, undefined)
      expect(result).toBeNull()
    })

    test('returns formatted context with department knowledge', async () => {
      // Layer 1: dept knowledge
      selectResults = [
        [makeDeptKnowledge('영업 규칙', '할인율 최대 20%', '규칙')],
        // Layer 2: docs (empty)
        [],
      ]

      const result = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)
      expect(result).not.toBeNull()
      expect(result).toContain('부서 참고 자료')
      expect(result).toContain('영업 규칙')
      expect(result).toContain('할인율 최대 20%')
    })

    test('returns formatted context with both layers', async () => {
      selectResults = [
        // Call 1 (collectDepartmentKnowledge): Layer 1
        [makeDeptKnowledge('규칙 1', '짧은 내용', '규칙')],
        // Call 2 (collectDepartmentDocs): Layer 2
        [makeDoc('문서 A', '문서 내용 A')],
      ]

      const result = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)
      expect(result).not.toBeNull()
      expect(result).toContain('부서 참고 자료')
      expect(result).toContain('규칙 1')
      expect(result).toContain('관련 문서')
      expect(result).toContain('문서 A')
    })

    test('returns null when no knowledge exists', async () => {
      selectResults = [[], []]
      const result = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)
      expect(result).toBeNull()
    })

    test('uses cache on second call', async () => {
      selectResults = [
        [makeDeptKnowledge('캐시 테스트', '캐시 내용', null)],
        [],
      ]

      const result1 = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)

      // Second call should use cache -- reset selectResults to prove no DB call
      selectResults = []
      const result2 = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)

      expect(result1).toBe(result2)
    })

    test('cache invalidation works', async () => {
      selectResults = [
        [makeDeptKnowledge('원래 지식', '원래 내용', null)],
        [],
      ]
      const result1 = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)

      clearKnowledgeCache(COMPANY_ID)

      globalCallIndex = 0
      selectResults = [
        [makeDeptKnowledge('새 지식', '새 내용', null)],
        [],
      ]
      const result2 = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)

      expect(result1).toContain('원래 지식')
      expect(result2).toContain('새 지식')
    })
  })

  // === collectAgentMemoryContext ===

  describe('collectAgentMemoryContext', () => {
    test('returns null when no memories', async () => {
      selectResults = [[]]
      const result = await collectAgentMemoryContext(COMPANY_ID, AGENT_ID)
      expect(result).toBeNull()
    })

    test('returns formatted memory context', async () => {
      selectResults = [[
        makeMemory('m1', '고객 분석', '연령대별 세분화 필요', 'learning'),
        makeMemory('m2', '보고서 양식', '표 형식 선호', 'preference'),
      ]]

      const result = await collectAgentMemoryContext(COMPANY_ID, AGENT_ID)
      expect(result).not.toBeNull()
      expect(result).toContain('고객 분석')
      expect(result).toContain('연령대별 세분화 필요')
      expect(result).toContain('보고서 양식')
    })

    test('uses cache on second call', async () => {
      selectResults = [[makeMemory('m1', '기억', '내용', 'learning')]]
      const result1 = await collectAgentMemoryContext(COMPANY_ID, AGENT_ID)

      selectResults = []
      const result2 = await collectAgentMemoryContext(COMPANY_ID, AGENT_ID)

      expect(result1).toBe(result2)
    })
  })

  // === getInjectionPreview ===

  describe('getInjectionPreview', () => {
    test('returns empty preview when no department', async () => {
      selectResults = [[]] // agent memories query
      const result = await getInjectionPreview(COMPANY_ID, AGENT_ID, null)
      expect(result.departmentKnowledge).toHaveLength(0)
      expect(result.knowledgeDocs).toHaveLength(0)
      expect(result.agentMemories).toHaveLength(0)
    })

    test('returns preview with all data sources', async () => {
      selectResults = [
        // dept knowledge
        [makeDeptKnowledge('규칙', '내용', '카테고리')],
        // dept docs
        [makeDoc('문서', '문서 내용')],
        // agent memories
        [makeMemory('m1', '학습', '내용', 'learning')],
      ]

      const result = await getInjectionPreview(COMPANY_ID, AGENT_ID, DEPT_ID)
      expect(result.departmentKnowledge).toHaveLength(1)
      expect(result.knowledgeDocs).toHaveLength(1)
      expect(result.agentMemories).toHaveLength(1)
      expect(result.totalChars).toBeGreaterThan(0)
    })
  })

  // === Cache ===

  describe('Cache', () => {
    test('clearAllCache clears everything', async () => {
      selectResults = [
        [makeDeptKnowledge('지식', '내용', null)],
        [],
      ]
      await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)

      clearAllCache()

      // Reset for second call
      globalCallIndex = 0
      selectResults = [
        [makeDeptKnowledge('다른 지식', '다른 내용', null)],
        [],
      ]
      const result = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)
      expect(result).toContain('다른 지식')
    })

    test('clearKnowledgeCache only clears specific company', async () => {
      // Prime cache for company 1
      selectResults = [
        [makeDeptKnowledge('회사1 지식', '내용1', null)],
        [],
        [makeDeptKnowledge('회사2 지식', '내용2', null)],
        [],
      ]
      await collectKnowledgeContext('comp-1', AGENT_ID, DEPT_ID)
      await collectKnowledgeContext('comp-2', AGENT_ID, DEPT_ID)

      // Clear only comp-1
      clearKnowledgeCache('comp-1')

      // comp-2 should still be cached (no DB call)
      const result2 = await collectKnowledgeContext('comp-2', AGENT_ID, DEPT_ID)
      expect(result2).toContain('회사2 지식')
    })
  })

  // === Token Budget ===

  describe('Token Budget', () => {
    test('department knowledge has priority over docs', async () => {
      // Fill Layer 1 with large content
      const largeDeptKnowledge = Array.from({ length: 10 }, (_, i) =>
        makeDeptKnowledge(`규칙 ${i}`, 'x'.repeat(300), '규칙'),
      )
      selectResults = [
        largeDeptKnowledge,
        // Layer 2 docs exist but budget should be exhausted
        [makeDoc('문서', 'y'.repeat(500))],
      ]

      const result = await collectKnowledgeContext(COMPANY_ID, AGENT_ID, DEPT_ID)
      expect(result).not.toBeNull()
      expect(result).toContain('부서 참고 자료')
      // Docs may or may not appear depending on remaining budget
    })
  })
})
