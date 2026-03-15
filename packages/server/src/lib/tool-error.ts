/**
 * ToolError — typed error for built-in tool handlers (E13, D3)
 *
 * All built-in tool handlers must throw ToolError, never generic Error.
 * Error codes use TOOL_/AGENT_ prefix system (D3).
 */
export class ToolError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ToolError'
  }
}
