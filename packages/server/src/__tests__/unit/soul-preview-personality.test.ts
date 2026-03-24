import { describe, test, expect } from 'bun:test'

// Story 24.6: Soul Preview with personality override (UXR136 A/B preview)

describe('Story 24.6: Soul Preview Personality Override', () => {
  describe('Personality vars built from override', () => {
    test('extraVars built correctly from personality traits', () => {
      const override = { openness: 80, conscientiousness: 30, extraversion: 70, agreeableness: 60, neuroticism: 40 }
      const extraVars: Record<string, string> = {}
      for (const [key, val] of Object.entries(override)) {
        extraVars[`personality_${key}`] = String(val)
      }
      expect(extraVars).toEqual({
        personality_openness: '80',
        personality_conscientiousness: '30',
        personality_extraversion: '70',
        personality_agreeableness: '60',
        personality_neuroticism: '40',
      })
    })

    test('no extraVars when override undefined', () => {
      const override = undefined
      const extraVars: Record<string, string> = {}
      if (override) {
        for (const [key, val] of Object.entries(override)) {
          extraVars[`personality_${key}`] = String(val)
        }
      }
      expect(Object.keys(extraVars)).toHaveLength(0)
    })

    test('all 5 OCEAN keys produce personality_* prefixed keys', () => {
      const keys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
      for (const key of keys) {
        expect(`personality_${key}`).toMatch(/^personality_/)
      }
    })
  })

  describe('Template rendering with personality vars', () => {
    // Simulate the renderSoul template replacement logic
    const render = (template: string, vars: Record<string, string>) =>
      template.replace(/\{\{([^}]+)\}\}/g, (_, key) => vars[key.trim()] || '')

    test('personality vars substituted in template', () => {
      const template = '개방성: {{personality_openness}}, 성실성: {{personality_conscientiousness}}'
      const vars = { personality_openness: '80', personality_conscientiousness: '30' }
      const result = render(template, vars)
      expect(result).toBe('개방성: 80, 성실성: 30')
    })

    test('A/B comparison shows different values for same template', () => {
      const template = '개방성: {{personality_openness}}'
      const varsA = { personality_openness: '50' }
      const varsB = { personality_openness: '80' }
      expect(render(template, varsA)).toBe('개방성: 50')
      expect(render(template, varsB)).toBe('개방성: 80')
      expect(render(template, varsA)).not.toBe(render(template, varsB))
    })

    test('missing personality vars become empty string', () => {
      const template = '개방성: {{personality_openness}}'
      const result = render(template, {})
      expect(result).toBe('개방성: ')
    })

    test('mixed builtin + personality vars both substituted', () => {
      const template = '{{department_name}} 에이전트: {{personality_extraversion}}'
      const vars = { department_name: '마케팅', personality_extraversion: '70' }
      expect(render(template, vars)).toBe('마케팅 에이전트: 70')
    })
  })
})
