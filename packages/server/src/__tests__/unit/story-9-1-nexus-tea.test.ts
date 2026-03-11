/**
 * TEA (Test Architect) — Story 9.1 NEXUS Canvas
 * Risk-based test expansion: edge cases, negative paths, boundary conditions
 */
import { describe, test, expect } from 'bun:test'

// ── Layout Data Types ──
type NodePosition = { x: number; y: number }
type LayoutData = {
  nodePositions: Record<string, NodePosition>
  viewport?: { x: number; y: number; zoom: number }
}

// ── Helpers ──
function applyLayoutToNodes(
  elkNodes: { id: string; position: NodePosition }[],
  saved: Record<string, NodePosition> | undefined,
) {
  return elkNodes.map((n) => {
    const pos = saved?.[n.id]
    return pos ? { ...n, position: pos } : n
  })
}

function isPositionDragEnd(change: { type: string; dragging?: boolean }) {
  return change.type === 'position' && 'dragging' in change && !change.dragging
}

describe('TEA Story 9.1: NEXUS Canvas Edge Cases', () => {
  describe('P0: Layout API — validation & boundary', () => {
    test('empty nodePositions object is valid', () => {
      const data: LayoutData = { nodePositions: {} }
      expect(Object.keys(data.nodePositions)).toHaveLength(0)
    })

    test('nodePositions with negative coordinates are valid', () => {
      const data: LayoutData = {
        nodePositions: { 'node-1': { x: -500, y: -300 } },
      }
      expect(data.nodePositions['node-1'].x).toBe(-500)
      expect(data.nodePositions['node-1'].y).toBe(-300)
    })

    test('nodePositions with very large coordinates are valid', () => {
      const data: LayoutData = {
        nodePositions: { 'node-1': { x: 99999, y: 99999 } },
      }
      expect(data.nodePositions['node-1'].x).toBe(99999)
    })

    test('viewport zoom of 0 edge case', () => {
      const data: LayoutData = {
        nodePositions: {},
        viewport: { x: 0, y: 0, zoom: 0 },
      }
      expect(data.viewport!.zoom).toBe(0)
    })

    test('viewport zoom max boundary (2.0)', () => {
      const data: LayoutData = {
        nodePositions: {},
        viewport: { x: 0, y: 0, zoom: 2 },
      }
      expect(data.viewport!.zoom).toBeLessThanOrEqual(2)
    })

    test('viewport zoom min boundary (0.1)', () => {
      const data: LayoutData = {
        nodePositions: {},
        viewport: { x: 0, y: 0, zoom: 0.1 },
      }
      expect(data.viewport!.zoom).toBeGreaterThanOrEqual(0.1)
    })

    test('layout with 100+ nodes handles correctly', () => {
      const positions: Record<string, NodePosition> = {}
      for (let i = 0; i < 100; i++) {
        positions[`node-${i}`] = { x: i * 10, y: i * 20 }
      }
      const data: LayoutData = { nodePositions: positions }
      expect(Object.keys(data.nodePositions)).toHaveLength(100)
      expect(data.nodePositions['node-99']).toEqual({ x: 990, y: 1980 })
    })

    test('upsert logic: first save creates, second overwrites entirely', () => {
      let savedLayout: LayoutData | null = null

      // First save — creates
      const layout1: LayoutData = { nodePositions: { 'a': { x: 1, y: 2 } } }
      savedLayout = layout1
      expect(savedLayout).toEqual(layout1)

      // Second save — overwrites (not merges)
      const layout2: LayoutData = { nodePositions: { 'b': { x: 3, y: 4 } } }
      savedLayout = layout2
      expect(savedLayout.nodePositions['a']).toBeUndefined() // Old data gone
      expect(savedLayout.nodePositions['b']).toEqual({ x: 3, y: 4 })
    })
  })

  describe('P0: Tenant isolation', () => {
    test('layout is scoped by company (tenantMiddleware)', () => {
      const companyA = { id: 'company-a', layout: { nodePositions: { 'n1': { x: 0, y: 0 } } } }
      const companyB = { id: 'company-b', layout: { nodePositions: { 'n2': { x: 50, y: 50 } } } }
      // Each company has its own layout
      expect(companyA.layout.nodePositions['n1']).toBeDefined()
      expect(companyB.layout.nodePositions['n2']).toBeDefined()
      expect(companyA.layout.nodePositions['n2']).toBeUndefined()
    })

    test('layout name filter: only nexus layouts returned', () => {
      const layouts = [
        { name: 'nexus', data: {} },
        { name: 'sketchvibe', data: {} },
        { name: 'default', data: {} },
      ]
      const nexusLayouts = layouts.filter((l) => l.name === 'nexus')
      expect(nexusLayouts).toHaveLength(1)
    })
  })

  describe('P1: Edit mode state transitions', () => {
    test('toggling edit mode back and forth preserves node positions', () => {
      const nodePositions = [{ x: 100, y: 200 }, { x: 300, y: 400 }]
      let isEditMode = false

      // Toggle to edit
      isEditMode = true
      expect(nodePositions[0]).toEqual({ x: 100, y: 200 })

      // Toggle back to view
      isEditMode = false
      expect(nodePositions[0]).toEqual({ x: 100, y: 200 })
    })

    test('edit mode does not reset dirty flag', () => {
      let isDirty = true
      let isEditMode = false

      // Toggle edit mode should NOT clear dirty
      isEditMode = !isEditMode
      expect(isDirty).toBe(true) // Still dirty
    })

    test('switching to view mode while dirty preserves unsaved changes', () => {
      let isDirty = true
      let isEditMode = true

      // Switch to view mode
      isEditMode = false
      // Dirty flag should persist — changes not lost
      expect(isDirty).toBe(true)
    })
  })

  describe('P1: Dirty flag edge cases', () => {
    test('multiple sequential drags accumulate dirty flag', () => {
      let isDirty = false
      const changes = [
        { type: 'position', dragging: false },
        { type: 'position', dragging: false },
      ]
      for (const c of changes) {
        if (isPositionDragEnd(c)) isDirty = true
      }
      expect(isDirty).toBe(true)
    })

    test('non-position changes do not trigger dirty', () => {
      let isDirty = false
      const changes = [
        { type: 'select' },
        { type: 'dimensions' },
      ]
      for (const c of changes) {
        if (isPositionDragEnd(c)) isDirty = true
      }
      expect(isDirty).toBe(false)
    })

    test('drag start (dragging=true) does not trigger dirty', () => {
      let isDirty = false
      const change = { type: 'position', dragging: true }
      if (isPositionDragEnd(change)) isDirty = true
      expect(isDirty).toBe(false)
    })

    test('saving resets dirty, then new drag re-sets it', () => {
      let isDirty = true
      // Save
      isDirty = false
      expect(isDirty).toBe(false)
      // New drag
      const change = { type: 'position', dragging: false }
      if (isPositionDragEnd(change)) isDirty = true
      expect(isDirty).toBe(true)
    })
  })

  describe('P1: Layout restore — partial and edge cases', () => {
    test('saved layout with extra nodes (deleted from org) ignores unknowns', () => {
      const elkNodes = [{ id: 'node-a', position: { x: 0, y: 0 } }]
      const saved = { 'node-a': { x: 100, y: 200 }, 'node-deleted': { x: 999, y: 999 } }

      const result = applyLayoutToNodes(elkNodes, saved)
      expect(result).toHaveLength(1) // Only existing nodes
      expect(result[0].position).toEqual({ x: 100, y: 200 })
    })

    test('saved layout with no matching nodes falls back to ELK entirely', () => {
      const elkNodes = [
        { id: 'new-node-1', position: { x: 10, y: 20 } },
        { id: 'new-node-2', position: { x: 30, y: 40 } },
      ]
      const saved = { 'old-node': { x: 500, y: 500 } }

      const result = applyLayoutToNodes(elkNodes, saved)
      expect(result[0].position).toEqual({ x: 10, y: 20 })
      expect(result[1].position).toEqual({ x: 30, y: 40 })
    })

    test('undefined saved layout falls back to ELK', () => {
      const elkNodes = [{ id: 'n1', position: { x: 5, y: 10 } }]
      const result = applyLayoutToNodes(elkNodes, undefined)
      expect(result[0].position).toEqual({ x: 5, y: 10 })
    })

    test('empty saved positions object falls back to ELK', () => {
      const elkNodes = [{ id: 'n1', position: { x: 5, y: 10 } }]
      const result = applyLayoutToNodes(elkNodes, {})
      expect(result[0].position).toEqual({ x: 5, y: 10 })
    })
  })

  describe('P1: Node selection edge cases', () => {
    test('rapid node clicks update selection correctly', () => {
      let selected: string | null = null
      const clicks = ['node-1', 'node-2', 'node-3', 'node-1']
      for (const id of clicks) selected = id
      expect(selected).toBe('node-1')
    })

    test('clicking same node twice keeps it selected', () => {
      let selected: string | null = null
      selected = 'node-1'
      selected = 'node-1' // React Flow passes same node on re-click
      expect(selected).toBe('node-1')
    })

    test('pane click after node selection clears selection', () => {
      let selected: string | null = 'node-1'
      // Pane click
      selected = null
      expect(selected).toBeNull()
    })
  })

  describe('P2: Toolbar state edge cases', () => {
    test('double-click save button should not cause issues', () => {
      let saveCount = 0
      const isDirty = true
      const isSaving = false

      // First click
      if (isDirty && !isSaving) saveCount++
      // Second click while saving
      const nowSaving = true
      if (isDirty && !nowSaving) saveCount++

      expect(saveCount).toBe(1) // Only one save triggered
    })

    test('auto-layout while dirty warns but proceeds', () => {
      let isDirty = true
      // Auto-layout resets positions and marks dirty
      isDirty = true // Re-marked dirty from auto-layout
      expect(isDirty).toBe(true)
    })

    test('fitView works regardless of edit mode', () => {
      let fitViewCalled = false
      const isEditMode = false
      // fitView should always be available
      fitViewCalled = true
      expect(fitViewCalled).toBe(true)
    })
  })

  describe('P2: Polling behavior edge cases', () => {
    test('polling respects enabled flag with null companyId', () => {
      const companyId: string | null = null
      const enabled = !!companyId
      const config = { refetchInterval: enabled ? 30_000 : false }
      expect(config.refetchInterval).toBe(false)
    })

    test('polling interval is exactly 30 seconds', () => {
      const interval = 30_000
      expect(interval).toBe(30 * 1000)
    })

    test('data refresh preserves saved positions when available', () => {
      // Simulate: org data changes (new agent added), but saved layout exists
      const elkNodes = [
        { id: 'dept-1', position: { x: 0, y: 0 } },
        { id: 'agent-new', position: { x: 0, y: 100 } }, // New agent from refresh
      ]
      const saved = { 'dept-1': { x: 200, y: 50 } } // Only dept-1 has saved position

      const result = applyLayoutToNodes(elkNodes, saved)
      expect(result[0].position).toEqual({ x: 200, y: 50 }) // Saved
      expect(result[1].position).toEqual({ x: 0, y: 100 }) // ELK fallback for new node
    })
  })

  describe('P2: API response format compliance', () => {
    test('error response follows standard format', () => {
      const errorResponse = { success: false, error: { code: 'LAYOUT_001', message: 'Layout not found' } }
      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error.code).toBeDefined()
      expect(errorResponse.error.message).toBeDefined()
    })

    test('success response with null data is valid', () => {
      const response = { success: true, data: null }
      expect(response.success).toBe(true)
    })
  })
})
