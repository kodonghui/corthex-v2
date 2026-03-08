import { db } from '../../db'
import { workflows, workflowExecutions } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { toolPool } from '../tool-pool'

export interface WorkflowStep {
  id: string
  type: string
  action: string
  params?: Record<string, any>
  dependsOn?: string[]
}

export interface WorkflowContext {
  executionId: string
  workflowId: string
  companyId: string
  state: Record<string, any>
}

// 간단한 DAG (Directed Acyclic Graph) 실행 엔진
export class WorkflowEngine {
  
  static async startExecution(workflowId: string, companyId: string, triggeredBy: string) {
    const workflow = await db.query.workflows.findFirst({
      where: and(
        eq(workflows.id, workflowId),
        eq(workflows.companyId, companyId),
        eq(workflows.isActive, true)
      )
    })

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found or inactive`)
    }

    const [execution] = await db.insert(workflowExecutions)
      .values({
        workflowId,
        companyId,
        status: 'running',
        stepSummaries: [],
        totalDurationMs: 0,
        triggeredBy
      })
      .returning()

    this.runDag(workflow, execution.id, companyId).catch(async (err) => {
      console.error(`Workflow ${execution.id} failed:`, err)
      await this.markFailed(execution.id, companyId, err.message, 0)
    })

    return execution
  }

  private static async runDag(workflow: typeof workflows.$inferSelect, executionId: string, companyId: string) {
    const steps = workflow.steps as WorkflowStep[]
    if (!steps || steps.length === 0) {
      return this.markCompleted(executionId, companyId, [], 0)
    }

    const layers = this.topologicalSort(steps)

    let currentState: Record<string, any> = {}
    let currentSummaries: any[] = []
    const startTime = Date.now()

    try {
      for (const layer of layers) {
        
        const stepPromises = layer.map(async (step) => {
          const result = await this.executeStep(step, currentState, companyId)
          return { stepId: step.id, action: step.action, status: 'success', result }
        })

        const layerResults = await Promise.all(stepPromises)

        for (const res of layerResults) {
          currentState[res.stepId] = res.result
          currentSummaries.push(res)
        }

        await db.update(workflowExecutions)
          .set({ stepSummaries: currentSummaries })
          .where(eq(workflowExecutions.id, executionId))
      }

      await this.markCompleted(executionId, companyId, currentSummaries, Date.now() - startTime)

    } catch (error: any) {
      currentSummaries.push({ error: error.message, status: 'failed' })
      await this.markFailed(executionId, companyId, currentSummaries, Date.now() - startTime)
      throw error
    }
  }

  private static async executeStep(step: WorkflowStep, currentState: Record<string, any>, companyId: string) {
    const injectedParams = this.injectContext(step.params || {}, currentState)

    if (step.type === 'tool') {
      return await toolPool.execute(step.action, injectedParams, {
        companyId,
        agentId: 'system-workflow',
        agentName: 'Workflow Engine'
      })
    } else if (step.type === 'llm') {
      return { msg: 'LLM step placeholder', input: injectedParams }
    } else {
      return { msg: 'Unknown step type' }
    }
  }

  private static injectContext(params: Record<string, any>, state: Record<string, any>): Record<string, any> {
    const injected: Record<string, any> = {}
    
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === 'string') {
        const match = val.match(/^\{\{(.+)\}\}$/)
        if (match) {
          const path = match[1].split('.')
          let current: any = state
          for (const p of path) {
            current = current ? current[p] : undefined
          }
          injected[key] = current
        } else {
          injected[key] = val
        }
      } else if (typeof val === 'object' && val !== null) {
        injected[key] = this.injectContext(val, state)
      } else {
        injected[key] = val
      }
    }

    return injected
  }

  static topologicalSort(steps: WorkflowStep[]): WorkflowStep[][] {
    const inDegree: Record<string, number> = {}
    const graph: Record<string, string[]> = {}
    const stepMap = new Map<string, WorkflowStep>()

    steps.forEach(s => {
      stepMap.set(s.id, s)
      inDegree[s.id] = 0
      graph[s.id] = []
    })

    steps.forEach(s => {
      if (s.dependsOn) {
        s.dependsOn.forEach((dep: string) => {
          if (!graph[dep]) graph[dep] = []
          graph[dep].push(s.id)
          inDegree[s.id] = (inDegree[s.id] || 0) + 1
        })
      }
    })

    const layers: WorkflowStep[][] = []
    let queue: string[] = Object.keys(inDegree).filter(id => inDegree[id] === 0)

    while (queue.length > 0) {
      const currentLayerSteps = queue.map(id => stepMap.get(id)!)
      layers.push(currentLayerSteps)
      
      const nextQueue: string[] = []
      
      for (const currentId of queue) {
        if (graph[currentId]) {
          for (const neighbor of graph[currentId]) {
            inDegree[neighbor]--
            if (inDegree[neighbor] === 0) {
              nextQueue.push(neighbor)
            }
          }
        }
      }
      queue = nextQueue
    }

    const visitedCount = layers.reduce((acc, layer) => acc + layer.length, 0)
    if (visitedCount !== steps.length) {
      throw new Error('Cyclic dependency detected in workflow steps')
    }

    return layers
  }

  private static async markCompleted(executionId: string, companyId: string, summaries: any[], durationMs: number) {
    await db.update(workflowExecutions)
      .set({
        status: 'success',
        stepSummaries: summaries,
        totalDurationMs: durationMs
      })
      .where(and(eq(workflowExecutions.id, executionId), eq(workflowExecutions.companyId, companyId)))
  }

  private static async markFailed(executionId: string, companyId: string, summariesOrError: any, durationMs: number) {
    const errorDetails = typeof summariesOrError === 'string' 
      ? [{ error: summariesOrError, status: 'failed' }] 
      : summariesOrError

    await db.update(workflowExecutions)
      .set({
        status: 'failed',
        stepSummaries: errorDetails,
        totalDurationMs: durationMs
      })
      .where(and(eq(workflowExecutions.id, executionId), eq(workflowExecutions.companyId, companyId)))
  }
}
