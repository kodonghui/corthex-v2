import { query } from '@anthropic-ai/claude-agent-sdk'
import { ERROR_CODES } from '../lib/error-codes'
import { createSessionLogger } from '../db/logger'
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

/** D6: Single entry point — all agent execution passes through here */
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

  // Pre-spawn accepted event (absorbs ~2s SDK startup)
  yield { type: 'accepted', sessionId: ctx.sessionId }
  yield { type: 'processing', agentName }

  // Extract token for SDK call, then null for security (NFR-S2)
  // CLAUDECODE env signals to SDK that this is a programmatic invocation
  let token: string | null = ctx.cliToken
  const env: Record<string, string> = { ANTHROPIC_API_KEY: token!, CLAUDECODE: '' }
  token = null

  // Buffer for SSE events generated inside SDK hook callbacks
  const pendingEvents: SSEEvent[] = []
  let usageInfo: UsageInfo | null = null

  try {
    log.info({ event: 'agent_start', data: { depth: ctx.depth } }, 'Agent starting')

    let costUsd = 0
    let tokensUsed = 0

    for await (const msg of query({
      prompt: message,
      options: {
        systemPrompt: soul,
        maxTurns: 10,
        permissionMode: 'bypassPermissions',
        env,
        hooks: {
          PreToolUse: [{
            hooks: [async (input) => {
              const pre = input as { tool_name: string; tool_input: unknown }
              const result = await toolPermissionGuard(ctx, pre.tool_name, pre.tool_input)
              if (!result.allow) {
                pendingEvents.push({
                  type: 'error',
                  code: result.reason || ERROR_CODES.TOOL_PERMISSION_DENIED,
                  message: `Tool "${pre.tool_name}" is not permitted`,
                })
                return { decision: 'block' as const, reason: result.reason }
              }
              return { decision: 'approve' as const }
            }],
          }],
          PostToolUse: [{
            hooks: [async (input) => {
              const post = input as { tool_name: string; tool_input: unknown; tool_response: unknown }
              const rawOutput = typeof post.tool_response === 'string'
                ? post.tool_response
                : JSON.stringify(post.tool_response)
              // Chain: scrubber → redactor → delegation-tracker (D4 order)
              let output = credentialScrubber(ctx, post.tool_name, rawOutput)
              output = outputRedactor(ctx, post.tool_name, output)
              delegationTracker(ctx, post.tool_name, output, post.tool_input)
              // Yield handoff SSE event when call_agent detected
              if (post.tool_name === 'call_agent') {
                const from = ctx.visitedAgents[ctx.visitedAgents.length - 1] || 'unknown'
                const to = (post.tool_input as { targetAgentId?: string } | undefined)?.targetAgentId || 'unknown'
                pendingEvents.push({ type: 'handoff', from, to, depth: ctx.depth })
              }
              return {}
            }],
          }],
        },
      },
    })) {
      // Drain any hook-generated events before processing this message
      while (pendingEvents.length > 0) {
        yield pendingEvents.shift()!
      }

      if (msg.type === 'assistant') {
        const content = (msg as any).message?.content
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'text' && block.text) {
              yield { type: 'message', content: block.text }
            }
          }
        }
      }

      if (msg.type === 'result') {
        costUsd = (msg as any).total_cost_usd || 0
        const usage = (msg as any).usage
        tokensUsed = usage ? (usage.input_tokens || 0) + (usage.output_tokens || 0) : 0

        // Extract model from modelUsage for cost tracking
        const modelUsage = (msg as any).modelUsage as Record<string, unknown> | undefined
        const model = modelUsage ? (Object.keys(modelUsage)[0] || 'claude-haiku-4-5') : 'claude-haiku-4-5'
        usageInfo = {
          inputTokens: usage?.input_tokens || 0,
          outputTokens: usage?.output_tokens || 0,
          model,
        }

        if (msg.subtype !== 'success') {
          yield {
            type: 'error',
            code: ERROR_CODES.AGENT_SPAWN_FAILED,
            message: (msg as any).error || 'Agent execution failed',
          }
        }
      }
    }

    // Drain any remaining hook-generated events
    while (pendingEvents.length > 0) {
      yield pendingEvents.shift()!
    }

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
    // Clear sensitive env data and unregister session
    env.ANTHROPIC_API_KEY = ''
    activeSessions.delete(ctx.sessionId)
    // Fire-and-forget cost tracking (AC #4)
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
