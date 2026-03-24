/**
 * Story 23.14 — HandoffTracker Redesign Tests
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const trackerPath = resolve(__dirname, '..', 'pages/hub/handoff-tracker.tsx')

describe('HandoffTracker Redesign', () => {
  const src = readFileSync(trackerPath, 'utf-8')

  // ── Component exports ──
  test('HandoffTracker is exported', () => {
    expect(src).toContain('export function HandoffTracker')
  })

  test('HandoffTimelineEntry is defined', () => {
    expect(src).toContain('function HandoffTimelineEntry')
  })

  // ── Status color mapping ──
  test('has pending status with amber color', () => {
    expect(src).toContain("pending: {")
    expect(src).toContain('text-amber-600')
    expect(src).toContain('bg-amber-50')
  })

  test('has delegating (in-progress) status with blue color', () => {
    expect(src).toContain("delegating: {")
    expect(src).toContain('text-blue-600')
    expect(src).toContain('bg-blue-50')
  })

  test('has completed status with olive color', () => {
    expect(src).toContain("completed: {")
    expect(src).toContain("text-[#5a7247]")
  })

  test('has failed status with red color', () => {
    expect(src).toContain("failed: {")
    expect(src).toContain('text-red-600')
    expect(src).toContain('bg-red-50')
  })

  // ── Timeline rendering features ──
  test('has timeline dot and connector line', () => {
    expect(src).toContain('Timeline connector line')
    expect(src).toContain('Timeline dot')
    expect(src).toContain('rounded-full')
  })

  test('has expandable detail panel', () => {
    expect(src).toContain('expanded')
    expect(src).toContain('setExpanded')
    expect(src).toContain('ChevronDown')
    expect(src).toContain('ChevronRight')
  })

  test('shows from/to agent names with arrow', () => {
    expect(src).toContain('fromAgent')
    expect(src).toContain('toAgent')
    expect(src).toContain('ArrowRight')
  })

  test('has data-testid for handoff entries', () => {
    expect(src).toContain('data-testid="handoff-entry"')
    expect(src).toContain('data-testid="handoff-tracker"')
  })

  // ── Duration formatting ──
  test('formatDuration helper exists', () => {
    expect(src).toContain('function formatDuration')
  })

  // ── Live indicator ──
  test('shows live indicator when delegating', () => {
    expect(src).toContain('Live')
    expect(src).toContain('animate-spin')
    expect(src).toContain('animate-pulse')
  })

  // ── Natural Organic styling ──
  test('uses Natural Organic theme colors', () => {
    expect(src).toContain('#283618') // dark olive text
    expect(src).toContain('#6b705c') // muted text
    expect(src).toContain('#e5e1d3') // sand
    expect(src).toContain('#5a7247') // olive accent
  })

  // ── Depth info ──
  test('shows handoff depth in expanded view', () => {
    expect(src).toContain('entry.depth')
    expect(src).toContain('Level')
  })
})
