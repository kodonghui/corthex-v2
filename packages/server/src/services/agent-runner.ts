import { llmRouter, resolveModel, resolveProvider } from './llm-router'
import { calculateCostMicro } from '../lib/cost-tracker'
import { checkToolPermission, hasWildcard } from './tool-permission-guard'
import { filterOutput } from './output-filter'
import { createAuditLog, AUDIT_ACTIONS } from './audit-log'
import { collectKnowledgeContext, collectAgentMemoryContext } from './knowledge-injector'
import { extractAndSaveMemories } from './memory-extractor'
import type { LLMRouterContext } from './llm-router'
import type {
  LLMRequest,
  LLMResponse,
  LLMStreamChunk,
  LLMMessage,
  LLMToolDefinition,
  LLMToolCall,
  AgentTier,
  LLMProviderName,
  TaskRequest,
  TaskResponse,
  ToolCallRecord,
  ToolExecutor,
} from '@corthex/shared'

// === Types ===

export type AgentConfig = {
  id: string
  companyId: string
  name: string
  nameEn?: string | null
  tier: AgentTier
  modelName: string
  soul: string | null
  allowedTools: string[]
  isActive: boolean
  departmentId?: string | null
  autoLearn?: boolean
}

export type ToolDefinitionProvider = (allowedTools: string[]) => LLMToolDefinition[]
export type ToolNameProvider = () => string[]

// === Constants ===

const DEFAULT_MAX_TOOL_ITERATIONS = 5
const DEFAULT_SOUL = 'You are a helpful AI assistant. Follow instructions carefully and provide accurate responses.'

const CREDENTIAL_PATTERNS = [
  /sk-[a-zA-Z0-9_-]{20,}/,
  /AIza[a-zA-Z0-9_-]{30,}/,
  /Bearer\s+[a-zA-Z0-9_.-]{20,}/,
  /API_KEY\s*=\s*[^\s]{10,}/i,
  /SECRET\s*=\s*[^\s]{10,}/i,
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
]

// === System Prompt Builder ===

export function buildSystemPrompt(
  agent: AgentConfig,
  toolDefs?: LLMToolDefinition[],
): string {
  const parts: string[] = []

  // Soul section
  const soul = agent.soul?.trim() || DEFAULT_SOUL
  parts.push(soul)

  // Tool awareness section (tool definitions are passed separately via LLMRequest.tools,
  // but we include a summary in the system prompt for agent awareness)
  if (toolDefs && toolDefs.length > 0) {
    parts.push('\n## Available Tools\n')
    parts.push(`You have access to ${toolDefs.length} tools. Use them when appropriate to complete tasks.`)
    for (const tool of toolDefs) {
      parts.push(`- **${tool.name}**: ${tool.description}`)
    }
  }

  const assembled = parts.join('\n')

  // Credential scrubbing -- throw if any credential pattern found
  scanForCredentials(assembled)

  return assembled
}

export function scanForCredentials(text: string): void {
  for (const pattern of CREDENTIAL_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error(
        `Credential pattern detected in system prompt (NFR11 violation). Pattern: ${pattern.source.slice(0, 30)}...`,
      )
    }
  }
}

// === Tool Definitions ===

// Default stub provider -- returns minimal definitions for tool names
// Will be replaced by ToolPool (Epic 4)
let toolDefinitionProvider: ToolDefinitionProvider = (allowedTools: string[]) => {
  return allowedTools.map((name) => ({
    name,
    description: `Tool: ${name}`,
    parameters: { type: 'object', properties: {} },
  }))
}

// Returns all registered tool names -- used for wildcard "*" resolution
let toolNameProvider: ToolNameProvider = () => []

export function setToolDefinitionProvider(provider: ToolDefinitionProvider): void {
  toolDefinitionProvider = provider
}

export function setToolNameProvider(provider: ToolNameProvider): void {
  toolNameProvider = provider
}

export function getAllToolNames(): string[] {
  return toolNameProvider()
}

export function getToolDefinitions(allowedTools: string[]): LLMToolDefinition[] {
  if (!allowedTools || allowedTools.length === 0) return []
  // Wildcard: resolve to all registered tools
  if (hasWildcard(allowedTools)) {
    const allNames = toolNameProvider()
    if (allNames.length === 0) return []
    return toolDefinitionProvider(allNames)
  }
  return toolDefinitionProvider(allowedTools)
}

// === Agent Runner ===

export class AgentRunner {
  async execute(
    agent: AgentConfig,
    task: TaskRequest,
    context: LLMRouterContext,
    toolExecutor?: ToolExecutor,
  ): Promise<TaskResponse> {
    const toolDefs = getToolDefinitions(agent.allowedTools)
    const systemPrompt = buildSystemPrompt(agent, toolDefs.length > 0 ? toolDefs : undefined)
    const { model } = resolveModel({ tier: agent.tier, modelName: agent.modelName })
    const maxIterations = task.maxToolIterations ?? DEFAULT_MAX_TOOL_ITERATIONS

    // Append context to system prompt if provided
    let finalSystemPrompt = systemPrompt
    if (task.context) {
      finalSystemPrompt += `\n\n## Additional Context\n\n${task.context}`
      scanForCredentials(task.context)
    }

    // Auto-inject department knowledge and agent memories
    if (agent.departmentId) {
      const knowledgeCtx = await collectKnowledgeContext(agent.companyId, agent.id, agent.departmentId)
      if (knowledgeCtx) {
        finalSystemPrompt += `\n\n## Department Knowledge\n\n${knowledgeCtx}`
        scanForCredentials(knowledgeCtx)
      }
    }
    const taskDesc = typeof task.messages[0]?.content === 'string' ? task.messages[0].content : undefined
    const memoryCtx = await collectAgentMemoryContext(agent.companyId, agent.id, taskDesc)
    if (memoryCtx) {
      finalSystemPrompt += `\n\n## Agent Memories\n\n${memoryCtx}`
      scanForCredentials(memoryCtx)
    }

    const messages: LLMMessage[] = [...task.messages]
    const allToolRecords: ToolCallRecord[] = []
    let totalInput = 0
    let totalOutput = 0
    let lastResponse: LLMResponse | null = null
    let actualIterations = 0

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      actualIterations = iteration
      const request: LLMRequest = {
        model,
        systemPrompt: finalSystemPrompt,
        messages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
      }

      const response = await llmRouter.call(request, context)
      lastResponse = response
      totalInput += response.usage.inputTokens
      totalOutput += response.usage.outputTokens

      // If no tool calls, we're done
      if (response.finishReason !== 'tool_use' || response.toolCalls.length === 0) {
        break
      }

      // Process tool calls
      if (!toolExecutor) {
        // No executor provided -- return with tool calls unresolved
        break
      }

      const toolResults = await this.executeToolCalls(response.toolCalls, toolExecutor, allToolRecords, agent.allowedTools)

      // Append assistant message with tool calls
      messages.push({
        role: 'assistant',
        content: response.content || '',
        toolCalls: response.toolCalls,
      })

      // Append tool results as tool messages
      for (const result of toolResults) {
        messages.push({
          role: 'tool',
          content: result.content,
          toolCallId: result.toolCallId,
        })
      }

      // If this was the last iteration, add warning
      if (iteration === maxIterations) {
        const partialContent = response.content || ''
        const provider = resolveProvider(model)
        const costMicro = calculateCostMicro(model, totalInput, totalOutput)

        return {
          content: partialContent + '\n\n[WARNING: Maximum tool iterations reached. Some tool calls may not have been processed.]',
          toolCalls: allToolRecords,
          usage: { inputTokens: totalInput, outputTokens: totalOutput },
          cost: { model, provider, estimatedCostMicro: costMicro },
          finishReason: 'max_iterations',
          iterations: iteration,
        }
      }
    }

    if (!lastResponse) {
      throw new Error('AgentRunner: No LLM response received')
    }

    const provider = resolveProvider(model)
    const costMicro = calculateCostMicro(model, totalInput, totalOutput)

    // FR55: Output filter — redact credentials in agent response
    const content = lastResponse.content
    const filterResult = content ? filterOutput(content) : null
    const finalContent = filterResult ? filterResult.filtered : content

    // Audit log if credentials were redacted (fire-and-forget)
    if (filterResult && filterResult.redactedCount > 0) {
      createAuditLog({
        companyId: agent.companyId,
        actorType: 'agent',
        actorId: agent.id,
        action: AUDIT_ACTIONS.SECURITY_OUTPUT_REDACTED,
        targetType: 'agent_response',
        metadata: {
          redactedCount: filterResult.redactedCount,
          redactedTypes: filterResult.redactedTypes,
          agentName: agent.name,
        },
      }).catch(() => {})
    }

    const taskResponse = {
      content: finalContent,
      toolCalls: allToolRecords,
      usage: { inputTokens: totalInput, outputTokens: totalOutput },
      cost: { model, provider, estimatedCostMicro: costMicro },
      finishReason: lastResponse.finishReason,
      iterations: actualIterations,
    }

    // Auto-learning: extract memories from successful task (fire-and-forget)
    if (agent.autoLearn !== false && finalContent && lastResponse.finishReason !== 'error') {
      const taskDesc = task.messages[0]?.content || ''
      extractAndSaveMemories({
        companyId: agent.companyId,
        agentId: agent.id,
        taskDescription: taskDesc,
        taskResult: finalContent,
        source: agent.name,
      }).catch(() => {})
    }

    return taskResponse
  }

  async *executeStream(
    agent: AgentConfig,
    task: TaskRequest,
    context: LLMRouterContext,
    toolExecutor?: ToolExecutor,
  ): AsyncGenerator<LLMStreamChunk> {
    const toolDefs = getToolDefinitions(agent.allowedTools)
    const systemPrompt = buildSystemPrompt(agent, toolDefs.length > 0 ? toolDefs : undefined)
    const { model } = resolveModel({ tier: agent.tier, modelName: agent.modelName })
    const maxIterations = task.maxToolIterations ?? DEFAULT_MAX_TOOL_ITERATIONS

    let finalSystemPrompt = systemPrompt
    if (task.context) {
      finalSystemPrompt += `\n\n## Additional Context\n\n${task.context}`
      scanForCredentials(task.context)
    }

    // Auto-inject department knowledge and agent memories
    if (agent.departmentId) {
      const knowledgeCtx = await collectKnowledgeContext(agent.companyId, agent.id, agent.departmentId)
      if (knowledgeCtx) {
        finalSystemPrompt += `\n\n## Department Knowledge\n\n${knowledgeCtx}`
        scanForCredentials(knowledgeCtx)
      }
    }
    const streamTaskDesc = typeof task.messages[0]?.content === 'string' ? task.messages[0].content : undefined
    const memoryCtx = await collectAgentMemoryContext(agent.companyId, agent.id, streamTaskDesc)
    if (memoryCtx) {
      finalSystemPrompt += `\n\n## Agent Memories\n\n${memoryCtx}`
      scanForCredentials(memoryCtx)
    }

    const messages: LLMMessage[] = [...task.messages]
    let totalInput = 0
    let totalOutput = 0
    const allToolRecords: ToolCallRecord[] = []

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      const request: LLMRequest = {
        model,
        systemPrompt: finalSystemPrompt,
        messages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
      }

      let bufferedContent = ''
      const bufferedToolCalls: LLMToolCall[] = []
      let streamUsage = { inputTokens: 0, outputTokens: 0 }
      let hasToolCalls = false

      for await (const chunk of llmRouter.stream(request, context)) {
        if (chunk.type === 'text' && chunk.content) {
          bufferedContent += chunk.content
          // Only yield text chunks on the first iteration or when no tool calls pending
          if (!hasToolCalls) {
            yield chunk
          }
        } else if (chunk.type === 'tool_call_start' && chunk.toolCall) {
          hasToolCalls = true
          bufferedToolCalls.push({
            id: chunk.toolCall.id || `tool-${bufferedToolCalls.length}`,
            name: chunk.toolCall.name || '',
            arguments: chunk.toolCall.arguments || {},
          })
        } else if (chunk.type === 'done' && chunk.usage) {
          streamUsage = chunk.usage
        }
      }

      totalInput += streamUsage.inputTokens
      totalOutput += streamUsage.outputTokens

      // No tool calls -- stream is done
      if (!hasToolCalls || bufferedToolCalls.length === 0 || !toolExecutor) {
        // Auto-learning: extract memories from stream result (fire-and-forget)
        if (agent.autoLearn !== false && bufferedContent) {
          const taskDesc = task.messages[0]?.content || ''
          extractAndSaveMemories({
            companyId: agent.companyId,
            agentId: agent.id,
            taskDescription: taskDesc,
            taskResult: bufferedContent,
            source: agent.name,
          }).catch(() => {})
        }
        yield { type: 'done', usage: { inputTokens: totalInput, outputTokens: totalOutput } }
        return
      }

      // Execute tool calls
      const toolResults = await this.executeToolCalls(bufferedToolCalls, toolExecutor, allToolRecords, agent.allowedTools)

      // Append messages for next iteration
      messages.push({
        role: 'assistant',
        content: bufferedContent,
        toolCalls: bufferedToolCalls,
      })

      for (const result of toolResults) {
        messages.push({
          role: 'tool',
          content: result.content,
          toolCallId: result.toolCallId,
        })
      }

      if (iteration === maxIterations) {
        yield { type: 'text', content: '\n\n[WARNING: Maximum tool iterations reached.]' }
        yield { type: 'done', usage: { inputTokens: totalInput, outputTokens: totalOutput } }
        return
      }
    }

    yield { type: 'done', usage: { inputTokens: totalInput, outputTokens: totalOutput } }
  }

  private async executeToolCalls(
    toolCalls: LLMToolCall[],
    toolExecutor: ToolExecutor,
    allToolRecords: ToolCallRecord[],
    allowedTools?: string[],
  ): Promise<Array<{ toolCallId: string; content: string }>> {
    const results: Array<{ toolCallId: string; content: string }> = []

    for (const tc of toolCalls) {
      // NFR14: Server-side permission check before execution
      const permission = checkToolPermission(allowedTools, tc.name)
      if (!permission.allowed) {
        const reason = permission.reason || `TOOL_NOT_PERMITTED: ${tc.name}`
        allToolRecords.push({ name: tc.name, arguments: tc.arguments, error: reason, durationMs: 0 })
        results.push({ toolCallId: tc.id, content: `Error: ${reason}` })
        continue
      }

      const start = Date.now()
      try {
        const result = await toolExecutor(tc.name, tc.arguments)
        const durationMs = Date.now() - start
        if ('result' in result) {
          allToolRecords.push({ name: tc.name, arguments: tc.arguments, result: result.result, durationMs })
          results.push({ toolCallId: tc.id, content: result.result })
        } else {
          allToolRecords.push({ name: tc.name, arguments: tc.arguments, error: result.error, durationMs })
          results.push({ toolCallId: tc.id, content: `Error: ${result.error}` })
        }
      } catch (err) {
        const durationMs = Date.now() - start
        const errorMsg = err instanceof Error ? err.message : String(err)
        allToolRecords.push({ name: tc.name, arguments: tc.arguments, error: errorMsg, durationMs })
        results.push({ toolCallId: tc.id, content: `Error: ${errorMsg}` })
      }
    }

    return results
  }
}

// Singleton instance
export const agentRunner = new AgentRunner()
