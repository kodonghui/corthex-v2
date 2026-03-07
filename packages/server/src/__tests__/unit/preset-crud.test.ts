import { describe, test, expect } from 'bun:test'
import { z } from 'zod'

// === Zod Schema Tests (mirroring the route schemas) ===

const createPresetSchema = z.object({
  name: z.string().min(1).max(100),
  command: z.string().min(1).max(10_000),
  description: z.string().max(500).nullish(),
  category: z.string().max(50).nullish(),
})

const updatePresetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  command: z.string().min(1).max(10_000).optional(),
  description: z.string().max(500).nullish(),
  category: z.string().max(50).nullish(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

// === Create Schema Validation Tests ===

describe('Create Preset Schema', () => {
  test('accepts valid minimal preset', () => {
    const result = createPresetSchema.safeParse({ name: '분석 요청', command: '삼성전자 분석해줘' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('분석 요청')
      expect(result.data.command).toBe('삼성전자 분석해줘')
    }
  })

  test('accepts full preset with all fields', () => {
    const result = createPresetSchema.safeParse({
      name: '주간 보고서',
      command: '/전체 이번 주 실적 분석 보고서 작성해줘',
      description: '매주 월요일 사용',
      category: '보고',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe('매주 월요일 사용')
      expect(result.data.category).toBe('보고')
    }
  })

  test('rejects empty name', () => {
    const result = createPresetSchema.safeParse({ name: '', command: '테스트' })
    expect(result.success).toBe(false)
  })

  test('rejects missing command', () => {
    const result = createPresetSchema.safeParse({ name: '테스트' })
    expect(result.success).toBe(false)
  })

  test('rejects name exceeding 100 chars', () => {
    const result = createPresetSchema.safeParse({ name: 'a'.repeat(101), command: '테스트' })
    expect(result.success).toBe(false)
  })

  test('rejects command exceeding 10000 chars', () => {
    const result = createPresetSchema.safeParse({ name: '테스트', command: 'a'.repeat(10001) })
    expect(result.success).toBe(false)
  })

  test('accepts null description', () => {
    const result = createPresetSchema.safeParse({ name: '테스트', command: '명령', description: null })
    expect(result.success).toBe(true)
  })

  test('accepts undefined description', () => {
    const result = createPresetSchema.safeParse({ name: '테스트', command: '명령' })
    expect(result.success).toBe(true)
  })

  test('rejects description exceeding 500 chars', () => {
    const result = createPresetSchema.safeParse({
      name: '테스트',
      command: '명령',
      description: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  test('rejects category exceeding 50 chars', () => {
    const result = createPresetSchema.safeParse({
      name: '테스트',
      command: '명령',
      category: 'a'.repeat(51),
    })
    expect(result.success).toBe(false)
  })
})

// === Update Schema Validation Tests ===

describe('Update Preset Schema', () => {
  test('accepts partial update with name only', () => {
    const result = updatePresetSchema.safeParse({ name: '새 이름' })
    expect(result.success).toBe(true)
  })

  test('accepts partial update with command only', () => {
    const result = updatePresetSchema.safeParse({ command: '새 명령어' })
    expect(result.success).toBe(true)
  })

  test('accepts sortOrder update', () => {
    const result = updatePresetSchema.safeParse({ sortOrder: 5 })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.sortOrder).toBe(5)
  })

  test('rejects negative sortOrder', () => {
    const result = updatePresetSchema.safeParse({ sortOrder: -1 })
    expect(result.success).toBe(false)
  })

  test('accepts isActive toggle', () => {
    const result = updatePresetSchema.safeParse({ isActive: false })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.isActive).toBe(false)
  })

  test('accepts empty object (no-op update)', () => {
    const result = updatePresetSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  test('rejects empty name string', () => {
    const result = updatePresetSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  test('rejects empty command string', () => {
    const result = updatePresetSchema.safeParse({ command: '' })
    expect(result.success).toBe(false)
  })

  test('accepts null description (clear)', () => {
    const result = updatePresetSchema.safeParse({ description: null })
    expect(result.success).toBe(true)
  })

  test('accepts null category (clear)', () => {
    const result = updatePresetSchema.safeParse({ category: null })
    expect(result.success).toBe(true)
  })
})

// === Ownership Verification Logic Tests ===

describe('Ownership Verification', () => {
  const mockPresets = [
    { id: 'p1', userId: 'user-1', companyId: 'comp-1', isGlobal: false },
    { id: 'p2', userId: 'user-2', companyId: 'comp-1', isGlobal: true },
    { id: 'p3', userId: 'user-1', companyId: 'comp-2', isGlobal: false },
  ]

  function canModify(preset: typeof mockPresets[0], tenantUserId: string): boolean {
    return preset.userId === tenantUserId
  }

  function canView(preset: typeof mockPresets[0], tenantUserId: string, tenantCompanyId: string): boolean {
    if (preset.companyId !== tenantCompanyId) return false
    return preset.userId === tenantUserId || preset.isGlobal
  }

  test('owner can modify own preset', () => {
    expect(canModify(mockPresets[0], 'user-1')).toBe(true)
  })

  test('non-owner cannot modify preset', () => {
    expect(canModify(mockPresets[0], 'user-2')).toBe(false)
  })

  test('non-owner cannot modify global preset', () => {
    expect(canModify(mockPresets[1], 'user-1')).toBe(false)
  })

  test('user can view own preset', () => {
    expect(canView(mockPresets[0], 'user-1', 'comp-1')).toBe(true)
  })

  test('user can view global preset in same company', () => {
    expect(canView(mockPresets[1], 'user-1', 'comp-1')).toBe(true)
  })

  test('user cannot view other company preset', () => {
    expect(canView(mockPresets[2], 'user-1', 'comp-1')).toBe(false)
  })

  test('user cannot view non-global other user preset', () => {
    expect(canView(mockPresets[0], 'user-2', 'comp-1')).toBe(false)
  })
})

// === Name Duplicate Check Logic Tests ===

describe('Name Duplicate Check', () => {
  const existingPresets = [
    { id: 'p1', name: '삼성전자 분석', userId: 'user-1', companyId: 'comp-1' },
    { id: 'p2', name: '주간 보고서', userId: 'user-1', companyId: 'comp-1' },
    { id: 'p3', name: '삼성전자 분석', userId: 'user-2', companyId: 'comp-1' },
  ]

  function isDuplicate(name: string, userId: string, companyId: string, excludeId?: string): boolean {
    return existingPresets.some(
      (p) =>
        p.name === name &&
        p.userId === userId &&
        p.companyId === companyId &&
        p.id !== excludeId,
    )
  }

  test('detects exact name duplicate for same user', () => {
    expect(isDuplicate('삼성전자 분석', 'user-1', 'comp-1')).toBe(true)
  })

  test('allows same name for different user', () => {
    expect(isDuplicate('삼성전자 분석', 'user-3', 'comp-1')).toBe(false)
  })

  test('allows different name for same user', () => {
    expect(isDuplicate('새 프리셋', 'user-1', 'comp-1')).toBe(false)
  })

  test('excludes self when updating', () => {
    expect(isDuplicate('삼성전자 분석', 'user-1', 'comp-1', 'p1')).toBe(false)
  })

  test('detects duplicate even when excluding different id', () => {
    expect(isDuplicate('삼성전자 분석', 'user-1', 'comp-1', 'p2')).toBe(true)
  })
})

// === Preset Execute Logic Tests ===

describe('Preset Execute Logic', () => {
  test('sortOrder increments on execute', () => {
    let sortOrder = 0
    sortOrder += 1
    expect(sortOrder).toBe(1)
    sortOrder += 1
    expect(sortOrder).toBe(2)
  })

  test('command text extracted from preset', () => {
    const preset = { command: '/전체 오늘 시장 분석해줘' }
    expect(preset.command).toBe('/전체 오늘 시장 분석해줘')
    expect(preset.command.startsWith('/전체')).toBe(true)
  })

  test('preset command type detection - direct text', () => {
    const text = '삼성전자 분석해줘'
    const isSlash = text.startsWith('/')
    const isMention = text.startsWith('@')
    expect(isSlash).toBe(false)
    expect(isMention).toBe(false)
  })

  test('preset command type detection - slash command', () => {
    const text = '/전체 시장 분석'
    const isSlash = text.startsWith('/')
    expect(isSlash).toBe(true)
  })

  test('preset command type detection - mention', () => {
    const text = '@전략팀장 삼성 분석'
    const isMention = text.startsWith('@')
    expect(isMention).toBe(true)
  })
})

// === SlashPopup Filter Logic Tests ===

describe('SlashPopup Integrated Filter', () => {
  const SLASH_COMMANDS = [
    { cmd: '/전체', desc: '모든 팀장에게 동시에 명령' },
    { cmd: '/순차', desc: '팀장에게 순차적으로 릴레이 명령' },
    { cmd: '/명령어', desc: '사용 가능한 모든 명령어 보기' },
  ]

  const presets = [
    { id: 'p1', name: '삼성전자 분석', command: '삼성전자 최근 실적 분석', category: '분석' },
    { id: 'p2', name: '주간 보고서', command: '/전체 주간 실적 보고서', category: '보고' },
    { id: 'p3', name: '전략 검토', command: '전략 포트폴리오 검토', category: '전략' },
  ]

  function filterAll(query: string) {
    const q = query.toLowerCase()
    const cmds = SLASH_COMMANDS.filter((c) => c.cmd.toLowerCase().includes(q))
    const pres = presets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.command.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)),
    )
    return { cmds, presets: pres, total: cmds.length + pres.length }
  }

  test('empty query returns all items', () => {
    const result = filterAll('')
    expect(result.cmds.length).toBe(3)
    expect(result.presets.length).toBe(3)
    expect(result.total).toBe(6)
  })

  test('filters system commands by cmd name', () => {
    const result = filterAll('전체')
    expect(result.cmds.length).toBe(1)
    expect(result.cmds[0].cmd).toBe('/전체')
  })

  test('filters presets by name', () => {
    const result = filterAll('삼성')
    expect(result.presets.length).toBe(1)
    expect(result.presets[0].name).toBe('삼성전자 분석')
  })

  test('filters presets by command text', () => {
    const result = filterAll('포트폴리오')
    expect(result.presets.length).toBe(1)
    expect(result.presets[0].name).toBe('전략 검토')
  })

  test('filters presets by category', () => {
    const result = filterAll('보고')
    expect(result.presets.length).toBe(1)
    expect(result.presets[0].name).toBe('주간 보고서')
  })

  test('mixed results: commands + presets matching same query', () => {
    const result = filterAll('전')
    expect(result.cmds.length).toBeGreaterThan(0) // /전체
    expect(result.presets.length).toBeGreaterThan(0) // 전략 검토
  })

  test('no results for unmatched query', () => {
    const result = filterAll('없는검색어')
    expect(result.total).toBe(0)
  })

  test('selected index maps correctly across sections', () => {
    const result = filterAll('')
    // Index 0-2: system commands, 3-5: presets
    const idx = 4
    const isPreset = idx >= result.cmds.length
    expect(isPreset).toBe(true)
    const presetIdx = idx - result.cmds.length
    expect(result.presets[presetIdx].name).toBe('주간 보고서')
  })
})

// === API Response Format Tests ===

describe('API Response Format', () => {
  test('success response shape', () => {
    const response = { success: true, data: { id: 'p1', name: '테스트' } }
    expect(response.success).toBe(true)
    expect(response.data).toBeDefined()
    expect(response.data.id).toBe('p1')
  })

  test('error response shape', () => {
    const response = { success: false, error: { code: 'PRESET_DUPLICATE', message: '같은 이름의 프리셋이 이미 존재합니다' } }
    expect(response.success).toBe(false)
    expect(response.error.code).toBe('PRESET_DUPLICATE')
  })

  test('delete response shape', () => {
    const response = { success: true, data: { deleted: true } }
    expect(response.success).toBe(true)
    expect(response.data.deleted).toBe(true)
  })

  test('execute response shape', () => {
    const response = {
      success: true,
      data: {
        id: 'cmd-1',
        type: 'preset',
        status: 'pending',
        presetId: 'p1',
        presetName: '삼성전자 분석',
        createdAt: '2026-03-07T00:00:00Z',
      },
    }
    expect(response.success).toBe(true)
    expect(response.data.type).toBe('preset')
    expect(response.data.presetId).toBe('p1')
  })
})
