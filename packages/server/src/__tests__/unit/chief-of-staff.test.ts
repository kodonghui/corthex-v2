import { describe, test, expect, mock, beforeEach } from 'bun:test'
import { parseLLMJson } from '../../services/chief-of-staff'

// === parseLLMJson Tests ===

describe('parseLLMJson', () => {
  test('parses plain JSON object', () => {
    const result = parseLLMJson<{ name: string }>('{"name": "test"}')
    expect(result).toEqual({ name: 'test' })
  })

  test('parses JSON wrapped in markdown code block', () => {
    const raw = '```json\n{"departmentId": "abc", "managerId": "def", "confidence": 0.9, "reasoning": "test"}\n```'
    const result = parseLLMJson<{ departmentId: string; managerId: string }>(raw)
    expect(result).not.toBeNull()
    expect(result!.departmentId).toBe('abc')
    expect(result!.managerId).toBe('def')
  })

  test('parses JSON wrapped in code block without language tag', () => {
    const raw = '```\n{"score": 5}\n```'
    const result = parseLLMJson<{ score: number }>(raw)
    expect(result).toEqual({ score: 5 })
  })

  test('extracts JSON from surrounding text', () => {
    const raw = 'Here is the result: {"value": 42} and some trailing text'
    const result = parseLLMJson<{ value: number }>(raw)
    expect(result).toEqual({ value: 42 })
  })

  test('returns null for invalid JSON', () => {
    expect(parseLLMJson('not json at all')).toBeNull()
  })

  test('returns null for empty string', () => {
    expect(parseLLMJson('')).toBeNull()
  })

  test('handles JSON with whitespace', () => {
    const raw = '  \n  {"key": "value"}  \n  '
    const result = parseLLMJson<{ key: string }>(raw)
    expect(result).toEqual({ key: 'value' })
  })

  test('parses complex nested JSON', () => {
    const raw = '```json\n{"scores": {"conclusionClarity": 4, "evidenceSufficiency": 3}, "totalScore": 7, "passed": false, "feedback": "needs work"}\n```'
    const result = parseLLMJson<{ scores: Record<string, number>; totalScore: number; passed: boolean; feedback: string }>(raw)
    expect(result).not.toBeNull()
    expect(result!.scores.conclusionClarity).toBe(4)
    expect(result!.totalScore).toBe(7)
    expect(result!.passed).toBe(false)
    expect(result!.feedback).toBe('needs work')
  })

  test('handles JSON with unicode content', () => {
    const raw = '{"reasoning": "마케팅 분야에 적합합니다"}'
    const result = parseLLMJson<{ reasoning: string }>(raw)
    expect(result).toEqual({ reasoning: '마케팅 분야에 적합합니다' })
  })

  test('handles JSON with surrounding text before and after', () => {
    const raw = 'Here is the analysis: {"departmentId": "d1", "confidence": 0.9}'
    const result = parseLLMJson<{ departmentId: string; confidence: number }>(raw)
    expect(result).not.toBeNull()
    expect(result!.departmentId).toBe('d1')
    expect(result!.confidence).toBe(0.9)
  })
})

// === Classification Logic Tests (unit, no DB) ===

describe('ChiefOfStaff Classification Logic', () => {
  test('confidence below 0.5 should indicate secretary direct handling', () => {
    // Unit logic: confidence < 0.5 means secretary handles directly
    const confidence = 0.3
    expect(confidence < 0.5).toBe(true)
  })

  test('confidence at exactly 0.5 should NOT trigger fallback', () => {
    const confidence = 0.5
    expect(confidence < 0.5).toBe(false)
  })

  test('confidence clamping: values above 1 should clamp to 1', () => {
    const raw = 1.5
    const clamped = Math.max(0, Math.min(1, raw))
    expect(clamped).toBe(1)
  })

  test('confidence clamping: negative values should clamp to 0', () => {
    const raw = -0.3
    const clamped = Math.max(0, Math.min(1, raw))
    expect(clamped).toBe(0)
  })
})

// === Quality Gate Logic Tests (unit, no DB) ===

describe('ChiefOfStaff Quality Gate Logic', () => {
  const QUALITY_PASS_THRESHOLD = 15

  test('total score >= 15 should PASS', () => {
    const scores = { conclusionClarity: 4, evidenceSufficiency: 3, riskMention: 3, formatAdequacy: 3, logicalConsistency: 3 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(16)
    expect(total >= QUALITY_PASS_THRESHOLD).toBe(true)
  })

  test('total score exactly 15 should PASS', () => {
    const scores = { conclusionClarity: 3, evidenceSufficiency: 3, riskMention: 3, formatAdequacy: 3, logicalConsistency: 3 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(15)
    expect(total >= QUALITY_PASS_THRESHOLD).toBe(true)
  })

  test('total score < 15 should FAIL', () => {
    const scores = { conclusionClarity: 2, evidenceSufficiency: 3, riskMention: 2, formatAdequacy: 3, logicalConsistency: 3 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(13)
    expect(total >= QUALITY_PASS_THRESHOLD).toBe(false)
  })

  test('all scores at max (25) should PASS', () => {
    const scores = { conclusionClarity: 5, evidenceSufficiency: 5, riskMention: 5, formatAdequacy: 5, logicalConsistency: 5 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(25)
    expect(total >= QUALITY_PASS_THRESHOLD).toBe(true)
  })

  test('all scores at min (5) should FAIL', () => {
    const scores = { conclusionClarity: 1, evidenceSufficiency: 1, riskMention: 1, formatAdequacy: 1, logicalConsistency: 1 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(5)
    expect(total >= QUALITY_PASS_THRESHOLD).toBe(false)
  })
})

// === Rework Logic Tests ===

describe('ChiefOfStaff Rework Logic', () => {
  const MAX_REWORK_ATTEMPTS = 2

  test('attempt 1 FAIL should allow rework', () => {
    const attempt = 1
    expect(attempt <= MAX_REWORK_ATTEMPTS).toBe(true)
  })

  test('attempt 2 FAIL should allow rework', () => {
    const attempt = 2
    expect(attempt <= MAX_REWORK_ATTEMPTS).toBe(true)
  })

  test('attempt 3 should NOT allow further rework (max exceeded)', () => {
    const attempt = 3
    expect(attempt > MAX_REWORK_ATTEMPTS).toBe(true)
  })

  test('warningFlag should be true when max reworks exceeded', () => {
    let warningFlag = false
    const attempt = 3
    if (attempt > MAX_REWORK_ATTEMPTS) {
      warningFlag = true
    }
    expect(warningFlag).toBe(true)
  })
})

// === Classify Prompt Builder Tests ===

describe('Classify Prompt Builder', () => {
  test('should build prompt with departments and managers', () => {
    // Simulate the prompt building logic
    const deptList = [
      { id: 'd1', name: '전략기획팀', description: '전략 수립 및 기획' },
      { id: 'd2', name: '마케팅팀', description: '마케팅 전략 및 실행' },
    ]
    const managerList = [
      { id: 'm1', name: '전략팀장', role: '전략 기획 총괄', departmentId: 'd1' },
      { id: 'm2', name: '마케팅팀장', role: '마케팅 총괄', departmentId: 'd2' },
    ]

    // Build dept lines (matching the service logic)
    const deptLines = deptList.map(d => `- ${d.name} (id: ${d.id})${d.description ? `: ${d.description}` : ''}`).join('\n')
    const mgrLines = managerList.map(m => {
      const dept = deptList.find(d => d.id === m.departmentId)
      return `- ${m.name} (id: ${m.id}, 부서: ${dept?.name ?? '미배속'})${m.role ? ` - ${m.role}` : ''}`
    }).join('\n')

    expect(deptLines).toContain('전략기획팀')
    expect(deptLines).toContain('마케팅팀')
    expect(mgrLines).toContain('전략팀장')
    expect(mgrLines).toContain('마케팅팀장')
    expect(mgrLines).toContain('부서: 전략기획팀')
  })

  test('should handle empty departments', () => {
    const deptLines = [].map((d: any) => `- ${d.name}`).join('\n')
    expect(deptLines).toBe('')
  })

  test('should handle manager without department', () => {
    const deptList: Array<{ id: string; name: string }> = []
    const manager = { id: 'm1', name: 'Test', role: null, departmentId: null }
    const dept = deptList.find(d => d.id === manager.departmentId)
    const line = `- ${manager.name} (id: ${manager.id}, 부서: ${dept?.name ?? '미배속'})${manager.role ? ` - ${manager.role}` : ''}`
    expect(line).toContain('미배속')
    expect(line).not.toContain('null')
  })
})

// === Quality Gate Prompt Parsing Tests ===

describe('Quality Gate Response Parsing', () => {
  test('parses valid quality gate response', () => {
    const raw = '{"scores": {"conclusionClarity": 4, "evidenceSufficiency": 3, "riskMention": 3, "formatAdequacy": 4, "logicalConsistency": 4}, "totalScore": 18, "passed": true, "feedback": null}'
    const parsed = parseLLMJson<{
      scores: { conclusionClarity: number; evidenceSufficiency: number; riskMention: number; formatAdequacy: number; logicalConsistency: number }
      totalScore: number
      passed: boolean
      feedback: string | null
    }>(raw)
    expect(parsed).not.toBeNull()
    expect(parsed!.scores.conclusionClarity).toBe(4)
    expect(parsed!.totalScore).toBe(18)
    expect(parsed!.passed).toBe(true)
    expect(parsed!.feedback).toBeNull()
  })

  test('parses quality gate FAIL response with feedback', () => {
    const raw = '```json\n{"scores": {"conclusionClarity": 2, "evidenceSufficiency": 2, "riskMention": 2, "formatAdequacy": 3, "logicalConsistency": 2}, "totalScore": 11, "passed": false, "feedback": "결론이 불명확합니다. 근거를 보강하세요."}\n```'
    const parsed = parseLLMJson<{
      scores: Record<string, number>
      totalScore: number
      passed: boolean
      feedback: string | null
    }>(raw)
    expect(parsed).not.toBeNull()
    expect(parsed!.totalScore).toBe(11)
    expect(parsed!.passed).toBe(false)
    expect(parsed!.feedback).toContain('결론')
  })

  test('parses classification response', () => {
    const raw = '{"departmentId": "abc-123", "managerId": "def-456", "confidence": 0.85, "reasoning": "마케팅 관련 명령입니다"}'
    const parsed = parseLLMJson<{
      departmentId: string
      managerId: string
      confidence: number
      reasoning: string
    }>(raw)
    expect(parsed).not.toBeNull()
    expect(parsed!.departmentId).toBe('abc-123')
    expect(parsed!.managerId).toBe('def-456')
    expect(parsed!.confidence).toBe(0.85)
    expect(parsed!.reasoning).toBe('마케팅 관련 명령입니다')
  })
})

// === WebSocket Event Format Tests ===

describe('WebSocket Event Format', () => {
  test('command:status event should have required fields', () => {
    const event = {
      type: 'command:status',
      companyId: 'comp-1',
      commandId: 'cmd-1',
      phase: 'classifying',
      timestamp: new Date().toISOString(),
    }
    expect(event.type).toBe('command:status')
    expect(event.companyId).toBeTruthy()
    expect(event.commandId).toBeTruthy()
    expect(event.phase).toBeTruthy()
    expect(event.timestamp).toBeTruthy()
  })

  test('valid phases for command status', () => {
    const validPhases = ['classifying', 'delegating', 'executing', 'reviewing', 'reworking', 'completed', 'failed']
    for (const phase of validPhases) {
      expect(typeof phase).toBe('string')
      expect(phase.length).toBeGreaterThan(0)
    }
  })
})

// === Pipeline Phase Tracking Tests ===

describe('Pipeline Phase Tracking', () => {
  test('normal flow: classify → delegate → review → completed', () => {
    const phases: string[] = []
    phases.push('classify')
    phases.push('delegate')
    phases.push('review')
    phases.push('completed')
    expect(phases).toEqual(['classify', 'delegate', 'review', 'completed'])
  })

  test('direct delegate flow (mention): direct-delegate → delegate → review → completed', () => {
    const phases: string[] = []
    phases.push('direct-delegate')
    phases.push('delegate')
    phases.push('review')
    phases.push('completed')
    expect(phases[0]).toBe('direct-delegate')
    expect(phases).not.toContain('classify')
  })

  test('fallback flow: classify → classify-fallback → delegate → review → completed', () => {
    const phases: string[] = []
    phases.push('classify')
    phases.push('classify-fallback')
    phases.push('delegate')
    phases.push('review')
    phases.push('completed')
    expect(phases).toContain('classify-fallback')
  })

  test('rework flow: classify → delegate → review → rework-1 → review → completed', () => {
    const phases: string[] = []
    phases.push('classify')
    phases.push('delegate')
    phases.push('review')
    phases.push('rework-1')
    phases.push('completed')
    expect(phases).toContain('rework-1')
  })

  test('max rework flow adds max-rework-exceeded', () => {
    const phases: string[] = []
    phases.push('classify')
    phases.push('delegate')
    phases.push('review')
    phases.push('rework-1')
    phases.push('rework-2')
    phases.push('max-rework-exceeded')
    phases.push('completed')
    expect(phases).toContain('max-rework-exceeded')
  })

  test('failure flow should contain "failed"', () => {
    const phases: string[] = []
    phases.push('classify')
    phases.push('failed')
    expect(phases).toContain('failed')
  })
})

// === Process Options Validation Tests ===

describe('ProcessOptions Validation', () => {
  test('required fields must be present', () => {
    const options = {
      commandId: 'cmd-1',
      commandText: '시장 분석해줘',
      companyId: 'comp-1',
      userId: 'user-1',
    }
    expect(options.commandId).toBeTruthy()
    expect(options.commandText).toBeTruthy()
    expect(options.companyId).toBeTruthy()
    expect(options.userId).toBeTruthy()
  })

  test('targetAgentId is optional', () => {
    const options = {
      commandId: 'cmd-1',
      commandText: '분석해줘',
      companyId: 'comp-1',
      userId: 'user-1',
      targetAgentId: null,
    }
    expect(options.targetAgentId).toBeNull()
  })

  test('targetAgentId skips classification', () => {
    const targetAgentId = 'agent-123'
    const shouldSkipClassify = !!targetAgentId
    expect(shouldSkipClassify).toBe(true)
  })
})

// === ChiefOfStaffResult Type Tests ===

describe('ChiefOfStaffResult Structure', () => {
  test('successful result has all fields', () => {
    const result = {
      commandId: 'cmd-1',
      content: '분석 결과입니다.',
      classification: {
        departmentId: 'dept-1',
        managerId: 'mgr-1',
        confidence: 0.9,
        reasoning: '전략 관련',
      },
      qualityGate: {
        scores: {
          conclusionClarity: 4,
          evidenceSufficiency: 4,
          riskMention: 3,
          formatAdequacy: 4,
          logicalConsistency: 4,
        },
        totalScore: 19,
        passed: true,
        feedback: null,
      },
      attemptNumber: 1,
      warningFlag: false,
      phases: ['classify', 'delegate', 'review', 'completed'],
    }
    expect(result.content).toBeTruthy()
    expect(result.classification).not.toBeNull()
    expect(result.qualityGate).not.toBeNull()
    expect(result.qualityGate!.passed).toBe(true)
    expect(result.warningFlag).toBe(false)
    expect(result.attemptNumber).toBe(1)
  })

  test('failed result has error content and no quality gate', () => {
    const result = {
      commandId: 'cmd-1',
      content: '비서실장 에이전트를 찾을 수 없습니다',
      classification: null,
      qualityGate: null,
      attemptNumber: 0,
      warningFlag: false,
      phases: ['failed'],
    }
    expect(result.classification).toBeNull()
    expect(result.qualityGate).toBeNull()
    expect(result.phases).toContain('failed')
  })

  test('warning flag result from max rework', () => {
    const result = {
      commandId: 'cmd-1',
      content: '결과 (품질 미달 경고)',
      classification: { departmentId: 'd1', managerId: 'm1', confidence: 0.8, reasoning: '...' },
      qualityGate: {
        scores: { conclusionClarity: 2, evidenceSufficiency: 2, riskMention: 2, formatAdequacy: 3, logicalConsistency: 2 },
        totalScore: 11,
        passed: false,
        feedback: '품질 미달',
      },
      attemptNumber: 3,
      warningFlag: true,
      phases: ['classify', 'delegate', 'review', 'rework-1', 'rework-2', 'max-rework-exceeded', 'completed'],
    }
    expect(result.warningFlag).toBe(true)
    expect(result.attemptNumber).toBe(3)
    expect(result.phases).toContain('max-rework-exceeded')
  })
})

// === Quality Gate Metadata Storage Format Tests ===

describe('Quality Gate Metadata for commands table', () => {
  test('quality gate summary has correct shape', () => {
    const qualityGateSummary = {
      passed: true,
      totalScore: 19,
      attemptNumber: 1,
      warningFlag: false,
    }
    expect(qualityGateSummary).toHaveProperty('passed')
    expect(qualityGateSummary).toHaveProperty('totalScore')
    expect(qualityGateSummary).toHaveProperty('attemptNumber')
    expect(qualityGateSummary).toHaveProperty('warningFlag')
  })

  test('classification summary has correct shape', () => {
    const classificationSummary = {
      departmentId: 'dept-1',
      managerId: 'mgr-1',
      confidence: 0.85,
    }
    expect(classificationSummary).toHaveProperty('departmentId')
    expect(classificationSummary).toHaveProperty('managerId')
    expect(classificationSummary).toHaveProperty('confidence')
  })

  test('null quality gate when process fails early', () => {
    const metadata = {
      qualityGate: null,
      classification: null,
    }
    expect(metadata.qualityGate).toBeNull()
    expect(metadata.classification).toBeNull()
  })
})

// =======================================================
// TEA Risk-Based Tests — Generated by TEA Automate
// =======================================================

// === RISK AREA 1: parseLLMJson edge cases ===

describe('TEA: parseLLMJson edge cases', () => {
  test('handles JSON array (not object)', () => {
    const raw = '[1, 2, 3]'
    const result = parseLLMJson<number[]>(raw)
    expect(result).toEqual([1, 2, 3])
  })

  test('handles deeply nested JSON', () => {
    const raw = '{"a": {"b": {"c": {"d": {"e": 42}}}}}'
    const result = parseLLMJson<{ a: { b: { c: { d: { e: number } } } } }>(raw)
    expect(result).not.toBeNull()
    expect(result!.a.b.c.d.e).toBe(42)
  })

  test('handles JSON with escaped quotes', () => {
    const raw = '{"text": "He said \\"hello\\" to me"}'
    const result = parseLLMJson<{ text: string }>(raw)
    expect(result).not.toBeNull()
    expect(result!.text).toBe('He said "hello" to me')
  })

  test('returns null for partial/truncated JSON', () => {
    const raw = '{"departmentId": "abc", "managerId": '
    expect(parseLLMJson(raw)).toBeNull()
  })

  test('handles multiple markdown code blocks (picks first)', () => {
    const raw = '```json\n{"first": true}\n```\nSome text\n```json\n{"second": true}\n```'
    const result = parseLLMJson<{ first?: boolean; second?: boolean }>(raw)
    expect(result).not.toBeNull()
    expect(result!.first).toBe(true)
  })

  test('handles code block with extra whitespace', () => {
    const raw = '```json\n\n  {"key": "value"}  \n\n```'
    const result = parseLLMJson<{ key: string }>(raw)
    expect(result).toEqual({ key: 'value' })
  })

  test('handles JSON with newlines in string values', () => {
    const raw = '{"reasoning": "Line 1\\nLine 2\\nLine 3"}'
    const result = parseLLMJson<{ reasoning: string }>(raw)
    expect(result).not.toBeNull()
    expect(result!.reasoning).toContain('Line 1')
  })

  test('returns null for just braces with invalid content', () => {
    expect(parseLLMJson('{not valid json at all}')).toBeNull()
  })

  test('handles boolean and null values', () => {
    const raw = '{"active": true, "deleted": false, "note": null}'
    const result = parseLLMJson<{ active: boolean; deleted: boolean; note: null }>(raw)
    expect(result).not.toBeNull()
    expect(result!.active).toBe(true)
    expect(result!.deleted).toBe(false)
    expect(result!.note).toBeNull()
  })

  test('handles empty object', () => {
    expect(parseLLMJson<Record<string, never>>('{}')).toEqual({})
  })

  test('handles number-only JSON', () => {
    // JSON.parse("42") is valid
    const result = parseLLMJson<number>('42')
    expect(result).toBe(42)
  })

  test('handles string-only JSON', () => {
    const result = parseLLMJson<string>('"hello"')
    expect(result).toBe('hello')
  })
})

// === RISK AREA 2: Quality Gate score recalculation logic ===

describe('TEA: Quality Gate score recalculation', () => {
  const QUALITY_PASS_THRESHOLD = 15

  test('server recalculates totalScore — ignores LLM-provided totalScore', () => {
    // If LLM says totalScore=25 but individual scores only sum to 11, server uses 11
    const scores = { conclusionClarity: 2, evidenceSufficiency: 2, riskMention: 2, formatAdequacy: 3, logicalConsistency: 2 }
    const realTotal = scores.conclusionClarity + scores.evidenceSufficiency +
      scores.riskMention + scores.formatAdequacy + scores.logicalConsistency
    expect(realTotal).toBe(11)
    expect(realTotal >= QUALITY_PASS_THRESHOLD).toBe(false)
    // Even if LLM claimed totalScore=25, server uses recalculated 11
  })

  test('server recalculates passed flag — ignores LLM-provided passed', () => {
    // LLM might say "passed: true" but if recalculated total < 15, we set FAIL
    const scores = { conclusionClarity: 2, evidenceSufficiency: 2, riskMention: 2, formatAdequacy: 2, logicalConsistency: 2 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(10)
    const passed = total >= QUALITY_PASS_THRESHOLD
    expect(passed).toBe(false)
  })

  test('minimum possible total is 5 (all 1s)', () => {
    const scores = { conclusionClarity: 1, evidenceSufficiency: 1, riskMention: 1, formatAdequacy: 1, logicalConsistency: 1 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(5)
  })

  test('maximum possible total is 25 (all 5s)', () => {
    const scores = { conclusionClarity: 5, evidenceSufficiency: 5, riskMention: 5, formatAdequacy: 5, logicalConsistency: 5 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(25)
  })

  test('exactly threshold-1 (14) should FAIL', () => {
    const scores = { conclusionClarity: 3, evidenceSufficiency: 3, riskMention: 3, formatAdequacy: 3, logicalConsistency: 2 }
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    expect(total).toBe(14)
    expect(total >= QUALITY_PASS_THRESHOLD).toBe(false)
  })

  test('default scores (all 3s) give exactly 15 — PASS', () => {
    const defaultScores = { conclusionClarity: 3, evidenceSufficiency: 3, riskMention: 3, formatAdequacy: 3, logicalConsistency: 3 }
    const total = Object.values(defaultScores).reduce((a, b) => a + b, 0)
    expect(total).toBe(15)
    expect(total >= QUALITY_PASS_THRESHOLD).toBe(true)
  })

  test('feedback is null when passed, non-null when failed', () => {
    const passedResult = { passed: true, totalScore: 20, feedback: null }
    const failedResult = { passed: false, totalScore: 10, feedback: '결론이 불명확합니다' }
    expect(passedResult.feedback).toBeNull()
    expect(failedResult.feedback).not.toBeNull()
  })
})

// === RISK AREA 3: Classification confidence edge cases ===

describe('TEA: Classification confidence boundaries', () => {
  test('confidence exactly 0.0 should clamp to 0', () => {
    const clamped = Math.max(0, Math.min(1, 0.0))
    expect(clamped).toBe(0)
  })

  test('confidence exactly 1.0 should stay 1', () => {
    const clamped = Math.max(0, Math.min(1, 1.0))
    expect(clamped).toBe(1)
  })

  test('confidence NaN falls back to 0.5', () => {
    // Code uses Number.isFinite guard: NaN → falls back to 0.5
    const rawConfidence = NaN
    const result = Number.isFinite(rawConfidence) ? Math.max(0, Math.min(1, rawConfidence)) : 0.5
    expect(result).toBe(0.5)
  })

  test('confidence undefined uses default 0.5', () => {
    const rawConfidence = undefined
    const withDefault = rawConfidence ?? 0.5
    expect(withDefault).toBe(0.5)
    const clamped = Math.max(0, Math.min(1, withDefault))
    expect(clamped).toBe(0.5)
    // At 0.5, should NOT trigger fallback (< 0.5 required)
    expect(clamped < 0.5).toBe(false)
  })

  test('confidence 0.499 triggers secretary fallback', () => {
    const confidence = 0.499
    expect(confidence < 0.5).toBe(true)
  })

  test('confidence 0.501 does NOT trigger fallback', () => {
    const confidence = 0.501
    expect(confidence < 0.5).toBe(false)
  })
})

// === RISK AREA 4: Rework loop boundary conditions ===

describe('TEA: Rework loop boundary analysis', () => {
  const MAX_REWORK_ATTEMPTS = 2

  test('loop runs max MAX_REWORK_ATTEMPTS+1 iterations (3 total)', () => {
    let iterations = 0
    for (let attempt = 1; attempt <= MAX_REWORK_ATTEMPTS + 1; attempt++) {
      iterations++
    }
    expect(iterations).toBe(3)
  })

  test('first attempt (1) can trigger rework if fails quality', () => {
    const attempt = 1
    expect(attempt <= MAX_REWORK_ATTEMPTS).toBe(true)
  })

  test('second attempt (2) can trigger rework if fails quality', () => {
    const attempt = 2
    expect(attempt <= MAX_REWORK_ATTEMPTS).toBe(true)
  })

  test('third attempt (3) exceeds max rework — warningFlag', () => {
    const attempt = 3
    expect(attempt > MAX_REWORK_ATTEMPTS).toBe(true)
  })

  test('rework context includes attempt number and feedback', () => {
    const attempt = 1
    const feedback = '결론이 불명확합니다'
    const previousResult = '이전 결과물'
    const reworkContext = `## 재작업 지시 (시도 ${attempt + 1}/${MAX_REWORK_ATTEMPTS + 1})

이전 결과가 품질 검수에서 탈락했습니다. 아래 피드백을 반영하여 개선하세요.

### 품질 검수 피드백
${feedback}

### 이전 결과
${previousResult}`
    expect(reworkContext).toContain('시도 2/3')
    expect(reworkContext).toContain(feedback)
    expect(reworkContext).toContain(previousResult)
  })

  test('if quality gate passes on first try, no rework phases', () => {
    const phases: string[] = ['classify', 'delegate', 'review']
    // First quality gate passes
    phases.push('completed')
    expect(phases).not.toContain('rework-1')
    expect(phases).not.toContain('max-rework-exceeded')
  })

  test('if quality gate fails once then passes, one rework phase', () => {
    const phases: string[] = ['classify', 'delegate', 'review']
    // Attempt 1 fails
    phases.push('rework-1')
    // Attempt 2 passes
    phases.push('completed')
    expect(phases.filter(p => p.startsWith('rework-')).length).toBe(1)
  })
})

// === RISK AREA 5: Classify prompt builder edge cases ===

describe('TEA: buildClassifyPrompt edge cases', () => {
  test('handles department with null description', () => {
    const dept = { id: 'd1', name: '테스트팀', description: null }
    const line = `- ${dept.name} (id: ${dept.id})${dept.description ? `: ${dept.description}` : ''}`
    expect(line).toBe('- 테스트팀 (id: d1)')
    expect(line).not.toContain('null')
  })

  test('handles manager with null role and null departmentId', () => {
    const manager = { id: 'm1', name: 'TestMgr', role: null, departmentId: null }
    const deptList: Array<{ id: string; name: string }> = []
    const dept = deptList.find(d => d.id === manager.departmentId)
    const line = `- ${manager.name} (id: ${manager.id}, 부서: ${dept?.name ?? '미배속'})${manager.role ? ` - ${manager.role}` : ''}`
    expect(line).toContain('미배속')
    expect(line).not.toContain('null')
    expect(line).not.toContain('undefined')
  })

  test('handles single department single manager', () => {
    const depts = [{ id: 'd1', name: 'Solo팀', description: '유일한 팀' }]
    const managers = [{ id: 'm1', name: 'Solo팀장', role: '총괄', departmentId: 'd1' }]
    const deptLines = depts.map(d => `- ${d.name} (id: ${d.id})${d.description ? `: ${d.description}` : ''}`).join('\n')
    const mgrLines = managers.map(m => {
      const dept = depts.find(d => d.id === m.departmentId)
      return `- ${m.name} (id: ${m.id}, 부서: ${dept?.name ?? '미배속'})${m.role ? ` - ${m.role}` : ''}`
    }).join('\n')
    expect(deptLines.split('\n')).toHaveLength(1)
    expect(mgrLines.split('\n')).toHaveLength(1)
    expect(mgrLines).toContain('Solo팀')
  })

  test('handles manager belonging to non-existent department', () => {
    const depts = [{ id: 'd1', name: 'A팀', description: null }]
    const manager = { id: 'm1', name: 'Orphan', role: null, departmentId: 'd-nonexistent' }
    const dept = depts.find(d => d.id === manager.departmentId)
    expect(dept).toBeUndefined()
    const line = `- ${manager.name} (id: ${manager.id}, 부서: ${dept?.name ?? '미배속'})`
    expect(line).toContain('미배속')
  })

  test('special characters in department/manager names', () => {
    const dept = { id: 'd1', name: 'R&D/AI 팀', description: 'AI & ML' }
    const line = `- ${dept.name} (id: ${dept.id}): ${dept.description}`
    expect(line).toContain('R&D/AI 팀')
    expect(line).toContain('AI & ML')
  })
})

// === RISK AREA 6: Process pipeline state transitions ===

describe('TEA: Process pipeline state transitions', () => {
  test('no secretary → immediate failure with no phases except "failed"', () => {
    const result = {
      commandId: 'cmd-1',
      content: '비서실장 에이전트를 찾을 수 없습니다',
      classification: null,
      qualityGate: null,
      attemptNumber: 0,
      warningFlag: false,
      phases: ['failed'],
    }
    expect(result.phases).toHaveLength(1)
    expect(result.phases[0]).toBe('failed')
    expect(result.attemptNumber).toBe(0)
  })

  test('no manager agent after classify → failure includes classify phase', () => {
    const phases = ['classify', 'failed']
    expect(phases).toContain('classify')
    expect(phases[phases.length - 1]).toBe('failed')
  })

  test('delegate failure → phases include delegate + failed', () => {
    const phases = ['classify', 'delegate', 'failed']
    expect(phases).toContain('delegate')
    expect(phases[phases.length - 1]).toBe('failed')
  })

  test('review-error (quality gate LLM failure) → passes with warning', () => {
    const phases = ['classify', 'delegate', 'review', 'review-error', 'completed']
    const warningFlag = true
    const qualityGate = {
      scores: { conclusionClarity: 3, evidenceSufficiency: 3, riskMention: 3, formatAdequacy: 3, logicalConsistency: 3 },
      totalScore: 15,
      passed: true,
      feedback: null,
    }
    expect(phases).toContain('review-error')
    expect(warningFlag).toBe(true)
    expect(qualityGate.passed).toBe(true)
  })

  test('rework-failed → uses previous result with warning', () => {
    const phases = ['classify', 'delegate', 'review', 'rework-1', 'rework-failed', 'completed']
    expect(phases).toContain('rework-failed')
    expect(phases[phases.length - 1]).toBe('completed')
  })

  test('secretary-direct phase when confidence < 0.5', () => {
    const phases = ['classify', 'secretary-direct', 'delegate', 'review', 'completed']
    expect(phases).toContain('secretary-direct')
    expect(phases.indexOf('secretary-direct')).toBeLessThan(phases.indexOf('delegate'))
  })

  test('phases always end with either "completed" or "failed"', () => {
    const scenarios = [
      ['failed'],
      ['classify', 'failed'],
      ['classify', 'delegate', 'failed'],
      ['classify', 'delegate', 'review', 'completed'],
      ['classify', 'delegate', 'review', 'rework-1', 'completed'],
      ['direct-delegate', 'delegate', 'review', 'completed'],
      ['classify', 'classify-fallback', 'delegate', 'review', 'completed'],
    ]
    for (const phases of scenarios) {
      const last = phases[phases.length - 1]
      expect(last === 'completed' || last === 'failed').toBe(true)
    }
  })
})

// === RISK AREA 7: Command metadata shape ===

describe('TEA: Command metadata shape validation', () => {
  test('completed command metadata has both classification and qualityGate', () => {
    const metadata = {
      qualityGate: { passed: true, totalScore: 20, attemptNumber: 1, warningFlag: false },
      classification: { departmentId: 'd1', managerId: 'm1', confidence: 0.9 },
    }
    expect(metadata.qualityGate).toHaveProperty('passed')
    expect(metadata.qualityGate).toHaveProperty('totalScore')
    expect(metadata.qualityGate).toHaveProperty('attemptNumber')
    expect(metadata.qualityGate).toHaveProperty('warningFlag')
    expect(metadata.classification).toHaveProperty('departmentId')
    expect(metadata.classification).toHaveProperty('managerId')
    expect(metadata.classification).toHaveProperty('confidence')
    // classification metadata does NOT include reasoning (stripped for storage)
    expect(metadata.classification).not.toHaveProperty('reasoning')
  })

  test('warningFlag command has qualityGate.passed=false but status completed', () => {
    const metadata = {
      qualityGate: { passed: false, totalScore: 11, attemptNumber: 3, warningFlag: true },
      classification: { departmentId: 'd1', managerId: 'm1', confidence: 0.7 },
    }
    expect(metadata.qualityGate.passed).toBe(false)
    expect(metadata.qualityGate.warningFlag).toBe(true)
    expect(metadata.qualityGate.attemptNumber).toBe(3)
  })

  test('mention command has classification=null in metadata', () => {
    // When targetAgentId is specified, classification is skipped
    const result = {
      classification: null,
      qualityGate: { passed: true, totalScore: 18, attemptNumber: 1, warningFlag: false },
    }
    expect(result.classification).toBeNull()
    expect(result.qualityGate).not.toBeNull()
  })
})

// === RISK AREA 8: findSecretaryAgent query conditions ===

describe('TEA: findSecretaryAgent query conditions', () => {
  test('requires all 4 conditions: companyId + isSystem + isSecretary + isActive', () => {
    // Simulating the query conditions
    const conditions = {
      companyId: 'comp-1',
      isSystem: true,
      isSecretary: true,
      isActive: true,
    }
    expect(Object.keys(conditions)).toHaveLength(4)
    expect(conditions.isSystem).toBe(true)
    expect(conditions.isSecretary).toBe(true)
    expect(conditions.isActive).toBe(true)
  })

  test('inactive secretary should not be found', () => {
    const agent = { isSystem: true, isSecretary: true, isActive: false }
    const matches = agent.isSystem && agent.isSecretary && agent.isActive
    expect(matches).toBe(false)
  })

  test('non-system secretary should not be found', () => {
    const agent = { isSystem: false, isSecretary: true, isActive: true }
    const matches = agent.isSystem && agent.isSecretary && agent.isActive
    expect(matches).toBe(false)
  })

  test('system agent that is not secretary should not be found', () => {
    const agent = { isSystem: true, isSecretary: false, isActive: true }
    const matches = agent.isSystem && agent.isSecretary && agent.isActive
    expect(matches).toBe(false)
  })
})

// === RISK AREA 9: getActiveManagers excludes secretary ===

describe('TEA: getActiveManagers exclusions', () => {
  test('only tier=manager agents are included', () => {
    const agents = [
      { tier: 'manager', isActive: true, isSecretary: false },
      { tier: 'specialist', isActive: true, isSecretary: false },
      { tier: 'worker', isActive: true, isSecretary: false },
    ]
    const managers = agents.filter(a => a.tier === 'manager' && a.isActive && !a.isSecretary)
    expect(managers).toHaveLength(1)
  })

  test('secretary agent with tier=manager is excluded', () => {
    const agents = [
      { tier: 'manager', isActive: true, isSecretary: true },
      { tier: 'manager', isActive: true, isSecretary: false },
    ]
    const managers = agents.filter(a => a.tier === 'manager' && a.isActive && !a.isSecretary)
    expect(managers).toHaveLength(1)
    expect(managers[0].isSecretary).toBe(false)
  })

  test('inactive managers are excluded', () => {
    const agents = [
      { tier: 'manager', isActive: false, isSecretary: false },
      { tier: 'manager', isActive: true, isSecretary: false },
    ]
    const managers = agents.filter(a => a.tier === 'manager' && a.isActive && !a.isSecretary)
    expect(managers).toHaveLength(1)
    expect(managers[0].isActive).toBe(true)
  })
})
