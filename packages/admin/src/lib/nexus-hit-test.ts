import type { Node } from '@xyflow/react'

// Node dimensions matching elk-layout.ts NODE_SIZES
const HIT_SIZES: Record<string, { width: number; height: number }> = {
  department: { width: 240, height: 60 },
  'unassigned-group': { width: 240, height: 60 },
}

export type DropTarget = {
  targetNodeId: string
  departmentId: string | null // null for unassigned-group
  deptName: string
}

/**
 * Find which department/unassigned-group node the dragged agent center overlaps.
 * Returns null if no valid drop target or if agent is already in that department.
 */
export function findDropTarget(
  dragNodeId: string,
  dragPos: { x: number; y: number },
  allNodes: Node[],
  currentDeptId: string | null,
): DropTarget | null {
  // Agent node center
  const cx = dragPos.x + 100 // agent width 200 / 2
  const cy = dragPos.y + 40  // agent height 80 / 2

  for (const node of allNodes) {
    if (node.id === dragNodeId) continue
    const size = HIT_SIZES[node.type ?? '']
    if (!size) continue

    const nx = node.position.x
    const ny = node.position.y

    if (cx >= nx && cx <= nx + size.width && cy >= ny && cy <= ny + size.height) {
      if (node.type === 'unassigned-group') {
        // Already unassigned → no-op
        if (currentDeptId === null) return null
        return {
          targetNodeId: node.id,
          departmentId: null,
          deptName: '미배속',
        }
      }

      // Department node: extract dept ID from node.id = "dept-{uuid}"
      const deptId = node.id.replace('dept-', '')
      if (deptId === currentDeptId) return null // same dept

      return {
        targetNodeId: node.id,
        departmentId: deptId,
        deptName: (node.data as { name?: string })?.name ?? '부서',
      }
    }
  }

  return null
}
