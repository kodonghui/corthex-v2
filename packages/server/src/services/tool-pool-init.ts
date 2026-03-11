/**
 * Tool pool initialization — no-op after agent-runner removal.
 * The new engine (engine/agent-loop.ts + SDK) manages tools directly.
 * This file is kept for API compatibility (server/index.ts calls initToolPool()).
 */

export function initToolPool(): void {
  // no-op: agent-runner.setToolDefinitionProvider removed with old engine
}
