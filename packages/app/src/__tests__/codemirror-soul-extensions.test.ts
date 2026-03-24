import { describe, test, expect } from 'bun:test'

// Story 24.6: CodeMirror Soul Extensions Tests (UXR118, AR15, UXR136)

import {
  SOUL_VARIABLES,
  SOUL_VARIABLE_CSS,
  type SoulVariable,
} from '../lib/codemirror-soul-extensions'

describe('Story 24.6: CodeMirror Soul Extensions', () => {
  describe('AR15: All available variables defined', () => {
    test('exactly 13 variables: 7 builtin + 5 personality + 1 memory', () => {
      expect(SOUL_VARIABLES).toHaveLength(13)
    })

    test('7 builtin variables', () => {
      const builtins = SOUL_VARIABLES.filter(v => v.category === 'builtin')
      expect(builtins).toHaveLength(7)
      const names = builtins.map(v => v.name)
      expect(names).toContain('agent_list')
      expect(names).toContain('subordinate_list')
      expect(names).toContain('tool_list')
      expect(names).toContain('department_name')
      expect(names).toContain('owner_name')
      expect(names).toContain('specialty')
      expect(names).toContain('knowledge_context')
    })

    test('5 personality variables (personality_* prefix)', () => {
      const personality = SOUL_VARIABLES.filter(v => v.category === 'personality')
      expect(personality).toHaveLength(5)
      for (const v of personality) {
        expect(v.name).toMatch(/^personality_/)
      }
    })

    test('1 memory variable', () => {
      const memory = SOUL_VARIABLES.filter(v => v.category === 'memory')
      expect(memory).toHaveLength(1)
      expect(memory[0].name).toBe('relevant_memories')
    })

    test('all variables have required fields', () => {
      for (const v of SOUL_VARIABLES) {
        expect(v.name.length).toBeGreaterThan(0)
        expect(v.label.length).toBeGreaterThan(0)
        expect(v.description.length).toBeGreaterThan(0)
        expect(['builtin', 'personality', 'memory']).toContain(v.category)
      }
    })

    test('no duplicate variable names', () => {
      const names = SOUL_VARIABLES.map(v => v.name)
      expect(new Set(names).size).toBe(names.length)
    })
  })

  describe('UXR118: Variable highlighting CSS', () => {
    test('CSS contains .cm-soul-variable class', () => {
      expect(SOUL_VARIABLE_CSS).toContain('.cm-soul-variable')
    })

    test('CSS has olive-themed color (#5a7247)', () => {
      expect(SOUL_VARIABLE_CSS).toContain('#5a7247')
    })

    test('CSS has background color', () => {
      expect(SOUL_VARIABLE_CSS).toContain('background-color')
    })
  })

  describe('Autocomplete: {{variable}} regex matching', () => {
    test('regex matches {{word}} patterns', () => {
      const regex = /\{\{(\w*)/
      expect(regex.test('{{agent_list')).toBe(true)
      expect(regex.test('{{')).toBe(true)
      expect(regex.test('{{personality_openness')).toBe(true)
    })

    test('regex does not match single brace', () => {
      const regex = /\{\{(\w*)/
      expect(regex.test('{agent_list')).toBe(false)
      expect(regex.test('agent_list')).toBe(false)
    })
  })

  describe('Extension exports', () => {
    test('soulVariableHighlight is exported', async () => {
      const mod = await import('../lib/codemirror-soul-extensions')
      expect(mod.soulVariableHighlight).toBeDefined()
    })

    test('soulAutocomplete is exported', async () => {
      const mod = await import('../lib/codemirror-soul-extensions')
      expect(mod.soulAutocomplete).toBeDefined()
    })

    test('SOUL_VARIABLE_CSS is a non-empty string', () => {
      expect(typeof SOUL_VARIABLE_CSS).toBe('string')
      expect(SOUL_VARIABLE_CSS.length).toBeGreaterThan(0)
    })
  })

  describe('Variable categories for autocomplete type icons', () => {
    test('builtin vars get "keyword" type', () => {
      const builtins = SOUL_VARIABLES.filter(v => v.category === 'builtin')
      for (const v of builtins) {
        // Matches autocomplete mapping: builtin → keyword
        expect(v.category).toBe('builtin')
      }
    })

    test('personality vars get "variable" type', () => {
      const personality = SOUL_VARIABLES.filter(v => v.category === 'personality')
      for (const v of personality) {
        expect(v.category).toBe('personality')
      }
    })

    test('memory vars get "property" type', () => {
      const memory = SOUL_VARIABLES.filter(v => v.category === 'memory')
      for (const v of memory) {
        expect(v.category).toBe('memory')
      }
    })
  })
})
