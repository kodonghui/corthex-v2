export type ToolExecContext = {
  companyId: string
  agentId: string
  sessionId: string
  departmentId: string | null
  userId: string
}

export type ToolHandler = (
  input: Record<string, unknown>,
  ctx: ToolExecContext,
) => Promise<string> | string
