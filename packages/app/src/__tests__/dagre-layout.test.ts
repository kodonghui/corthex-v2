/**
 * dagre-layout.ts 유닛 테스트 — 자동 정렬 계산
 * 서버 없이 실행 가능: bun test src/__tests__/dagre-layout.test.ts
 */
import { describe, test, expect } from 'bun:test'
import { getAutoLayout } from '../lib/dagre-layout'
import type { Node, Edge } from '@xyflow/react'

function makeNode(id: string, type: string = 'default'): Node {
  return { id, type, position: { x: 0, y: 0 }, data: {} }
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target }
}

describe('getAutoLayout', () => {
  test('3노드 + 2엣지 → 모든 노드에 위치값 존재', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')]
    const edges = [makeEdge('a', 'b'), makeEdge('a', 'c')]

    const result = getAutoLayout(nodes, edges)

    expect(result).toHaveLength(3)
    for (const node of result) {
      expect(typeof node.position.x).toBe('number')
      expect(typeof node.position.y).toBe('number')
      expect(Number.isNaN(node.position.x)).toBe(false)
      expect(Number.isNaN(node.position.y)).toBe(false)
    }
  })

  test('빈 입력 → 빈 배열', () => {
    const result = getAutoLayout([], [])
    expect(result).toEqual([])
  })

  test('부모-자식 노드의 y 좌표가 다름 (수직 분리)', () => {
    const nodes = [makeNode('parent'), makeNode('child')]
    const edges = [makeEdge('parent', 'child')]

    const result = getAutoLayout(nodes, edges)
    const parentY = result.find((n) => n.id === 'parent')!.position.y
    const childY = result.find((n) => n.id === 'child')!.position.y

    expect(childY).toBeGreaterThan(parentY)
  })

  test('company 타입 노드도 정상 처리', () => {
    const nodes = [makeNode('company', 'company'), makeNode('dept', 'department')]
    const edges = [makeEdge('company', 'dept')]

    const result = getAutoLayout(nodes, edges)
    expect(result).toHaveLength(2)
    expect(typeof result[0].position.x).toBe('number')
  })
})
