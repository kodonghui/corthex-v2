import { describe, test, expect, mock, beforeEach } from 'bun:test'

// --- Mocks ---

const mockGetEmbedding = mock(() =>
  Promise.resolve(Array.from({ length: 1024 }, (_, i) => i / 1024)),
)

const mockSearchSimilarDocs = mock(() =>
  Promise.resolve([
    { id: 'doc-1', title: 'Test Doc 1', content: 'Content about investing', folderId: 'folder-1', tags: ['finance'], distance: 0.15 },
    { id: 'doc-2', title: 'Test Doc 2', content: 'Content about trading', folderId: 'folder-1', tags: ['trading'], distance: 0.35 },
  ]),
)

mock.module('../../services/voyage-embedding', () => ({
  getEmbedding: (...args: any[]) => mockGetEmbedding(...args),
}))

mock.module('../../db/scoped-query', () => ({
  getDB: mock(() => ({
    searchSimilarDocs: (...args: any[]) => mockSearchSimilarDocs(...args),
  })),
}))

import { semanticSearch } from '../../services/semantic-search'

beforeEach(() => {
  mockGetEmbedding.mockClear()
  mockSearchSimilarDocs.mockClear()

  // Reset to default implementations
  mockGetEmbedding.mockImplementation(() =>
    Promise.resolve(Array.from({ length: 1024 }, (_, i) => i / 1024)),
  )
  mockSearchSimilarDocs.mockImplementation(() =>
    Promise.resolve([
      { id: 'doc-1', title: 'Test Doc 1', content: 'Content about investing', folderId: 'folder-1', tags: ['finance'], distance: 0.15 },
      { id: 'doc-2', title: 'Test Doc 2', content: 'Content about trading', folderId: 'folder-1', tags: ['trading'], distance: 0.35 },
    ]),
  )
})

// ══════════════════════════════════════════════════════════
// semanticSearch() 함수 테스트
// ══════════════════════════════════════════════════════════

describe('semanticSearch', () => {
  test('returns results with score (distance → score conversion)', async () => {
    const results = await semanticSearch('company-1', '삼성전자 투자 분석')
    expect(results).not.toBeNull()
    expect(results!.length).toBe(2)
    expect(results![0].id).toBe('doc-1')
    expect(results![0].score).toBeCloseTo(0.85, 1) // 1 - 0.15
    expect(results![1].score).toBeCloseTo(0.65, 1) // 1 - 0.35
  })

  test('passes topK and threshold to searchSimilarDocs', async () => {
    await semanticSearch('company-1', 'test query', { topK: 10, threshold: 0.5 })
    expect(mockSearchSimilarDocs).toHaveBeenCalledWith(
      expect.any(Array),
      10,
      0.5,
      undefined,
    )
  })

  test('passes folderId to searchSimilarDocs', async () => {
    await semanticSearch('company-1', 'test query', { folderId: 'folder-abc' })
    expect(mockSearchSimilarDocs).toHaveBeenCalledWith(
      expect.any(Array),
      5,
      0.8,
      'folder-abc',
    )
  })

  test('uses default options when none provided', async () => {
    await semanticSearch('company-1', 'test query')
    expect(mockSearchSimilarDocs).toHaveBeenCalledWith(
      expect.any(Array),
      5,
      0.8,
      undefined,
    )
  })

  test('returns null when embedding generation fails', async () => {
    mockGetEmbedding.mockImplementation(() =>
      Promise.resolve(null),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results).toBeNull()
  })

  test('clamps negative scores to 0', async () => {
    mockSearchSimilarDocs.mockImplementation(() =>
      Promise.resolve([
        { id: 'doc-x', title: 'Far doc', content: 'Far away', folderId: null, tags: null, distance: 1.5 },
      ]),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results).not.toBeNull()
    expect(results![0].score).toBe(0) // 1 - 1.5 = -0.5 → clamped to 0
  })

  test('returns empty array when no similar docs found', async () => {
    mockSearchSimilarDocs.mockImplementation(() =>
      Promise.resolve([]),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results).not.toBeNull()
    expect(results!.length).toBe(0)
  })

  test('result contains all expected fields', async () => {
    const results = await semanticSearch('company-1', 'test')
    expect(results).not.toBeNull()
    const result = results![0]
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('folderId')
    expect(result).toHaveProperty('tags')
    expect(result).toHaveProperty('score')
  })

  test('calls getEmbedding with correct companyId and query', async () => {
    await semanticSearch('company-1', 'AI 투자 전략')
    expect(mockGetEmbedding).toHaveBeenCalledWith('company-1', 'AI 투자 전략')
  })

  test('calls getEmbedding with different companyIds', async () => {
    await semanticSearch('company-xyz', 'test')
    expect(mockGetEmbedding).toHaveBeenCalledWith('company-xyz', 'test')
  })
})

// ══════════════════════════════════════════════════════════
// scoped-query searchSimilarDocs folderId 필터 테스트
// ══════════════════════════════════════════════════════════

describe('searchSimilarDocs folderId filter', () => {
  test('folderId is passed as 4th argument', async () => {
    await semanticSearch('company-1', 'test', { folderId: 'folder-123' })
    const call = mockSearchSimilarDocs.mock.calls[0]
    expect(call[3]).toBe('folder-123')
  })

  test('folderId is undefined when not provided', async () => {
    await semanticSearch('company-1', 'test')
    const call = mockSearchSimilarDocs.mock.calls[0]
    expect(call[3]).toBeUndefined()
  })
})

// ══════════════════════════════════════════════════════════
// Score 변환 테스트
// ══════════════════════════════════════════════════════════

describe('score conversion (distance → score)', () => {
  test('distance 0 → score 1 (identical)', async () => {
    mockSearchSimilarDocs.mockImplementation(() =>
      Promise.resolve([
        { id: 'doc-1', title: 'T', content: 'C', folderId: null, tags: null, distance: 0 },
      ]),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results![0].score).toBe(1)
  })

  test('distance 0.5 → score 0.5', async () => {
    mockSearchSimilarDocs.mockImplementation(() =>
      Promise.resolve([
        { id: 'doc-1', title: 'T', content: 'C', folderId: null, tags: null, distance: 0.5 },
      ]),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results![0].score).toBe(0.5)
  })

  test('distance 1.0 → score 0', async () => {
    mockSearchSimilarDocs.mockImplementation(() =>
      Promise.resolve([
        { id: 'doc-1', title: 'T', content: 'C', folderId: null, tags: null, distance: 1.0 },
      ]),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results![0].score).toBe(0)
  })

  test('distance > 1 → score clamped to 0', async () => {
    mockSearchSimilarDocs.mockImplementation(() =>
      Promise.resolve([
        { id: 'doc-1', title: 'T', content: 'C', folderId: null, tags: null, distance: 1.8 },
      ]),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results![0].score).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════
// 엣지 케이스
// ══════════════════════════════════════════════════════════

describe('edge cases', () => {
  test('handles null content in results', async () => {
    mockSearchSimilarDocs.mockImplementation(() =>
      Promise.resolve([
        { id: 'doc-1', title: 'No content', content: null, folderId: null, tags: null, distance: 0.2 },
      ]),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results).not.toBeNull()
    expect(results![0].content).toBeNull()
    expect(results![0].score).toBeCloseTo(0.8, 1)
  })

  test('handles null tags in results', async () => {
    mockSearchSimilarDocs.mockImplementation(() =>
      Promise.resolve([
        { id: 'doc-1', title: 'T', content: 'C', folderId: null, tags: null, distance: 0.1 },
      ]),
    )
    const results = await semanticSearch('company-1', 'test')
    expect(results![0].tags).toBeNull()
  })
})
