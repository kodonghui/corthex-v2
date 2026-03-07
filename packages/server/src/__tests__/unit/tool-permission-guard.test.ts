import { describe, it, expect } from 'bun:test'
import { checkToolPermission, hasWildcard } from '../../services/tool-permission-guard'

describe('tool-permission-guard', () => {
  describe('checkToolPermission', () => {
    it('allows tool when in allowedTools list', () => {
      const result = checkToolPermission(['web_search', 'calculator'], 'web_search')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('denies tool when not in allowedTools list', () => {
      const result = checkToolPermission(['web_search', 'calculator'], 'email_sender')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('TOOL_NOT_PERMITTED')
      expect(result.reason).toContain('email_sender')
    })

    it('denies all tools when allowedTools is empty', () => {
      const result = checkToolPermission([], 'web_search')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('TOOL_NOT_PERMITTED')
      expect(result.reason).toContain('no tools permitted')
    })

    it('denies all tools when allowedTools is undefined', () => {
      const result = checkToolPermission(undefined, 'web_search')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('TOOL_NOT_PERMITTED')
    })

    it('denies all tools when allowedTools is null', () => {
      const result = checkToolPermission(null, 'web_search')
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('TOOL_NOT_PERMITTED')
    })

    it('allows any tool when wildcard "*" is in allowedTools', () => {
      const result = checkToolPermission(['*'], 'any_tool_name')
      expect(result.allowed).toBe(true)
    })

    it('allows tool with wildcard among other tools', () => {
      const result = checkToolPermission(['web_search', '*'], 'random_tool')
      expect(result.allowed).toBe(true)
    })

    it('returns specific error message with tool name', () => {
      const result = checkToolPermission(['calculator'], 'secret_admin_tool')
      expect(result.reason).toBe('TOOL_NOT_PERMITTED: secret_admin_tool is not in your allowed tools')
    })

    it('handles single tool in allowedTools', () => {
      expect(checkToolPermission(['only_tool'], 'only_tool').allowed).toBe(true)
      expect(checkToolPermission(['only_tool'], 'other_tool').allowed).toBe(false)
    })

    it('is case-sensitive for tool names', () => {
      const result = checkToolPermission(['Web_Search'], 'web_search')
      expect(result.allowed).toBe(false)
    })
  })

  describe('hasWildcard', () => {
    it('returns true when allowedTools contains "*"', () => {
      expect(hasWildcard(['*'])).toBe(true)
      expect(hasWildcard(['web_search', '*'])).toBe(true)
    })

    it('returns false when allowedTools does not contain "*"', () => {
      expect(hasWildcard(['web_search', 'calculator'])).toBe(false)
    })

    it('returns false for empty array', () => {
      expect(hasWildcard([])).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(hasWildcard(undefined)).toBe(false)
    })

    it('returns false for null', () => {
      expect(hasWildcard(null)).toBe(false)
    })
  })
})
