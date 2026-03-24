/**
 * Story 23.13 — NexusCanvas Redesign Tests
 */
import { describe, test, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const appSrc = resolve(__dirname, '..')

describe('NexusCanvas Redesign', () => {
  // ── Component exports ──
  test('NexusCanvas component exports NexusCanvas + NexusCanvasProps', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/nexus-canvas.tsx'), 'utf-8')
    expect(src).toContain('export function NexusCanvas')
    expect(src).toContain('export interface NexusCanvasProps')
  })

  test('AgentNode component is exported', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/AgentNode.tsx'), 'utf-8')
    expect(src).toContain('export function AgentNode')
  })

  test('CompanyNode component is exported', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/CompanyNode.tsx'), 'utf-8')
    expect(src).toContain('export function CompanyNode')
  })

  test('DepartmentNode component is exported', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/DepartmentNode.tsx'), 'utf-8')
    expect(src).toContain('export function DepartmentNode')
  })

  // ── Natural Organic theme colors ──
  test('AgentNode uses Natural Organic olive/cream colors', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/AgentNode.tsx'), 'utf-8')
    expect(src).toContain('#283618') // dark olive
    expect(src).toContain('#5a7247') // olive
    expect(src).toContain('#e5e1d3') // sand
    expect(src).toContain('#faf8f5') // cream
  })

  test('CompanyNode uses Natural Organic theme', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/CompanyNode.tsx'), 'utf-8')
    expect(src).toContain('#283618') // dark olive bg
    expect(src).toContain('#faf8f5') // cream text
    expect(src).toContain('#5a7247') // olive accent
  })

  test('DepartmentNode uses Natural Organic theme', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/DepartmentNode.tsx'), 'utf-8')
    expect(src).toContain('#283618') // dark olive text
    expect(src).toContain('#e5e1d3') // sand border
    expect(src).toContain('#5a7247') // olive accent
  })

  // ── Agent node features ──
  test('AgentNode has avatar, tier badge, status dot', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/AgentNode.tsx'), 'utf-8')
    // Avatar area
    expect(src).toContain('avatarUrl')
    expect(src).toContain('Bot')
    // Tier badge
    expect(src).toContain('TIER_BADGES')
    expect(src).toContain('manager')
    expect(src).toContain('specialist')
    expect(src).toContain('worker')
    // Status dot
    expect(src).toContain('STATUS_COLORS')
    expect(src).toContain('online')
    expect(src).toContain('working')
    expect(src).toContain('error')
    expect(src).toContain('offline')
  })

  // ── Canvas features ──
  test('NexusCanvas has MiniMap', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/nexus-canvas.tsx'), 'utf-8')
    expect(src).toContain('MiniMap')
  })

  test('NexusCanvas has Controls (zoom)', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/nexus-canvas.tsx'), 'utf-8')
    expect(src).toContain('Controls')
  })

  test('NexusCanvas has export PNG/SVG buttons', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/nexus-canvas.tsx'), 'utf-8')
    expect(src).toContain('NexusExportButton')
    expect(src).toContain('PNG')
    expect(src).toContain('SVG')
    expect(src).toContain("handleExport('png')")
    expect(src).toContain("handleExport('svg')")
  })

  test('NexusCanvas has data-testid', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/nexus-canvas.tsx'), 'utf-8')
    expect(src).toContain('data-testid="nexus-canvas"')
  })

  // ── Nexus page uses NexusCanvas component ──
  test('NexusPage imports NexusCanvas from component', () => {
    const src = readFileSync(resolve(appSrc, 'pages/nexus.tsx'), 'utf-8')
    expect(src).toContain("from '../components/nexus/nexus-canvas'")
    expect(src).toContain('<NexusCanvas')
  })

  // ── Edge styling ──
  test('NexusCanvas uses olive-colored edges', () => {
    const src = readFileSync(resolve(appSrc, 'components/nexus/nexus-canvas.tsx'), 'utf-8')
    expect(src).toContain('#a3b18a') // sage green edges
  })
})
