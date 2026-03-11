/**
 * TEA Risk-Based Tests — commands-list-handler.ts
 * Risk focus: builtin/preset merge, category grouping, i18n, output format
 */
import { describe, it, expect } from 'bun:test'
import { formatCommandsListReport } from '../../services/commands-list-handler'

const MINIMAL_BUILTINS = [
  { command: '/전체', description: 'broadcast', usage: '/전체 [msg]', category: '지시' },
  { command: '/명령어', description: 'list', usage: '/명령어', category: '도움' },
]

describe('TEA: commands-list-handler edge cases', () => {
  describe('formatCommandsListReport — content risks', () => {
    it('should handle empty builtins list gracefully', () => {
      const report = formatCommandsListReport([], [])
      expect(report).toContain('사용 가능한 명령어')
      expect(report).toContain('@멘션')
      expect(report).toContain('등록된 프리셋이 없습니다')
    })

    it('should handle preset with all null optional fields', () => {
      const presets = [
        { name: 'test', command: '/전체 hello', description: null, category: null },
      ]
      const report = formatCommandsListReport(MINIMAL_BUILTINS, presets)
      expect(report).toContain('test')
      expect(report).toContain('일반') // null category → '일반'
    })

    it('should handle preset command with exactly 50 chars (no truncation)', () => {
      const cmd50 = 'B'.repeat(50)
      const presets = [{ name: 'p1', command: cmd50, description: null, category: null }]
      const report = formatCommandsListReport(MINIMAL_BUILTINS, presets)
      expect(report).toContain(cmd50)
      expect(report).not.toContain(cmd50 + '...')
    })

    it('should handle preset command with 51 chars (truncation)', () => {
      const cmd51 = 'C'.repeat(51)
      const presets = [{ name: 'p1', command: cmd51, description: null, category: null }]
      const report = formatCommandsListReport(MINIMAL_BUILTINS, presets)
      expect(report).toContain('C'.repeat(50) + '...')
    })

    it('should handle many presets (50+)', () => {
      const presets = Array.from({ length: 55 }, (_, i) => ({
        name: `preset_${i}`,
        command: `/전체 task ${i}`,
        description: null,
        category: `cat_${i % 3}`,
      }))
      const report = formatCommandsListReport(MINIMAL_BUILTINS, presets)
      expect(report).toContain('내 프리셋 (55개)')
      expect(report).toContain('preset_0')
      expect(report).toContain('preset_54')
    })

    it('should handle preset with pipe characters in command (table escape risk)', () => {
      const presets = [
        { name: 'pipe_test', command: 'echo "a | b"', description: null, category: null },
      ]
      const report = formatCommandsListReport(MINIMAL_BUILTINS, presets)
      // Should still produce valid output (pipe in markdown table)
      expect(report).toContain('pipe_test')
    })

    it('should include footer text about natural language routing', () => {
      const report = formatCommandsListReport(MINIMAL_BUILTINS, [])
      expect(report).toContain('비서실장이 자동으로')
      expect(report).toContain('라우팅')
    })

    it('should show usage in code format for builtins', () => {
      const report = formatCommandsListReport(MINIMAL_BUILTINS, [])
      expect(report).toContain('`/전체 [msg]`')
      expect(report).toContain('`/명령어`')
    })

    it('should include separator line before footer', () => {
      const report = formatCommandsListReport(MINIMAL_BUILTINS, [])
      expect(report).toContain('---')
    })
  })
})
