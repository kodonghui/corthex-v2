import { describe, it, expect } from 'bun:test'
import { parseSlash, parseMention, classify } from '../../services/command-router'
import type { ClassifyOptions, SlashType, CommandType } from '../../services/command-router'

// ==========================================
// parseSlash tests
// ==========================================

describe('parseSlash', () => {
  it('parses /전체 with args', () => {
    const result = parseSlash('/전체 시장 분석')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('all')
    expect(result!.commandType).toBe('all')
    expect(result!.args).toBe('시장 분석')
  })

  it('parses /전체 without args', () => {
    const result = parseSlash('/전체')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('all')
    expect(result!.args).toBe('')
  })

  it('parses /순차 with args', () => {
    const result = parseSlash('/순차 삼성전자 분석')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('sequential')
    expect(result!.commandType).toBe('sequential')
    expect(result!.args).toBe('삼성전자 분석')
  })

  it('parses /도구점검', () => {
    const result = parseSlash('/도구점검')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('tool_check')
    expect(result!.commandType).toBe('slash')
    expect(result!.args).toBe('')
  })

  it('parses /배치실행', () => {
    const result = parseSlash('/배치실행')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('batch_run')
    expect(result!.commandType).toBe('slash')
  })

  it('parses /배치상태', () => {
    const result = parseSlash('/배치상태')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('batch_status')
    expect(result!.commandType).toBe('slash')
  })

  it('parses /명령어', () => {
    const result = parseSlash('/명령어')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('commands_list')
    expect(result!.commandType).toBe('slash')
  })

  it('parses /토론 with topic', () => {
    const result = parseSlash('/토론 AI 시대의 투자 전략')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('debate')
    expect(result!.commandType).toBe('slash')
    expect(result!.args).toBe('AI 시대의 투자 전략')
  })

  it('parses /심층토론 with topic', () => {
    const result = parseSlash('/심층토론 반도체 산업 전망')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('deep_debate')
    expect(result!.commandType).toBe('slash')
    expect(result!.args).toBe('반도체 산업 전망')
  })

  it('returns null for non-slash text', () => {
    expect(parseSlash('삼성전자 분석해줘')).toBeNull()
  })

  it('returns null for unknown slash command', () => {
    expect(parseSlash('/알수없는명령')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseSlash('')).toBeNull()
  })

  it('handles leading/trailing whitespace', () => {
    const result = parseSlash('  /전체 분석  ')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('all')
    expect(result!.args).toBe('분석')
  })

  it('does not partial-match slash commands', () => {
    // /전체abc should not match /전체
    expect(parseSlash('/전체abc')).toBeNull()
  })

  it('handles /토론 without topic', () => {
    const result = parseSlash('/토론')
    expect(result).not.toBeNull()
    expect(result!.slashType).toBe('debate')
    expect(result!.args).toBe('')
  })

  it('correctly distinguishes /토론 from /심층토론', () => {
    const debate = parseSlash('/토론 주제')
    const deepDebate = parseSlash('/심층토론 주제')
    expect(debate!.slashType).toBe('debate')
    expect(deepDebate!.slashType).toBe('deep_debate')
  })

  // All 8 slash commands present
  it('supports all 8 slash commands', () => {
    const cmds = ['/전체', '/순차', '/도구점검', '/배치실행', '/배치상태', '/명령어', '/토론', '/심층토론']
    for (const cmd of cmds) {
      const result = parseSlash(cmd)
      expect(result).not.toBeNull()
    }
  })
})

// ==========================================
// parseMention tests
// ==========================================

describe('parseMention', () => {
  it('parses @mention at start of text', () => {
    const result = parseMention('@마케팅부장 삼성전자 분석해줘')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('마케팅부장')
    expect(result!.cleanText).toBe('삼성전자 분석해줘')
  })

  it('parses @mention with no following text', () => {
    const result = parseMention('@CIO')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('CIO')
    expect(result!.cleanText).toBe('')
  })

  it('returns null for text without @mention', () => {
    expect(parseMention('삼성전자 분석해줘')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseMention('')).toBeNull()
  })

  it('returns null for @ in middle of text', () => {
    expect(parseMention('이메일: test@test.com')).toBeNull()
  })

  it('handles whitespace-only after @mention', () => {
    const result = parseMention('@전략부장   ')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('전략부장')
    expect(result!.cleanText).toBe('')
  })

  it('handles leading whitespace', () => {
    const result = parseMention('  @법무부장 계약서 검토')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('법무부장')
    expect(result!.cleanText).toBe('계약서 검토')
  })

  it('parses English agent names', () => {
    const result = parseMention('@AnalystBot analyze AAPL')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('AnalystBot')
    expect(result!.cleanText).toBe('analyze AAPL')
  })

  it('handles multiline text after mention', () => {
    const result = parseMention('@마케팅부장 1. 분석\n2. 보고서')
    expect(result).not.toBeNull()
    expect(result!.mentionName).toBe('마케팅부장')
    expect(result!.cleanText).toBe('1. 분석\n2. 보고서')
  })
})

// ==========================================
// classify tests (without DB — mock resolveMentionAgent)
// ==========================================

// Since classify depends on DB for mention resolution, we test the non-DB paths
// and the full flow separately

describe('classify', () => {
  const baseOptions: ClassifyOptions = {
    companyId: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000002',
  }

  // --- Preset ---
  it('classifies preset when presetId provided', async () => {
    const result = await classify('삼성전자 분석', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
    })
    expect(result.type).toBe('preset')
    expect(result.parsedMeta.presetId).toBe('00000000-0000-0000-0000-000000000099')
    expect(result.parsedMeta.timeoutMs).toBe(60_000)
  })

  // --- Batch ---
  it('classifies batch when useBatch=true', async () => {
    const result = await classify('데이터 수집', {
      ...baseOptions,
      useBatch: true,
    })
    expect(result.type).toBe('batch')
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  // --- Slash commands ---
  it('classifies /전체 as type=all', async () => {
    const result = await classify('/전체 시장 분석', baseOptions)
    expect(result.type).toBe('all')
    expect(result.parsedMeta.slashType).toBe('all')
    expect(result.parsedMeta.slashArgs).toBe('시장 분석')
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('classifies /순차 as type=sequential', async () => {
    const result = await classify('/순차 순차 작업', baseOptions)
    expect(result.type).toBe('sequential')
    expect(result.parsedMeta.slashType).toBe('sequential')
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('classifies /토론 as type=slash with debate slashType', async () => {
    const result = await classify('/토론 AI 미래', baseOptions)
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('debate')
    expect(result.parsedMeta.slashArgs).toBe('AI 미래')
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('classifies /심층토론 as type=slash with deep_debate slashType', async () => {
    const result = await classify('/심층토론 주제', baseOptions)
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('deep_debate')
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('classifies /도구점검 as slash with 30s timeout', async () => {
    const result = await classify('/도구점검', baseOptions)
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('tool_check')
    expect(result.parsedMeta.timeoutMs).toBe(30_000)
  })

  it('classifies /배치실행 as slash', async () => {
    const result = await classify('/배치실행', baseOptions)
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('batch_run')
  })

  it('classifies /배치상태 as slash', async () => {
    const result = await classify('/배치상태', baseOptions)
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('batch_status')
  })

  it('classifies /명령어 as slash', async () => {
    const result = await classify('/명령어', baseOptions)
    expect(result.type).toBe('slash')
    expect(result.parsedMeta.slashType).toBe('commands_list')
  })

  // --- Priority: preset > batch > slash ---
  it('preset takes priority over slash', async () => {
    const result = await classify('/전체 분석', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
    })
    expect(result.type).toBe('preset')
  })

  it('batch takes priority over slash', async () => {
    const result = await classify('/전체 분석', {
      ...baseOptions,
      useBatch: true,
    })
    expect(result.type).toBe('batch')
  })

  // --- Direct with explicit targetAgentId ---
  it('classifies as mention when targetAgentId provided (no @)', async () => {
    const result = await classify('삼성전자 분석', {
      ...baseOptions,
      targetAgentId: '00000000-0000-0000-0000-000000000010',
    })
    expect(result.type).toBe('mention')
    expect(result.targetAgentId).toBe('00000000-0000-0000-0000-000000000010')
  })

  // --- Direct (default) ---
  it('classifies plain text as direct', async () => {
    const result = await classify('삼성전자 분석해줘', baseOptions)
    expect(result.type).toBe('direct')
    expect(result.targetAgentId).toBeNull()
    expect(result.parsedMeta.timeoutMs).toBe(60_000)
  })

  it('classifies empty-ish text as direct', async () => {
    const result = await classify('   hello   ', baseOptions)
    expect(result.type).toBe('direct')
    expect(result.text).toBe('hello')
  })

  // --- @mention falls back to direct when agent not found ---
  it('falls back to direct when @mention agent not found in DB', async () => {
    // resolveMentionAgent returns null (no matching agent or DB unavailable) -> falls to direct
    const result = await classify('@없는에이전트 분석', baseOptions)
    expect(result.type).toBe('direct')
    expect(result.targetAgentId).toBeNull()
  })

  // --- /전체 with no args sets slashArgs to undefined ---
  it('sets slashArgs to undefined when slash has no args', async () => {
    const result = await classify('/전체', baseOptions)
    expect(result.parsedMeta.slashArgs).toBeUndefined()
  })

  // --- Unknown slash falls back to direct ---
  it('unknown slash command falls back to direct', async () => {
    const result = await classify('/알수없는 커맨드', baseOptions)
    expect(result.type).toBe('direct')
  })

  // --- Preserves raw text ---
  it('preserves raw text in result', async () => {
    const result = await classify('/전체 시장 분석', baseOptions)
    expect(result.text).toBe('/전체 시장 분석')
  })
})

// ==========================================
// Timeout mapping tests
// ==========================================

describe('timeout mapping', () => {
  const baseOptions: ClassifyOptions = {
    companyId: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000002',
  }

  it('direct command has 60s timeout', async () => {
    const result = await classify('테스트', baseOptions)
    expect(result.parsedMeta.timeoutMs).toBe(60_000)
  })

  it('/전체 has 300s timeout', async () => {
    const result = await classify('/전체 분석', baseOptions)
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('/순차 has 300s timeout', async () => {
    const result = await classify('/순차 분석', baseOptions)
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('/토론 has 300s timeout', async () => {
    const result = await classify('/토론 주제', baseOptions)
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('/심층토론 has 300s timeout', async () => {
    const result = await classify('/심층토론 주제', baseOptions)
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })

  it('/도구점검 has 30s timeout', async () => {
    const result = await classify('/도구점검', baseOptions)
    expect(result.parsedMeta.timeoutMs).toBe(30_000)
  })

  it('preset has 60s timeout', async () => {
    const result = await classify('테스트', {
      ...baseOptions,
      presetId: '00000000-0000-0000-0000-000000000099',
    })
    expect(result.parsedMeta.timeoutMs).toBe(60_000)
  })

  it('batch has 300s timeout', async () => {
    const result = await classify('테스트', { ...baseOptions, useBatch: true })
    expect(result.parsedMeta.timeoutMs).toBe(300_000)
  })
})

// ==========================================
// Edge cases
// ==========================================

describe('edge cases', () => {
  const baseOptions: ClassifyOptions = {
    companyId: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000002',
  }

  it('handles very long text', async () => {
    const longText = '분석 '.repeat(1000).trim()
    const result = await classify(longText, baseOptions)
    expect(result.type).toBe('direct')
    expect(result.text).toBe(longText)
  })

  it('handles special characters in text', async () => {
    const result = await classify('삼성전자 $AAPL & 포트폴리오 <분석>', baseOptions)
    expect(result.type).toBe('direct')
  })

  it('handles newlines in text', async () => {
    const result = await classify('1. 삼성전자\n2. SK하이닉스\n3. LG에너지솔루션', baseOptions)
    expect(result.type).toBe('direct')
  })

  it('handles slash command with newlines in args', async () => {
    const result = await classify('/전체 1. 삼성전자\n2. SK하이닉스', baseOptions)
    expect(result.type).toBe('all')
    expect(result.parsedMeta.slashArgs).toBe('1. 삼성전자\n2. SK하이닉스')
  })

  it('does not confuse email @ with mention', async () => {
    // @ not at start
    const result = await classify('이메일: test@example.com 확인', baseOptions)
    expect(result.type).toBe('direct')
  })

  it('handles multiple spaces between slash and args', async () => {
    const result = await classify('/전체    많은    공백', baseOptions)
    expect(result.type).toBe('all')
    expect(result.parsedMeta.slashArgs).toBe('많은    공백')
  })
})
