import type { WorkflowStep } from '../../services/workflow/engine'

/**
 * DAG 기반 워크플로우 스텝 실행 순서 해석기
 * Kahn's 알고리즘으로 위상 정렬하여 병렬 실행 레이어(tier) 반환
 */
export class DAGSolver {
  /**
   * 스텝 배열을 의존성 기반으로 병렬 실행 레이어로 분류
   * @returns WorkflowStep[][] -- 각 레이어는 동시에 실행 가능한 스텝들
   * @throws Error('Circular dependency detected') 순환 참조 시
   */
  static resolveTiers(steps: WorkflowStep[]): WorkflowStep[][] {
    const stepMap = new Map<string, WorkflowStep>()
    const inDegree: Record<string, number> = {}
    const graph: Record<string, string[]> = {}

    for (const s of steps) {
      stepMap.set(s.id, s)
      inDegree[s.id] = 0
      graph[s.id] = []
    }

    for (const s of steps) {
      if (s.dependsOn) {
        for (const dep of s.dependsOn) {
          if (graph[dep]) {
            graph[dep].push(s.id)
            inDegree[s.id]++
          }
        }
      }
    }

    const tiers: WorkflowStep[][] = []
    let queue = Object.keys(inDegree).filter(id => inDegree[id] === 0)

    while (queue.length > 0) {
      tiers.push(queue.map(id => stepMap.get(id)!))
      const nextQueue: string[] = []
      for (const id of queue) {
        for (const neighbor of graph[id]) {
          inDegree[neighbor]--
          if (inDegree[neighbor] === 0) {
            nextQueue.push(neighbor)
          }
        }
      }
      queue = nextQueue
    }

    const visitedCount = tiers.reduce((acc, t) => acc + t.length, 0)
    if (visitedCount !== steps.length) {
      throw new Error('Circular dependency detected')
    }

    return tiers
  }
}
