import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db'
import { chatMessages, agents, agentMemory } from '../db/schema'
import { eq, and } from 'drizzle-orm'

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다')
  return new Anthropic({ apiKey })
}

type ChatContext = {
  agentId: string
  sessionId: string
  companyId: string
  userMessage: string
}

export async function generateAgentResponse(ctx: ChatContext): Promise<string> {
  const client = getClient()

  // 1. 에이전트 soul 로드
  const [agent] = await db
    .select({ name: agents.name, role: agents.role, soul: agents.soul })
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

  // 4. 시스템 프롬프트 구성
  const memoryBlock = memories.length > 0
    ? `\n\n## 장기 기억\n${memories.map(m => `- ${m.key}: ${m.value}`).join('\n')}`
    : ''

  const systemPrompt = `${agent.soul || '당신은 도움이 되는 AI 비서입니다.'}

## 기본 정보
- 이름: ${agent.name}
- 역할: ${agent.role || '비서'}
- 항상 한국어로 답변합니다
- 간결하고 실용적으로 답변합니다${memoryBlock}`

  // 5. 메시지 배열 구성
  const messages: Anthropic.MessageParam[] = history.map((msg) => ({
    role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
    content: msg.content,
  }))

  // 현재 메시지 추가
  messages.push({ role: 'user', content: ctx.userMessage })

  // 6. Claude API 호출
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  })

  // 텍스트 응답 추출
  const textBlock = response.content.find(b => b.type === 'text')
  return textBlock?.text || '응답을 생성할 수 없습니다.'
}
