/**
 * E16: External API Typed Error Pattern
 *
 * Wraps all external API calls and converts HTTP/network errors into typed ToolErrors.
 * All built-in tool handlers making external HTTP calls MUST use this adapter.
 *
 * Error code mapping:
 *   401/403 → TOOL_CREDENTIAL_INVALID (API key expired/invalid)
 *   429     → TOOL_QUOTA_EXHAUSTED (rate limit exceeded)
 *   5xx     → TOOL_EXTERNAL_SERVICE_ERROR (server error)
 *   network → TOOL_EXTERNAL_SERVICE_ERROR (DNS/connection failure)
 */
import { ToolError } from './tool-error'

export async function callExternalApi<T>(
  serviceName: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    // Re-throw ToolErrors as-is (already typed)
    if (err instanceof ToolError) throw err

    const status = err != null && typeof err === 'object' && 'status' in err
      ? (err as { status: number }).status
      : undefined

    if (status !== undefined) {
      if (status === 401 || status === 403) {
        throw new ToolError(
          'TOOL_CREDENTIAL_INVALID',
          `${serviceName}: auth failed (${status}). Check API credential in Admin settings.`,
        )
      }
      if (status === 429) {
        throw new ToolError('TOOL_QUOTA_EXHAUSTED', `${serviceName}: rate limit exceeded`)
      }
      if (status >= 500) {
        throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', `${serviceName}: server error (${status})`)
      }
    }

    const message = err instanceof Error ? err.message : String(err)
    throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', `${serviceName}: ${message}`)
  }
}
