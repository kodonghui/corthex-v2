import type { WorkflowStep } from '../../../shared/src/types'

export class WorkflowDAGError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorkflowDAGError'
  }
}

export class DAGSolver {
  /**
   * Resolves steps into sequential execution tiers (groups of parallelizable steps).
   * Detects cyclic dependencies securely.
   */
  static resolveTiers(steps: WorkflowStep[]): WorkflowStep[][] {
    if (!steps || steps.length === 0) return []

    const stepMap = new Map<string, WorkflowStep>()
    const inDegree = new Map<string, number>()
    const adjList = new Map<string, string[]>()

    // Initialize structures
    steps.forEach((step) => {
      stepMap.set(step.id, step)
      inDegree.set(step.id, 0)
      adjList.set(step.id, [])
    })

    // Build the graph
    steps.forEach((step) => {
      if (step.dependsOn && step.dependsOn.length > 0) {
        step.dependsOn.forEach((depId) => {
          if (!stepMap.has(depId)) {
            throw new WorkflowDAGError(`Step ${step.id} depends on non-existent step: ${depId}`)
          }
          // edge: depId -> step.id
          adjList.get(depId)!.push(step.id)
          inDegree.set(step.id, inDegree.get(step.id)! + 1)
        })
      }
    })

    const tiers: WorkflowStep[][] = []
    let currentTier: string[] = []

    // Queue for nodes with 0 in-degree
    for (const [id, count] of inDegree.entries()) {
      if (count === 0) currentTier.push(id)
    }

    let processedCount = 0

    while (currentTier.length > 0) {
      const nextTier: string[] = []
      const tierSteps: WorkflowStep[] = currentTier.map(id => stepMap.get(id)!)
      tiers.push(tierSteps)
      processedCount += currentTier.length

      // Reduce in-degree for neighbors
      for (const id of currentTier) {
        const neighbors = adjList.get(id)!
        for (const neighborId of neighbors) {
          const newDegree = inDegree.get(neighborId)! - 1
          inDegree.set(neighborId, newDegree)
          if (newDegree === 0) {
            nextTier.push(neighborId)
          }
        }
      }

      currentTier = nextTier
    }

    // Cycle detection check
    if (processedCount !== steps.length) {
      throw new WorkflowDAGError('Circular dependency detected in workflow steps. Execution aborted.')
    }

    return tiers
  }
}
