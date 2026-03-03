import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { chatMessages, agents, agentMemory, cliCredentials } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { loadAgentTools, toClaudeTools, executeTool } from './tool-executor'
import { recordCost } from './cost-tracker'
import { decrypt } from './crypto'

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
    .orderBy(chatMessages.createdAt)
    .limit(20)

  // 3. 에이전트 장기 기억 로드
  const memories = await db
    .select({ key: agentMemory.key, value: agentMemory.value })
    .from(agentMemory)
    .where(eq(agentMemory.agentId, ctx.agentId))
    .limit(10)

  // 4. 에이전트에 할당된 도구 로드
  const toolRecords = await loadAgentTools(ctx.agentId, ctx.companyId)
  const claudeTools = toClaudeTools(toolRecords)

  // 5. 시스템 프롬프트 구성
  const memoryBlock = memories.length > 0
    ? `\n\n## 장기 기억\n${memories.map(m => `- ${m.key}: ${m.value}`).join('\n')}`
    : ''

  const toolBlock = toolRecords.length > 0
    ? `\n\n## 사용 가능한 도구\n${toolRecords.map(t => `- ${t.name}: ${t.description || ''}`).join('\n')}\n\n도구가 필요한 질문을 받으면 적극적으로 도구를 사용하세요.`
    : ''

  const systemPrompt = `${agent.soul || '당신은 도움이 되는 AI 비서입니다.'}

## 기본 정보
- 이름: ${agent.name}
- 역할: ${agent.role || '비서'}
- 항상 한국어로 답변합니다
- 간결하고 실용적으로 답변합니다${memoryBlock}${toolBlock}`

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
      ...(claudeTools.length > 0 ? { tools: claudeTools } : {}),
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
