import { toolPool } from './tool-pool'
import { setToolDefinitionProvider } from './agent-runner'

/**
 * Wire ToolPool into AgentRunner.
 * Call once at server startup after tools are registered.
 */
export function initToolPool(): void {
  setToolDefinitionProvider((allowedTools) => toolPool.getDefinitions(allowedTools))
}
