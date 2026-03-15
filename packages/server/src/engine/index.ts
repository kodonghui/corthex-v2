/**
 * engine/index.ts — Public API barrel (E8)
 *
 * External code must import engine functions/types from here only.
 * Internal engine files (soul-renderer, model-selector, sse-adapter, hooks/)
 * are implementation details and must NOT be imported directly from outside engine/.
 */

export { runAgent, collectAgentResponse, getActiveSessions } from './agent-loop'
export { renderSoul } from './soul-renderer'
export { selectModel, selectModelFromDB } from './model-selector'
export { sseStream } from './sse-adapter'
export type { SessionContext, SSEEvent, PreToolHookResult, Tool, RunAgentOptions, ToolCallContext, BuiltinToolHandler } from './types'
