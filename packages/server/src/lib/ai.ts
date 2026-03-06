import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { chatMessages, chatSessions, agents, agentMemory, cliCredentials, mcpServers } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { loadAgentTools, toClaudeTools, executeTool } from './tool-executor'
import { mcpListTools, mcpCallTool, mcpCallToolStream } from './mcp-client'
import { recordCost } from './cost-tracker'
import { decrypt } from './crypto'
import { checkMcpRateLimit } from './mcp-rate-limit'
import { logActivity } from './activity-logger'

/**
 * 유저의 CLI 토큰으로 Anthropic 클라이언트 생성
 * 설계: 각 유저(H)마다 자기 CLI 토큰 → 비용/데이터 격리
 */
export async function getClientForUser(userId: string, companyId: string): Promise<Anthropic> {
  const [cred] = await db
    .select({ encryptedToken: cliCredentials.encryptedToken })
    .from(cliCredentials)
    .where(
      and(
        eq(cliCredentials.userId, userId),
        eq(cliCredentials.companyId, companyId),
        eq(cliCredentials.isActive, true),
      ),
    )
    .limit(1)

  if (!cred) {
    throw new Error('CLI 토큰이 등록되지 않았습니다. 관리자에게 CLI 크레덴셜 등록을 요청하세요.')
  }

  const apiKey = await decrypt(cred.encryptedToken)
  return new Anthropic({ apiKey })
}

// MCP 도구 레코드 — handler가 'mcp::serverId' 형식
type McpToolRecord = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  serverUrl: string
  serverId: string
}

/**
 * 회사에 등록된 활성 MCP 서버들에서 도구 목록 수집
 */
async function loadMcpToolsForCompany(companyId: string, existingToolNames: Set<string>): Promise<{
  mcpToolRecords: McpToolRecord[]
  claudeMcpTools: Anthropic.Messages.Tool[]
}> {
  const servers = await db
    .select({ id: mcpServers.id, name: mcpServers.name, url: mcpServers.url })
    .from(mcpServers)
    .where(and(eq(mcpServers.companyId, companyId), eq(mcpServers.isActive, true)))

  if (servers.length === 0) return { mcpToolRecords: [], claudeMcpTools: [] }

  const mcpToolRecords: McpToolRecord[] = []
  const claudeMcpTools: Anthropic.Messages.Tool[] = []

  for (const server of servers) {
    try {
      const tools = await mcpListTools(server.url)
      for (const tool of tools) {
        // 내장 도구와 이름 충돌 시 건너뛰기
        if (existingToolNames.has(tool.name)) continue
        // 이미 다른 MCP 서버에서 추가된 같은 이름 도구도 건너뛰기
        if (mcpToolRecords.some(t => t.name === tool.name)) continue

        mcpToolRecords.push({
          name: tool.name,
          description: tool.description || '',
          inputSchema: tool.inputSchema || {},
          serverUrl: server.url,
          serverId: server.id,
        })
        claudeMcpTools.push({
          name: tool.name,
          description: `[MCP] ${tool.description || ''}`,
          input_schema: (tool.inputSchema as Anthropic.Messages.Tool['input_schema']) || {
            type: 'object' as const,
            properties: {},
          },
        })
      }
    } catch {
      // MCP 서버 연결 실패 시 건너뛰기 (서비스 가용성 우선)
    }
  }

  return { mcpToolRecords, claudeMcpTools }
}

type ChatContext = {
  agentId: string
  sessionId: string
  companyId: string
  userMessage: string
  userId: string
}

const MAX_TOOL_ROUNDS = 5  // 도구 루프 최대 반복 횟수

export async function generateAgentResponse(ctx: ChatContext): Promise<string> {
  const client = await getClientForUser(ctx.userId, ctx.companyId)

  // 1. 에이전트 정보 로드
  const [agent] = await db
    .select({
      name: agents.name,
      role: agents.role,
      soul: agents.soul,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(eq(agents.id, ctx.agentId))
    .limit(1)

  if (!agent) throw new Error('에이전트를 찾을 수 없습니다')

  // 2. 이전 대화 히스토리 로드 (최근 20개)
  const history = await db
    .select({ sender: chatMessages.sender, content: chatMessages.content })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, ctx.sessionId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(20)
  history.reverse()

  // 3. 에이전트 장기 기억 로드
  const memories = await db
    .select({ key: agentMemory.key, value: agentMemory.value })
    .from(agentMemory)
    .where(eq(agentMemory.agentId, ctx.agentId))
    .limit(10)

  // 4. 에이전트에 할당된 도구 로드 + MCP 도구 추가
  const toolRecords = await loadAgentTools(ctx.agentId, ctx.companyId)
  const claudeTools = toClaudeTools(toolRecords)
  const existingToolNames = new Set(toolRecords.map(t => t.name))
  const { mcpToolRecords, claudeMcpTools } = await loadMcpToolsForCompany(ctx.companyId, existingToolNames)
  const allClaudeTools = [...claudeTools, ...claudeMcpTools]

  // 5. 시스템 프롬프트 구성
  const memoryBlock = memories.length > 0
    ? `\n\n## 장기 기억\n${memories.map(m => `- ${m.key}: ${m.value}`).join('\n')}`
    : ''

  const allToolDescriptions = [
    ...toolRecords.map(t => `- ${t.name}: ${t.description || ''}`),
    ...mcpToolRecords.map(t => `- ${t.name} [MCP]: ${t.description}`),
  ]
  const toolBlock = allToolDescriptions.length > 0
    ? `\n\n## 사용 가능한 도구\n${allToolDescriptions.join('\n')}\n\n도구가 필요한 질문을 받으면 적극적으로 도구를 사용하세요.`
    : ''

  // 5.5 세션 metadata에서 종목 컨텍스트 추출
  const [sessionRow] = await db
    .select({ metadata: chatSessions.metadata })
    .from(chatSessions)
    .where(eq(chatSessions.id, ctx.sessionId))
    .limit(1)
  const meta = sessionRow?.metadata as { stockCode?: string; stockName?: string } | null
  const stockContext = meta?.stockCode
    ? `\n\n## 현재 종목 컨텍스트\n사용자가 보고 있는 종목: ${meta.stockName || ''} (${meta.stockCode})\n이 종목에 대한 질문에 우선적으로 답변해주세요.`
    : ''

  const systemPrompt = `${agent.soul || '당신은 도움이 되는 AI 비서입니다.'}

## 기본 정보
- 이름: ${agent.name}
- 역할: ${agent.role || '비서'}
- 항상 한국어로 답변합니다
- 간결하고 실용적으로 답변합니다${stockContext}${memoryBlock}${toolBlock}`

  // 6. 메시지 배열 구성
  const messages: Anthropic.MessageParam[] = history.map((msg) => ({
    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.content,
  }))
  messages.push({ role: 'user', content: ctx.userMessage })

  // 7. Claude API 호출 — tool_use 루프
  const toolExecCtx = {
    companyId: ctx.companyId,
    agentId: ctx.agentId,
    sessionId: ctx.sessionId,
    departmentId: agent.departmentId,
    userId: ctx.userId,
  }

  let toolCallSummaries: string[] = []

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
      ...(allClaudeTools.length > 0 ? { tools: allClaudeTools } : {}),
    })

    // 비용 기록
    recordCost({
      companyId: ctx.companyId,
      agentId: ctx.agentId,
      sessionId: ctx.sessionId || undefined,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      source: 'chat',
    })

    // 텍스트 + tool_use 블록 분리
    const textBlocks = response.content.filter(b => b.type === 'text')
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')

    // 도구 호출이 없으면 최종 텍스트 반환
    if (toolUseBlocks.length === 0) {
      const finalText = textBlocks.map(b => b.type === 'text' ? b.text : '').join('\n')

      // 도구 호출이 있었으면 요약 추가
      if (toolCallSummaries.length > 0) {
        return `${finalText}\n\n---\n🔧 **도구 호출 내역:**\n${toolCallSummaries.join('\n')}`
      }
      return finalText || '응답을 생성할 수 없습니다.'
    }

    // 도구 호출 실행
    const toolResults: Anthropic.MessageParam['content'] = []

    for (const block of toolUseBlocks) {
      if (block.type !== 'tool_use') continue

      // MCP 도구인지 확인
      const mcpTool = mcpToolRecords.find(t => t.name === block.name)
      if (mcpTool) {
        // MCP 속도 제한
        const rateCheck = checkMcpRateLimit(ctx.userId)
        if (!rateCheck.allowed) {
          toolResults.push({
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: '[오류] MCP 도구 실행 속도 제한 (분당 20회)',
            is_error: true,
          } as Anthropic.Messages.ToolResultBlockParam)
          continue
        }

        try {
          const result = await mcpCallTool(mcpTool.serverUrl, block.name, block.input as Record<string, unknown>)
          toolCallSummaries.push(`- **${block.name}** [MCP]: ${JSON.stringify(block.input).slice(0, 80)}`)
          toolResults.push({
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: result || '(빈 결과)',
          } as Anthropic.Messages.ToolResultBlockParam)

          logActivity({
            companyId: ctx.companyId, userId: ctx.userId, type: 'tool_call', phase: 'end',
            actorType: 'user', actorId: ctx.userId, action: 'mcp-tool-execute',
            detail: `MCP 도구 실행: ${block.name}`,
            metadata: { toolName: block.name, serverUrl: mcpTool.serverUrl },
          })
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'MCP 도구 실행 실패'
          toolCallSummaries.push(`- **${block.name}** [MCP] 실패: ${errMsg}`)
          toolResults.push({
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: `[오류] ${errMsg}`,
            is_error: true,
          } as Anthropic.Messages.ToolResultBlockParam)

          logActivity({
            companyId: ctx.companyId, userId: ctx.userId, type: 'tool_call', phase: 'error',
            actorType: 'user', actorId: ctx.userId, action: 'mcp-tool-execute',
            detail: `MCP 도구 실행 실패: ${block.name} — ${errMsg}`,
            metadata: { toolName: block.name, serverUrl: mcpTool.serverUrl, error: errMsg },
          })
        }
        continue
      }

      const toolRecord = toolRecords.find(t => t.name === block.name)
      if (!toolRecord) {
        toolResults.push({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: `도구 '${block.name}'을(를) 찾을 수 없습니다.`,
          is_error: true,
        } as Anthropic.Messages.ToolResultBlockParam)
        continue
      }

      const result = await executeTool(
        block.name,
        block.input as Record<string, unknown>,
        toolExecCtx,
        toolRecord,
      )

      toolCallSummaries.push(`- **${block.name}**: ${JSON.stringify(block.input).slice(0, 80)}`)

      toolResults.push({
        type: 'tool_result' as const,
        tool_use_id: block.id,
        content: result,
      } as Anthropic.Messages.ToolResultBlockParam)
    }

    // assistant 메시지 (tool_use 포함) + tool_result 메시지를 히스토리에 추가
    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults as Anthropic.Messages.ToolResultBlockParam[] })
  }

  // 루프 초과 시
  return '도구 호출이 너무 많아 중단되었습니다. 질문을 더 구체적으로 해주세요.'
}

// === 스트리밍 버전 ===

export type StreamEvent =
  | { type: 'token'; content: string }
  | { type: 'tool-start'; toolName: string; toolId: string; input?: string }
  | { type: 'tool-progress'; toolName: string; toolId: string; content: string }
  | { type: 'tool-end'; toolName: string; toolId: string; result: string; durationMs?: number; error?: boolean }
  | { type: 'done'; sessionId: string }
  | { type: 'error'; code: string; message: string }

/**
 * 스트리밍 AI 응답 생성 — 이벤트 콜백으로 실시간 전달
 * 최종 전체 텍스트를 반환하여 DB 저장에 사용
 */
export async function generateAgentResponseStream(
  ctx: ChatContext,
  onEvent: (event: StreamEvent) => void,
): Promise<string> {
  const client = await getClientForUser(ctx.userId, ctx.companyId)

  const [agent] = await db
    .select({
      name: agents.name,
      role: agents.role,
      soul: agents.soul,
      departmentId: agents.departmentId,
    })
    .from(agents)
    .where(eq(agents.id, ctx.agentId))
    .limit(1)

  if (!agent) throw new Error('에이전트를 찾을 수 없습니다')

  const history = await db
    .select({ sender: chatMessages.sender, content: chatMessages.content })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, ctx.sessionId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(20)
  history.reverse()

  const memories = await db
    .select({ key: agentMemory.key, value: agentMemory.value })
    .from(agentMemory)
    .where(eq(agentMemory.agentId, ctx.agentId))
    .limit(10)

  // 에이전트 도구 + MCP 도구 로드
  const toolRecords = await loadAgentTools(ctx.agentId, ctx.companyId)
  const claudeTools = toClaudeTools(toolRecords)
  const existingToolNames = new Set(toolRecords.map(t => t.name))
  const { mcpToolRecords, claudeMcpTools } = await loadMcpToolsForCompany(ctx.companyId, existingToolNames)
  const allClaudeTools = [...claudeTools, ...claudeMcpTools]

  const memoryBlock = memories.length > 0
    ? `\n\n## 장기 기억\n${memories.map(m => `- ${m.key}: ${m.value}`).join('\n')}`
    : ''
  const allToolDescriptions = [
    ...toolRecords.map(t => `- ${t.name}: ${t.description || ''}`),
    ...mcpToolRecords.map(t => `- ${t.name} [MCP]: ${t.description}`),
  ]
  const toolBlock = allToolDescriptions.length > 0
    ? `\n\n## 사용 가능한 도구\n${allToolDescriptions.join('\n')}\n\n도구가 필요한 질문을 받으면 적극적으로 도구를 사용하세요.`
    : ''

  // 세션 metadata에서 종목 컨텍스트 추출
  const [sessionRow] = await db
    .select({ metadata: chatSessions.metadata })
    .from(chatSessions)
    .where(eq(chatSessions.id, ctx.sessionId))
    .limit(1)
  const meta = sessionRow?.metadata as { stockCode?: string; stockName?: string } | null
  const stockContext = meta?.stockCode
    ? `\n\n## 현재 종목 컨텍스트\n사용자가 보고 있는 종목: ${meta.stockName || ''} (${meta.stockCode})\n이 종목에 대한 질문에 우선적으로 답변해주세요.`
    : ''

  const systemPrompt = `${agent.soul || '당신은 도움이 되는 AI 비서입니다.'}

## 기본 정보
- 이름: ${agent.name}
- 역할: ${agent.role || '비서'}
- 항상 한국어로 답변합니다
- 간결하고 실용적으로 답변합니다${stockContext}${memoryBlock}${toolBlock}`

  const messages: Anthropic.MessageParam[] = history.map((msg) => ({
    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.content,
  }))
  messages.push({ role: 'user', content: ctx.userMessage })

  const toolExecCtx = {
    companyId: ctx.companyId,
    agentId: ctx.agentId,
    sessionId: ctx.sessionId,
    departmentId: agent.departmentId,
    userId: ctx.userId,
  }

  let fullText = ''

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
      ...(allClaudeTools.length > 0 ? { tools: allClaudeTools } : {}),
    })

    // 텍스트 토큰 스트리밍
    stream.on('text', (text) => {
      fullText += text
      onEvent({ type: 'token', content: text })
    })

    const finalMessage = await stream.finalMessage()

    // 비용 기록
    recordCost({
      companyId: ctx.companyId,
      agentId: ctx.agentId,
      sessionId: ctx.sessionId || undefined,
      model: finalMessage.model,
      inputTokens: finalMessage.usage.input_tokens,
      outputTokens: finalMessage.usage.output_tokens,
      source: 'chat',
    })

    // tool_use 블록 확인
    const toolUseBlocks = finalMessage.content.filter(b => b.type === 'tool_use')

    if (toolUseBlocks.length === 0) {
      // 도구 호출 없음 — 스트리밍 완료
      onEvent({ type: 'done', sessionId: ctx.sessionId })
      return fullText || '응답을 생성할 수 없습니다.'
    }

    // 도구 실행
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

    for (const block of toolUseBlocks) {
      if (block.type !== 'tool_use') continue

      const inputStr = JSON.stringify(block.input).slice(0, 200)

      // MCP 도구인지 확인
      const mcpTool = mcpToolRecords.find(t => t.name === block.name)
      if (mcpTool) {
        // MCP 속도 제한
        const rateCheck = checkMcpRateLimit(ctx.userId)
        if (!rateCheck.allowed) {
          onEvent({ type: 'tool-start', toolName: `${block.name} [MCP]`, toolId: block.id, input: inputStr })
          onEvent({ type: 'tool-end', toolName: `${block.name} [MCP]`, toolId: block.id, result: 'MCP 도구 실행 속도 제한 (분당 20회)', durationMs: 0, error: true })
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: '[오류] MCP 도구 실행 속도 제한 (분당 20회)', is_error: true })
          continue
        }

        onEvent({ type: 'tool-start', toolName: `${block.name} [MCP]`, toolId: block.id, input: inputStr })
        const toolStart = Date.now()
        try {
          const result = await mcpCallToolStream(
            mcpTool.serverUrl,
            block.name,
            block.input as Record<string, unknown>,
            (progressText) => {
              onEvent({ type: 'tool-progress', toolName: `${block.name} [MCP]`, toolId: block.id, content: progressText })
            },
          )
          const durationMs = Date.now() - toolStart
          onEvent({ type: 'tool-end', toolName: `${block.name} [MCP]`, toolId: block.id, result: result || '(빈 결과)', durationMs })
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result || '(빈 결과)' })

          logActivity({
            companyId: ctx.companyId, userId: ctx.userId, type: 'tool_call', phase: 'end',
            actorType: 'user', actorId: ctx.userId, action: 'mcp-tool-execute',
            detail: `MCP 도구 실행: ${block.name}`,
            metadata: { toolName: block.name, serverUrl: mcpTool.serverUrl, durationMs },
          })
        } catch (err) {
          const durationMs = Date.now() - toolStart
          const errMsg = err instanceof Error ? err.message : 'MCP 도구 실행 실패'
          onEvent({ type: 'tool-end', toolName: `${block.name} [MCP]`, toolId: block.id, result: errMsg, durationMs, error: true })
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: `[오류] ${errMsg}`, is_error: true })

          logActivity({
            companyId: ctx.companyId, userId: ctx.userId, type: 'tool_call', phase: 'error',
            actorType: 'user', actorId: ctx.userId, action: 'mcp-tool-execute',
            detail: `MCP 도구 실행 실패: ${block.name} — ${errMsg}`,
            metadata: { toolName: block.name, serverUrl: mcpTool.serverUrl, error: errMsg },
          })
        }
        continue
      }

      onEvent({ type: 'tool-start', toolName: block.name, toolId: block.id, input: inputStr })

      const toolRecord = toolRecords.find(t => t.name === block.name)
      if (!toolRecord) {
        const errResult = `도구 '${block.name}'을(를) 찾을 수 없습니다.`
        onEvent({ type: 'tool-end', toolName: block.name, toolId: block.id, result: errResult, durationMs: 0, error: true })
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: errResult, is_error: true })
        continue
      }

      const toolStart = Date.now()
      const result = await executeTool(block.name, block.input as Record<string, unknown>, toolExecCtx, toolRecord)
      const durationMs = Date.now() - toolStart
      const isError = result.startsWith('[오류]')
      onEvent({ type: 'tool-end', toolName: block.name, toolId: block.id, result, durationMs, error: isError || undefined })
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result, ...(isError ? { is_error: true } : {}) })
    }

    // 다음 라운드를 위해 히스토리 업데이트
    messages.push({ role: 'assistant', content: finalMessage.content })
    messages.push({ role: 'user', content: toolResults })
  }

  // MAX_TOOL_ROUNDS 초과 안내
  const limitMsg = '\n\n도구 호출 횟수 제한(5회)에 도달했습니다. 질문을 더 구체적으로 해주세요.'
  fullText += limitMsg
  onEvent({ type: 'token', content: limitMsg })
  onEvent({ type: 'done', sessionId: ctx.sessionId })
  return fullText
}
