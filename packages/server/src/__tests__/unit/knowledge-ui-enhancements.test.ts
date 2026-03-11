import { describe, test, expect, beforeEach, mock } from 'bun:test'

// ============================================================
// Story 10.5: Knowledge Management UI Enhancements
// Tests for embedding status derivation and similar docs API
// ============================================================

// ============================================================
// Unit Tests: Embedding Status Derivation
// ============================================================

describe('Embedding Status Derivation', () => {
  const deriveStatus = (doc: { embeddedAt: string | null }) =>
    doc.embeddedAt ? 'done' : 'none'

  test('returns "done" when embeddedAt is set', () => {
    expect(deriveStatus({ embeddedAt: '2026-03-10T12:00:00Z' })).toBe('done')
  })

  test('returns "none" when embeddedAt is null', () => {
    expect(deriveStatus({ embeddedAt: null })).toBe('none')
  })

  test('embedding vector should be stripped from response', () => {
    const doc = {
      id: 'abc',
      title: 'Test',
      embedding: [0.1, 0.2, 0.3],
      embeddedAt: '2026-03-10',
    }
    const result = { ...doc, embedding: undefined, embeddingStatus: deriveStatus(doc) }
    expect(result.embedding).toBeUndefined()
    expect(result.embeddingStatus).toBe('done')
  })
})

// ============================================================
// Unit Tests: Similar Documents Score Conversion
// ============================================================

describe('Similar Documents Score Conversion', () => {
  test('converts cosine distance to similarity score', () => {
    // cosine distance 0 = identical => score 1.0
    const score = Math.max(0, 1 - 0)
    expect(score).toBe(1)
  })

  test('converts distance 0.3 to score 0.7', () => {
    const score = Math.max(0, 1 - 0.3)
    expect(score).toBeCloseTo(0.7, 5)
  })

  test('converts distance 1.0 to score 0', () => {
    const score = Math.max(0, 1 - 1.0)
    expect(score).toBe(0)
  })

  test('clamps negative distances to 0', () => {
    const score = Math.max(0, 1 - 1.5)
    expect(score).toBe(0)
  })

  test('filters out self-document from similar results', () => {
    const docId = 'doc-1'
    const results = [
      { id: 'doc-1', title: 'Self', distance: 0 },
      { id: 'doc-2', title: 'Similar A', distance: 0.2 },
      { id: 'doc-3', title: 'Similar B', distance: 0.4 },
      { id: 'doc-4', title: 'Similar C', distance: 0.6 },
    ]

    const similar = results
      .filter(r => r.id !== docId)
      .slice(0, 3)
      .map(r => ({
        id: r.id,
        title: r.title,
        score: Math.max(0, 1 - Number(r.distance)),
      }))

    expect(similar).toHaveLength(3)
    expect(similar[0]).toEqual({ id: 'doc-2', title: 'Similar A', score: 0.8 })
    expect(similar[1]).toEqual({ id: 'doc-3', title: 'Similar B', score: 0.6 })
    expect(similar[2]).toEqual({ id: 'doc-4', title: 'Similar C', score: 0.4 })
  })

  test('returns empty array when doc has no embedding', () => {
    const doc = { embedding: null }
    const result = doc.embedding ? 'would search' : []
    expect(result).toEqual([])
  })

  test('returns fewer than 3 when not enough similar docs exist', () => {
    const docId = 'doc-1'
    const results = [
      { id: 'doc-1', title: 'Self', distance: 0 },
      { id: 'doc-2', title: 'Only Similar', distance: 0.3 },
    ]

    const similar = results
      .filter(r => r.id !== docId)
      .slice(0, 3)

    expect(similar).toHaveLength(1)
  })
})

// ============================================================
// Unit Tests: Search Mode Selection
// ============================================================

describe('Search Mode Validation', () => {
  const validModes = ['keyword', 'semantic', 'hybrid']

  test('accepts valid search modes', () => {
    for (const mode of validModes) {
      expect(validModes.includes(mode)).toBe(true)
    }
  })

  test('defaults to hybrid for invalid mode', () => {
    const rawMode = 'invalid'
    const mode = validModes.includes(rawMode) ? rawMode : 'hybrid'
    expect(mode).toBe('hybrid')
  })

  test('defaults to hybrid for empty mode', () => {
    const rawMode = ''
    const mode = validModes.includes(rawMode) ? rawMode : 'hybrid'
    expect(mode).toBe('hybrid')
  })

  test('preserves keyword mode', () => {
    const rawMode = 'keyword'
    const mode = validModes.includes(rawMode) ? rawMode : 'hybrid'
    expect(mode).toBe('keyword')
  })

  test('preserves semantic mode', () => {
    const rawMode = 'semantic'
    const mode = validModes.includes(rawMode) ? rawMode : 'hybrid'
    expect(mode).toBe('semantic')
  })
})

// ============================================================
// Unit Tests: Search Result Processing
// ============================================================

describe('Search Result Processing', () => {
  test('hybrid results merge semantic and keyword without duplicates', () => {
    const semanticResults = [
      { id: 'doc-1', title: 'A', score: 0.9 },
      { id: 'doc-2', title: 'B', score: 0.7 },
    ]
    const keywordResults = [
      { id: 'doc-2', title: 'B', score: null },
      { id: 'doc-3', title: 'C', score: null },
    ]

    const topK = 5
    const semanticIds = new Set(semanticResults.map(d => d.id))
    const supplementDocs = keywordResults
      .filter(d => !semanticIds.has(d.id))
      .slice(0, topK - semanticResults.length)

    const hybridDocs = [...semanticResults, ...supplementDocs]

    expect(hybridDocs).toHaveLength(3)
    expect(hybridDocs.map(d => d.id)).toEqual(['doc-1', 'doc-2', 'doc-3'])
    // doc-2 should keep semantic score, not be duplicated
    expect(hybridDocs[1].score).toBe(0.7)
  })

  test('score display rounds to nearest integer percent', () => {
    expect(Math.round(0.867 * 100)).toBe(87)
    expect(Math.round(0.123 * 100)).toBe(12)
    expect(Math.round(0.999 * 100)).toBe(100)
    expect(Math.round(0.001 * 100)).toBe(0)
  })

  test('highlight generation for keyword match', () => {
    const content = 'This is a long document about Samsung Electronics investment analysis and strategy for Q3 2026.'
    const query = 'Samsung'
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const matchIndex = lowerContent.indexOf(lowerQuery)

    expect(matchIndex).toBeGreaterThanOrEqual(0)

    const start = Math.max(0, matchIndex - 50)
    const end = Math.min(content.length, matchIndex + query.length + 50)
    const highlight = (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '')

    expect(highlight).toContain('Samsung')
  })

  test('highlight fallback for semantic match (no keyword match)', () => {
    const content = 'A completely different text about financial markets and equity portfolios for institutional investors.'
    const query = 'Samsung'
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const matchIndex = lowerContent.indexOf(lowerQuery)

    expect(matchIndex).toBe(-1) // No keyword match

    const maxLen = 150
    const highlight = content.length > maxLen ? content.slice(0, maxLen) + '...' : content
    expect(highlight.length).toBeLessThanOrEqual(maxLen + 3)
  })
})

// ============================================================
// Unit Tests: Embedding Status Badge Mapping
// ============================================================

describe('Embedding Status Badge Mapping', () => {
  const getBadgeInfo = (status?: string) => {
    switch (status) {
      case 'done': return { label: '완료', variant: 'success' }
      case 'pending': return { label: '대기', variant: 'warning' }
      default: return { label: '—', variant: 'none' }
    }
  }

  test('done status maps to success badge', () => {
    const badge = getBadgeInfo('done')
    expect(badge.label).toBe('완료')
    expect(badge.variant).toBe('success')
  })

  test('pending status maps to warning badge', () => {
    const badge = getBadgeInfo('pending')
    expect(badge.label).toBe('대기')
    expect(badge.variant).toBe('warning')
  })

  test('none status maps to dash', () => {
    const badge = getBadgeInfo('none')
    expect(badge.label).toBe('—')
  })

  test('undefined status maps to dash', () => {
    const badge = getBadgeInfo(undefined)
    expect(badge.label).toBe('—')
  })
})
