import { query } from '@anthropic-ai/claude-agent-sdk'
import { ERROR_CODES } from '../lib/error-codes'
import { createSessionLogger } from '../db/logger'
import type { SessionContext, SSEEvent, RunAgentOptions } from './types'

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
      },
    })) {
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

        if (msg.subtype !== 'success') {
          yield {
            type: 'error',
            code: ERROR_CODES.AGENT_SPAWN_FAILED,
            message: (msg as any).error || 'Agent execution failed',
          }
        }
      }
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
  }
}
