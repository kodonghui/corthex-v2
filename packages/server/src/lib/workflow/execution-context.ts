export class TemplateResolutionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TemplateResolutionError'
  }
}

export class ExpressionEvaluationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExpressionEvaluationError'
  }
}

export type StepOutput = Record<string, any>

export class ExecutionContext {
  private outputs = new Map<string, StepOutput>()
  private globalContext: Record<string, any> = {}

  constructor(initialContext?: Record<string, any>) {
    if (initialContext) {
      this.globalContext = { ...initialContext }
    }
  }

  setStepOutput(stepId: string, output: StepOutput) {
    this.outputs.set(stepId, output)
  }

  getStepOutput(stepId: string): StepOutput | undefined {
    return this.outputs.get(stepId)
  }

  getAllOutputs(): Record<string, StepOutput> {
    return Object.fromEntries(this.outputs)
  }

  /**
   * Safely traverses a dot-notation path like `step1.output.result.value`
   * Throws TemplateResolutionError if path not found (Strict Templating).
   */
  getValue(path: string): any {
    const parts = path.split('.')
    // Start with all outputs. e.g. path 'step1.output.value' will look for 'step1' in the root outputs object.
    let current: any = { ...this.getAllOutputs(), global: this.globalContext }

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        throw new TemplateResolutionError(`Cannot resolve path '${path}': property '${part}' does not exist on undefined/null/primitive.`)
      }
      if (!(part in current)) {
        throw new TemplateResolutionError(`Strict Templating Error: Path '${path}' failed at '${part}'. Property does not exist.`)
      }
      current = current[part]
    }
    return current
  }

  /**
   * Replaces `{{path.ext}}` in strings or objects with their actual runtime values.
   */
  resolveParams(params: Record<string, any>): Record<string, any> {
    if (!params) return {}

    const resolveItem = (item: any): any => {
      if (typeof item === 'string') {
        // Match exact {{var}} substitution (if the whole string is the template)
        const exactMatch = item.match(/^\{\{([\w.]+)\}\}$/)
        if (exactMatch) {
          return this.getValue(exactMatch[1])
        }

        // Match embedded templates "Hello {{user.name}}"
        return item.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
          const val = this.getValue(path)
          return typeof val === 'object' ? JSON.stringify(val) : String(val)
        })
      } else if (Array.isArray(item)) {
        return item.map(resolveItem)
      } else if (item !== null && typeof item === 'object') {
        const resolvedObj: Record<string, any> = {}
        for (const [k, v] of Object.entries(item)) {
          resolvedObj[k] = resolveItem(v)
        }
        return resolvedObj
      }
      return item
    }

    return resolveItem(params)
  }

  /**
   * Safe predefined condition evaluator. No eval().
   * Expects structured conditions like: { operator: 'eq', left: '{{step1.status}}', right: 'success' }
   */
  evaluateCondition(conditionDef: { operator: string; left: any; right: any }): boolean {
    if (!conditionDef || typeof conditionDef !== 'object') {
       throw new ExpressionEvaluationError('Invalid condition definition')
    }

    const { operator, left, right } = conditionDef
    
    // Resolve left and right values if they contain templates
    const resolvedLeft = typeof left === 'string' && left.includes('{{') ? this.resolveParams({ val: left }).val : left
    const resolvedRight = typeof right === 'string' && right.includes('{{') ? this.resolveParams({ val: right }).val : right

    switch (operator) {
      case 'eq': return resolvedLeft === resolvedRight
      case 'neq': return resolvedLeft !== resolvedRight
      case 'gt': return resolvedLeft > resolvedRight
      case 'gte': return resolvedLeft >= resolvedRight
      case 'lt': return resolvedLeft < resolvedRight
      case 'lte': return resolvedLeft <= resolvedRight
      case 'in': return Array.isArray(resolvedRight) && resolvedRight.includes(resolvedLeft)
      case 'contains': return typeof resolvedLeft === 'string' && typeof resolvedRight === 'string' && resolvedLeft.includes(resolvedRight)
      case 'truthy': return !!resolvedLeft
      case 'falsy': return !resolvedLeft
      default:
        throw new ExpressionEvaluationError(`Unknown operator: ${operator}`)
    }
  }
}
