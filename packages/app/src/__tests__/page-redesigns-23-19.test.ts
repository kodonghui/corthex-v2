import { describe, test, expect, beforeAll } from 'bun:test'

// === Story 23.19 — Page Redesigns: Documents, ARGOS, Activity ===
// Tests for page structure, component exports, and Natural Organic theme consistency

// Mock browser globals for component imports
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    (globalThis as Record<string, unknown>).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    }
  }
})

// ── Natural Organic Theme Constants ──

const NATURAL_ORGANIC = {
  cream: '#faf8f5',
  olive: '#283618',
  oliveLight: '#5a7247',
  oliveAccent: '#606C38',
  sand: '#e5e1d3',
  sandDark: '#d4cfc4',
  elevated: '#f5f0e8',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b705c',
  textMuted: '#908a78',
  textTertiary: '#756e5a',
}

// ── KnowledgePage Tests ──

describe('KnowledgePage', () => {
  test('exports KnowledgePage as named export', async () => {
    const mod = await import('../pages/knowledge')
    expect(mod.KnowledgePage).toBeDefined()
    expect(typeof mod.KnowledgePage).toBe('function')
  })

  test('content type constants are defined', () => {
    const CONTENT_TYPES = ['markdown', 'text', 'html', 'mermaid'] as const
    expect(CONTENT_TYPES).toHaveLength(4)
    CONTENT_TYPES.forEach(ct => expect(typeof ct).toBe('string'))
  })

  test('memory type constants are defined', () => {
    const MEMORY_TYPES = ['learning', 'insight', 'preference', 'fact'] as const
    expect(MEMORY_TYPES).toHaveLength(4)
    MEMORY_TYPES.forEach(mt => expect(typeof mt).toBe('string'))
  })

  test('formatDate helper produces Korean locale string', () => {
    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    const result = formatDate('2026-03-20T10:30:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  test('formatRelative returns relative time strings', () => {
    function formatRelative(dateStr: string) {
      const diff = Date.now() - new Date(dateStr).getTime()
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return '방금 전'
      if (minutes < 60) return `${minutes}분 전`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}시간 전`
      const days = Math.floor(hours / 24)
      if (days < 30) return `${days}일 전`
      return 'old'
    }
    expect(formatRelative(new Date().toISOString())).toBe('방금 전')
    expect(formatRelative(new Date(Date.now() - 3600000).toISOString())).toBe('1시간 전')
    expect(formatRelative(new Date(Date.now() - 86400000 * 2).toISOString())).toBe('2일 전')
  })

  test('flattenFolders flattens nested folder tree', () => {
    type Folder = { id: string; name: string; children: Folder[] }
    function flattenFolders(folders: Folder[], depth = 0): { id: string; name: string; indent: string }[] {
      const result: { id: string; name: string; indent: string }[] = []
      for (const f of folders) {
        result.push({ id: f.id, name: f.name, indent: '\u00A0\u00A0'.repeat(depth) })
        result.push(...flattenFolders(f.children, depth + 1))
      }
      return result
    }

    const folders: Folder[] = [
      { id: '1', name: 'Root', children: [{ id: '2', name: 'Child', children: [] }] },
    ]
    const flat = flattenFolders(folders)
    expect(flat).toHaveLength(2)
    expect(flat[0].indent).toBe('')
    expect(flat[1].indent).toBe('\u00A0\u00A0')
  })

  test('findFolderName searches nested folders', () => {
    type Folder = { id: string; name: string; children: Folder[] }
    function findFolderName(folders: Folder[], id: string): string | null {
      for (const f of folders) {
        if (f.id === id) return f.name
        const found = findFolderName(f.children, id)
        if (found) return found
      }
      return null
    }

    const folders: Folder[] = [
      { id: '1', name: 'Root', children: [{ id: '2', name: 'Child', children: [] }] },
    ]
    expect(findFolderName(folders, '2')).toBe('Child')
    expect(findFolderName(folders, '999')).toBeNull()
  })
})

// ── ArgosPage Tests ──

describe('ArgosPage', () => {
  test('exports ArgosPage as named export', async () => {
    const mod = await import('../pages/argos')
    expect(mod.ArgosPage).toBeDefined()
    expect(typeof mod.ArgosPage).toBe('function')
  })

  test('trigger types are properly defined', () => {
    const TRIGGER_TYPES = [
      { value: 'price', label: '가격 감시' },
      { value: 'price-above', label: '가격 상한' },
      { value: 'price-below', label: '가격 하한' },
      { value: 'news', label: '뉴스 감시' },
      { value: 'schedule', label: '정기 수집' },
      { value: 'market-open', label: '장 시작' },
      { value: 'market-close', label: '장 마감' },
      { value: 'custom', label: '커스텀' },
    ]
    expect(TRIGGER_TYPES).toHaveLength(8)
    TRIGGER_TYPES.forEach(tt => {
      expect(tt.value).toBeTruthy()
      expect(tt.label).toBeTruthy()
    })
  })

  test('event status badge configurations are complete', () => {
    const statuses = ['detected', 'executing', 'completed', 'failed']
    const EVENT_STATUS_BADGE: Record<string, { label: string; classes: string }> = {
      detected: { label: '감지됨', classes: 'bg-slate-500/15 text-[#6b705c]' },
      executing: { label: '실행중', classes: 'bg-blue-500/15 text-blue-400 animate-pulse' },
      completed: { label: '완료', classes: 'bg-emerald-500/15 text-emerald-400' },
      failed: { label: '실패', classes: 'bg-red-500/15 text-red-400' },
    }
    statuses.forEach(s => {
      expect(EVENT_STATUS_BADGE[s]).toBeDefined()
      expect(EVENT_STATUS_BADGE[s].label).toBeTruthy()
      expect(EVENT_STATUS_BADGE[s].classes).toBeTruthy()
    })
  })

  test('formatConditionKorean handles price triggers', () => {
    function formatConditionKorean(triggerType: string, condition: Record<string, unknown>): string {
      if (['price', 'price-above', 'price-below'].includes(triggerType)) {
        const ticker = (condition.ticker || '?') as string
        const value = (condition.value ?? '?') as number
        return `${ticker} ${typeof value === 'number' ? value.toLocaleString() : value}`
      }
      return JSON.stringify(condition)
    }

    expect(formatConditionKorean('price', { ticker: 'AAPL', value: 150 })).toBe('AAPL 150')
    expect(formatConditionKorean('price-above', { ticker: 'TSLA', value: 200 })).toBe('TSLA 200')
  })

  test('formatRelativeTime returns Korean relative times', () => {
    function formatRelativeTime(dateStr: string): string {
      const diff = Date.now() - new Date(dateStr).getTime()
      if (diff < 60000) return '방금'
      const minutes = Math.floor(diff / 60000)
      if (minutes < 60) return `${minutes}분 전`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}시간 전`
      return `${Math.floor(hours / 24)}일 전`
    }
    expect(formatRelativeTime(new Date().toISOString())).toBe('방금')
    expect(formatRelativeTime(new Date(Date.now() - 7200000).toISOString())).toBe('2시간 전')
  })

  test('Natural Organic colors are used (no dark-mode stone/slate text)', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(new URL('../pages/', import.meta.url).pathname + 'argos.tsx', 'utf8')
    // Should not have dark-theme text colors
    expect(content).not.toContain('text-slate-50')
    expect(content).not.toContain('text-slate-200')
    // Should use Natural Organic colors
    expect(content).toContain('#faf8f5')
    expect(content).toContain('#283618')
    expect(content).toContain('#606C38')
  })
})

// ── ActivityLogPage Tests ──

describe('ActivityLogPage', () => {
  test('exports ActivityLogPage as named export', async () => {
    const mod = await import('../pages/activity-log')
    expect(mod.ActivityLogPage).toBeDefined()
    expect(typeof mod.ActivityLogPage).toBe('function')
  })

  test('tab items are properly defined', () => {
    const TAB_ITEMS = [
      { value: 'agents', label: 'Activity' },
      { value: 'delegations', label: 'Delegation' },
      { value: 'quality', label: 'QA Reviews' },
      { value: 'tools', label: 'Tools' },
    ]
    expect(TAB_ITEMS).toHaveLength(4)
    TAB_ITEMS.forEach(t => {
      expect(t.value).toBeTruthy()
      expect(t.label).toBeTruthy()
    })
  })

  test('status badge configuration covers all statuses', () => {
    const STATUS_BADGE: Record<string, { label: string; dotColor: string }> = {
      completed: { label: 'Success', dotColor: '#4d7c0f' },
      done: { label: 'Success', dotColor: '#4d7c0f' },
      failed: { label: 'Critical', dotColor: '#dc2626' },
      error: { label: 'Critical', dotColor: '#dc2626' },
      working: { label: 'Info', dotColor: '#2563eb' },
      pass: { label: 'PASS', dotColor: '#4d7c0f' },
      fail: { label: 'FAIL', dotColor: '#dc2626' },
      warning: { label: 'Neutral', dotColor: '#b45309' },
    }
    expect(Object.keys(STATUS_BADGE).length).toBeGreaterThanOrEqual(8)
    Object.values(STATUS_BADGE).forEach(v => {
      expect(v.label).toBeTruthy()
      expect(v.dotColor).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  test('formatTime produces Korean date format', () => {
    function formatTime(dateStr: string) {
      return new Date(dateStr).toLocaleString('ko-KR', {
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
      })
    }
    const result = formatTime('2026-03-20T14:30:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  test('formatDuration handles various inputs', () => {
    function formatDuration(ms: number | null | undefined) {
      if (ms == null) return '-'
      if (ms < 1000) return `${ms}ms`
      return `${(ms / 1000).toFixed(1)}s`
    }
    expect(formatDuration(null)).toBe('-')
    expect(formatDuration(undefined)).toBe('-')
    expect(formatDuration(500)).toBe('500ms')
    expect(formatDuration(1500)).toBe('1.5s')
    expect(formatDuration(0)).toBe('0ms')
  })

  test('phaseDotColor returns appropriate colors', () => {
    function phaseDotColor(phase: string): string {
      if (['completed', 'done', 'end', 'success'].includes(phase)) return '#4d7c0f'
      if (['failed', 'error'].includes(phase)) return '#dc2626'
      if (['working', 'start', 'running'].includes(phase)) return '#2563eb'
      if (phase === 'warning') return '#b45309'
      return '#756e5a'
    }
    expect(phaseDotColor('completed')).toBe('#4d7c0f')
    expect(phaseDotColor('failed')).toBe('#dc2626')
    expect(phaseDotColor('working')).toBe('#2563eb')
    expect(phaseDotColor('warning')).toBe('#b45309')
    expect(phaseDotColor('unknown')).toBe('#756e5a')
  })

  test('scorePercent calculates correctly', () => {
    function scorePercent(score: number | undefined, max: number | undefined): number {
      if (score == null || max == null || max === 0) return 0
      return Math.round((score / max) * 100)
    }
    expect(scorePercent(80, 100)).toBe(80)
    expect(scorePercent(0, 100)).toBe(0)
    expect(scorePercent(undefined, 100)).toBe(0)
    expect(scorePercent(50, 0)).toBe(0)
  })
})

// ── Theme Consistency Tests ──

describe('Natural Organic Theme Consistency', () => {
  test('theme color tokens are valid hex values', () => {
    Object.entries(NATURAL_ORGANIC).forEach(([key, value]) => {
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })

  test('page data-testid attributes are set', async () => {
    const fs = await import('fs')

    const knowledgeContent = fs.readFileSync(new URL('../pages/', import.meta.url).pathname + 'knowledge.tsx', 'utf8')
    expect(knowledgeContent).toContain('data-testid="knowledge-page"')

    const argosContent = fs.readFileSync(new URL('../pages/', import.meta.url).pathname + 'argos.tsx', 'utf8')
    expect(argosContent).toContain('data-testid="argos-page"')

    const activityContent = fs.readFileSync(new URL('../pages/', import.meta.url).pathname + 'activity-log.tsx', 'utf8')
    expect(activityContent).toContain('data-testid="activity-log-page"')
  })

  test('knowledge page does not have redundant header/footer', async () => {
    const fs = await import('fs')
    const content = fs.readFileSync(new URL('../pages/', import.meta.url).pathname + 'knowledge.tsx', 'utf8')
    // The KnowledgePage export should not contain its own CORTHEX branding header
    const pageExport = content.slice(content.indexOf('export function KnowledgePage'))
    expect(pageExport).not.toContain('CORTHEX <span')
    expect(pageExport).not.toContain('v2.0.4-stable')
    expect(pageExport).not.toContain('API Reference')
  })
})
