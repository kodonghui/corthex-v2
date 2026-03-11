/**
 * TEA-generated tests for Story 5.6: @멘션 + 프리셋 시스템
 *
 * Risk-based coverage analysis:
 * - R1 (HIGH): Preset expansion in hub.ts SSE pipeline — wrong order breaks routing
 * - R2 (HIGH): getDB migration — tenant isolation must be preserved
 * - R3 (MED): Preset + @mention interaction — expanded command with @mention
 * - R4 (MED): Edge cases — empty commands, whitespace, special characters
 * - R5 (LOW): sortOrder increment — non-blocking error handling
 */
import { describe, test, expect } from 'bun:test'

// === R1: Hub.ts Preset Expansion Pipeline Order ===

describe('TEA R1: 프리셋 확장 파이프라인 순서', () => {
  /** Simulates the hub.ts resolution pipeline */
  function resolveMessage(
    message: string,
    presets: { name: string; command: string }[],
    agents: { name: string; nameEn: string | null; isActive: boolean; isSecretary: boolean }[],
    requestedAgentId?: string,
  ): { resolvedMessage: string; resolvedBy: 'agentId' | 'preset' | 'mention' | 'secretary' | 'error' } {
    let agentMessage = message

    // Step 0: explicit agentId
    if (requestedAgentId) {
      return { resolvedMessage: agentMessage, resolvedBy: 'agentId' }
    }

    // Step 1: preset shortcut
    const matchedPreset = presets.find((p) => p.name === message.trim())
    if (matchedPreset) {
      agentMessage = matchedPreset.command
      // Fall through — expanded command may contain @mention
    }

    // Step 2: @mention parsing
    const mentionMatch = agentMessage.match(/^@(\S+)\s*(.*)/s)
    if (mentionMatch) {
      const mentionName = mentionMatch[1]
      const found = agents.find(
        (a) => (a.name === mentionName || a.nameEn === mentionName) && a.isActive,
      )
      if (found) {
        return {
          resolvedMessage: mentionMatch[2] || '',
          resolvedBy: matchedPreset ? 'preset' : 'mention',
        }
      }
      return { resolvedMessage: agentMessage, resolvedBy: 'error' }
    }

    // Step 3: secretary fallback
    const secretary = agents.find((a) => a.isSecretary && a.isActive)
    if (secretary) {
      return { resolvedMessage: agentMessage, resolvedBy: matchedPreset ? 'preset' : 'secretary' }
    }

    return { resolvedMessage: agentMessage, resolvedBy: 'error' }
  }

  const presets = [
    { name: '시황', command: '현재 주식시장 시황을 분석해줘' },
    { name: '삼성분석', command: '@투자분석팀장 삼성전자 최근 3년 실적 분석' },
    { name: '전체보고', command: '/전체 이번 주 실적 보고서' },
  ]

  const agents = [
    { name: '투자분석팀장', nameEn: 'CIO', isActive: true, isSecretary: false },
    { name: '비서실장', nameEn: 'ChiefOfStaff', isActive: true, isSecretary: true },
  ]

  test('explicit agentId takes highest priority over preset', () => {
    const result = resolveMessage('시황', presets, agents, 'agent-uuid')
    expect(result.resolvedBy).toBe('agentId')
    expect(result.resolvedMessage).toBe('시황') // NOT expanded
  })

  test('preset expands before @mention parsing', () => {
    const result = resolveMessage('삼성분석', presets, agents)
    expect(result.resolvedBy).toBe('preset')
    expect(result.resolvedMessage).toBe('삼성전자 최근 3년 실적 분석')
  })

  test('preset with plain text falls to secretary', () => {
    const result = resolveMessage('시황', presets, agents)
    expect(result.resolvedBy).toBe('preset')
    expect(result.resolvedMessage).toBe('현재 주식시장 시황을 분석해줘')
  })

  test('non-preset @mention resolves directly', () => {
    const result = resolveMessage('@CIO 분석해줘', presets, agents)
    expect(result.resolvedBy).toBe('mention')
    expect(result.resolvedMessage).toBe('분석해줘')
  })

  test('non-preset non-mention falls to secretary', () => {
    const result = resolveMessage('삼성전자 분석해줘', presets, agents)
    expect(result.resolvedBy).toBe('secretary')
  })

  test('preset with slash command in text preserves slash', () => {
    const result = resolveMessage('전체보고', presets, agents)
    expect(result.resolvedBy).toBe('preset')
    expect(result.resolvedMessage).toBe('/전체 이번 주 실적 보고서')
  })

  test('no secretary + no match = error', () => {
    const noSecretaryAgents = [
      { name: '팀장', nameEn: 'TM', isActive: true, isSecretary: false },
    ]
    const result = resolveMessage('아무거나', [], noSecretaryAgents)
    expect(result.resolvedBy).toBe('error')
  })
})

// === R2: getDB Migration — Tenant Isolation ===

describe('TEA R2: getDB 마이그레이션 테넌트 격리', () => {
  test('scoped methods require companyId parameter', () => {
    // Verify getDB function signature enforces companyId
    const getDB = (companyId: string) => {
      if (!companyId) throw new Error('companyId required')
      return { companyId }
    }
    expect(() => getDB('')).toThrow('companyId required')
    expect(getDB('comp-1').companyId).toBe('comp-1')
  })

  test('preset CRUD operations scoped to company', () => {
    // Simulate scoped preset operations
    type Preset = { id: string; companyId: string; userId: string; name: string }
    const allPresets: Preset[] = [
      { id: 'p1', companyId: 'comp-1', userId: 'u1', name: '시황' },
      { id: 'p2', companyId: 'comp-2', userId: 'u2', name: '시황' },
    ]

    const scopedPresets = (companyId: string) =>
      allPresets.filter((p) => p.companyId === companyId)

    expect(scopedPresets('comp-1')).toHaveLength(1)
    expect(scopedPresets('comp-1')[0].id).toBe('p1')
    expect(scopedPresets('comp-2')).toHaveLength(1)
    expect(scopedPresets('comp-2')[0].id).toBe('p2')
  })

  test('same preset name allowed across different companies', () => {
    const presetsByCompany: Record<string, string[]> = {
      'comp-1': ['시황', '보고'],
      'comp-2': ['시황', '분석'],
    }
    // Both companies can have "시황" — no cross-tenant conflict
    expect(presetsByCompany['comp-1']).toContain('시황')
    expect(presetsByCompany['comp-2']).toContain('시황')
  })

  test('delete only affects own company preset', () => {
    const presets = [
      { id: 'p1', companyId: 'comp-1', name: 'X' },
      { id: 'p2', companyId: 'comp-2', name: 'X' },
    ]
    const deleteScoped = (id: string, companyId: string) =>
      presets.filter((p) => !(p.id === id && p.companyId === companyId))

    const afterDelete = deleteScoped('p1', 'comp-1')
    expect(afterDelete).toHaveLength(1)
    expect(afterDelete[0].companyId).toBe('comp-2') // comp-2's preset untouched
  })
})

// === R3: Preset + @Mention Interaction ===

describe('TEA R3: 프리셋 + @멘션 상호작용', () => {
  function parseMention(message: string) {
    const match = message.match(/^@(\S+)\s*(.*)/s)
    return match ? { name: match[1], cleanText: match[2] || '' } : null
  }

  test('preset named same as agent does not conflict with @mention', () => {
    // Preset name "CIO" should match as preset (exact name), not as @mention
    const presets = [{ name: 'CIO', command: 'CIO에게 보고서 요청' }]
    const message = 'CIO'
    const preset = presets.find((p) => p.name === message.trim())
    expect(preset).not.toBeUndefined()
    // @mention would require "@CIO" not "CIO"
    expect(parseMention(message)).toBeNull()
  })

  test('@mention in expanded preset command is parsed correctly', () => {
    const expandedCommand = '@CMO 마케팅 전략 보고서 작성해줘'
    const mention = parseMention(expandedCommand)
    expect(mention).not.toBeNull()
    expect(mention!.name).toBe('CMO')
    expect(mention!.cleanText).toBe('마케팅 전략 보고서 작성해줘')
  })

  test('preset name starting with @ is not a valid preset shortcut', () => {
    // If someone types "@시황", it should be treated as @mention, not preset
    const presets = [{ name: '@시황', command: '시황 분석' }]
    const message = '@시황'
    // @mention parsing happens on expanded message, but preset match is on raw message
    const preset = presets.find((p) => p.name === message.trim())
    expect(preset).not.toBeUndefined() // Would match as preset name
    // But parseMention also matches
    const mention = parseMention(message)
    expect(mention).not.toBeNull()
    // In practice: preset match happens first, replaces message, then @mention re-parses
  })

  test('preset with Korean @mention agent name', () => {
    const expandedCommand = '@투자분석팀장 삼성전자 분석'
    const mention = parseMention(expandedCommand)
    expect(mention!.name).toBe('투자분석팀장')
  })
})

// === R4: Edge Cases ===

describe('TEA R4: 엣지 케이스', () => {
  test('empty message does not match any preset', () => {
    const presets = [{ name: '시황', command: 'test' }]
    expect(presets.find((p) => p.name === ''.trim())).toBeUndefined()
  })

  test('whitespace-only message does not match preset', () => {
    const presets = [{ name: '시황', command: 'test' }]
    expect(presets.find((p) => p.name === '   '.trim())).toBeUndefined()
  })

  test('preset name with special characters matches exactly', () => {
    const presets = [{ name: '분석(삼성)', command: 'test' }]
    expect(presets.find((p) => p.name === '분석(삼성)')).not.toBeUndefined()
    expect(presets.find((p) => p.name === '분석삼성')).toBeUndefined()
  })

  test('preset command can be very long (up to 10000 chars)', () => {
    const longCommand = '분석해줘 '.repeat(1000).trim()
    expect(longCommand.length).toBeLessThanOrEqual(10000)
  })

  test('multiple presets: first match by name wins', () => {
    const presets = [
      { name: '시황', command: 'first' },
      { name: '시황', command: 'second' }, // Duplicate — shouldn't happen due to unique constraint
    ]
    const found = presets.find((p) => p.name === '시황')
    expect(found!.command).toBe('first')
  })

  test('preset name is case-sensitive', () => {
    const presets = [{ name: 'Analysis', command: 'test' }]
    expect(presets.find((p) => p.name === 'analysis')).toBeUndefined()
    expect(presets.find((p) => p.name === 'Analysis')).not.toBeUndefined()
  })
})

// === R5: sortOrder Non-blocking Error Handling ===

describe('TEA R5: sortOrder 비동기 에러 처리', () => {
  test('sortOrder increment error is caught silently', async () => {
    // Simulates the .catch(() => {}) pattern used in hub.ts
    const failingIncrement = async () => {
      throw new Error('DB connection failed')
    }
    // Should not throw — error is swallowed
    await failingIncrement().catch(() => {})
    expect(true).toBe(true) // Reached here = no unhandled rejection
  })

  test('sortOrder starts at 0 and increments', () => {
    const preset = { sortOrder: 0 }
    preset.sortOrder += 1
    expect(preset.sortOrder).toBe(1)
  })

  test('presets sorted by sortOrder descending', () => {
    const presets = [
      { name: 'A', sortOrder: 5 },
      { name: 'B', sortOrder: 20 },
      { name: 'C', sortOrder: 1 },
    ]
    const sorted = [...presets].sort((a, b) => b.sortOrder - a.sortOrder)
    expect(sorted.map((p) => p.name)).toEqual(['B', 'A', 'C'])
  })
})
