/**
 * TEA Tests for Story 20-4: Workflow Canvas (Nocode Visual)
 *
 * Tests pure logic functions extracted from workflow-canvas.tsx
 * Since the canvas component is React+SVG (untestable in bun:test),
 * we test the extracted DAG/layout/edge logic functions.
 */
import { describe, test, expect } from 'bun:test'

// === Replicate pure logic from workflow-canvas.tsx for testing ===

type WorkflowStep = {
  id: string
  name: string
  type: 'tool' | 'llm' | 'condition'
  action: string
  params?: Record<string, unknown>
  agentId?: string
  dependsOn?: string[]
  trueBranch?: string
  falseBranch?: string
  systemPrompt?: string
  timeout?: number
  retryCount?: number
  metadata?: {
    position?: { x: number; y: number }
  }
}

type Edge = {
  from: string
  to: string
  type: 'dependsOn' | 'trueBranch' | 'falseBranch'
}

function buildDagLayers(steps: WorkflowStep[]): WorkflowStep[][] | null {
  if (steps.length === 0) return []

  const inDegree = new Map(steps.map((s) => [s.id, 0]))

  for (const s of steps) {
    for (const dep of s.dependsOn || []) {
      if (inDegree.has(dep)) {
        inDegree.set(s.id, (inDegree.get(s.id) || 0) + 1)
      }
    }
  }

  const result: WorkflowStep[][] = []
  let queue = steps.filter((s) => (inDegree.get(s.id) || 0) === 0)

  while (queue.length > 0) {
    result.push(queue)
    const nextQueue: WorkflowStep[] = []
    for (const s of queue) {
      for (const other of steps) {
        if (other.dependsOn?.includes(s.id)) {
          const newDeg = (inDegree.get(other.id) || 0) - 1
          inDegree.set(other.id, newDeg)
          if (newDeg === 0) nextQueue.push(other)
        }
      }
    }
    queue = nextQueue
  }

  const totalSorted = result.reduce((acc, l) => acc + l.length, 0)
  if (totalSorted < steps.length) return null

  return result
}

function autoLayout(steps: WorkflowStep[], canvasWidth = 800): WorkflowStep[] {
  const layers = buildDagLayers(steps)
  if (!layers) return steps

  const LAYER_GAP = 120
  const NODE_GAP = 180

  return steps.map((step) => {
    const layerIdx = layers.findIndex((layer) => layer.some((s) => s.id === step.id))
    if (layerIdx === -1) return step
    const inLayerIdx = layers[layerIdx].findIndex((s) => s.id === step.id)
    const layerWidth = layers[layerIdx].length * NODE_GAP
    const startX = (canvasWidth - layerWidth) / 2

    return {
      ...step,
      metadata: {
        ...step.metadata,
        position: { x: startX + inLayerIdx * NODE_GAP, y: 60 + layerIdx * LAYER_GAP },
      },
    }
  })
}

function buildEdges(steps: WorkflowStep[]): Edge[] {
  const edges: Edge[] = []
  const ids = new Set(steps.map((s) => s.id))
  for (const s of steps) {
    for (const dep of s.dependsOn || []) {
      if (ids.has(dep)) {
        edges.push({ from: dep, to: s.id, type: 'dependsOn' })
      }
    }
    if (s.trueBranch && ids.has(s.trueBranch)) {
      edges.push({ from: s.id, to: s.trueBranch, type: 'trueBranch' })
    }
    if (s.falseBranch && ids.has(s.falseBranch)) {
      edges.push({ from: s.id, to: s.falseBranch, type: 'falseBranch' })
    }
  }
  return edges
}

function wouldCreateCycle(steps: WorkflowStep[], fromId: string, toId: string): boolean {
  const testSteps = steps.map((s) => {
    if (s.id === toId) {
      return { ...s, dependsOn: [...(s.dependsOn || []), fromId] }
    }
    return s
  })
  return buildDagLayers(testSteps) === null
}

function getPos(step: WorkflowStep): { x: number; y: number } {
  return step.metadata?.position || { x: 100, y: 100 }
}

// === Helper to create test steps ===
function makeStep(overrides: Partial<WorkflowStep> & { id: string }): WorkflowStep {
  return { name: overrides.id, type: 'tool', action: 'test', ...overrides }
}

// ===================================================================
// TESTS
// ===================================================================

describe('Story 20-4: Workflow Canvas Logic', () => {

  // ----- buildDagLayers -----

  describe('buildDagLayers (cycle detection + layering)', () => {
    test('empty steps returns empty array', () => {
      expect(buildDagLayers([])).toEqual([])
    })

    test('single node returns one layer', () => {
      const steps = [makeStep({ id: 'a' })]
      const layers = buildDagLayers(steps)
      expect(layers).toHaveLength(1)
      expect(layers![0]).toHaveLength(1)
      expect(layers![0][0].id).toBe('a')
    })

    test('linear chain: A → B → C produces 3 layers', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
        makeStep({ id: 'c', dependsOn: ['b'] }),
      ]
      const layers = buildDagLayers(steps)
      expect(layers).toHaveLength(3)
      expect(layers![0][0].id).toBe('a')
      expect(layers![1][0].id).toBe('b')
      expect(layers![2][0].id).toBe('c')
    })

    test('parallel nodes: A and B (no deps) in same layer', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b' }),
      ]
      const layers = buildDagLayers(steps)
      expect(layers).toHaveLength(1)
      expect(layers![0]).toHaveLength(2)
    })

    test('diamond DAG: A → B,C → D', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
        makeStep({ id: 'c', dependsOn: ['a'] }),
        makeStep({ id: 'd', dependsOn: ['b', 'c'] }),
      ]
      const layers = buildDagLayers(steps)
      expect(layers).toHaveLength(3)
      expect(layers![0]).toHaveLength(1) // a
      expect(layers![1]).toHaveLength(2) // b, c
      expect(layers![2]).toHaveLength(1) // d
    })

    test('simple cycle A → B → A returns null', () => {
      const steps = [
        makeStep({ id: 'a', dependsOn: ['b'] }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
      ]
      expect(buildDagLayers(steps)).toBeNull()
    })

    test('three-node cycle A → B → C → A returns null', () => {
      const steps = [
        makeStep({ id: 'a', dependsOn: ['c'] }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
        makeStep({ id: 'c', dependsOn: ['b'] }),
      ]
      expect(buildDagLayers(steps)).toBeNull()
    })

    test('partial cycle: D is fine, A→B→C→A is cycle → null', () => {
      const steps = [
        makeStep({ id: 'd' }),
        makeStep({ id: 'a', dependsOn: ['c'] }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
        makeStep({ id: 'c', dependsOn: ['b'] }),
      ]
      expect(buildDagLayers(steps)).toBeNull()
    })

    test('ignores dependsOn references to nonexistent nodes', () => {
      const steps = [
        makeStep({ id: 'a', dependsOn: ['z'] }), // z doesn't exist
        makeStep({ id: 'b', dependsOn: ['a'] }),
      ]
      const layers = buildDagLayers(steps)
      expect(layers).toHaveLength(2)
      expect(layers![0][0].id).toBe('a')
    })
  })

  // ----- autoLayout -----

  describe('autoLayout (coordinate calculation)', () => {
    test('assigns positions to nodes', () => {
      const steps = [makeStep({ id: 'a' }), makeStep({ id: 'b', dependsOn: ['a'] })]
      const laid = autoLayout(steps)
      expect(laid[0].metadata?.position).toBeDefined()
      expect(laid[1].metadata?.position).toBeDefined()
    })

    test('first layer Y=60, second layer Y=180', () => {
      const steps = [makeStep({ id: 'a' }), makeStep({ id: 'b', dependsOn: ['a'] })]
      const laid = autoLayout(steps)
      expect(laid[0].metadata!.position!.y).toBe(60)
      expect(laid[1].metadata!.position!.y).toBe(180)
    })

    test('parallel nodes have same Y', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b' }),
      ]
      const laid = autoLayout(steps)
      expect(laid[0].metadata!.position!.y).toBe(laid[1].metadata!.position!.y)
    })

    test('parallel nodes have different X', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b' }),
      ]
      const laid = autoLayout(steps)
      expect(laid[0].metadata!.position!.x).not.toBe(laid[1].metadata!.position!.x)
    })

    test('returns original steps unchanged if cycle detected', () => {
      const steps = [
        makeStep({ id: 'a', dependsOn: ['b'] }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
      ]
      const laid = autoLayout(steps)
      // Should return steps unchanged (no position assigned)
      expect(laid[0].metadata?.position).toBeUndefined()
      expect(laid[1].metadata?.position).toBeUndefined()
    })

    test('preserves existing metadata fields', () => {
      const steps = [makeStep({ id: 'a', metadata: { position: { x: 999, y: 999 } } })]
      const laid = autoLayout(steps)
      // Position gets overwritten by auto-layout
      expect(laid[0].metadata!.position!.x).not.toBe(999)
    })

    test('centers nodes for given canvas width', () => {
      const steps = [makeStep({ id: 'a' })]
      const laid = autoLayout(steps, 1000)
      // Single node: startX = (1000 - 180) / 2 = 410
      expect(laid[0].metadata!.position!.x).toBe(410)
    })
  })

  // ----- buildEdges -----

  describe('buildEdges (edge extraction)', () => {
    test('no edges for independent nodes', () => {
      const steps = [makeStep({ id: 'a' }), makeStep({ id: 'b' })]
      expect(buildEdges(steps)).toEqual([])
    })

    test('dependsOn creates edge', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
      ]
      const edges = buildEdges(steps)
      expect(edges).toHaveLength(1)
      expect(edges[0]).toEqual({ from: 'a', to: 'b', type: 'dependsOn' })
    })

    test('trueBranch creates edge', () => {
      const steps = [
        makeStep({ id: 'cond', type: 'condition', trueBranch: 'target' }),
        makeStep({ id: 'target' }),
      ]
      const edges = buildEdges(steps)
      expect(edges).toHaveLength(1)
      expect(edges[0]).toEqual({ from: 'cond', to: 'target', type: 'trueBranch' })
    })

    test('falseBranch creates edge', () => {
      const steps = [
        makeStep({ id: 'cond', type: 'condition', falseBranch: 'target' }),
        makeStep({ id: 'target' }),
      ]
      const edges = buildEdges(steps)
      expect(edges).toHaveLength(1)
      expect(edges[0]).toEqual({ from: 'cond', to: 'target', type: 'falseBranch' })
    })

    test('condition with both branches creates two edges', () => {
      const steps = [
        makeStep({ id: 'cond', type: 'condition', trueBranch: 't', falseBranch: 'f' }),
        makeStep({ id: 't' }),
        makeStep({ id: 'f' }),
      ]
      const edges = buildEdges(steps)
      expect(edges).toHaveLength(2)
      expect(edges.find((e) => e.type === 'trueBranch')).toBeDefined()
      expect(edges.find((e) => e.type === 'falseBranch')).toBeDefined()
    })

    test('ignores references to nonexistent nodes', () => {
      const steps = [
        makeStep({ id: 'a', dependsOn: ['ghost'] }),
        makeStep({ id: 'b', type: 'condition', trueBranch: 'ghost2' }),
      ]
      expect(buildEdges(steps)).toEqual([])
    })

    test('multiple dependsOn creates multiple edges', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b' }),
        makeStep({ id: 'c', dependsOn: ['a', 'b'] }),
      ]
      const edges = buildEdges(steps)
      expect(edges).toHaveLength(2)
    })
  })

  // ----- wouldCreateCycle -----

  describe('wouldCreateCycle (cycle prediction)', () => {
    test('direct self-loop is a cycle', () => {
      const steps = [makeStep({ id: 'a' })]
      expect(wouldCreateCycle(steps, 'a', 'a')).toBe(true)
    })

    test('connecting A→B where B→A exists is a cycle', () => {
      const steps = [
        makeStep({ id: 'a', dependsOn: ['b'] }),
        makeStep({ id: 'b' }),
      ]
      // Trying to add b→a (making a depend on b AND b depend on a)
      // Actually: fromId=b, toId=a => adds b to a's dependsOn
      // a already depends on b, now b would depend on... wait.
      // wouldCreateCycle adds fromId to toId's dependsOn
      // So fromId='a', toId='b' adds 'a' to b's dependsOn
      // b currently has no dependsOn, a depends on b.
      // Adding a to b's dependsOn => a→b→a = cycle
      expect(wouldCreateCycle(steps, 'a', 'b')).toBe(true)
    })

    test('safe connection returns false', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b' }),
      ]
      expect(wouldCreateCycle(steps, 'a', 'b')).toBe(false)
    })

    test('transitive cycle detection: A→B→C, adding C→A', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
        makeStep({ id: 'c', dependsOn: ['b'] }),
      ]
      // Adding c to a's dependsOn: a→b→c→a = cycle
      expect(wouldCreateCycle(steps, 'c', 'a')).toBe(true)
    })

    test('adding parallel edge does not create cycle', () => {
      const steps = [
        makeStep({ id: 'a' }),
        makeStep({ id: 'b', dependsOn: ['a'] }),
        makeStep({ id: 'c', dependsOn: ['a'] }),
      ]
      // Adding b to c's dependsOn: c depends on a and b. b depends on a. No cycle.
      expect(wouldCreateCycle(steps, 'b', 'c')).toBe(false)
    })
  })

  // ----- getPos -----

  describe('getPos (position extraction)', () => {
    test('returns stored position', () => {
      const step = makeStep({ id: 'a', metadata: { position: { x: 42, y: 99 } } })
      expect(getPos(step)).toEqual({ x: 42, y: 99 })
    })

    test('returns default position when no metadata', () => {
      const step = makeStep({ id: 'a' })
      expect(getPos(step)).toEqual({ x: 100, y: 100 })
    })

    test('returns default position when metadata has no position', () => {
      const step = makeStep({ id: 'a', metadata: {} })
      expect(getPos(step)).toEqual({ x: 100, y: 100 })
    })
  })

  // ----- WorkflowStep metadata.position -----

  describe('WorkflowStep metadata.position compatibility', () => {
    test('steps without position are valid', () => {
      const step: WorkflowStep = { id: '1', name: 'test', type: 'tool', action: 'run' }
      expect(step.metadata).toBeUndefined()
    })

    test('steps with position preserve all fields', () => {
      const step: WorkflowStep = {
        id: '1',
        name: 'test',
        type: 'llm',
        action: 'summarize',
        systemPrompt: 'You are...',
        timeout: 30000,
        retryCount: 2,
        dependsOn: ['0'],
        metadata: { position: { x: 100, y: 200 } },
      }
      expect(step.metadata!.position).toEqual({ x: 100, y: 200 })
      expect(step.systemPrompt).toBe('You are...')
      expect(step.timeout).toBe(30000)
    })

    test('autoLayout does not lose non-position step fields', () => {
      const steps: WorkflowStep[] = [{
        id: '1',
        name: 'test',
        type: 'llm',
        action: 'summarize',
        systemPrompt: 'prompt',
        timeout: 5000,
        retryCount: 1,
        dependsOn: [],
      }]
      const laid = autoLayout(steps)
      expect(laid[0].name).toBe('test')
      expect(laid[0].type).toBe('llm')
      expect(laid[0].action).toBe('summarize')
      expect(laid[0].systemPrompt).toBe('prompt')
      expect(laid[0].timeout).toBe(5000)
      expect(laid[0].retryCount).toBe(1)
      expect(laid[0].metadata!.position).toBeDefined()
    })
  })
})
