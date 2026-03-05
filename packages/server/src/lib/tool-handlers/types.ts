export type ToolExecContext = {
  companyId: string
  agentId: string
  sessionId: string
  departmentId: string | null
  userId: string
  config?: Record<string, unknown>
  getCredentials: (provider: string) => Promise<Record<string, string>>
}

export type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolExecContext,
) => Promise<string> | string
