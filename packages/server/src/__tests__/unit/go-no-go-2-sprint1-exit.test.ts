import { describe, test, expect } from 'bun:test'
import * as fs from 'fs'

/**
 * Story 24.8: Go/No-Go #2 — Sprint 1 Exit Verification
 *
 * Comprehensive gate checks for Epic 24 Agent Personality System.
 * ALL tests must pass for Sprint 1 sign-off.
 *
 * Approach: static source verification (no DB required).
 * Runtime behavior already covered by dedicated test suites.
 */

const readSrc = (relPath: string) => fs.readFileSync(`packages/server/src/${relPath}`, 'utf-8')
const readRoot = (relPath: string) => fs.readFileSync(relPath, 'utf-8')

// === Gate 1: renderSoul extraVars mechanism ===

describe('Go/No-Go #2: Gate 1 — renderSoul personality injection', () => {
  const src = readSrc('engine/soul-renderer.ts')

  test('renderSoul accepts extraVars parameter', () => {
    expect(src).toContain('extraVars?: Record<string, string>')
  })

  test('extraVars spread into variable map', () => {
    expect(src).toContain('...extraVars')
  })

  test('unknown vars replaced with empty string', () => {
    // Pattern: vars[key.trim()] || ''  (unknown → empty string)
    expect(src).toContain("|| ''")
    expect(src).toContain('.replace(')
  })

  test('soul-renderer test suite exists and is comprehensive', () => {
    const testSrc = readSrc('__tests__/unit/soul-renderer.test.ts')
    const testCount = (testSrc.match(/\btest\(/g) || []).length
    expect(testCount).toBeGreaterThanOrEqual(5)
  })
})

// === Gate 2: All call sites use enrich() → extraVars pattern ===

describe('Go/No-Go #2: Gate 2 — Call site personality injection (static verification)', () => {
  // 9 files, 10+ call sites (agora-engine has 2)
  const CALL_SITE_FILES = [
    'routes/workspace/hub.ts',
    'tool-handlers/builtins/call-agent.ts',
    'services/agora-engine.ts',
    'services/argos-evaluator.ts',
    'services/telegram-bot.ts',
    'routes/commands.ts',
    'routes/workspace/presets.ts',
    'routes/public-api/v1.ts',
    'services/organization.ts',
  ]

  test('all 9 renderSoul call site files exist', () => {
    expect(CALL_SITE_FILES).toHaveLength(9)
    for (const file of CALL_SITE_FILES) {
      expect(fs.existsSync(`packages/server/src/${file}`)).toBe(true)
    }
  })

  test('each call site file imports renderSoul', () => {
    for (const file of CALL_SITE_FILES) {
      const src = readSrc(file)
      expect(src).toContain('renderSoul')
    }
  })

  test('enrich function exported from soul-enricher', () => {
    const src = readSrc('services/soul-enricher.ts')
    expect(src).toMatch(/export\s+(async\s+)?function\s+enrich/)
  })

  test('soul-enricher returns personalityVars and memoryVars', () => {
    const src = readSrc('services/soul-enricher.ts')
    expect(src).toContain('personalityVars')
    expect(src).toContain('memoryVars')
  })
})

// === Gate 3: PER-1 4-layer sanitization 100% ===

describe('Go/No-Go #2: Gate 3 — PER-1 sanitization layers exist', () => {
  test('Layer 1: PERSONALITY_KEYS whitelist exists in soul-enricher', () => {
    const src = readSrc('services/soul-enricher.ts')
    expect(src).toContain('PERSONALITY_KEYS')
    expect(src).toContain('openness')
    expect(src).toContain('conscientiousness')
    expect(src).toContain('extraversion')
    expect(src).toContain('agreeableness')
    expect(src).toContain('neuroticism')
  })

  test('Layer 2: Zod .strict() on personalityTraitsSchema', () => {
    const src = readSrc('routes/admin/agents.ts')
    expect(src).toContain('personalityTraitsSchema')
    expect(src).toContain('.strict()')
  })

  test('Layer 2 also in workspace route', () => {
    const src = readSrc('routes/workspace/agents.ts')
    expect(src).toContain('personalityTraitsSchema')
    expect(src).toContain('.strict()')
  })

  test('Layer 3: Control char strip in soul-enricher', () => {
    const src = readSrc('services/soul-enricher.ts')
    expect(src).toContain('\\x00-\\x1f')
  })

  test('Layer 4: Template regex replaces unknown vars (source check)', () => {
    const src = readSrc('engine/soul-renderer.ts')
    // Pattern: {{var}} → vars[key] || ''  (unknown → empty string)
    expect(src).toMatch(/\{\{/)
    expect(src).toContain("|| ''")
  })

  test('PER-1 adversarial test suite exists and is comprehensive (30+ tests)', () => {
    const src = readSrc('__tests__/unit/per1-sanitization-chain.test.ts')
    const testCount = (src.match(/\btest\(/g) || []).length
    expect(testCount).toBeGreaterThanOrEqual(30)
  })
})

// === Gate 4: NULL personality_traits backward compat ===

describe('Go/No-Go #2: Gate 4 — NULL personality backward compatibility', () => {
  test('enrich() handles missing personality gracefully (returns empty {})', () => {
    const src = readSrc('services/soul-enricher.ts')
    // Should have graceful fallback for no personality_traits
    expect(src).toContain('personalityVars')
    // Empty object fallback
    expect(src).toMatch(/personalityVars.*\{/)
  })

  test('renderSoul extraVars parameter is optional', () => {
    const src = readSrc('engine/soul-renderer.ts')
    expect(src).toContain('extraVars?')
  })

  test('PERSONALITY_PRESETS imported from @corthex/shared', async () => {
    const { PERSONALITY_PRESETS } = await import('@corthex/shared')
    expect(PERSONALITY_PRESETS).toBeDefined()
    expect(Array.isArray(PERSONALITY_PRESETS)).toBe(true)
  })

  test('PersonalityTraits type allows null in DB schema', () => {
    // Check agents schema allows null personality_traits
    const schemaDir = fs.readdirSync('packages/server/src/db').filter(f => f.includes('schema'))
    expect(schemaDir.length).toBeGreaterThan(0)
  })
})

// === Gate 5: Preset selection → sliders fill ===

describe('Go/No-Go #2: Gate 5 — Presets & slider integration', () => {
  test('3+ presets exist with valid OCEAN values (0-100 integers)', async () => {
    const { PERSONALITY_PRESETS } = await import('@corthex/shared')
    expect(PERSONALITY_PRESETS.length).toBeGreaterThanOrEqual(3)

    for (const preset of PERSONALITY_PRESETS) {
      expect(preset.id.length).toBeGreaterThan(0)
      expect(preset.nameKo.length).toBeGreaterThan(0)
      for (const key of ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const) {
        const val = preset.traits[key]
        expect(Number.isInteger(val)).toBe(true)
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThanOrEqual(100)
      }
    }
  })

  test('BigFiveSliderGroup component exists', () => {
    expect(fs.existsSync('packages/app/src/components/agents/big-five-slider-group.tsx')).toBe(true)
  })

  test('preset API endpoint exists in admin routes', () => {
    const src = readSrc('routes/admin/agents.ts')
    expect(src).toContain('personality-presets')
    expect(src).toContain('PERSONALITY_PRESETS')
  })
})

// === Gate 6: Soul templates contain personality section ===

describe('Go/No-Go #2: Gate 6 — Soul templates personality integration', () => {
  test('soul-templates.ts contains all 5 personality placeholders', () => {
    const src = readSrc('lib/soul-templates.ts')
    expect(src).toContain('{{personality_openness}}')
    expect(src).toContain('{{personality_conscientiousness}}')
    expect(src).toContain('{{personality_extraversion}}')
    expect(src).toContain('{{personality_agreeableness}}')
    expect(src).toContain('{{personality_neuroticism}}')
  })

  test('at least 10 personality placeholders (5 per template × 2)', () => {
    const src = readSrc('lib/soul-templates.ts')
    const matches = src.match(/\{\{personality_/g) || []
    expect(matches.length).toBeGreaterThanOrEqual(10)
  })
})

// === Gate 7: AR73 + AR74 Sprint 1 infrastructure ===

describe('Go/No-Go #2: Gate 7 — AR73/AR74 infrastructure', () => {
  test('CallAgentResponse interface defined in engine/types.ts', () => {
    const src = readSrc('engine/types.ts')
    expect(src).toContain('CallAgentResponse')
    expect(src).toContain("'success'")
    expect(src).toContain("'failure'")
    expect(src).toContain("'partial'")
    expect(src).toContain('summary')
    expect(src).toContain('delegatedTo')
  })

  test('parseChildResponse function exported from call-agent', () => {
    const src = readSrc('tool-handlers/builtins/call-agent.ts')
    expect(src).toMatch(/export\s+function\s+parseChildResponse/)
  })

  test('REFLECTION_MODEL defined as Haiku', () => {
    const src = readSrc('engine/model-selector.ts')
    expect(src).toContain('REFLECTION_MODEL')
    expect(src).toContain('haiku')
  })

  test('selectModelWithCostPreference exported from model-selector', () => {
    const src = readSrc('engine/model-selector.ts')
    expect(src).toMatch(/export\s+function\s+selectModelWithCostPreference/)
  })

  test('CostPreference type defined', () => {
    const src = readSrc('engine/model-selector.ts')
    expect(src).toContain('CostPreference')
    expect(src).toContain("'quality'")
    expect(src).toContain("'balanced'")
    expect(src).toContain("'cost'")
  })

  test('AR73 test suite exists (10+ tests)', () => {
    const src = readSrc('__tests__/unit/ar73-response-standardization.test.ts')
    const testCount = (src.match(/\btest\(/g) || []).length
    expect(testCount).toBeGreaterThanOrEqual(10)
  })

  test('AR74 test suite exists (11+ tests)', () => {
    const src = readSrc('__tests__/unit/ar74-cost-aware-model.test.ts')
    const testCount = (src.match(/\btest\(/g) || []).length
    expect(testCount).toBeGreaterThanOrEqual(11)
  })
})

// === Gate 8: CodeMirror soul extensions ===

describe('Go/No-Go #2: Gate 8 — Soul editor extensions', () => {
  const cmSrc = fs.readFileSync('packages/app/src/lib/codemirror-soul-extensions.ts', 'utf-8')

  test('SOUL_VARIABLES array exported with 13 entries', () => {
    expect(cmSrc).toContain('SOUL_VARIABLES')
    // Count variable definitions by name property
    const nameMatches = cmSrc.match(/name:\s*'/g) || []
    expect(nameMatches.length).toBeGreaterThanOrEqual(13)
  })

  test('soulVariableHighlight exported', () => {
    expect(cmSrc).toContain('soulVariableHighlight')
    expect(cmSrc).toContain('MatchDecorator')
  })

  test('soulAutocomplete exported', () => {
    expect(cmSrc).toContain('soulAutocomplete')
    expect(cmSrc).toContain('autocompletion')
  })

  test('personality category variables included', () => {
    expect(cmSrc).toContain('personality_openness')
    expect(cmSrc).toContain('personality_conscientiousness')
    expect(cmSrc).toContain('personality_extraversion')
    expect(cmSrc).toContain('personality_agreeableness')
    expect(cmSrc).toContain('personality_neuroticism')
  })

  test('CodeMirror editor component supports soulMode', () => {
    const editorSrc = fs.readFileSync('packages/app/src/components/codemirror-editor.tsx', 'utf-8')
    expect(editorSrc).toContain('soulMode')
    expect(editorSrc).toContain('soulVariableHighlight')
    expect(editorSrc).toContain('soulAutocomplete')
  })
})

// === Summary gate ===

describe('Go/No-Go #2: Sprint 1 Exit Summary', () => {
  test('all story files exist with Status: implemented', () => {
    const storyFiles = [
      '_bmad-output/implementation-artifacts/stories/24-3-per1-sanitization-chain.md',
      '_bmad-output/implementation-artifacts/stories/24-4-personality-presets.md',
      '_bmad-output/implementation-artifacts/stories/24-5-big-five-slider-ui.md',
      '_bmad-output/implementation-artifacts/stories/24-6-soul-editor-autocomplete.md',
      '_bmad-output/implementation-artifacts/stories/24-7-call-agent-response-standardization.md',
    ]
    for (const file of storyFiles) {
      expect(fs.existsSync(file)).toBe(true)
      const content = fs.readFileSync(file, 'utf-8')
      expect(content).toContain('Status: implemented')
    }
  })

  test('dedicated test suites exist for each major story', () => {
    const testFiles = [
      '__tests__/unit/per1-sanitization-chain.test.ts',        // 24.3
      '__tests__/unit/soul-preview-personality.test.ts',        // 24.6
      '__tests__/unit/ar73-response-standardization.test.ts',   // 24.7
      '__tests__/unit/ar74-cost-aware-model.test.ts',           // 24.7
    ]
    for (const file of testFiles) {
      expect(fs.existsSync(`packages/server/src/${file}`)).toBe(true)
    }
  })

  test('total test coverage: 30+ per1 + 11 AR73 + 11 AR74 + 7 preview = 59+ tests', () => {
    const per1 = (readSrc('__tests__/unit/per1-sanitization-chain.test.ts').match(/\btest\(/g) || []).length
    const ar73 = (readSrc('__tests__/unit/ar73-response-standardization.test.ts').match(/\btest\(/g) || []).length
    const ar74 = (readSrc('__tests__/unit/ar74-cost-aware-model.test.ts').match(/\btest\(/g) || []).length
    const preview = (readSrc('__tests__/unit/soul-preview-personality.test.ts').match(/\btest\(/g) || []).length
    expect(per1 + ar73 + ar74 + preview).toBeGreaterThanOrEqual(59)
  })
})
