import { describe, test, expect, mock, beforeEach } from 'bun:test'

// === Mock setup ===

let mockSelectResult: any[] = []
let mockInsertResult: any[] = [{ id: 'mem-1' }]
let mockUpdateResult: any[] = [{ id: 'mem-1' }]
let mockExecuteResult: any = { rows: [] }

const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      orderBy: mock(() => ({
        limit: mock(() => ({
          offset: mock(() => Promise.resolve(mockSelectResult)),
        })),
      })),
    })),
  })),
}))

const mockUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => ({
      returning: mock(() => Promise.resolve(mockUpdateResult)),
    })),
  })),
}))

const mockInsert = mock(() => ({
  values: mock(() => ({
    returning: mock(() => Promise.resolve(mockInsertResult)),
  })),
}))

const mockExecute = mock(() => Promise.resolve(mockExecuteResult))

mock.module('../../db', () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
    insert: mockInsert,
    execute: mockExecute,
  },
}))

mock.module('../../db/schema', () => ({
  observations: { companyId: 'company_id', agentId: 'agent_id', reflected: 'reflected', flagged: 'flagged', importance: 'importance', createdAt: 'created_at', id: 'id' },
  agentMemories: { companyId: 'company_id', agentId: 'agent_id', id: 'id', source: 'source', category: 'category', isActive: 'is_active', createdAt: 'created_at', updatedAt: 'updated_at', confidence: 'confidence', embedding: 'embedding' },
  agents: {},
  departments: {},
  knowledgeDocs: {},
  agentTools: {},
  toolDefinitions: {},
  users: {},
  costRecords: { companyId: 'company_id', source: 'source', createdAt: 'created_at' },
  presets: {},
  sketches: {},
  tierConfigs: {},
  semanticCache: {},
  agentReports: {},
  toolCallEvents: {},
  mcpServerConfigs: {},
  agentMcpAccess: {},
  mcpLifecycleEvents: {},
  credentials: {},
  activityLogs: {},
}))

mock.module('../../db/tenant-helpers', () => ({
  withTenant: mock(() => ({})),
  scopedWhere: mock((...args: any[]) => ({})),
  scopedInsert: mock((data: any) => data),
}))

mock.module('../../db/pgvector', () => ({
  cosineDistance: mock(() => ({})),
}))

mock.module('../../lib/credential-crypto', () => ({
  decrypt: mock((v: string) => v),
}))

mock.module('pgvector', () => ({
  toSql: mock((v: number[]) => `[${v.join(',')}]`),
  fromSql: mock((v: string) => []),
}))

beforeEach(() => {
  mockSelectResult = []
  mockInsertResult = [{ id: 'mem-1' }]
  mockUpdateResult = [{ id: 'mem-1' }]
  mockExecuteResult = { rows: [] }
})

describe('Story 28.5: Agent Memories Extension', () => {

  // === Schema verification ===

  test('P0: schema has embedding column with 1024 dimensions', async () => {
    const schema = await Bun.file('packages/server/src/db/schema.ts').text()
    // Verify within agent_memories block
    const memBlock = schema.slice(schema.indexOf("pgTable('agent_memories'"), schema.indexOf('agentMemoriesRelations'))
    expect(memBlock).toContain("embedding: vector('embedding', { dimensions: 1024 })")
  })

  test('P0: schema has category column', async () => {
    const schema = await Bun.file('packages/server/src/db/schema.ts').text()
    const memBlock = schema.slice(schema.indexOf("pgTable('agent_memories'"), schema.indexOf('agentMemoriesRelations'))
    expect(memBlock).toContain("category: varchar('category'")
  })

  test('P0: schema has observationIds column', async () => {
    const schema = await Bun.file('packages/server/src/db/schema.ts').text()
    const memBlock = schema.slice(schema.indexOf("pgTable('agent_memories'"), schema.indexOf('agentMemoriesRelations'))
    expect(memBlock).toContain("observationIds: text('observation_ids')")
  })

  test('P0: source default remains "manual"', async () => {
    const schema = await Bun.file('packages/server/src/db/schema.ts').text()
    const memBlock = schema.slice(schema.indexOf("pgTable('agent_memories'"), schema.indexOf('agentMemoriesRelations'))
    expect(memBlock).toContain("source: varchar('source'")
    expect(memBlock).toContain(".default('manual')")
  })

  test('P0: embedding default is null (no default = nullable)', async () => {
    const schema = await Bun.file('packages/server/src/db/schema.ts').text()
    const memBlock = schema.slice(schema.indexOf("pgTable('agent_memories'"), schema.indexOf('agentMemoriesRelations'))
    // embedding should NOT have .notNull() — it's nullable
    const embeddingLine = memBlock.split('\n').find(l => l.includes("embedding: vector("))
    expect(embeddingLine).toBeDefined()
    expect(embeddingLine).not.toContain('.notNull()')
  })

  test('P0: category default is null (nullable)', async () => {
    const schema = await Bun.file('packages/server/src/db/schema.ts').text()
    const memBlock = schema.slice(schema.indexOf("pgTable('agent_memories'"), schema.indexOf('agentMemoriesRelations'))
    const categoryLine = memBlock.split('\n').find(l => l.includes("category: varchar("))
    expect(categoryLine).toBeDefined()
    expect(categoryLine).not.toContain('.notNull()')
  })

  // === Migration verification ===

  test('P0: migration creates HNSW index on embedding', async () => {
    const migration = await Bun.file('packages/server/src/db/migrations/0064_agent_memories_extension.sql').text()
    expect(migration).toContain('CREATE INDEX IF NOT EXISTS idx_agent_memories_embedding')
    expect(migration).toContain('USING hnsw (embedding vector_cosine_ops)')
  })

  test('P0: migration creates partial index for reflection source', async () => {
    const migration = await Bun.file('packages/server/src/db/migrations/0064_agent_memories_extension.sql').text()
    expect(migration).toContain('idx_agent_memories_reflection')
    expect(migration).toContain("WHERE source = 'reflection'")
    expect(migration).toContain('company_id, agent_id, created_at DESC')
  })

  // === Semantic search ===

  test('P0: searchMemoriesBySimilarity method exists in scoped-query', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(query).toContain('searchMemoriesBySimilarity')
    // Uses cosine similarity formula
    expect(query).toContain('1 - (embedding <=> ')
    expect(query).toContain('ORDER BY embedding <=>')
  })

  test('P0: searchMemoriesBySimilarity filters by company_id and agent_id', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    const searchBlock = query.slice(query.indexOf('searchMemoriesBySimilarity'), query.indexOf('listAgentMemories'))
    expect(searchBlock).toContain('company_id = ${companyId}')
    expect(searchBlock).toContain('agent_id = ${agentId}')
    expect(searchBlock).toContain('is_active = true')
    expect(searchBlock).toContain('embedding IS NOT NULL')
  })

  test('P0: searchMemoriesBySimilarity returns similarity score', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    const searchBlock = query.slice(query.indexOf('searchMemoriesBySimilarity'), query.indexOf('listAgentMemories'))
    expect(searchBlock).toContain('AS similarity')
    expect(searchBlock).toContain('>= ${minSimilarity}')
  })

  // === Source filter ===

  test('P1: listAgentMemories supports source filter', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    const listBlock = query.slice(query.indexOf('listAgentMemories'), query.indexOf('deleteAgentMemory'))
    expect(listBlock).toContain('opts?.source')
    expect(listBlock).toContain('agentMemories.source')
  })

  // === Category filter ===

  test('P1: listAgentMemories supports category filter', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    const listBlock = query.slice(query.indexOf('listAgentMemories'), query.indexOf('deleteAgentMemory'))
    expect(listBlock).toContain('opts?.category')
    expect(listBlock).toContain('agentMemories.category')
  })

  // === Pagination ===

  test('P1: listAgentMemories supports pagination', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    const listBlock = query.slice(query.indexOf('listAgentMemories'), query.indexOf('deleteAgentMemory'))
    expect(listBlock).toContain('opts?.limit')
    expect(listBlock).toContain('opts?.offset')
    // defaults
    expect(listBlock).toContain('50')
    expect(listBlock).toContain('0')
  })

  // === Memory confidence update ===

  test('P1: updateMemoryConfidence updates confidence with company isolation', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    expect(query).toContain('updateMemoryConfidence')
    const updateBlock = query.slice(query.indexOf('updateMemoryConfidence'), query.indexOf('updateAgentMemoryEmbedding'))
    expect(updateBlock).toContain('agentMemories.companyId')
    expect(updateBlock).toContain('confidence')
  })

  // === Memory deletion with company isolation ===

  test('P1: deleteAgentMemory soft-deletes with company isolation', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    const deleteBlock = query.slice(query.indexOf('deleteAgentMemory'), query.indexOf('updateMemoryConfidence'))
    expect(deleteBlock).toContain('isActive: false')
    expect(deleteBlock).toContain('agentMemories.companyId')
    expect(deleteBlock).toContain('agentMemories.id')
  })

  // === Embedding update ===

  test('P1: updateAgentMemoryEmbedding validates non-finite values', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    const embedBlock = query.slice(query.indexOf('updateAgentMemoryEmbedding'))
    expect(embedBlock).toContain('Number.isFinite')
    expect(embedBlock).toContain('embedding contains non-finite values')
  })

  test('P1: updateAgentMemoryEmbedding uses raw SQL with company isolation', async () => {
    const query = await Bun.file('packages/server/src/db/scoped-query.ts').text()
    const embedBlock = query.slice(query.indexOf('updateAgentMemoryEmbedding'))
    expect(embedBlock).toContain('UPDATE agent_memories')
    expect(embedBlock).toContain('embedding = ${vectorStr}::vector')
    expect(embedBlock).toContain('company_id = ${companyId}')
  })

  // === Reflection worker vectorization ===

  test('P0: reflection-worker imports getEmbedding', async () => {
    const worker = await Bun.file('packages/server/src/services/reflection-worker.ts').text()
    expect(worker).toContain("import { getEmbedding } from './voyage-embedding'")
  })

  test('P0: reflection-worker fire-and-forget vectorizes after insert', async () => {
    const worker = await Bun.file('packages/server/src/services/reflection-worker.ts').text()
    // Checks for the fire-and-forget pattern
    expect(worker).toContain('Promise.resolve().then(async ()')
    expect(worker).toContain('getEmbedding(companyId')
    expect(worker).toContain('updateAgentMemoryEmbedding(inserted.id')
  })

  test('P1: reflection-worker vectorization failure does not break insertion', async () => {
    const worker = await Bun.file('packages/server/src/services/reflection-worker.ts').text()
    // Graceful degradation — catch block
    expect(worker).toContain('graceful degradation')
    expect(worker).toContain('.catch(() => {})')
  })
})
