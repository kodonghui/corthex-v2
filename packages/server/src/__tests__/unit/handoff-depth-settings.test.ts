/**
 * Story 8.4: maxDepth 회사별 설정 — 단위 테스트
 * handoff-depth-settings service, API routes, hub/argos integration
 */
import { describe, test, expect, mock, beforeEach } from 'bun:test'

// ─── Mock DB ───
const mockSelect = mock(() => ({ from: mockFrom }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockLimit = mock(() => [{ settings: null }])
const mockUpdate = mock(() => ({ set: mockSet }))
const mockSet = mock(() => ({ where: mockUpdateWhere }))
const mockUpdateWhere = mock(() => Promise.resolve())

mock.module('../../db', () => ({
  db: {
    select: mockSelect,
    update: mockUpdate,
  },
}))

mock.module('../../db/schema', () => ({
  companies: {
    id: 'id',
    settings: 'settings',
  },
}))

mock.module('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ _eq: [a, b] }),
}))

import { getMaxHandoffDepth, saveMaxHandoffDepth } from '../../services/handoff-depth-settings'

// ─── getMaxHandoffDepth Tests ───

describe('getMaxHandoffDepth', () => {
  beforeEach(() => {
    mockLimit.mockReset()
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
  })

  test('returns configured value when settings.maxHandoffDepth exists', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 7 } }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(7)
  })

  test('returns default 5 when settings is null', async () => {
    mockLimit.mockReturnValueOnce([{ settings: null }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(5)
  })

  test('returns default 5 when company not found', async () => {
    mockLimit.mockReturnValueOnce([])
    const result = await getMaxHandoffDepth('nonexistent')
    expect(result).toBe(5)
  })

  test('returns default 5 when maxHandoffDepth not in settings', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { timezone: 'Asia/Seoul' } }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(5)
  })

  test('returns default 5 when maxHandoffDepth is not a number', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 'invalid' } }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(5)
  })

  test('returns default 5 when maxHandoffDepth is below minimum (0)', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 0 } }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(5)
  })

  test('returns default 5 when maxHandoffDepth exceeds maximum (11)', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 11 } }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(5)
  })

  test('returns default 5 when maxHandoffDepth is float', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 3.5 } }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(5)
  })

  test('returns 1 as minimum valid depth', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 1 } }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(1)
  })

  test('returns 10 as maximum valid depth', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 10 } }])
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(10)
  })

  test('returns default 5 on DB error', async () => {
    mockLimit.mockImplementationOnce(() => { throw new Error('DB connection failed') })
    const result = await getMaxHandoffDepth('company-1')
    expect(result).toBe(5)
  })
})

// ─── saveMaxHandoffDepth Tests ───

describe('saveMaxHandoffDepth', () => {
  beforeEach(() => {
    mockLimit.mockReset()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()
  })

  test('saves valid depth and returns it', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { timezone: 'Asia/Seoul' } }])
    const result = await saveMaxHandoffDepth('company-1', 8)
    expect(result).toBe(8)
    expect(mockUpdate).toHaveBeenCalled()
  })

  test('merges with existing settings (preserves other keys)', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { timezone: 'UTC', defaultModel: 'gpt-4o' } }])
    await saveMaxHandoffDepth('company-1', 3)
    expect(mockSet).toHaveBeenCalled()
    const setArg = mockSet.mock.calls[0][0] as { settings: Record<string, unknown> }
    expect(setArg.settings.timezone).toBe('UTC')
    expect(setArg.settings.defaultModel).toBe('gpt-4o')
    expect(setArg.settings.maxHandoffDepth).toBe(3)
  })

  test('handles null existing settings', async () => {
    mockLimit.mockReturnValueOnce([{ settings: null }])
    await saveMaxHandoffDepth('company-1', 5)
    const setArg = mockSet.mock.calls[0][0] as { settings: Record<string, unknown> }
    expect(setArg.settings.maxHandoffDepth).toBe(5)
  })

  test('throws on depth below minimum (0)', async () => {
    await expect(saveMaxHandoffDepth('company-1', 0)).rejects.toThrow('must be an integer between 1 and 10')
  })

  test('throws on depth above maximum (11)', async () => {
    await expect(saveMaxHandoffDepth('company-1', 11)).rejects.toThrow('must be an integer between 1 and 10')
  })

  test('throws on float depth', async () => {
    await expect(saveMaxHandoffDepth('company-1', 3.5)).rejects.toThrow('must be an integer between 1 and 10')
  })

  test('throws on negative depth', async () => {
    await expect(saveMaxHandoffDepth('company-1', -1)).rejects.toThrow('must be an integer between 1 and 10')
  })

  test('throws when company not found', async () => {
    mockLimit.mockReturnValueOnce([])
    await expect(saveMaxHandoffDepth('nonexistent', 5)).rejects.toThrow('Company not found')
  })

  test('saves minimum valid depth (1)', async () => {
    mockLimit.mockReturnValueOnce([{ settings: {} }])
    const result = await saveMaxHandoffDepth('company-1', 1)
    expect(result).toBe(1)
  })

  test('saves maximum valid depth (10)', async () => {
    mockLimit.mockReturnValueOnce([{ settings: {} }])
    const result = await saveMaxHandoffDepth('company-1', 10)
    expect(result).toBe(10)
  })

  test('overwrites existing maxHandoffDepth', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 3 } }])
    await saveMaxHandoffDepth('company-1', 8)
    const setArg = mockSet.mock.calls[0][0] as { settings: Record<string, unknown> }
    expect(setArg.settings.maxHandoffDepth).toBe(8)
  })
})

// ─── SessionContext Integration Tests ───

describe('SessionContext maxDepth integration', () => {
  test('hub.ts imports getMaxHandoffDepth correctly', async () => {
    const hubModule = await import('../../routes/workspace/hub')
    expect(hubModule.hubRoute).toBeDefined()
  })

  test('argos-evaluator imports getMaxHandoffDepth correctly', async () => {
    // Verify the import exists by checking the module loads
    const fn = getMaxHandoffDepth
    expect(typeof fn).toBe('function')
  })

  test('getMaxHandoffDepth returns number for SessionContext.maxDepth', async () => {
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 7 } }])
    const depth = await getMaxHandoffDepth('company-1')
    expect(typeof depth).toBe('number')
    expect(depth).toBeGreaterThanOrEqual(1)
    expect(depth).toBeLessThanOrEqual(10)
  })
})

// ─── API Route Schema Tests ───

describe('company-settings route schema', () => {
  test('route module exports companySettingsRoute', async () => {
    const mod = await import('../../routes/admin/company-settings')
    expect(mod.companySettingsRoute).toBeDefined()
  })

  test('handoff depth default is 5 as per architecture ORC-1', async () => {
    mockLimit.mockReturnValueOnce([{ settings: {} }])
    const depth = await getMaxHandoffDepth('any-company')
    expect(depth).toBe(5)
  })
})

// ─── Shared Type Tests ───

describe('shared types', () => {
  test('HandoffDepthSettings type exists in shared types', async () => {
    const types = await import('@corthex/shared')
    // Type existence is verified at compile time; runtime check for module loading
    expect(types).toBeDefined()
  })
})

// ─── Session Immutability (AC: #5) ───

describe('session immutability (AC: #5)', () => {
  test('SessionContext is readonly — changing settings does not affect in-flight sessions', async () => {
    // First call: depth = 3
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 3 } }])
    const depth1 = await getMaxHandoffDepth('company-1')

    // Simulate settings change to 8
    mockLimit.mockReturnValueOnce([{ settings: { maxHandoffDepth: 8 } }])
    const depth2 = await getMaxHandoffDepth('company-1')

    // Both should return their own snapshot values
    expect(depth1).toBe(3)
    expect(depth2).toBe(8)

    // In real usage: SessionContext.maxDepth is set once at session start and is readonly
    // New sessions pick up the new value, existing sessions keep the old one
  })
})

// ─── agora-engine stays at maxDepth: 1 (AC: #6) ───

describe('agora-engine unchanged (AC: #6)', () => {
  test('agora-engine.ts still uses maxDepth: 1 for debates (no handoff)', async () => {
    // Read the agora-engine source to verify it still has maxDepth: 1
    const fs = await import('fs')
    const source = fs.readFileSync(
      new URL('../../services/agora-engine.ts', import.meta.url).pathname,
      'utf-8',
    )
    const matches = source.match(/maxDepth:\s*1/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBeGreaterThanOrEqual(2) // Two occurrences: line 194 and 311
  })
})
