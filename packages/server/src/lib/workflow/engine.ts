import type { Workflow, WorkflowStep } from '../../../shared/src/types'
import { DAGSolver } from './dag-solver'
import { ExecutionContext } from './execution-context'

export type StepState = 'pending' | 'running' | 'success' | 'failed' | 'skipped'

export interface StepSummary {
  id: string
  action: string
  state: StepState
  output?: Record<string, any>
  error?: string
  durationMs: number
}

export class WorkflowEngine {
  private workflow: Workflow
  private context: ExecutionContext
  private stepStatuses = new Map<string, StepSummary>()
  
  // Dummy EventBus hook for AC4 (will be injected/expanded later)
  private emitEvent(stepId: string, state: StepState, payload?: any) {
    // console.log(`[EventBus Publish] Workflow ${this.workflow.id} Step ${stepId}: ${state}`, payload)
  }

  constructor(workflow: Workflow, initialContext?: Record<string, any>) {
    this.workflow = workflow
    this.context = new ExecutionContext(initialContext)
    
    // Initialize all as pending
    this.workflow.steps.forEach(step => {
      this.stepStatuses.set(step.id, {
        id: step.id,
        action: step.action,
        state: 'pending',
        durationMs: 0
      })
    })
  }

  getStatuses() {
    return Array.from(this.stepStatuses.values())
  }

  async run(): Promise<{ success: boolean; results: StepSummary[] }> {
    try {
      // 1. Resolve parallel tiers securely
      const tiers = DAGSolver.resolveTiers(this.workflow.steps)

      for (const tier of tiers) {
        // Run all steps in the current tier in parallel
        await Promise.all(tier.map(step => this.executeStep(step)))
      }

      // Check overall success (if any failed, overall is false)
      const allSuccess = Array.from(this.stepStatuses.values()).every(
        s => s.state === 'success' || s.state === 'skipped'
      )
      
      return { success: allSuccess && this.workflow.steps.length > 0, results: this.getStatuses() }
    } catch (error: any) {
      // Catch e.g. DAG cycle errors
      return { success: false, results: this.getStatuses() }
    }
  }

  private async executeStep(step: WorkflowStep): Promise<void> {
    const summary = this.stepStatuses.get(step.id)!

    // Check if dependencies were successful
    if (step.dependsOn && step.dependsOn.length > 0) {
      const depsSuccessful = step.dependsOn.every(depId => {
        const depStatus = this.stepStatuses.get(depId)
        return depStatus && depStatus.state === 'success'
      })

      if (!depsSuccessful) {
        summary.state = 'skipped'
        summary.error = 'One or more dependencies failed or were skipped'
        this.emitEvent(step.id, 'skipped', { reason: summary.error })
        return
      }
    }

    // Mark as running
    summary.state = 'running'
    this.emitEvent(step.id, 'running')
    const startTime = Date.now()

    try {
      // Resolve inputs via Context Strict Templating
      const resolvedParams = this.context.resolveParams(step.params || {})
      let stepOutput: Record<string, any> = {}

      // Execute based on type
      if (step.type === 'tool') {
        stepOutput = await this.mockToolExecution(step.action, resolvedParams)
      } else if (step.type === 'llm') {
        stepOutput = await this.mockLLMExecution(step.action, resolvedParams)
      } else if (step.type === 'condition') {
        const conditionMet = this.context.evaluateCondition(resolvedParams as any)
        stepOutput = { conditionMet }
        if (!conditionMet) {
          throw new Error('Condition not met')
        }
      } else {
        throw new Error(`Unsupported step type: ${step.type}`)
      }

      // Success
      summary.state = 'success'
      summary.output = stepOutput
      summary.durationMs = Date.now() - startTime
      this.context.setStepOutput(step.id, stepOutput)
      this.emitEvent(step.id, 'success', { output: stepOutput, ms: summary.durationMs })

    } catch (error: any) {
      // Failure
      summary.state = 'failed'
      summary.error = error.message
      summary.durationMs = Date.now() - startTime
      this.emitEvent(step.id, 'failed', { error: error.message, ms: summary.durationMs })
    }
  }

  // --- Mock Executors for Dev Phase (Will be integrated with real endpoints) ---
  private async mockToolExecution(action: string, params: any) {
    // Simulate async tool execution
    await new Promise(res => setTimeout(res, 50))
    return { status: 'ok', tool: action, requestedParams: params }
  }

  private async mockLLMExecution(action: string, params: any) {
    // Simulate async LLM
    await new Promise(res => setTimeout(res, 100))
    return { completion: `LLM response for ${action}`, metadata: { tokens: 42 } }
  }
}
