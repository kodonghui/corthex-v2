import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { buildAnnouncement } from '../components/ScreenReaderAnnouncer'

const canvasSrc = readFileSync(resolve(__dirname, '../components/OfficeCanvas.tsx'), 'utf-8')
const mobileSrc = readFileSync(resolve(__dirname, '../components/MobileAgentList.tsx'), 'utf-8')
const announcerSrc = readFileSync(resolve(__dirname, '../components/ScreenReaderAnnouncer.tsx'), 'utf-8')

describe('ScreenReaderAnnouncer — buildAnnouncement', () => {
  test('working status with task', () => {
    expect(buildAnnouncement('Alpha', 'working', 'Processing data')).toBe(
      'Agent Alpha is now working on Processing data',
    )
  })

  test('working status without task', () => {
    expect(buildAnnouncement('Alpha', 'working')).toBe('Agent Alpha is now working')
  })

  test('idle status', () => {
    expect(buildAnnouncement('Bravo', 'idle')).toBe('Agent Bravo is now idle')
  })

  test('reflecting status', () => {
    expect(buildAnnouncement('Charlie', 'reflecting')).toBe('Agent Charlie is reflecting')
  })

  test('error status', () => {
    expect(buildAnnouncement('Delta', 'error')).toBe('Agent Delta encountered an error')
  })

  test('offline status', () => {
    expect(buildAnnouncement('Echo', 'offline')).toBe('Agent Echo went offline')
  })

  test('unknown status fallback', () => {
    expect(buildAnnouncement('Foxtrot', 'unknown')).toBe(
      'Agent Foxtrot status changed to unknown',
    )
  })
})

describe('OfficeCanvas — Keyboard Accessibility', () => {
  test('has tabIndex={0} for keyboard focus', () => {
    expect(canvasSrc).toContain('tabIndex={0}')
  })

  test('has role="application"', () => {
    expect(canvasSrc).toContain('role="application"')
  })

  test('has aria-label with agent count', () => {
    expect(canvasSrc).toContain('aria-label={`Virtual Office')
    expect(canvasSrc).toContain('agents.length} agents`}')
  })

  test('handles Tab key for navigation', () => {
    expect(canvasSrc).toContain("e.key === 'Tab'")
  })

  test('handles Arrow keys for navigation', () => {
    expect(canvasSrc).toContain("e.key === 'ArrowRight'")
    expect(canvasSrc).toContain("e.key === 'ArrowDown'")
    expect(canvasSrc).toContain("e.key === 'ArrowLeft'")
    expect(canvasSrc).toContain("e.key === 'ArrowUp'")
  })

  test('handles Enter to show tooltip', () => {
    expect(canvasSrc).toContain("e.key === 'Enter'")
  })

  test('handles Escape to dismiss tooltip', () => {
    expect(canvasSrc).toContain("e.key === 'Escape'")
  })

  test('includes ScreenReaderAnnouncer', () => {
    expect(canvasSrc).toContain('<ScreenReaderAnnouncer')
  })

  test('onKeyDown handler is attached', () => {
    expect(canvasSrc).toContain('onKeyDown={handleKeyDown}')
  })
})

describe('MobileAgentList — Semantic HTML', () => {
  test('uses ul element with role="list"', () => {
    expect(mobileSrc).toContain('role="list"')
  })

  test('uses li elements with role="listitem"', () => {
    expect(mobileSrc).toContain('role="listitem"')
  })

  test('has aria-label on the list', () => {
    expect(mobileSrc).toContain('aria-label={`Agent list')
  })

  test('has aria-label on each agent card', () => {
    expect(mobileSrc).toContain('aria-label={`${agent.name}, ${agent.status}')
  })

  test('status dot has aria-hidden', () => {
    expect(mobileSrc).toContain('aria-hidden="true"')
  })

  test('refresh button has aria-label', () => {
    expect(mobileSrc).toContain('aria-label="Refresh agent list"')
  })
})

describe('ScreenReaderAnnouncer — Structure', () => {
  test('uses aria-live="polite"', () => {
    expect(announcerSrc).toContain('aria-live="polite"')
  })

  test('uses aria-atomic="true"', () => {
    expect(announcerSrc).toContain('aria-atomic="true"')
  })

  test('uses role="status"', () => {
    expect(announcerSrc).toContain('role="status"')
  })

  test('is visually hidden (clip rect)', () => {
    expect(announcerSrc).toContain('clip:')
  })

  test('exports buildAnnouncement', () => {
    expect(announcerSrc).toContain('export function buildAnnouncement')
  })

  test('exports ScreenReaderAnnouncer', () => {
    expect(announcerSrc).toContain('export function ScreenReaderAnnouncer')
  })
})

describe('Component exports', () => {
  test('ScreenReaderAnnouncer exports correctly', async () => {
    const mod = await import('../components/ScreenReaderAnnouncer')
    expect(mod.ScreenReaderAnnouncer).toBeDefined()
    expect(typeof mod.ScreenReaderAnnouncer).toBe('function')
    expect(mod.buildAnnouncement).toBeDefined()
    expect(typeof mod.buildAnnouncement).toBe('function')
  })
})
