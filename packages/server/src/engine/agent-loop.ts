import Anthropic from '@anthropic-ai/sdk'
import { ERROR_CODES } from '../lib/error-codes'
import { createSessionLogger } from '../db/logger'
import { getDB } from '../db/scoped-query'
import { selectModel } from './model-selector'
import type { SessionContext, SSEEvent, RunAgentOptions, CallAgentResponse } from './types'
import { toolPermissionGuard } from './hooks/tool-permission-guard'
import { credentialScrubber, init as scrubberInit, release as scrubberRelease } from './hooks/credential-scrubber'
import { mcpManager } from './mcp/mcp-manager'
import { outputRedactor } from './hooks/output-redactor'
import { delegationTracker } from './hooks/delegation-tracker'
import { costTracker } from './hooks/cost-tracker'
import type { UsageInfo } from './hooks/cost-tracker'
import { checkSemanticCache, saveToSemanticCache } from './semantic-cache'

/** Session registry for graceful shutdown (NFR-O1) */
const activeSessions = new Map<string, SessionContext>()

/** Generate a UUID v4 for run tracking (E17: runId groups all tool calls in one session) */
function generateRunId(): string {
  return crypto.randomUUID()
}

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
  const { soul, message } = options
  // Inject runId at session start if not provided (E17: agent-loop.ts is responsible for runId)
  const ctx: SessionContext = options.ctx.runId
    ? options.ctx
    : { ...options.ctx, runId: generateRunId() }
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

    // [Layer 1] Semantic Cache check (D19, D20) — Story 15.3
    if (agentRecord?.enableSemanticCache) {
      try {
        const cacheResult = await checkSemanticCache(ctx.companyId, message)
        if (cacheResult) {
          log.info({ event: 'semantic_cache_hit', companyId: ctx.companyId, agentId: agentName, similarity: cacheResult.similarity }, 'Semantic cache hit')
          // Yield cache response as SSE events (costUsd: 0)
          yield { type: 'message', content: cacheResult.response }
          yield { type: 'done', costUsd: 0, tokensUsed: 0 }
          return
        }
        log.info({ event: 'semantic_cache_miss', companyId: ctx.companyId, agentId: agentName }, 'Semantic cache miss')
      } catch {
        // NFR-CACHE-R2: graceful fallback — continue to LLM
      }
    }

    // D28: Init credential scrubber FIRST — before any tool calls (Story 18.5)
    await scrubberInit(ctx)

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

    // FR-MCP4: MERGE stage — load assigned MCP servers and get sessions for tool merge
    // D26: lazy spawn — getOrSpawnSession is called here to get tool definitions for first turn,
    // but spawned processes are fully torn down at session end (teardownAll in finally)
    const mcpServerRows = await getDB(ctx.companyId).getMcpServersForAgent(agentName)
    const mcpSessionsWithDisplayNames: Array<{ displayName: string; session: import('./mcp/mcp-manager').McpSession }> = []
    for (const row of mcpServerRows) {
      try {
        const session = await mcpManager.getOrSpawnSession(ctx.sessionId, row.mcp.id, ctx.companyId)
        mcpSessionsWithDisplayNames.push({ displayName: row.mcp.displayName, session })
      } catch {
        // If MCP server fails to spawn, skip it (don't block agent start)
        log.warn({ event: 'mcp_spawn_failed', data: { mcpServerId: row.mcp.id } }, 'MCP session spawn failed at init')
      }
    }

    const mergedMcpTools = mcpManager.getMergedTools([], mcpSessionsWithDisplayNames)
    const mcpApiTools: Anthropic.Messages.Tool[] = mergedMcpTools.map(t => ({
      name: t.name,
      description: t.description || '',
      input_schema: (t.inputSchema ?? { type: 'object' as const, properties: {} }) as Anthropic.Messages.Tool['input_schema'],
    }))

    const allTools: Anthropic.Messages.Tool[] = [CALL_AGENT_TOOL, ...agentApiTools, ...mcpApiTools]

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
    // Collect full response text for semantic cache save (Story 15.3)
    const fullResponseParts: string[] = []

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
          fullResponseParts.push(block.text)
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

        // PreToolUse hook (tool-permission-guard, FR-TA3)
        const preResult = await toolPermissionGuard(ctx, block.name, toolInput)
        if (!preResult.allow) {
          // TOOL_NOT_ALLOWED: tool_name format (FR-TA3, NFR-S5)
          const blockedOutput = preResult.reason || `TOOL_NOT_ALLOWED: ${block.name}`
          pendingEvents.push({
            type: 'error',
            code: blockedOutput,
            message: blockedOutput,
          })
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

        // call_agent: emit handoff SSE event, return AR73 structured response
        if (block.name === 'call_agent') {
          const from = agentName
          const to = (toolInput.targetAgentId as string | undefined) || 'unknown'
          const message = (toolInput.message as string | undefined) || ''
          pendingEvents.push({ type: 'handoff', from, to, depth: ctx.depth })
          const response: CallAgentResponse = {
            status: 'success',
            summary: `작업이 ${to}에게 위임되었습니다.`,
            delegatedTo: to,
            next_actions: message ? [`${to}가 "${message.slice(0, 100)}" 처리 중`] : undefined,
          }
          const callAgentOutput = JSON.stringify(response)
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

        // FR-MCP4 E12 EXECUTE stage: MCP tools have double-underscore namespace (notion__create_page)
        if (block.name.includes('__')) {
          let mcpOutput: string
          try {
            mcpOutput = await mcpManager.execute(
              block.name,
              toolInput,
              ctx.sessionId,
              ctx.companyId,
              agentName,
              ctx.runId,
            )
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err)
            mcpOutput = `[MCP tool error: ${errMsg}]`
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: mcpOutput,
              is_error: true,
            })
            // D28: PostToolUse hook chain — MCP output also scrubbed
            let output = credentialScrubber(ctx, block.name, mcpOutput)
            output = outputRedactor(ctx, block.name, output)
            delegationTracker(ctx, block.name, output, toolInput)
            continue
          }
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: mcpOutput,
          })
          // D28: PostToolUse hook chain — MCP output scrubbed (not exempt)
          let mcpScrubbedOutput = credentialScrubber(ctx, block.name, mcpOutput)
          mcpScrubbedOutput = outputRedactor(ctx, block.name, mcpScrubbedOutput)
          delegationTracker(ctx, block.name, mcpScrubbedOutput, toolInput)
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

    // [Layer 1] Save to Semantic Cache after successful LLM response (Story 15.3)
    if (agentRecord?.enableSemanticCache && fullResponseParts.length > 0) {
      const fullResponse = fullResponseParts.join('')
      try {
        await saveToSemanticCache(ctx.companyId, message, fullResponse)
      } catch {
        // NFR-CACHE-R2: ignore errors — log.warn handled inside saveToSemanticCache
      }
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
    // FR-MCP5 D4: TEARDOWN MCP sessions BEFORE Stop Hooks — independent of session outcome
    mcpManager.teardownAll(ctx.sessionId, ctx.companyId).catch(() => {})
    // D28: Release in-memory credential list to free memory
    scrubberRelease(ctx.sessionId)
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
