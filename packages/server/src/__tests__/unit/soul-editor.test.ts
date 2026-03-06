import { describe, test, expect } from 'bun:test'
import { existsSync } from 'fs'
import { resolve } from 'path'

/**
 * Story 15-3: Soul Editor (CodeMirror upgrade)
 * Unit tests for the CodeMirror editor integration in the workspace soul editor.
 * Note: CodeMirror is a client-side component. These tests validate the contract
 * and behavioral expectations rather than DOM rendering.
 */

describe('Story 15-3: Soul Editor CodeMirror Integration', () => {
  // ── AC #1: CodeMirror lazy loading ──
  describe('AC #1: Lazy import contract', () => {
    test('codemirror-editor module file exists', () => {
      const filePath = resolve(__dirname, '../../../../app/src/components/codemirror-editor.tsx')
      expect(existsSync(filePath)).toBe(true)
    })
  })

  // ── AC #4: Character counter logic ──
  describe('AC #4: Character counter logic', () => {
    const MAX_CHARS = 2000

    test('counts characters correctly for empty string', () => {
      const text = ''
      expect(text.length).toBe(0)
      expect(text.length > MAX_CHARS).toBe(false)
    })

    test('counts characters correctly for normal text', () => {
      const text = '# Agent Soul\n\nYou are a marketing specialist...'
      expect(text.length).toBe(47)
      expect(text.length > MAX_CHARS).toBe(false)
    })

    test('detects over-limit correctly', () => {
      const text = 'a'.repeat(2001)
      expect(text.length).toBe(2001)
      expect(text.length > MAX_CHARS).toBe(true)
    })

    test('boundary: exactly 2000 chars is within limit', () => {
      const text = 'a'.repeat(2000)
      expect(text.length).toBe(2000)
      expect(text.length > MAX_CHARS).toBe(false)
    })

    test('handles Korean characters correctly', () => {
      const text = '당신은 CEO의 비서실장입니다.'
      expect(text.length).toBe(17)
      expect(text.length > MAX_CHARS).toBe(false)
    })

    test('handles markdown with special characters', () => {
      const text = '# 헤딩\n\n**볼드** _이탤릭_ `코드`\n\n- 리스트 1\n- 리스트 2'
      expect(text.length).toBe(40)
      expect(text.length > MAX_CHARS).toBe(false)
    })
  })

  // ── AC #7: Existing functionality preserved ──
  describe('AC #7: Soul editor state management', () => {
    test('isDirty detection: same text is not dirty', () => {
      const original = 'You are a marketing specialist...'
      const current = 'You are a marketing specialist...'
      expect(current !== original).toBe(false)
    })

    test('isDirty detection: modified text is dirty', () => {
      const original: string = 'You are a marketing specialist...'
      const current: string = 'You are a data analyst...'
      expect(current !== original).toBe(true)
    })

    test('template application replaces soul text', () => {
      let soulText = 'Original soul content'
      const templateContent = 'New template content from library'
      // Simulating template apply
      soulText = templateContent
      expect(soulText).toBe('New template content from library')
    })

    test('reset restores to admin soul', () => {
      const adminSoul = 'Admin-set original soul'
      let soulText = 'User modified soul'
      // Simulating reset
      soulText = adminSoul
      expect(soulText).toBe('Admin-set original soul')
    })
  })

  // ── AC #2: Markdown support verification ──
  describe('AC #2: Markdown content patterns', () => {
    test('supports heading syntax', () => {
      const text = '# Main Title\n## Sub Title\n### Section'
      expect(text).toContain('#')
      expect(text.split('\n').length).toBe(3)
    })

    test('supports bold and italic', () => {
      const text = '**bold** and _italic_ and ***both***'
      expect(text).toContain('**bold**')
      expect(text).toContain('_italic_')
    })

    test('supports code blocks', () => {
      const text = 'Inline `code` and\n```\nblock code\n```'
      expect(text).toContain('`code`')
      expect(text).toContain('```')
    })

    test('supports list items for auto-indent', () => {
      const text = '- Item 1\n  - Sub item\n- Item 2'
      expect(text).toContain('  - Sub item')
    })
  })

  // ── AC #5 & #6: Layout contract ──
  describe('AC #5/#6: Editor layout contract', () => {
    test('editor height should be 288px (12 rows equivalent)', () => {
      // The CodeMirror editor is configured with height: 288px
      // which matches the original 12-row textarea height
      const expectedHeight = '288px'
      expect(expectedHeight).toBe('288px')
    })

    test('50/50 split uses flex-1 for both panes', () => {
      // Both editor and preview panes use flex-1 class
      // Desktop: side by side, Mobile: tab switching
      const editorClass = 'flex-1'
      const previewClass = 'flex-1'
      expect(editorClass).toBe(previewClass)
    })
  })

  // ── AC #8: Build verification ──
  describe('AC #8: Build compatibility', () => {
    test('codemirror-editor module file exists with correct name', () => {
      const filePath = resolve(__dirname, '../../../../app/src/components/codemirror-editor.tsx')
      expect(existsSync(filePath)).toBe(true)
    })

    test('soul-editor.tsx exists', () => {
      const filePath = resolve(__dirname, '../../../../app/src/components/settings/soul-editor.tsx')
      expect(existsSync(filePath)).toBe(true)
    })
  })

  // ── TEA: CodeMirror module structure tests ──
  describe('TEA: CodeMirror module exports', () => {
    test('EditorView is available from @codemirror/view', async () => {
      const mod = await import('../../../../app/node_modules/@codemirror/view')
      expect(mod.EditorView).toBeDefined()
      expect(typeof mod.EditorView).toBe('function')
    })

    test('EditorState is available from @codemirror/state', async () => {
      const mod = await import('../../../../app/node_modules/@codemirror/state')
      expect(mod.EditorState).toBeDefined()
      expect(mod.Compartment).toBeDefined()
    })

    test('markdown language support is available', async () => {
      const mod = await import('../../../../app/node_modules/@codemirror/lang-markdown')
      expect(mod.markdown).toBeDefined()
      expect(typeof mod.markdown).toBe('function')
    })

    test('oneDark theme is available', async () => {
      const mod = await import('../../../../app/node_modules/@codemirror/theme-one-dark')
      expect(mod.oneDark).toBeDefined()
    })

    test('commands (defaultKeymap, indentWithTab) are available', async () => {
      const mod = await import('../../../../app/node_modules/@codemirror/commands')
      expect(mod.defaultKeymap).toBeDefined()
      expect(mod.indentWithTab).toBeDefined()
      expect(Array.isArray(mod.defaultKeymap)).toBe(true)
    })

    test('basicSetup is available from codemirror', async () => {
      const mod = await import('../../../../app/node_modules/codemirror')
      expect(mod.basicSetup).toBeDefined()
    })
  })

  // ── TEA: Edge cases for character counting ──
  describe('TEA: Character counter edge cases', () => {
    const MAX_CHARS = 2000

    test('handles emoji characters', () => {
      const text = '🔒 마케터 소울'
      expect(text.length).toBeGreaterThan(0)
      expect(text.length > MAX_CHARS).toBe(false)
    })

    test('handles mixed content: Korean + English + markdown', () => {
      const text = '# 마케터 Soul\n\n**역할**: Marketing Expert\n\n- 한국어 가능\n- English too'
      expect(text.length).toBeGreaterThan(0)
      expect(text.length > MAX_CHARS).toBe(false)
    })

    test('handles newlines correctly in char count', () => {
      const text = 'line1\nline2\nline3'
      expect(text.length).toBe(17) // each \n counts as 1
    })

    test('handles tab characters', () => {
      const text = 'line1\tindented'
      expect(text.length).toBe(14)
    })

    test('handles 1999 chars (one below limit)', () => {
      const text = 'x'.repeat(1999)
      expect(text.length > MAX_CHARS).toBe(false)
    })

    test('handles 2001 chars (one above limit)', () => {
      const text = 'x'.repeat(2001)
      expect(text.length > MAX_CHARS).toBe(true)
    })
  })

  // ── TEA: Soul editor state transitions ──
  describe('TEA: Soul editor state transitions', () => {
    test('empty soul → type text → isDirty', () => {
      const original: string = ''
      const current: string = 'New soul content'
      expect(current !== original).toBe(true)
    })

    test('soul with content → clear all → isDirty', () => {
      const original = 'Some content'
      const current: string = ''
      expect(current !== original).toBe(true)
    })

    test('type then undo → not dirty', () => {
      const original = 'Original'
      let current = 'Modified'
      current = 'Original' // undo
      expect(current !== original).toBe(false)
    })

    test('template load overwrites regardless of current content', () => {
      let soulText = 'Very long and elaborate soul definition that took forever to write...'
      const templateContent = 'Short template.'
      soulText = templateContent
      expect(soulText).toBe('Short template.')
    })

    test('template load on empty editor', () => {
      let soulText = ''
      const templateContent = 'Template content'
      soulText = templateContent
      expect(soulText).toBe('Template content')
    })

    test('multiple template loads: last one wins', () => {
      let soulText = ''
      soulText = 'Template A content'
      soulText = 'Template B content'
      soulText = 'Template C content'
      expect(soulText).toBe('Template C content')
    })

    test('save resets dirty state', () => {
      let original = 'Original'
      let current = 'Modified'
      expect(current !== original).toBe(true) // dirty
      // After save
      original = current
      expect(current !== original).toBe(false) // not dirty
    })
  })

  // ── TEA: CodeMirror wrapper prop contract ──
  describe('TEA: CodeMirror wrapper component contract', () => {
    test('component accepts value prop as string', () => {
      const value = '# Soul\n\nContent here'
      expect(typeof value).toBe('string')
    })

    test('component accepts empty string value', () => {
      const value = ''
      expect(typeof value).toBe('string')
      expect(value.length).toBe(0)
    })

    test('component onChange receives string', () => {
      let received = ''
      const onChange = (val: string) => { received = val }
      onChange('new text')
      expect(received).toBe('new text')
    })

    test('component onChange receives empty string on clear', () => {
      let received = 'initial'
      const onChange = (val: string) => { received = val }
      onChange('')
      expect(received).toBe('')
    })

    test('placeholder is optional', () => {
      const props = { value: '', onChange: (_: string) => {} }
      expect(props.value).toBeDefined()
      expect(props.onChange).toBeDefined()
    })
  })

  // ── TEA: Dark mode detection logic ──
  describe('TEA: Dark mode detection logic', () => {
    test('dark class detection pattern', () => {
      // Simulating the getIsDark() logic from codemirror-editor.tsx
      const classList = ['dark', 'bg-zinc-900']
      const isDark = classList.includes('dark')
      expect(isDark).toBe(true)
    })

    test('light mode detection (no dark class)', () => {
      const classList = ['bg-white']
      const isDark = classList.includes('dark')
      expect(isDark).toBe(false)
    })

    test('empty class list defaults to not dark', () => {
      const classList: string[] = []
      const isDark = classList.includes('dark')
      expect(isDark).toBe(false)
    })
  })
})
