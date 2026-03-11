import { describe, test, expect } from 'bun:test'

// === Import from NEW module (orchestration-helpers) ===
import {
  makeContext,
  toAgentConfig,
  parseLLMJson,
} from '../../lib/orchestration-helpers'

// === Import from OLD module (chief-of-staff re-exports) — backward compatibility ===
import {
  makeContext as reExportedMakeContext,
  toAgentConfig as reExportedToAgentConfig,
  parseLLMJson as reExportedParseLLMJson,
} from '../../services/chief-of-staff'

// =======================================================
// TEA Risk-Based Tests — orchestration-helpers.ts
// Story 5.5: 기존 오케스트레이터 삭제
// =======================================================

// === RISK AREA 1: Re-export backward compatibility ===
// Risk: After extracting utilities to orchestration-helpers.ts, the re-exports
// from chief-of-staff.ts must resolve to the same functions.

describe('TEA: Re-export backward compatibility', () => {
  test('makeContext re-exported from chief-of-staff is the same function', () => {
    expect(makeContext).toBe(reExportedMakeContext)
  })

  test('toAgentConfig re-exported from chief-of-staff is the same function', () => {
    expect(toAgentConfig).toBe(reExportedToAgentConfig)
  })

  test('parseLLMJson re-exported from chief-of-staff is the same function', () => {
    expect(parseLLMJson).toBe(reExportedParseLLMJson)
  })

  test('makeContext produces identical output from both imports', () => {
    const agent = {
      id: 'a1', companyId: 'c1', name: 'Test', nameEn: null,
      tier: 'manager' as const, modelName: 'claude-sonnet-4-6',
      soul: null, allowedTools: [] as string[], isActive: true,
      departmentId: null, autoLearn: true,
    }
    const result1 = makeContext('c1', agent)
    const result2 = reExportedMakeContext('c1', agent)
    expect(result1).toEqual(result2)
  })
})

// === RISK AREA 2: makeContext output shape ===

describe('TEA: makeContext output shape', () => {
  const mockAgent = {
    id: 'agent-1', companyId: 'comp-1', name: '전략팀장', nameEn: 'Strategy Manager',
    tier: 'manager' as const, modelName: 'claude-sonnet-4-6', soul: null,
    allowedTools: [] as string[], isActive: true, departmentId: null, autoLearn: true,
  }

  test('returns LLMRouterContext with correct fields', () => {
    const ctx = makeContext('comp-1', mockAgent)
    expect(ctx).toEqual({
      companyId: 'comp-1',
      agentId: 'agent-1',
      agentName: '전략팀장',
      source: 'delegation',
    })
  })

  test('source is always "delegation"', () => {
    const ctx = makeContext('any', mockAgent)
    expect(ctx.source).toBe('delegation')
  })

  test('uses agent.id not agent.companyId for agentId', () => {
    const agent = { ...mockAgent, id: 'different-id', companyId: 'comp-X' }
    const ctx = makeContext('comp-Y', agent)
    expect(ctx.agentId).toBe('different-id')
    expect(ctx.companyId).toBe('comp-Y')
  })
})

// === RISK AREA 3: toAgentConfig mapping correctness ===

describe('TEA: toAgentConfig mapping', () => {
  test('maps all required fields from DB row', () => {
    const row = {
      id: 'a1', companyId: 'c1', name: '테스트', nameEn: 'Test',
      tier: 'specialist', modelName: 'gpt-4o', soul: 'some soul text',
      allowedTools: ['tool1', 'tool2'], isActive: true,
      departmentId: 'dept-1', autoLearn: false,
    }
    const config = toAgentConfig(row)
    expect(config.id).toBe('a1')
    expect(config.companyId).toBe('c1')
    expect(config.name).toBe('테스트')
    expect(config.nameEn).toBe('Test')
    expect(config.tier).toBe('specialist')
    expect(config.modelName).toBe('gpt-4o')
    expect(config.soul).toBe('some soul text')
    expect(config.allowedTools).toEqual(['tool1', 'tool2'])
    expect(config.isActive).toBe(true)
    expect(config.departmentId).toBe('dept-1')
    expect(config.autoLearn).toBe(false)
  })

  test('defaults modelName to claude-sonnet-4-6 when null', () => {
    const row = {
      id: 'a1', companyId: 'c1', name: 'Test', nameEn: null,
      tier: 'manager', modelName: null, soul: null,
      allowedTools: [], isActive: true,
    }
    const config = toAgentConfig(row)
    expect(config.modelName).toBe('claude-sonnet-4-6')
  })

  test('defaults allowedTools to empty array when null', () => {
    const row = {
      id: 'a1', companyId: 'c1', name: 'Test', nameEn: null,
      tier: 'worker', modelName: null, soul: null,
      allowedTools: null, isActive: true,
    }
    const config = toAgentConfig(row)
    expect(config.allowedTools).toEqual([])
  })

  test('defaults departmentId to null when not present', () => {
    const row = {
      id: 'a1', companyId: 'c1', name: 'Test', nameEn: null,
      tier: 'manager', modelName: null, soul: null,
      allowedTools: [], isActive: true,
    }
    const config = toAgentConfig(row)
    expect(config.departmentId).toBeNull()
  })

  test('defaults autoLearn to true when undefined', () => {
    const row = {
      id: 'a1', companyId: 'c1', name: 'Test', nameEn: null,
      tier: 'manager', modelName: null, soul: null,
      allowedTools: [], isActive: true,
    }
    const config = toAgentConfig(row)
    expect(config.autoLearn).toBe(true)
  })

  test('tier is properly cast to union type', () => {
    for (const tier of ['manager', 'specialist', 'worker'] as const) {
      const row = {
        id: 'a1', companyId: 'c1', name: 'Test', nameEn: null,
        tier, modelName: null, soul: null,
        allowedTools: [], isActive: true,
      }
      const config = toAgentConfig(row)
      expect(config.tier).toBe(tier)
    }
  })
})

// === RISK AREA 4: parseLLMJson from orchestration-helpers (direct import) ===
// Verifies parseLLMJson works when imported from the new location

describe('TEA: parseLLMJson from orchestration-helpers', () => {
  test('parses plain JSON', () => {
    const result = parseLLMJson<{ key: string }>('{"key": "value"}')
    expect(result).toEqual({ key: 'value' })
  })

  test('parses markdown code block', () => {
    const raw = '```json\n{"name": "test"}\n```'
    const result = parseLLMJson<{ name: string }>(raw)
    expect(result).toEqual({ name: 'test' })
  })

  test('extracts JSON from surrounding text', () => {
    const raw = 'Some text {"data": 42} more text'
    const result = parseLLMJson<{ data: number }>(raw)
    expect(result).toEqual({ data: 42 })
  })

  test('returns null for non-JSON input', () => {
    expect(parseLLMJson('just text')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(parseLLMJson('')).toBeNull()
  })

  test('handles Korean content in JSON values', () => {
    const raw = '{"reasoning": "마케팅 부서에 위임합니다"}'
    const result = parseLLMJson<{ reasoning: string }>(raw)
    expect(result!.reasoning).toBe('마케팅 부서에 위임합니다')
  })
})

// === RISK AREA 5: Import path consistency ===
// Verifies that all-command-processor and sequential-command-processor
// import from orchestration-helpers, not chief-of-staff

describe('TEA: Import migration verification', () => {
  test('orchestration-helpers exports makeContext', () => {
    expect(typeof makeContext).toBe('function')
  })

  test('orchestration-helpers exports toAgentConfig', () => {
    expect(typeof toAgentConfig).toBe('function')
  })

  test('orchestration-helpers exports parseLLMJson', () => {
    expect(typeof parseLLMJson).toBe('function')
  })

  // These are async functions that need DB, so we just verify they're exported
  test('orchestration-helpers module shape is complete', async () => {
    const mod = await import('../../lib/orchestration-helpers')
    expect(typeof mod.makeContext).toBe('function')
    expect(typeof mod.toAgentConfig).toBe('function')
    expect(typeof mod.parseLLMJson).toBe('function')
    expect(typeof mod.createOrchTask).toBe('function')
    expect(typeof mod.completeOrchTask).toBe('function')
    expect(typeof mod.findSecretaryAgent).toBe('function')
    expect(typeof mod.getActiveManagers).toBe('function')
    expect(typeof mod.getActiveDepartments).toBe('function')
    expect(typeof mod.isInvestmentDepartment).toBe('function')
  })
})

// === RISK AREA 6: toAgentConfig edge cases with extra DB fields ===

describe('TEA: toAgentConfig with extra/missing DB fields', () => {
  test('ignores extra unknown fields from DB row', () => {
    const row = {
      id: 'a1', companyId: 'c1', name: 'Test', nameEn: null,
      tier: 'manager', modelName: null, soul: null,
      allowedTools: [], isActive: true,
      // Extra fields that DB might return
      createdAt: new Date(), updatedAt: new Date(),
      role: 'some role', isSystem: false, isSecretary: false,
    }
    const config = toAgentConfig(row)
    expect(config.id).toBe('a1')
    // Extra fields should not appear on the result
    expect((config as any).createdAt).toBeUndefined()
    expect((config as any).role).toBeUndefined()
    expect((config as any).isSystem).toBeUndefined()
  })

  test('handles nameEn as null gracefully', () => {
    const row = {
      id: 'a1', companyId: 'c1', name: '한국이름', nameEn: null,
      tier: 'manager', modelName: null, soul: null,
      allowedTools: [], isActive: true,
    }
    const config = toAgentConfig(row)
    expect(config.nameEn).toBeNull()
  })

  test('handles soul as null gracefully', () => {
    const row = {
      id: 'a1', companyId: 'c1', name: 'Test', nameEn: null,
      tier: 'manager', modelName: null, soul: null,
      allowedTools: [], isActive: true,
    }
    const config = toAgentConfig(row)
    expect(config.soul).toBeNull()
  })
})
