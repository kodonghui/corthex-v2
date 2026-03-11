/**
 * 도구 실행 모킹 헬퍼 — Hook PreToolUse/PostToolUse 결과 모킹
 *
 * 사용법:
 *   import { mockToolPermission, createMockToolResult } from './helpers/tool-mock'
 *   mockToolPermission({ allow: true })
 */
import { mock } from 'bun:test'
import type { PreToolHookResult, Tool } from '../../engine/types'

// ─── Types ───────────────────────────────────────────────────

export interface MockToolConfig {
  name: string
  result?: unknown
  error?: string
}

// ─── Tool Permission Mock ────────────────────────────────────

/**
 * Mock the tool-permission-guard hook to return a fixed result.
 * Useful for testing scenarios where tool access is allowed/denied.
 */
export function mockToolPermission(result: PreToolHookResult) {
  const guardFn = mock(() => Promise.resolve(result))

  mock.module('../../engine/hooks/tool-permission-guard', () => ({
    toolPermissionGuard: guardFn,
  }))

  return { guardFn }
}

/**
 * Mock tool permission guard to allow specific tools and deny others.
 */
export function mockToolPermissionMap(allowedTools: string[]) {
  const guardFn = mock((toolName: string) => {
    const allow = allowedTools.includes(toolName)
    return Promise.resolve({
      allow,
      reason: allow ? undefined : `Tool ${toolName} not in allowed list`,
    } satisfies PreToolHookResult)
  })

  mock.module('../../engine/hooks/tool-permission-guard', () => ({
    toolPermissionGuard: guardFn,
  }))

  return { guardFn }
}

// ─── Tool Result Factories ──────────────────────────────────

/**
 * Create a mock tool execution result for testing PostToolUse hooks.
 */
export function createMockToolResult(config: MockToolConfig) {
  if (config.error) {
    return {
      name: config.name,
      success: false,
      error: config.error,
    }
  }
  return {
    name: config.name,
    success: true,
    result: config.result ?? `Result for ${config.name}`,
  }
}

/**
 * Create a mock Tool definition for testing.
 */
export function createMockTool(overrides: Partial<Tool> = {}): Tool {
  return {
    name: overrides.name || 'test-tool',
    description: overrides.description || 'A test tool',
    inputSchema: overrides.inputSchema || { type: 'object', properties: {} },
  }
}

// ─── Credential Scrubber Mock ────────────────────────────────

/**
 * Mock the credential-scrubber hook (PostToolUse).
 * Note: @zapier/secret-scrubber is a pure function — normally runs for real.
 * Only mock if you need to test scrubber-specific behavior in isolation.
 */
export function mockCredentialScrubber(scrubResult?: string) {
  const scrubFn = mock((input: string) => scrubResult ?? input)

  mock.module('../../engine/hooks/credential-scrubber', () => ({
    credentialScrubber: scrubFn,
  }))

  return { scrubFn }
}

// ─── Cost Tracker Mock ───────────────────────────────────────

/**
 * Mock the cost-tracker hook (Stop Hook).
 */
export function mockCostTracker() {
  const trackFn = mock(() => Promise.resolve())

  mock.module('../../engine/hooks/cost-tracker', () => ({
    costTracker: trackFn,
  }))

  return { trackFn }
}
