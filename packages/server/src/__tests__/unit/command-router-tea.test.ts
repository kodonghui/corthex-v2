/**
 * TEA (Test Architect) Generated Tests
 * Story 5-1: CommandRouter + Type Classification
 * Risk-based coverage expansion
 */
import { describe, it, expect } from 'bun:test'
import { parseSlash, parseMention, classify } from '../../services/command-router'
import type { ClassifyOptions } from '../../services/command-router'

const baseOptions: ClassifyOptions = {
  companyId: '00000000-0000-0000-0000-000000000001',
  userId: '00000000-0000-0000-0000-000000000002',
}

// ==========================================
// TEA Risk Category: Classification Priority Conflicts
// Risk: Incorrect priority when multiple signals present
// ==========================================

describe('TEA: classification priority conflicts', () => {
  it('preset overrides @mention text', async () => {
    const result = await classify('@마케팅부장 분석', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
    })
    expect(result.type).toBe('preset')
    expect(result.parsedMeta.presetId).toBeDefined()
  })

  it('preset overrides batch flag', async () => {
    const result = await classify('분석', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
      useBatch: true,
    })
    expect(result.type).toBe('preset')
  })

  it('preset overrides slash command', async () => {
    const result = await classify('/전체 분석', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
    })
    expect(result.type).toBe('preset')
  })

  it('batch overrides @mention', async () => {
    const result = await classify('@마케팅부장 분석', {
      ...baseOptions,
      useBatch: true,
    })
    expect(result.type).toBe('batch')
  })

  it('slash overrides @mention text', async () => {
    // When text starts with slash, slash takes precedence
    const result = await classify('/전체 @마케팅부장 분석', baseOptions)
    expect(result.type).toBe('all')
  })

  it('explicit targetAgentId without mention text classifies as mention', async () => {
    const result = await classify('그냥 텍스트', {
      ...baseOptions,
      targetAgentId: '00000000-0000-0000-0000-000000000010',
    })
    expect(result.type).toBe('mention')
    expect(result.targetAgentId).toBe('00000000-0000-0000-0000-000000000010')
  })

  it('preset + batch + slash + targetAgentId = preset wins', async () => {
    const result = await classify('/전체 분석', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
      useBatch: true,
      targetAgentId: '00000000-0000-0000-0000-000000000010',
    })
    expect(result.type).toBe('preset')
  })
})

// ==========================================
// TEA Risk Category: Slash Command Boundary Testing
// Risk: Partial matches, similar prefixes, unicode edge cases
// ==========================================

describe('TEA: slash command boundaries', () => {
  it('does not match /토 (incomplete /토론)', () => {
    expect(parseSlash('/토')).toBeNull()
  })

  it('does not match /심층 (incomplete /심층토론)', () => {
    expect(parseSlash('/심층')).toBeNull()
  })

  it('/심층토론 does not match /토론 prefix', () => {
    const result = parseSlash('/심층토론 주제')
    expect(result!.slashType).toBe('deep_debate')
    expect(result!.slashType).not.toBe('debate')
  })

  it('/토론방 (with suffix) does not match /토론', () => {
    expect(parseSlash('/토론방 주제')).toBeNull()
  })

  it('/배치 (incomplete) does not match /배치실행 or /배치상태', () => {
    expect(parseSlash('/배치')).toBeNull()
  })

  it('/배치실행상태 does not match /배치실행', () => {
    expect(parseSlash('/배치실행상태')).toBeNull()
  })

  it('handles tab character after slash command', () => {
    const result = parseSlash('/전체\t분석')
    // Tab is not a space, so /전체\t분석 won't match /전체 + space
    expect(result).toBeNull()
  })

  it('handles double slash', () => {
    expect(parseSlash('//전체')).toBeNull()
  })

  it('handles slash at end of text', () => {
    expect(parseSlash('분석/')).toBeNull()
  })
})

// ==========================================
// TEA Risk Category: @Mention Edge Cases
// Risk: Injection, special characters in agent names
// ==========================================

describe('TEA: mention edge cases', () => {
  it('handles @ followed by numbers', () => {
    const result = parseMention('@123 분석')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('123')
  })

  it('handles @ followed by hyphenated name', () => {
    const result = parseMention('@AI-분석가 작업')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('AI-분석가')
  })

  it('handles @ followed by underscore name', () => {
    const result = parseMention('@test_agent 작업')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('test_agent')
  })

  it('handles @@ (double at)', () => {
    const result = parseMention('@@agent 분석')
    expect(result).not.toBeNull()
    // Should capture @agent as the name including @
    expect(result!.mentionName).toBe('@@agent'.match(/^@(\S+)/)?.[1])
  })

  it('does not parse mention from middle of word', () => {
    expect(parseMention('email@agent.com test')).toBeNull()
  })

  it('returns null for just @', () => {
    expect(parseMention('@')).toBeNull()
  })

  it('returns null for @ followed by space', () => {
    expect(parseMention('@ 분석해줘')).toBeNull()
  })

  it('handles unicode emoji in mention name', () => {
    const result = parseMention('@분석봇🤖 작업')
    expect(result).not.toBeNull()
    // The emoji is part of the non-space match
    expect(result!.mentionName).toContain('분석봇')
  })
})

// ==========================================
// TEA Risk Category: Text Input Sanitization
// Risk: XSS-like content, SQL-like content in text field
// ==========================================

describe('TEA: text input handling', () => {
  it('preserves HTML-like content in text (server handles, not router)', async () => {
    const result = await classify('<script>alert("xss")</script>', baseOptions)
    expect(result.type).toBe('direct')
    expect(result.text).toBe('<script>alert("xss")</script>')
  })

  it('preserves SQL-like content in text', async () => {
    const result = await classify("'; DROP TABLE commands; --", baseOptions)
    expect(result.type).toBe('direct')
    expect(result.text).toBe("'; DROP TABLE commands; --")
  })

  it('handles null bytes in text gracefully', async () => {
    const result = await classify('텍스트\x00명령', baseOptions)
    expect(result.type).toBe('direct')
  })

  it('handles extremely short text (1 char)', async () => {
    const result = await classify('A', baseOptions)
    expect(result.type).toBe('direct')
    expect(result.text).toBe('A')
  })

  it('trims whitespace-only text', async () => {
    const result = await classify('   ', baseOptions)
    expect(result.type).toBe('direct')
    expect(result.text).toBe('')
  })
})

// ==========================================
// TEA Risk Category: Classify Result Structure
// Risk: Missing fields in result object
// ==========================================

describe('TEA: classify result structure validation', () => {
  it('direct result has all required fields', async () => {
    const result = await classify('테스트', baseOptions)
    expect(result.type).toBeDefined()
    expect(result.text).toBeDefined()
    expect(result.targetAgentId).toBeDefined()
    expect(result.parsedMeta).toBeDefined()
    expect(result.parsedMeta.timeoutMs).toBeGreaterThan(0)
  })

  it('slash result has slashType in parsedMeta', async () => {
    const result = await classify('/전체 분석', baseOptions)
    expect(result.parsedMeta.slashType).toBeDefined()
    expect(typeof result.parsedMeta.slashType).toBe('string')
  })

  it('preset result has presetId in parsedMeta', async () => {
    const result = await classify('텍스트', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
    })
    expect(result.parsedMeta.presetId).toBe('00000000-0000-0000-0000-000000000099')
  })

  it('batch result has no extra fields', async () => {
    const result = await classify('텍스트', { ...baseOptions, useBatch: true })
    expect(result.type).toBe('batch')
    expect(result.parsedMeta.slashType).toBeUndefined()
    expect(result.parsedMeta.presetId).toBeUndefined()
    expect(result.parsedMeta.mentionName).toBeUndefined()
  })

  it('slash with no args has undefined slashArgs', async () => {
    const result = await classify('/도구점검', baseOptions)
    expect(result.parsedMeta.slashArgs).toBeUndefined()
  })

  it('slash with args has defined slashArgs', async () => {
    const result = await classify('/전체 작업', baseOptions)
    expect(result.parsedMeta.slashArgs).toBe('작업')
  })

  it('targetAgentId is null for direct commands', async () => {
    const result = await classify('일반 텍스트', baseOptions)
    expect(result.targetAgentId).toBeNull()
  })

  it('targetAgentId is string for explicit target', async () => {
    const result = await classify('텍스트', {
      ...baseOptions,
      targetAgentId: '00000000-0000-0000-0000-000000000010',
    })
    expect(typeof result.targetAgentId).toBe('string')
  })
})

// ==========================================
// TEA Risk Category: Timeout Correctness (NFR1/NFR2)
// Risk: Wrong timeout leads to premature cancellation or infinite wait
// ==========================================

describe('TEA: timeout correctness (NFR compliance)', () => {
  const timeoutCases: [string, ClassifyOptions, number][] = [
    ['direct text', baseOptions, 60_000],
    ['/전체 분석', baseOptions, 300_000],
    ['/순차 분석', baseOptions, 300_000],
    ['/토론 주제', baseOptions, 300_000],
    ['/심층토론 주제', baseOptions, 300_000],
    ['/도구점검', baseOptions, 30_000],
    ['/배치실행', baseOptions, 30_000],
    ['/배치상태', baseOptions, 30_000],
    ['/명령어', baseOptions, 30_000],
  ]

  for (const [text, opts, expected] of timeoutCases) {
    it(`timeout for "${text}" is ${expected}ms`, async () => {
      const result = await classify(text, opts)
      expect(result.parsedMeta.timeoutMs).toBe(expected)
    })
  }

  it('batch timeout is 300s regardless of text content', async () => {
    const result = await classify('/도구점검', { ...baseOptions, useBatch: true })
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('preset timeout is 60s regardless of text content', async () => {
    const result = await classify('/전체 분석', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
    })
    expect(result.parsedMeta.timeoutMs).toBe(60_000)
  })
})

// ==========================================
// TEA Risk Category: All 8 Slash Commands Comprehensive
// Risk: Missing implementation for any slash command
// ==========================================

describe('TEA: comprehensive slash command verification', () => {
  const allSlash: [string, string, string][] = [
    ['/전체',     'all',           'all'],
    ['/순차',     'sequential',    'sequential'],
    ['/도구점검', 'tool_check',    'slash'],
    ['/배치실행', 'batch_run',     'slash'],
    ['/배치상태', 'batch_status',  'slash'],
    ['/명령어',   'commands_list', 'slash'],
    ['/토론',     'debate',        'slash'],
    ['/심층토론', 'deep_debate',   'slash'],
  ]

  for (const [cmd, expectedSlashType, expectedCommandType] of allSlash) {
    it(`${cmd} -> slashType=${expectedSlashType}, commandType=${expectedCommandType}`, () => {
      const result = parseSlash(cmd)
      expect(result).not.toBeNull()
      expect(result!.slashType).toBe(expectedSlashType)
      expect(result!.commandType).toBe(expectedCommandType)
    })

    it(`${cmd} with args preserves args`, () => {
      const result = parseSlash(`${cmd} 테스트 인자`)
      expect(result).not.toBeNull()
      expect(result!.args).toBe('테스트 인자')
    })

    it(`${cmd} classify produces correct type`, async () => {
      const result = await classify(`${cmd} 테스트`, baseOptions)
      expect(result.type).toBe(expectedCommandType)
    })
  }
})

// ==========================================
// TEA Risk Category: Options Object Edge Cases
// Risk: Nullish values in options causing crashes
// ==========================================

describe('TEA: options object edge cases', () => {
  it('handles undefined targetAgentId', async () => {
    const result = await classify('테스트', {
      companyId: '00000000-0000-0000-0000-000000000001',
      userId: '00000000-0000-0000-0000-000000000002',
      targetAgentId: undefined,
    })
    expect(result.type).toBe('direct')
  })

  it('handles null targetAgentId', async () => {
    const result = await classify('테스트', {
      companyId: '00000000-0000-0000-0000-000000000001',
      userId: '00000000-0000-0000-0000-000000000002',
      targetAgentId: null,
    })
    expect(result.type).toBe('direct')
  })

  it('handles null presetId', async () => {
    const result = await classify('테스트', {
      ...baseOptions,
      presetId: null,
    })
    expect(result.type).toBe('direct')
  })

  it('handles false useBatch', async () => {
    const result = await classify('테스트', {
      ...baseOptions,
      useBatch: false,
    })
    expect(result.type).toBe('direct')
  })

  it('handles empty string targetAgentId', async () => {
    const result = await classify('테스트', {
      ...baseOptions,
      targetAgentId: '',
    })
    // Empty string is falsy -> direct
    expect(result.type).toBe('direct')
  })
})
