import Anthropic from '@anthropic-ai/sdk'
import { ERROR_CODES } from '../lib/error-codes'
import { createSessionLogger } from '../db/logger'
import { getDB } from '../db/scoped-query'
import { selectModel } from './model-selector'
import type { SessionContext, SSEEvent, RunAgentOptions } from './types'
import { toolPermissionGuard } from './hooks/tool-permission-guard'
import { credentialScrubber } from './hooks/credential-scrubber'
import { outputRedactor } from './hooks/output-redactor'
import { delegationTracker } from './hooks/delegation-tracker'
import { costTracker } from './hooks/cost-tracker'
import type { UsageInfo } from './hooks/cost-tracker'

/** Session registry for graceful shutdown (NFR-O1) */
const activeSessions = new Map<string, SessionContext>()

export function getActiveSessions(): ReadonlyMap<string, SessionContext> {
  return activeSessions
}

/** call_agent tool definition — always available to CORTHEX agents (D4 handoff) */
const CALL_AGENT_TOOL: Anthropic.Messages.Tool = {
  name: 'call_agent',
  description: '하위 에이전트에게 작업을 위임합니다 (핸드오프). 위임 후 해당 에이전트의 응답이 반환됩니다.',
  input_schema: {
    type: 'object' as const,
    properties: {
      targetAgentId: { type: 'string', description: '위임할 대상 에이전트 ID' },
      message: { type: 'string', description: '위임할 메시지' },
    },
    required: ['targetAgentId', 'message'],
  },
}

/** D6: Single entry point — all agent execution passes through here
 *
 * Path B (D17): Uses anthropic.messages.create() directly with
 * cache_control: { type:'ephemeral' } on system prompt.
 * SDK PoC confirmed: claude-agent-sdk@0.2.72 only accepts string for
 * systemPrompt (array → empty string at runtime), so Path A is not feasible.
 */
export async function* runAgent(options: RunAgentOptions): AsyncGenerator<SSEEvent> {
  const { ctx, soul, message } = options
  const agentName = ctx.visitedAgents[ctx.visitedAgents.length - 1] || 'unknown'
  const log = createSessionLogger({
    sessionId: ctx.sessionId,
    companyId: ctx.companyId,
    agentId: agentName,
  })

  // Register session
  activeSessions.set(ctx.sessionId, ctx)

  // Pre-spawn accepted event (absorbs ~2s startup)
  yield { type: 'accepted', sessionId: ctx.sessionId }
  yield { type: 'processing', agentName }

  // Extract token for API call, then null for security (NFR-S2)
  const apiKey: string = ctx.cliToken
  const anthropic = new Anthropic({ apiKey })

  // Buffer for SSE events generated inside tool handling
  const pendingEvents: SSEEvent[] = []
  let usageInfo: UsageInfo | null = null

  try {
    log.info({ event: 'agent_start', data: { depth: ctx.depth } }, 'Agent starting')

    // Resolve model from agent tier (async lookup with fallback)
    const [agentRecord] = await getDB(ctx.companyId).agentById(agentName)
    const model = selectModel(agentRecord?.tierLevel ?? (agentRecord?.tier ?? 'worker'))

    // Load agent tools from DB (with inputSchema for API tool definitions)
    const toolRecords = await getDB(ctx.companyId).agentToolsWithSchema(agentName)
    const agentApiTools: Anthropic.Messages.Tool[] = toolRecords.map(t => ({
      name: t.name,
      description: t.description || '',
      input_schema: (t.inputSchema as Anthropic.Messages.Tool['input_schema']) ?? {
        type: 'object' as const,
        properties: {},
      },
    }))
    const allTools: Anthropic.Messages.Tool[] = [CALL_AGENT_TOOL, ...agentApiTools]

    // System prompt with cache_control (D17: cache_control: { type:'ephemeral' })
    const systemBlocks: Anthropic.Messages.TextBlockParam[] = [{
      type: 'text',
      text: soul || '',
      cache_control: { type: 'ephemeral' },
    }]

    const messages: Anthropic.Messages.MessageParam[] = [
      { role: 'user', content: message },
    ]

    let costUsd = 0
    let totalInputTokens = 0
    let totalOutputTokens = 0
    let totalCacheReadTokens = 0
    let totalCacheCreationTokens = 0

    // Multi-turn tool loop (max 10 turns = maxTurns equivalent)
    for (let turn = 0; turn < 10; turn++) {
      // Drain any pending events before API call
      while (pendingEvents.length > 0) {
        yield pendingEvents.shift()!
      }

      const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemBlocks,
        messages,
        ...(allTools.length > 0 ? { tools: allTools } : {}),
      })

      // Accumulate usage (including cache tokens — AC#5)
      totalInputTokens += response.usage.input_tokens
      totalOutputTokens += response.usage.output_tokens
      totalCacheReadTokens += response.usage.cache_read_input_tokens ?? 0
      totalCacheCreationTokens += response.usage.cache_creation_input_tokens ?? 0

      // Add assistant response to conversation history
      messages.push({ role: 'assistant', content: response.content })

      // Drain pending events before yielding message blocks
      while (pendingEvents.length > 0) {
        yield pendingEvents.shift()!
      }

      // Yield text blocks as message SSE events
      for (const block of response.content) {
        if (block.type === 'text' && block.text) {
          yield { type: 'message', content: block.text }
        }
      }

      // Stop if no tool_use or end_turn
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use',
      )
      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        break
      }

      // Process tool use blocks (PreToolUse → execute → PostToolUse)
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

      for (const block of toolUseBlocks) {
        const toolInput = block.input as Record<string, unknown>

        // PreToolUse hook (tool-permission-guard)
        const preResult = await toolPermissionGuard(ctx, block.name, toolInput)
        if (!preResult.allow) {
          pendingEvents.push({
            type: 'error',
            code: preResult.reason || ERROR_CODES.TOOL_PERMISSION_DENIED,
            message: `Tool "${block.name}" is not permitted`,
          })
          const blockedOutput = `Tool "${block.name}" is not permitted`
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: blockedOutput,
            is_error: true,
          })
          // PostToolUse hook chain for blocked tool
          let output = credentialScrubber(ctx, block.name, blockedOutput)
          output = outputRedactor(ctx, block.name, output)
          delegationTracker(ctx, block.name, output, toolInput)
          continue
        }

        // call_agent: emit handoff SSE event, return success result
        if (block.name === 'call_agent') {
          const from = agentName
          const to = (toolInput.targetAgentId as string | undefined) || 'unknown'
          pendingEvents.push({ type: 'handoff', from, to, depth: ctx.depth })
          const callAgentOutput = JSON.stringify({ success: true, delegatedTo: to })
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: callAgentOutput,
          })
          // PostToolUse hook chain
          let output = credentialScrubber(ctx, block.name, callAgentOutput)
          output = outputRedactor(ctx, block.name, output)
          delegationTracker(ctx, block.name, output, toolInput)
          continue
        }

        // Other tools: return not-implemented result (DB tools not executable in engine path)
        const otherOutput = `[Tool "${block.name}" is defined but not executable in this context]`
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: otherOutput,
          is_error: true,
        })
        // PostToolUse hook chain
        let output = credentialScrubber(ctx, block.name, otherOutput)
        output = outputRedactor(ctx, block.name, output)
        delegationTracker(ctx, block.name, output, toolInput)
      }

      // Add tool results to conversation for next turn
      messages.push({ role: 'user', content: toolResults })
    }

    // Drain any remaining pending events
    while (pendingEvents.length > 0) {
      yield pendingEvents.shift()!
    }

    // Build UsageInfo for cost tracking (AC#5: cache token fields)
    usageInfo = {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      model,
      cacheReadInputTokens: totalCacheReadTokens,
      cacheCreationInputTokens: totalCacheCreationTokens,
    }

    const tokensUsed = totalInputTokens + totalOutputTokens
    yield { type: 'done', costUsd, tokensUsed }
    log.info({ event: 'agent_done', data: { costUsd, tokensUsed } }, 'Agent completed')
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Unknown error'
    log.error({ event: 'agent_error', data: { error: errMessage } }, 'Agent failed')
    yield {
      type: 'error',
      code: ERROR_CODES.AGENT_SPAWN_FAILED,
      message: errMessage,
    }
  } finally {
    activeSessions.delete(ctx.sessionId)
    // Fire-and-forget cost tracking with cache metrics (AC#6)
    if (usageInfo) {
      costTracker(ctx, usageInfo).catch(() => {})
    }
  }
}

/** Fire-and-collect: run agent and return concatenated message text */
export async function collectAgentResponse(options: RunAgentOptions): Promise<string> {
  const parts: string[] = []
  for await (const event of runAgent(options)) {
    if (event.type === 'message') parts.push(event.content)
    if (event.type === 'error') throw new Error(event.message)
  }
  return parts.join('')
}
