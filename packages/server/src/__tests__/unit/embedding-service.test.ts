import { describe, test, expect, mock, beforeEach } from 'bun:test'

// Shared mock functions accessible by tests
let mockEmbedContent = mock(() =>
  Promise.resolve({
    embedding: {
      values: Array.from({ length: 768 }, (_, i) => i / 768),
    },
  }),
)

mock.module('@google/generative-ai', () => ({
  GoogleGenerativeAI: mock(function () {
    return {
      getGenerativeModel: mock(() => ({
        embedContent: (...args: any[]) => mockEmbedContent(...args),
      })),
    }
  }),
}))

mock.module('../../db', () => ({
  db: {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() => Promise.resolve([{
            id: 'doc-1',
            title: 'Test Doc',
            content: 'Test content for embedding',
          }])),
        })),
      })),
    })),
    execute: mock(() => Promise.resolve()),
  },
}))

mock.module('../../db/schema', () => ({
  knowledgeDocs: {
    id: 'id',
    title: 'title',
    content: 'content',
    companyId: 'company_id',
    isActive: 'is_active',
    embedding: 'embedding',
    embeddingModel: 'embedding_model',
    embeddedAt: 'embedded_at',
  },
}))

mock.module('../../services/credential-vault', () => ({
  getCredentials: mock(() =>
    Promise.resolve({ api_key: 'test-api-key-123' }),
  ),
}))

import {
  prepareText,
  generateEmbedding,
  generateEmbeddings,
  updateDocEmbedding,
  triggerEmbedding,
} from '../../services/embedding-service'

beforeEach(() => {
  mockEmbedContent = mock(() =>
    Promise.resolve({
      embedding: {
        values: Array.from({ length: 768 }, (_, i) => i / 768),
      },
    }),
  )
})

// === Task 1: Embedding Service — prepareText ===

describe('prepareText', () => {
  test('combines title and content', () => {
    expect(prepareText('My Title', 'Some content')).toBe('My Title\n\nSome content')
  })

  test('uses title only when content is null', () => {
    expect(prepareText('My Title', null)).toBe('My Title')
  })

  test('uses title only when content is empty string', () => {
    expect(prepareText('My Title', '')).toBe('My Title')
  })

  test('truncates to 10000 chars', () => {
    const result = prepareText('Title', 'a'.repeat(15000))
    expect(result.length).toBe(10000)
  })

  test('does not truncate text under limit', () => {
    const result = prepareText('Title', 'a'.repeat(5000))
    expect(result.length).toBe(5000 + 'Title'.length + 2)
  })

  test('handles very long title with no content', () => {
    const result = prepareText('A'.repeat(12000), null)
    expect(result.length).toBe(10000)
  })

  test('handles empty title with content', () => {
    expect(prepareText('', 'content')).toBe('\n\ncontent')
  })
})

// === Task 1: Embedding Service — generateEmbedding ===

describe('generateEmbedding', () => {
  test('returns 768-dim embedding array on success', async () => {
    const result = await generateEmbedding('test-key', 'hello world')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(768)
    expect(typeof result![0]).toBe('number')
  })

  test('returns null when API throws error', async () => {
    mockEmbedContent = mock(() => Promise.reject(new Error('API error')))
    const result = await generateEmbedding('test-key', 'hello')
    expect(result).toBeNull()
  })

  test('returns null when embedding has wrong dimensions', async () => {
    mockEmbedContent = mock(() =>
      Promise.resolve({ embedding: { values: [0.1, 0.2, 0.3] } }),
    )
    const result = await generateEmbedding('test-key', 'hello')
    expect(result).toBeNull()
  })

  test('returns null when embedding values are undefined', async () => {
    mockEmbedContent = mock(() =>
      Promise.resolve({ embedding: { values: undefined } }),
    )
    const result = await generateEmbedding('test-key', 'hello')
    expect(result).toBeNull()
  })

  test('returns null on network timeout', async () => {
    mockEmbedContent = mock(() => Promise.reject(new Error('ETIMEDOUT')))
    const result = await generateEmbedding('test-key', 'hello')
    expect(result).toBeNull()
  })

  test('returns null on rate limit (429)', async () => {
    mockEmbedContent = mock(() => {
      const err = new Error('429 Too Many Requests') as any
      err.status = 429
      return Promise.reject(err)
    })
    const result = await generateEmbedding('test-key', 'hello')
    expect(result).toBeNull()
  })
})

// === Task 1: Embedding Service — generateEmbeddings (batch) ===

describe('generateEmbeddings', () => {
  test('processes multiple texts sequentially', async () => {
    const results = await generateEmbeddings('test-key', ['hello', 'world', 'foo'])
    expect(results).toHaveLength(3)
    results.forEach(r => {
      expect(r).not.toBeNull()
      expect(r!).toHaveLength(768)
    })
  })

  test('returns null for failed items without stopping batch', async () => {
    let callCount = 0
    mockEmbedContent = mock(() => {
      callCount++
      if (callCount === 2) return Promise.reject(new Error('fail'))
      return Promise.resolve({ embedding: { values: Array.from({ length: 768 }, () => 0.1) } })
    })

    const results = await generateEmbeddings('test-key', ['a', 'b', 'c'])
    expect(results).toHaveLength(3)
    expect(results[0]).not.toBeNull()
    expect(results[1]).toBeNull()
    expect(results[2]).not.toBeNull()
  })

  test('handles empty input array', async () => {
    const results = await generateEmbeddings('test-key', [])
    expect(results).toEqual([])
  })

  test('handles single item', async () => {
    const results = await generateEmbeddings('test-key', ['solo'])
    expect(results).toHaveLength(1)
    expect(results[0]).not.toBeNull()
  })
})

// === Task 2: DB Update Helper ===

describe('updateDocEmbedding', () => {
  test('executes without error', async () => {
    const embedding = Array.from({ length: 768 }, () => 0.5)
    await expect(
      updateDocEmbedding('doc-1', 'company-1', embedding),
    ).resolves.toBeUndefined()
  })

  test('accepts custom model name', async () => {
    await expect(
      updateDocEmbedding('doc-1', 'company-1', [0.1, 0.2], 'custom-model'),
    ).resolves.toBeUndefined()
  })
})

// === Task 2: Vector Format ===

describe('vector string format', () => {
  test('vector string is correct for pgvector', () => {
    const embedding = [0.1, 0.2, 0.3]
    const vectorStr = `[${embedding.join(',')}]`
    expect(vectorStr).toBe('[0.1,0.2,0.3]')
  })

  test('768-dim vector produces valid string', () => {
    const embedding = Array.from({ length: 768 }, (_, i) => i / 768)
    const vectorStr = `[${embedding.join(',')}]`
    expect(vectorStr).toStartWith('[')
    expect(vectorStr).toEndWith(']')
    expect(vectorStr.split(',')).toHaveLength(768)
  })
})

// === Task 3: Trigger Integration ===

describe('triggerEmbedding', () => {
  test('does not throw (fire-and-forget)', () => {
    expect(() => triggerEmbedding('doc-1', 'company-1')).not.toThrow()
  })

  test('is non-blocking', () => {
    const start = Date.now()
    triggerEmbedding('doc-1', 'company-1')
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(50)
  })

  test('function signature accepts docId and companyId', () => {
    expect(typeof triggerEmbedding).toBe('function')
    expect(triggerEmbedding.length).toBe(2)
  })
})

// === Task 4: Batch Embedding ===

describe('embedAllDocuments', () => {
  test('is exported as a function', async () => {
    const mod = await import('../../services/embedding-service')
    expect(typeof mod.embedAllDocuments).toBe('function')
  })
})

// === Task 1: Module Exports ===

describe('module exports', () => {
  test('exports all required functions', async () => {
    const mod = await import('../../services/embedding-service')
    expect(typeof mod.generateEmbedding).toBe('function')
    expect(typeof mod.generateEmbeddings).toBe('function')
    expect(typeof mod.updateDocEmbedding).toBe('function')
    expect(typeof mod.embedDocument).toBe('function')
    expect(typeof mod.triggerEmbedding).toBe('function')
    expect(typeof mod.embedAllDocuments).toBe('function')
    expect(typeof mod.prepareText).toBe('function')
  })
})
