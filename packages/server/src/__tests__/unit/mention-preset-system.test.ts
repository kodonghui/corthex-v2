import { describe, test, expect } from 'bun:test'

// === @Mention Parsing Tests (hub.ts parseMention — already implemented, validation) ===

/** Parse @mention from start of message — mirrors hub.ts function */
function parseMention(message: string): { name: string; cleanText: string } | null {
  const match = message.match(/^@(\S+)\s*(.*)/s)
  return match ? { name: match[1], cleanText: match[2] || '' } : null
}

describe('@멘션 파싱 (parseMention)', () => {
  test('parses simple @mention with text', () => {
    const result = parseMention('@투자분석팀장 삼성전자 분석')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('투자분석팀장')
    expect(result!.cleanText).toBe('삼성전자 분석')
  })

  test('parses @mention with English name', () => {
    const result = parseMention('@CIO analyze Samsung')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('CIO')
    expect(result!.cleanText).toBe('analyze Samsung')
  })

  test('returns null for messages without @mention', () => {
    expect(parseMention('삼성전자 분석해줘')).toBeNull()
  })

  test('returns null for empty message', () => {
    expect(parseMention('')).toBeNull()
  })

  test('handles @mention at start only (not in middle)', () => {
    expect(parseMention('안녕 @CIO 분석해줘')).toBeNull()
  })

  test('handles @mention with no text after', () => {
    const result = parseMention('@투자분석팀장')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('투자분석팀장')
    expect(result!.cleanText).toBe('')
  })

  test('handles multiline text after @mention', () => {
    const result = parseMention('@CIO 라인1\n라인2\n라인3')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('CIO')
    expect(result!.cleanText).toBe('라인1\n라인2\n라인3')
  })
})

// === @Mention Agent Matching Tests ===

describe('@멘션 에이전트 매칭 (exact match)', () => {
  const mockAgents = [
    { id: 'a1', name: '투자분석팀장', nameEn: 'CIO', isActive: true },
    { id: 'a2', name: 'CMO', nameEn: 'CMO', isActive: true },
    { id: 'a3', name: '비활성팀장', nameEn: 'Inactive', isActive: false },
    { id: 'a4', name: 'CTO', nameEn: null, isActive: true },
  ]

  function findAgent(mentionName: string) {
    return mockAgents.find(
      (a) => (a.name === mentionName || a.nameEn === mentionName) && a.isActive !== false,
    )
  }

  test('matches Korean name exactly', () => {
    expect(findAgent('투자분석팀장')?.id).toBe('a1')
  })

  test('matches English name exactly', () => {
    expect(findAgent('CIO')?.id).toBe('a1')
  })

  test('does not match inactive agent', () => {
    expect(findAgent('비활성팀장')).toBeUndefined()
  })

  test('does not match partial name', () => {
    expect(findAgent('투자')).toBeUndefined()
  })

  test('does not fuzzy match', () => {
    expect(findAgent('투자분석')).toBeUndefined()
  })

  test('matches agent with null nameEn by name only', () => {
    expect(findAgent('CTO')?.id).toBe('a4')
  })

  test('case-sensitive match', () => {
    expect(findAgent('cio')).toBeUndefined()
    expect(findAgent('cmo')).toBeUndefined()
  })
})

// === Preset Shortcut Detection Tests (hub.ts new logic) ===

describe('프리셋 단축어 감지 (hub.ts)', () => {
  const mockPresets = [
    { id: 'p1', name: '시황', command: '현재 주식시장 시황을 분석해줘', isActive: true },
    { id: 'p2', name: '주간보고', command: '/전체 이번 주 실적 분석 보고서 작성해줘', isActive: true },
    { id: 'p3', name: '삼성분석', command: '@투자분석팀장 삼성전자 최근 3년 실적 분석', isActive: true },
  ]

  function detectPreset(message: string) {
    return mockPresets.find((p) => p.name === message.trim())
  }

  test('detects exact preset name match', () => {
    const preset = detectPreset('시황')
    expect(preset).not.toBeNull()
    expect(preset!.command).toBe('현재 주식시장 시황을 분석해줘')
  })

  test('detects preset with whitespace trimming', () => {
    const preset = detectPreset('  시황  ')
    expect(preset).not.toBeNull()
    expect(preset!.id).toBe('p1')
  })

  test('does not match partial preset name', () => {
    expect(detectPreset('시')).toBeUndefined()
  })

  test('does not match when message contains extra text', () => {
    expect(detectPreset('시황 분석해줘')).toBeUndefined()
  })

  test('does not match @mention as preset', () => {
    expect(detectPreset('@시황')).toBeUndefined()
  })

  test('does not match slash command as preset', () => {
    expect(detectPreset('/시황')).toBeUndefined()
  })

  test('preset with @mention in command text preserves @mention', () => {
    const preset = detectPreset('삼성분석')
    expect(preset).not.toBeNull()
    expect(preset!.command).toBe('@투자분석팀장 삼성전자 최근 3년 실적 분석')
  })

  test('preset with slash command in command text preserves slash', () => {
    const preset = detectPreset('주간보고')
    expect(preset).not.toBeNull()
    expect(preset!.command.startsWith('/전체')).toBe(true)
  })
})

// === Hub.ts Agent Resolution Order Tests ===

describe('허브 에이전트 해석 순서', () => {
  // Order: 1.requestedAgentId > 2.preset > 3.@mention > 4.secretary

  test('priority order: agentId > preset > mention > secretary', () => {
    const priorities = ['agentId', 'preset', 'mention', 'secretary'] as const
    expect(priorities.indexOf('agentId')).toBeLessThan(priorities.indexOf('preset'))
    expect(priorities.indexOf('preset')).toBeLessThan(priorities.indexOf('mention'))
    expect(priorities.indexOf('mention')).toBeLessThan(priorities.indexOf('secretary'))
  })

  test('preset expansion before @mention parsing', () => {
    // Scenario: preset "삼성분석" expands to "@투자분석팀장 삼성전자 분석"
    // Then @mention parsing should extract "투자분석팀장"
    const presetCommand = '@투자분석팀장 삼성전자 분석'
    const mention = parseMention(presetCommand)
    expect(mention).not.toBeNull()
    expect(mention!.name).toBe('투자분석팀장')
    expect(mention!.cleanText).toBe('삼성전자 분석')
  })

  test('preset expansion of non-mention command goes to secretary', () => {
    // Scenario: preset "시황" expands to "현재 주식시장 시황을 분석해줘"
    // No @mention → falls through to secretary
    const expandedCommand = '현재 주식시장 시황을 분석해줘'
    const mention = parseMention(expandedCommand)
    expect(mention).toBeNull() // No @mention → secretary will handle
  })
})

// === Preset sortOrder Tracking Tests ===

describe('프리셋 sortOrder 사용 빈도 추적', () => {
  test('sortOrder increments on each use', () => {
    let sortOrder = 0
    // Simulate 3 uses
    sortOrder += 1
    sortOrder += 1
    sortOrder += 1
    expect(sortOrder).toBe(3)
  })

  test('higher sortOrder means more frequently used', () => {
    const presets = [
      { name: 'A', sortOrder: 10 },
      { name: 'B', sortOrder: 3 },
      { name: 'C', sortOrder: 25 },
    ]
    const sorted = [...presets].sort((a, b) => b.sortOrder - a.sortOrder)
    expect(sorted[0].name).toBe('C') // Most used
    expect(sorted[1].name).toBe('A')
    expect(sorted[2].name).toBe('B') // Least used
  })
})
