import { describe, expect, test } from 'bun:test'
import { DAGSolver } from '../../lib/workflow/dag-solver'
import { ExecutionContext } from '../../lib/workflow/execution-context'
import { WorkflowEngine } from '../../lib/workflow/engine'
import type { Workflow } from '../../../../shared/src/types'

describe('DAG Solver', () => {
  test('Negative: Circular dependency throws errror', () => {
    const steps = [
      { id: '1', type: 'tool', action: 'a', dependsOn: ['2'] },
      { id: '2', type: 'tool', action: 'b', dependsOn: ['1'] }
    ]
    expect(() => DAGSolver.resolveTiers(steps as any)).toThrow('Circular dependency')
  })

  test('Valid Graph: Resolves parallel tiers', () => {
    const steps = [
      { id: '1', type: 'tool', action: 'a' },
      { id: '2', type: 'tool', action: 'b' },
      { id: '3', type: 'tool', action: 'c', dependsOn: ['1', '2'] }
    ]
    const tiers = DAGSolver.resolveTiers(steps as any)
    expect(tiers.length).toBe(2)
    expect(tiers[0].map((s: any) => s.id)).toEqual(['1', '2'])
    expect(tiers[1].map((s: any) => s.id)).toEqual(['3'])
  })
})

describe('Execution Context (Strict Templating)', () => {
  test('Positive: Resolves deep properties', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('auth', { token: { value: 'xyz123' } })
    const resolved = ctx.resolveParams({
      headers: { Authorization: 'Bearer {{auth.token.value}}' }
    })
    expect(resolved.headers.Authorization).toBe('Bearer xyz123')
  })

  test('Negative: Throws on undefined deep property', () => {
    const ctx = new ExecutionContext()
    ctx.setStepOutput('auth', { token: { value: 'xyz123' } })
    expect(() => {
      ctx.resolveParams({
        headers: { Authorization: 'Bearer {{auth.wrongToken.value}}' }
      })
    }).toThrow('Strict Templating Error')
  })
})

describe('Workflow Engine Execution', () => {
  test('Positive: Executes parallel & sequential steps and passes context', async () => {
    const mockWorkflow: Workflow = {
      id: 'wf1',
      name: 'Test flow',
      companyId: 'comp1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: [
        { id: 'fetchData1', type: 'tool', action: 'fetch', params: { query: 'users' } },
        { id: 'fetchData2', type: 'tool', action: 'fetch', params: { query: 'posts' } },
        { 
          id: 'processData', 
          type: 'llm', 
          action: 'summarize', 
          dependsOn: ['fetchData1', 'fetchData2'], 
          params: { prompt: 'Summarize {{fetchData1.status}} and {{fetchData2.requestedParams.query}}' } 
        }
      ]
    }

    const engine = new WorkflowEngine(mockWorkflow)
    const result = await engine.run()
    
    expect(result.success).toBe(true)
    const statuses = result.results
    
    // Check parallel execution completions
    const step1 = statuses.find(s => s.id === 'fetchData1')
    const step2 = statuses.find(s => s.id === 'fetchData2')
    const step3 = statuses.find(s => s.id === 'processData')

    expect(step1?.state).toBe('success')
    expect(step2?.state).toBe('success')
    expect(step3?.state).toBe('success')

    // Check context injection by interrogating output from mockLLM
    // (In mock LLM, it returns { completion: 'LLM...' })
    // The params resolved aren't visible in the output directly without spying, 
    // but the engine didn't crash on Strict Templating, meaning context passed successfully.
  })
})
