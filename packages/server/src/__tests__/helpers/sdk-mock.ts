/**
 * SDK 모킹 헬퍼 — Architecture E9: SDK query()만 모킹, CORTHEX 코드는 실제 실행
 *
 * 사용법:
 *   import { mockSDK, createMockSessionContext } from './helpers/sdk-mock'
 *   mockSDK({ responses: ['Hello!'] })
 *   // runAgent()는 실제 실행되며, query()만 모킹됨
 */
import { mock } from 'bun:test'
import type { SessionContext } from '../../engine/types'

// ─── Types ───────────────────────────────────────────────────

export interface MockToolCall {
  name: string
  input: Record<string, unknown>
}

export interface MockSDKOptions {
  /** Text responses the mocked agent will yield */
  responses?: string[]
  /** Tool calls the mocked agent will simulate */
  toolCalls?: MockToolCall[]
  /** Cost in USD to report */
  costUsd?: number
  /** Tokens used to report */
  tokensUsed?: number
  /** Simulate an error result instead of success */
  error?: string
  /** Simulate a thrown exception (network error, timeout, etc.) */
  throwError?: Error
}

// ─── SDK query() Mock ────────────────────────────────────────

/**
 * Mock the @anthropic-ai/claude-agent-sdk module.
 * Only `query()` is mocked — agent-loop.ts, hooks, SessionContext all run for real.
 *
 * Must be called BEFORE importing agent-loop.ts (bun:test hoists mock.module).
 */
export function mockSDK(options: MockSDKOptions = {}) {
  const {
    responses = ['mocked response'],
    toolCalls = [],
    costUsd = 0,
    tokensUsed = 0,
    error,
    throwError,
  } = options

  const queryFn = mock(() => {
    return {
      async *[Symbol.asyncIterator]() {
        if (throwError) {
          throw throwError
        }

        // Yield tool calls first (if any)
        for (const tc of toolCalls) {
          yield {
            type: 'assistant' as const,
            message: {
              content: [
                {
                  type: 'tool_use' as const,
                  name: tc.name,
                  input: tc.input,
                },
              ],
            },
          }
        }

        // Yield text responses
        for (const text of responses) {
          yield {
            type: 'assistant' as const,
            message: {
              content: [{ type: 'text' as const, text }],
            },
          }
        }

        // Yield result
        if (error) {
          yield {
            type: 'result' as const,
            subtype: 'error' as const,
            error,
            total_cost_usd: costUsd,
            usage: {
              input_tokens: Math.floor(tokensUsed * 0.7),
              output_tokens: Math.ceil(tokensUsed * 0.3),
            },
          }
        } else {
          yield {
            type: 'result' as const,
            subtype: 'success' as const,
            total_cost_usd: costUsd,
            usage: {
              input_tokens: Math.floor(tokensUsed * 0.7),
              output_tokens: Math.ceil(tokensUsed * 0.3),
            },
          }
        }
      },
    }
  })

  mock.module('@anthropic-ai/claude-agent-sdk', () => ({
    query: queryFn,
  }))

  return { queryFn }
}

/**
 * Mock SDK with sequential responses — each call to query() returns the next response set.
 * Useful for testing multi-turn conversations or handoff chains.
 */
export function mockSDKSequential(optionsList: MockSDKOptions[]) {
  let callIndex = 0

  const queryFn = mock(() => {
    const options = optionsList[callIndex] || optionsList[optionsList.length - 1]
    callIndex++

    const {
      responses = ['mocked response'],
      toolCalls = [],
      costUsd = 0,
      tokensUsed = 0,
      error,
      throwError,
    } = options

    return {
      async *[Symbol.asyncIterator]() {
        if (throwError) throw throwError

        for (const tc of toolCalls) {
          yield {
            type: 'assistant' as const,
            message: {
              content: [{ type: 'tool_use' as const, name: tc.name, input: tc.input }],
            },
          }
        }

        for (const text of responses) {
          yield {
            type: 'assistant' as const,
            message: { content: [{ type: 'text' as const, text }] },
          }
        }

        yield error
          ? { type: 'result' as const, subtype: 'error' as const, error, total_cost_usd: costUsd, usage: { input_tokens: Math.floor(tokensUsed * 0.7), output_tokens: Math.ceil(tokensUsed * 0.3) } }
          : { type: 'result' as const, subtype: 'success' as const, total_cost_usd: costUsd, usage: { input_tokens: Math.floor(tokensUsed * 0.7), output_tokens: Math.ceil(tokensUsed * 0.3) } }
      },
    }
  })

  mock.module('@anthropic-ai/claude-agent-sdk', () => ({
    query: queryFn,
  }))

  return { queryFn }
}

// ─── SessionContext Factory ──────────────────────────────────

/**
 * Create a mock SessionContext with sensible defaults.
 * Override any field via the `overrides` parameter.
 */
export function createMockSessionContext(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    cliToken: 'mock-cli-token',
    userId: 'test-user-id',
    companyId: 'test-company-id',
    depth: 0,
    sessionId: `test-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startedAt: Date.now(),
    maxDepth: 3,
    visitedAgents: ['test-agent'],
    ...overrides,
  }
}
