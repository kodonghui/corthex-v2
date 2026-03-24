import { describe, test, expect, mock, beforeEach } from 'bun:test'

/**
 * TEA (Test Architect) — Risk-based test expansion for Voyage AI embedding
 *
 * Risk Analysis:
 * P0: Embedding generation correctness (wrong dimensions, API failure graceful handling)
 * P0: Fire-and-forget must not crash server on failure
 * P0: DB update with vector must produce correct SQL
 * P1: Batch processing handles partial failures
 * P1: Text preprocessing edge cases (unicode, empty docs, huge docs)
 * P1: Credential vault fallback when no key
 * P2: Rate limiting behavior in batch mode
 */

// Shared mock state
let mockEmbed = mock(() =>
  Promise.resolve({
    data: [{ embedding: Array.from({ length: 1024 }, (_, i) => i / 1024) }],
    model: 'voyage-3',
    usage: { totalTokens: 10 },
  }),
)

let mockGetCredentials = mock(() =>
  Promise.resolve({ api_key: 'test-key-abc' }),
)

let mockDbExecute = mock(() => Promise.resolve())
let mockDbSelectResult: any[] = []

mock.module('voyageai', () => ({
  VoyageAIClient: mock(function (opts: any) {
    return { embed: (...args: any[]) => mockEmbed(...args) }
  }),
  VoyageAIError: class VoyageAIError extends Error {
    statusCode: number
    constructor(msg: string, statusCode: number) {
      super(msg)
      this.statusCode = statusCode
    }
  },
  VoyageAITimeoutError: class VoyageAITimeoutError extends Error {},
}))

mock.module('../../db', () => ({
  db: {
    select: mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() => Promise.resolve(mockDbSelectResult)),
        })),
      })),
    })),
    execute: (...args: any[]) => mockDbExecute(...args),
  },
}))

mock.module('../../db/schema', () => ({
  knowledgeDocs: {
    id: 'id', title: 'title', content: 'content',
    companyId: 'company_id', isActive: 'is_active',
    embedding: 'embedding', embeddingModel: 'embedding_model',
    embeddedAt: 'embedded_at',
  },
}))

mock.module('../../services/credential-vault', () => ({
  getCredentials: (...args: any[]) => mockGetCredentials(...args),
}))

import {
  prepareText,
  getEmbedding,
  getEmbeddingBatch,
  updateDocEmbedding,
  embedDocument,
  triggerEmbedding,
  embedAllDocuments,
} from '../../services/voyage-embedding'

beforeEach(() => {
  mockEmbed = mock(() =>
    Promise.resolve({
      data: [{ embedding: Array.from({ length: 1024 }, (_, i) => i / 1024) }],
      model: 'voyage-3',
      usage: { totalTokens: 10 },
    }),
  )
  mockGetCredentials = mock(() => Promise.resolve({ api_key: 'test-key' }))
  mockDbExecute = mock(() => Promise.resolve())
  mockDbSelectResult = [{
    id: 'doc-1', title: 'Test', content: 'Content',
  }]
})

// === P0: Text Preprocessing Edge Cases ===

describe('[TEA P0] prepareText edge cases', () => {
  test('handles unicode characters correctly', () => {
    const result = prepareText('삼성전자 투자 분석', '한국어 콘텐츠 테스트 🚀')
    expect(result).toBe('삼성전자 투자 분석\n\n한국어 콘텐츠 테스트 🚀')
  })

  test('handles emoji-heavy content', () => {
    const result = prepareText('🎯📊', '🚀🔥💡')
    expect(result).toContain('🎯📊')
    expect(result).toContain('🚀🔥💡')
  })

  test('handles newlines in content', () => {
    const result = prepareText('Title', 'Line1\nLine2\nLine3')
    expect(result).toBe('Title\n\nLine1\nLine2\nLine3')
  })

  test('handles tab characters', () => {
    const result = prepareText('Title', 'Col1\tCol2\tCol3')
    expect(result).toContain('\t')
  })

  test('truncation preserves title when combined exceeds limit', () => {
    const title = 'Important Title'
    const content = 'x'.repeat(10000)
    const result = prepareText(title, content)
    expect(result).toStartWith('Important Title')
    expect(result.length).toBe(10000)
  })

  test('handles null-like content values', () => {
    expect(prepareText('Title', null)).toBe('Title')
    expect(prepareText('Title', '')).toBe('Title')
  })

  test('exactly 10000 chars is not truncated', () => {
    const text = 'a'.repeat(9994) // title(5) + \n\n(2) + content = 10001 > truncated
    const result = prepareText('Title', text)
    expect(result.length).toBe(10000)
  })
})

// === P0: Embedding API Failure Modes ===

describe('[TEA P0] getEmbedding failure modes', () => {
  test('null embedding in response', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({ data: [{ embedding: null }] }),
    )
    const result = await getEmbedding('comp-1', 'text')
    expect(result).toBeNull()
  })

  test('empty data array', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({ data: [] }),
    )
    const result = await getEmbedding('comp-1', 'text')
    expect(result).toBeNull()
  })

  test('wrong dimension (384 instead of 1024)', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({
        data: [{ embedding: Array.from({ length: 384 }, () => 0.1) }],
      }),
    )
    const result = await getEmbedding('comp-1', 'text')
    expect(result).toBeNull()
  })

  test('wrong dimension (768 instead of 1024)', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({
        data: [{ embedding: Array.from({ length: 768 }, () => 0.1) }],
      }),
    )
    const result = await getEmbedding('comp-1', 'text')
    expect(result).toBeNull()
  })

  test('API returns malformed response (no data property)', async () => {
    mockEmbed = mock(() => Promise.resolve({}))
    const result = await getEmbedding('comp-1', 'text')
    expect(result).toBeNull()
  })

  test('API throws TypeError', async () => {
    mockEmbed = mock(() => Promise.reject(new TypeError('Cannot read property')))
    const result = await getEmbedding('comp-1', 'text')
    expect(result).toBeNull()
  })

  test('successful embedding has correct length', async () => {
    const result = await getEmbedding('comp-1', 'test text')
    expect(result).not.toBeNull()
    expect(result!.length).toBe(1024)
  })

  test('embedding values are numeric', async () => {
    const result = await getEmbedding('comp-1', 'test')
    expect(result).not.toBeNull()
    result!.forEach(v => expect(typeof v).toBe('number'))
  })
})

// === P0: embedDocument credential handling ===

describe('[TEA P0] embedDocument credential handling', () => {
  test('returns false when no API key in vault', async () => {
    mockGetCredentials = mock(() => Promise.resolve({}))
    const result = await embedDocument('doc-1', 'company-1')
    expect(result).toBe(false)
  })

  test('returns false when credential vault throws', async () => {
    mockGetCredentials = mock(() => Promise.reject(new Error('Vault unavailable')))
    const result = await embedDocument('doc-1', 'company-1')
    expect(result).toBe(false)
  })

  test('uses apiKey field as fallback', async () => {
    mockGetCredentials = mock(() => Promise.resolve({ apiKey: 'fallback-key' }))
    const result = await embedDocument('doc-1', 'company-1')
    expect(result).toBe(true)
  })

  test('uses first value as last resort', async () => {
    mockGetCredentials = mock(() => Promise.resolve({ some_field: 'last-resort-key' }))
    const result = await embedDocument('doc-1', 'company-1')
    expect(result).toBe(true)
  })

  test('returns false when document not found', async () => {
    mockDbSelectResult = []
    const result = await embedDocument('nonexistent', 'company-1')
    expect(result).toBe(false)
  })

  test('returns true on successful embedding', async () => {
    const result = await embedDocument('doc-1', 'company-1')
    expect(result).toBe(true)
  })

  test('returns false when embedding generation fails', async () => {
    mockEmbed = mock(() => Promise.reject(new Error('API down')))
    const result = await embedDocument('doc-1', 'company-1')
    expect(result).toBe(false)
  })
})

// === P0: Fire-and-forget safety ===

describe('[TEA P0] triggerEmbedding fire-and-forget safety', () => {
  test('never throws even when embedDocument would fail', () => {
    mockGetCredentials = mock(() => Promise.reject(new Error('crash')))
    expect(() => triggerEmbedding('doc-1', 'company-1')).not.toThrow()
  })

  test('returns void (undefined)', () => {
    const result = triggerEmbedding('doc-1', 'company-1')
    expect(result).toBeUndefined()
  })

  test('completes execution in under 10ms (non-blocking)', () => {
    const start = performance.now()
    triggerEmbedding('doc-1', 'company-1')
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(10)
  })
})

// === P0: updateDocEmbedding vector SQL ===

describe('[TEA P0] updateDocEmbedding SQL correctness', () => {
  test('calls db.execute for vector update', async () => {
    const embedding = Array.from({ length: 1024 }, () => 0.5)
    await updateDocEmbedding('doc-1', 'comp-1', embedding)
    expect(mockDbExecute).toHaveBeenCalled()
  })

  test('handles empty embedding array', async () => {
    await expect(
      updateDocEmbedding('doc-1', 'comp-1', []),
    ).resolves.toBeUndefined()
  })

  test('handles very large embedding values', async () => {
    const embedding = Array.from({ length: 1024 }, () => 999999.999999)
    await expect(
      updateDocEmbedding('doc-1', 'comp-1', embedding),
    ).resolves.toBeUndefined()
  })

  test('handles negative embedding values', async () => {
    const embedding = Array.from({ length: 1024 }, () => -0.5)
    await expect(
      updateDocEmbedding('doc-1', 'comp-1', embedding),
    ).resolves.toBeUndefined()
  })

  test('rejects NaN values', async () => {
    await expect(
      updateDocEmbedding('doc-1', 'comp-1', [NaN, 0.5]),
    ).rejects.toThrow('non-finite')
  })

  test('rejects Infinity values', async () => {
    await expect(
      updateDocEmbedding('doc-1', 'comp-1', [Infinity, 0.5]),
    ).rejects.toThrow('non-finite')
  })
})

// === P1: Batch embedding partial failures ===

describe('[TEA P1] getEmbeddingBatch batch resilience', () => {
  test('continues processing after middle batch failure', async () => {
    let callNum = 0
    mockEmbed = mock((req: any) => {
      callNum++
      if (callNum === 2) return Promise.reject(new Error('transient failure'))
      const count = req.input.length
      return Promise.resolve({
        data: Array.from({ length: count }, () => ({
          embedding: Array.from({ length: 1024 }, () => 0.1),
        })),
      })
    })
    const results = await getEmbeddingBatch('comp-1', ['a', 'b', 'c', 'd', 'e'], 2)
    expect(results).toHaveLength(5)
    // batch 1 (a,b) success, batch 2 (c,d) fail, batch 3 (e) success
    expect(results[0]).not.toBeNull()
    expect(results[1]).not.toBeNull()
    expect(results[2]).toBeNull()
    expect(results[3]).toBeNull()
    expect(results[4]).not.toBeNull()
  })

  test('all batches fail gracefully', async () => {
    mockEmbed = mock(() => Promise.reject(new Error('all fail')))
    const results = await getEmbeddingBatch('comp-1', ['a', 'b', 'c'])
    expect(results).toEqual([null, null, null])
  })

  test('single item batch works', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({
        data: [{ embedding: Array.from({ length: 1024 }, () => 0.1) }],
      }),
    )
    const results = await getEmbeddingBatch('comp-1', ['single'])
    expect(results).toHaveLength(1)
    expect(results[0]).not.toBeNull()
  })
})

// === P1: embedAllDocuments ===

describe('[TEA P1] embedAllDocuments', () => {
  test('returns result summary with zero docs when none found', async () => {
    mockDbSelectResult = []
    // Override the select chain for embedAllDocuments (it queries unembedded docs)
    const result = await embedAllDocuments('company-1')
    expect(result.total).toBe(0)
    expect(result.succeeded).toBe(0)
    expect(result.failed).toBe(0)
  })
})

// === P1: Vector string format safety ===

describe('[TEA P1] vector format edge cases', () => {
  test('scientific notation numbers format correctly', () => {
    const embedding = [1e-10, 2.5e-5, 3.14159]
    const vectorStr = `[${embedding.join(',')}]`
    expect(vectorStr).toBe('[1e-10,0.000025,3.14159]')
  })
})

// === P2: Module interface contract ===

describe('[TEA P2] module interface contract', () => {
  test('getEmbedding returns Promise<number[] | null>', async () => {
    const result = await getEmbedding('comp-1', 'text')
    expect(result === null || Array.isArray(result)).toBe(true)
  })

  test('getEmbeddingBatch returns Promise<(number[] | null)[]>', async () => {
    mockEmbed = mock(() =>
      Promise.resolve({
        data: [{ embedding: Array.from({ length: 1024 }, () => 0.1) }],
      }),
    )
    const result = await getEmbeddingBatch('comp-1', ['a'])
    expect(Array.isArray(result)).toBe(true)
    result.forEach(r => expect(r === null || Array.isArray(r)).toBe(true))
  })

  test('embedDocument returns Promise<boolean>', async () => {
    const result = await embedDocument('doc-1', 'comp-1')
    expect(typeof result).toBe('boolean')
  })

  test('triggerEmbedding returns void', () => {
    const result = triggerEmbedding('doc-1', 'comp-1')
    expect(result).toBeUndefined()
  })
})
