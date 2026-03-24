import { describe, test, expect, mock, beforeEach } from 'bun:test'

// Shared mock functions
let mockEmbed = mock(() =>
  Promise.resolve({
    data: [{ embedding: Array.from({ length: 1024 }, (_, i) => i / 1024) }],
    model: 'voyage-3',
    usage: { totalTokens: 10 },
  }),
)

// Define error classes outside mock.module so tests can reference the same class identity
class MockVoyageAIError extends Error {
  statusCode: number
  constructor(msg: string, statusCode: number) {
    super(msg)
    this.statusCode = statusCode
  }
}

class MockVoyageAITimeoutError extends Error {}

mock.module('voyageai', () => ({
  VoyageAIClient: mock(function (opts: any) {
    return { embed: (...args: any[]) => mockEmbed(...args) }
  }),
  VoyageAIError: MockVoyageAIError,
  VoyageAITimeoutError: MockVoyageAITimeoutError,
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
    Promise.resolve({ api_key: 'test-voyage-key-123' }),
  ),
}))

import {
  prepareText,
  getEmbedding,
  getEmbeddingBatch,
  updateDocEmbedding,
  triggerEmbedding,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
} from '../../services/voyage-embedding'

beforeEach(() => {
  mockEmbed = mock(() =>
    Promise.resolve({
      data: [{ embedding: Array.from({ length: 1024 }, (_, i) => i / 1024) }],
      model: 'voyage-3',
      usage: { totalTokens: 10 },
    }),
  )
})

// === Constants ===

describe('constants', () => {
  test('EMBEDDING_MODEL is voyage-3', () => {
    expect(EMBEDDING_MODEL).toBe('voyage-3')
  })

  test('EMBEDDING_DIMENSIONS is 1024', () => {
    expect(EMBEDDING_DIMENSIONS).toBe(1024)
  })
})

// === prepareText ===

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

// === getEmbedding ===

describe('getEmbedding', () => {
  test('returns 1024-dim embedding array on success', async () => {
    const result = await getEmbedding('company-1', 'hello world')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1024)
    expect(typeof result![0]).toBe('number')
  })

  test('returns null when API throws error', async () => {
    mockEmbed = mock(() => Promise.reject(new Error('API error')))
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
  })

  test('returns null when embedding has wrong dimensions', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({ data: [{ embedding: [0.1, 0.2, 0.3] }] }),
    )
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
  })

  test('returns null when data is empty', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({ data: [] }),
    )
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
  })

  test('returns null when data is undefined', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({ data: undefined }),
    )
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
  })

  test('returns null when no voyage_ai credentials exist', async () => {
    const { getCredentials } = require('../../services/credential-vault')
    getCredentials.mockImplementationOnce(() => Promise.reject(new Error('No credentials')))
    const result = await getEmbedding('company-no-creds', 'hello')
    expect(result).toBeNull()
  })

  test('returns null when api_key is missing from credentials', async () => {
    const { getCredentials } = require('../../services/credential-vault')
    getCredentials.mockImplementationOnce(() => Promise.resolve({}))
    const result = await getEmbedding('company-no-key', 'hello')
    expect(result).toBeNull()
  })

  test('uses voyage_ai provider for credentials', async () => {
    const { getCredentials } = require('../../services/credential-vault')
    await getEmbedding('company-1', 'test')
    expect(getCredentials).toHaveBeenCalledWith('company-1', 'voyage_ai')
  })
})

// === getEmbeddingBatch ===

describe('getEmbeddingBatch', () => {
  test('processes multiple texts', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({
        data: Array.from({ length: 3 }, () => ({
          embedding: Array.from({ length: 1024 }, () => 0.1),
        })),
      }),
    )
    const results = await getEmbeddingBatch('company-1', ['hello', 'world', 'foo'], 32)
    expect(results).toHaveLength(3)
    results.forEach(r => {
      expect(r).not.toBeNull()
      expect(r!).toHaveLength(1024)
    })
  })

  test('chunks by batchSize', async () => {
    let callCount = 0
    mockEmbed = mock((req: any) => {
      callCount++
      const count = req.input.length
      return Promise.resolve({
        data: Array.from({ length: count }, () => ({
          embedding: Array.from({ length: 1024 }, () => 0.1),
        })),
      })
    })

    const texts = Array.from({ length: 5 }, (_, i) => `text-${i}`)
    const results = await getEmbeddingBatch('company-1', texts, 2)
    expect(results).toHaveLength(5)
    expect(callCount).toBe(3) // 2+2+1
  })

  test('returns null for failed batch items, continues rest', async () => {
    let callCount = 0
    mockEmbed = mock((req: any) => {
      callCount++
      if (callCount === 2) return Promise.reject(new Error('batch fail'))
      const count = req.input.length
      return Promise.resolve({
        data: Array.from({ length: count }, () => ({
          embedding: Array.from({ length: 1024 }, () => 0.1),
        })),
      })
    })

    const texts = Array.from({ length: 6 }, (_, i) => `text-${i}`)
    const results = await getEmbeddingBatch('company-1', texts, 2)
    expect(results).toHaveLength(6)
    // First batch (0,1): success
    expect(results[0]).not.toBeNull()
    expect(results[1]).not.toBeNull()
    // Second batch (2,3): failed
    expect(results[2]).toBeNull()
    expect(results[3]).toBeNull()
    // Third batch (4,5): success
    expect(results[4]).not.toBeNull()
    expect(results[5]).not.toBeNull()
  })

  test('handles empty input array', async () => {
    const results = await getEmbeddingBatch('company-1', [])
    expect(results).toEqual([])
  })
})

// === updateDocEmbedding ===

describe('updateDocEmbedding', () => {
  test('executes without error', async () => {
    const embedding = Array.from({ length: 1024 }, () => 0.5)
    await expect(
      updateDocEmbedding('doc-1', 'company-1', embedding),
    ).resolves.toBeUndefined()
  })

  test('accepts custom model name', async () => {
    await expect(
      updateDocEmbedding('doc-1', 'company-1', [0.1, 0.2], 'custom-model'),
    ).resolves.toBeUndefined()
  })

  test('throws on non-finite values', async () => {
    await expect(
      updateDocEmbedding('doc-1', 'company-1', [NaN, 0.2]),
    ).rejects.toThrow('non-finite')
  })

  test('throws on Infinity values', async () => {
    await expect(
      updateDocEmbedding('doc-1', 'company-1', [Infinity, 0.2]),
    ).rejects.toThrow('non-finite')
  })
})

// === vector string format ===

describe('vector string format', () => {
  test('1024-dim vector produces valid string', () => {
    const embedding = Array.from({ length: 1024 }, (_, i) => i / 1024)
    const vectorStr = `[${embedding.join(',')}]`
    expect(vectorStr).toStartWith('[')
    expect(vectorStr).toEndWith(']')
    expect(vectorStr.split(',')).toHaveLength(1024)
  })
})

// === triggerEmbedding ===

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

// === exponential backoff (AC-3) ===

describe('exponential backoff', () => {
  test('does NOT retry on 400 (bad request) — returns null after 1 call', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      return Promise.reject(new MockVoyageAIError('Bad request', 400))
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
    expect(callCount).toBe(1)
  })

  test('does NOT retry on 401 (unauthorized) — returns null after 1 call', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      return Promise.reject(new MockVoyageAIError('Unauthorized', 401))
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
    expect(callCount).toBe(1)
  })

  test('does NOT retry on 403 (forbidden) — returns null after 1 call', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      return Promise.reject(new MockVoyageAIError('Forbidden', 403))
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
    expect(callCount).toBe(1)
  })

  test('retries on 429 (rate limit) then succeeds', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      if (callCount === 1) return Promise.reject(new MockVoyageAIError('Rate limited', 429))
      return Promise.resolve({
        data: [{ embedding: Array.from({ length: 1024 }, () => 0.1) }],
      })
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).not.toBeNull()
    expect(result!).toHaveLength(1024)
    expect(callCount).toBe(2) // 1 fail + 1 success
  }, 5000)

  test('retries on 500 (server error) then succeeds', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      if (callCount === 1) return Promise.reject(new MockVoyageAIError('Server error', 500))
      return Promise.resolve({
        data: [{ embedding: Array.from({ length: 1024 }, () => 0.1) }],
      })
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).not.toBeNull()
    expect(callCount).toBe(2)
  }, 5000)

  test('retries on 502 (bad gateway) then succeeds', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      if (callCount === 1) return Promise.reject(new MockVoyageAIError('Bad gateway', 502))
      return Promise.resolve({
        data: [{ embedding: Array.from({ length: 1024 }, () => 0.1) }],
      })
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).not.toBeNull()
    expect(callCount).toBe(2)
  }, 5000)

  test('retries on VoyageAITimeoutError then succeeds', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      if (callCount === 1) return Promise.reject(new MockVoyageAITimeoutError('Timeout'))
      return Promise.resolve({
        data: [{ embedding: Array.from({ length: 1024 }, () => 0.1) }],
      })
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).not.toBeNull()
    expect(callCount).toBe(2)
  }, 5000)

  test('retries on network error (TypeError with fetch) then succeeds', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      if (callCount === 1) return Promise.reject(new TypeError('fetch failed'))
      return Promise.resolve({
        data: [{ embedding: Array.from({ length: 1024 }, () => 0.1) }],
      })
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).not.toBeNull()
    expect(callCount).toBe(2)
  }, 5000)

  test('does NOT retry on generic Error (non-retryable)', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      return Promise.reject(new Error('Something unexpected'))
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
    expect(callCount).toBe(1)
  })

  test('returns null after all retries exhausted on persistent 429', async () => {
    let callCount = 0
    mockEmbed = mock(() => {
      callCount++
      return Promise.reject(new MockVoyageAIError('Rate limited', 429))
    })
    const result = await getEmbedding('company-1', 'hello')
    expect(result).toBeNull()
    // 1 initial + 5 retries = 6 total calls
    expect(callCount).toBe(6)
  }, 45000)

  test('getEmbeddingBatch retries individual batch on 429', async () => {
    let callCount = 0
    mockEmbed = mock((req: any) => {
      callCount++
      // First call (first batch) fails with 429, second call (retry) succeeds
      if (callCount === 1) return Promise.reject(new MockVoyageAIError('Rate limited', 429))
      const count = req.input.length
      return Promise.resolve({
        data: Array.from({ length: count }, () => ({
          embedding: Array.from({ length: 1024 }, () => 0.1),
        })),
      })
    })
    const results = await getEmbeddingBatch('company-1', ['a', 'b'], 2)
    expect(results).toHaveLength(2)
    expect(results[0]).not.toBeNull()
    expect(results[1]).not.toBeNull()
    expect(callCount).toBe(2) // 1 fail + 1 success
  }, 5000)
})

// === module exports ===

describe('module exports', () => {
  test('exports all required functions', async () => {
    const mod = await import('../../services/voyage-embedding')
    expect(typeof mod.getEmbedding).toBe('function')
    expect(typeof mod.getEmbeddingBatch).toBe('function')
    expect(typeof mod.updateDocEmbedding).toBe('function')
    expect(typeof mod.embedDocument).toBe('function')
    expect(typeof mod.triggerEmbedding).toBe('function')
    expect(typeof mod.embedAllDocuments).toBe('function')
    expect(typeof mod.prepareText).toBe('function')
    expect(mod.EMBEDDING_MODEL).toBe('voyage-3')
    expect(mod.EMBEDDING_DIMENSIONS).toBe(1024)
  })
})
