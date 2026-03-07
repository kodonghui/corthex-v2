import { z, type ZodSchema } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type {
  ToolCategory,
  ToolContext,
  ToolResult,
  ToolExecutor,
  LLMToolDefinition,
} from '@corthex/shared'
import { recordToolInvocation } from './tool-invocation-log'

// === Types ===

export type ToolRegistration = {
  name: string
  description: string
  category: ToolCategory
  parameters: ZodSchema
  execute: (params: unknown, context: ToolContext) => Promise<ToolResult>
}

// === Constants ===

const MAX_RESULT_LENGTH = 4000
const TRUNCATION_SUFFIX_RESERVE = 100

// === ToolPool ===

export class ToolPool {
  private tools = new Map<string, ToolRegistration>()

  register(tool: ToolRegistration): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered`)
    }
    this.tools.set(tool.name, tool)
  }

  has(name: string): boolean {
    return this.tools.has(name)
  }

  get(name: string): ToolRegistration | undefined {
    return this.tools.get(name)
  }

  list(): ToolRegistration[] {
    return Array.from(this.tools.values())
  }

  listByCategory(category: ToolCategory): ToolRegistration[] {
    return this.list().filter((t) => t.category === category)
  }

  async execute(name: string, params: unknown, context: ToolContext): Promise<ToolResult> {
    const tool = this.tools.get(name)
    if (!tool) {
      return { success: false, error: `Tool "${name}" not found` }
    }

    // Zod parameter validation
    const parsed = tool.parameters.safeParse(params)
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')
      return { success: false, error: `Invalid parameters: ${issues}` }
    }

    // Execute tool with timing
    const startTime = Date.now()
    try {
      const result = await tool.execute(parsed.data, context)
      const durationMs = Date.now() - startTime

      if (result.success) {
        const truncated = truncateResult(result.result, MAX_RESULT_LENGTH)
        // Fire-and-forget logging (no await)
        recordToolInvocation({
          companyId: context.companyId,
          agentId: context.agentId,
          toolName: name,
          input: parsed.data,
          output: truncated,
          status: 'success',
          durationMs,
        })
        return { success: true, result: truncated }
      }

      // Error result from tool
      recordToolInvocation({
        companyId: context.companyId,
        agentId: context.agentId,
        toolName: name,
        input: parsed.data,
        output: result.error,
        status: 'error',
        durationMs,
      })
      return result
    } catch (err) {
      const durationMs = Date.now() - startTime
      const message = err instanceof Error ? err.message : String(err)
      // Fire-and-forget logging (no await)
      recordToolInvocation({
        companyId: context.companyId,
        agentId: context.agentId,
        toolName: name,
        input: parsed.data,
        output: message,
        status: 'error',
        durationMs,
      })
      return { success: false, error: message }
    }
  }

  getDefinitions(allowedTools: string[]): LLMToolDefinition[] {
    if (!allowedTools || allowedTools.length === 0) return []
    return allowedTools
      .filter((name) => this.tools.has(name))
      .map((name) => {
        const tool = this.tools.get(name)!
        const jsonSchema = zodToJsonSchema(tool.parameters, { target: 'openApi3' })
        return {
          name: tool.name,
          description: tool.description,
          parameters: jsonSchema as Record<string, unknown>,
        }
      })
  }

  createExecutor(agent: {
    allowedTools: string[]
    id: string
    companyId: string
    name: string
  }): ToolExecutor {
    const context: ToolContext = {
      companyId: agent.companyId,
      agentId: agent.id,
      agentName: agent.name,
    }

    return async (toolName: string, args: Record<string, unknown>) => {
      // Server-side permission enforcement
      if (!agent.allowedTools.includes(toolName)) {
        return { error: `Permission denied: agent "${agent.name}" is not allowed to use tool "${toolName}"` }
      }

      const result = await this.execute(toolName, args, context)
      if (result.success) {
        return { result: result.result }
      }
      return { error: result.error }
    }
  }
}

// === Helpers ===

export function truncateResult(result: string, maxLength: number = MAX_RESULT_LENGTH): string {
  if (result.length <= maxLength) return result
  const cutoff = maxLength - TRUNCATION_SUFFIX_RESERVE
  return result.slice(0, cutoff) + `\n\n...[truncated, original: ${result.length} chars]`
}

// === Singleton ===

export const toolPool = new ToolPool()
