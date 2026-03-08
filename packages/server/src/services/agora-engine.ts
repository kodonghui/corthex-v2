import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db'
import { debates, agents } from '../db/schema'
import { agentRunner } from './agent-runner'
import { eventBus } from '../lib/event-bus'
import type { AgentConfig } from './agent-runner'
import type { LLMRouterContext } from './llm-router'
import type {
  DebateType,
  DebateStatus,
  ConsensusResult,
  DebateRound,
  DebateSpeech,
  DebateResult,
} from '@corthex/shared'

// === Constants ===

const DEFAULT_ROUNDS: Record<DebateType, number> = {
  'debate': 2,
  'deep-debate': 3,
}

const MAX_SPEECH_LENGTH = 500

const ROUND_PROMPTS: Record<number, string> = {
  1: '다음 주제에 대해 당신의 전문 분야 관점에서 입장과 근거를 300자 이내로 제시하세요.',
  2: '이전 참여자들의 의견을 고려하여, 반론하거나 보완하세요. 300자 이내로 답하세요.',
  3: '지금까지의 토론을 종합하여, 당신의 최종 입장을 200자 이내로 정리하세요.',
}

// === Types ===

export type CreateDebateParams = {
  companyId: string
  topic: string
  debateType?: DebateType
  participantAgentIds: string[]
  createdBy: string
  maxRounds?: number
}

type DebateParticipant = {
  agentId: string
  agentName: string
  role: string
}

// === Debate Event Hook (for future WebSocket integration in E11-S3) ===

function emitDebateEvent(companyId: string, eventType: string, payload: unknown): void {
  eventBus.emit('debate', { companyId, payload: { type: eventType, ...payload as Record<string, unknown> } })
}

// === AGORA Engine ===

export async function createDebate(params: CreateDebateParams) {
  const { companyId, topic, debateType = 'debate', participantAgentIds, createdBy, maxRounds } = params

  const trimmedTopic = (topic || '').trim()
  if (trimmedTopic.length === 0) {
    throw new Error('DEBATE_TOPIC_REQUIRED: 토론 주제를 입력하세요')
  }

  if (!participantAgentIds || participantAgentIds.length < 2) {
    throw new Error('DEBATE_MIN_PARTICIPANTS: 최소 2명의 참여 에이전트가 필요합니다')
  }

  // Validate agents exist and belong to company
  const agentRows = await db
    .select({ id: agents.id, name: agents.name, role: agents.role })
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.isActive, true)))

  const agentMap = new Map(agentRows.map(a => [a.id, a]))
  const participants: DebateParticipant[] = []

  for (const agentId of participantAgentIds) {
    const agent = agentMap.get(agentId)
    if (!agent) {
      throw new Error(`DEBATE_AGENT_NOT_FOUND: 에이전트를 찾을 수 없습니다: ${agentId}`)
    }
    participants.push({ agentId: agent.id, agentName: agent.name, role: agent.role || 'specialist' })
  }

  const resolvedMaxRounds = maxRounds ?? DEFAULT_ROUNDS[debateType]

  const [debate] = await db
    .insert(debates)
    .values({
      companyId,
      topic: trimmedTopic,
      debateType,
      status: 'pending',
      maxRounds: resolvedMaxRounds,
      participants,
      rounds: [],
      createdBy,
    })
    .returning()

  return debate
}

export async function startDebate(debateId: string, companyId: string) {
  // Load debate
  const [debate] = await db
    .select()
    .from(debates)
    .where(and(eq(debates.id, debateId), eq(debates.companyId, companyId)))

  if (!debate) {
    throw new Error('DEBATE_NOT_FOUND: 토론을 찾을 수 없습니다')
  }

  if (debate.status !== 'pending') {
    throw new Error(`DEBATE_INVALID_STATUS: 토론 상태가 pending이 아닙니다: ${debate.status}`)
  }

  // Update to in-progress
  await db
    .update(debates)
    .set({ status: 'in-progress' as DebateStatus, startedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(debates.id, debateId), eq(debates.companyId, companyId)))

  emitDebateEvent(companyId, 'debate-started', { debateId, topic: debate.topic })

  // Run rounds asynchronously
  executeDebateRounds(debateId, companyId, debate).catch(async (err) => {
    await handleDebateError(debateId, err)
  })

  return { ...debate, status: 'in-progress' as DebateStatus }
}

async function executeDebateRounds(
  debateId: string,
  companyId: string,
  debate: typeof debates.$inferSelect,
) {
  const participants = debate.participants as DebateParticipant[]
  const allRounds: DebateRound[] = []

  // Load agent configs for participants
  const agentRows = await db
    .select()
    .from(agents)
    .where(and(eq(agents.companyId, companyId), eq(agents.isActive, true)))

  const agentMap = new Map(agentRows.map(a => [a.id, a]))

  const context: LLMRouterContext = {
    companyId,
    agentId: 'agora-engine',
    agentName: 'AGORA Engine',
    source: 'delegation',
  }

  for (let roundNum = 1; roundNum <= debate.maxRounds; roundNum++) {
    emitDebateEvent(companyId, 'round-started', { debateId, roundNum })

    const speeches: DebateSpeech[] = []

    for (const participant of participants) {
      const agentRow = agentMap.get(participant.agentId)
      if (!agentRow) continue

      const agentConfig: AgentConfig = {
        id: agentRow.id,
        companyId,
        name: agentRow.name,
        nameEn: agentRow.nameEn,
        tier: agentRow.tier as 'manager' | 'specialist' | 'worker',
        modelName: agentRow.modelName || 'claude-sonnet-4-6',
        soul: agentRow.soul,
        allowedTools: [],
        isActive: true,
      }

      const prompt = buildSpeechPrompt(debate.topic, participant, roundNum, allRounds)

      try {
        const result = await agentRunner.execute(
          agentConfig,
          { messages: [{ role: 'user', content: prompt }] },
          context,
        )

        const content = (result.content || '').slice(0, MAX_SPEECH_LENGTH)

        const speech: DebateSpeech = {
          agentId: participant.agentId,
          agentName: participant.agentName,
          content,
          position: extractPosition(content),
          createdAt: new Date().toISOString(),
        }

        speeches.push(speech)
        emitDebateEvent(companyId, 'agent-spoke', { debateId, roundNum, speech })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        speeches.push({
          agentId: participant.agentId,
          agentName: participant.agentName,
          content: `[발언 실패: ${errorMsg}]`,
          position: 'error',
          createdAt: new Date().toISOString(),
        })
      }
    }

    const round: DebateRound = { roundNum, speeches }
    allRounds.push(round)

    // Save rounds after each round
    await db
      .update(debates)
      .set({ rounds: allRounds, updatedAt: new Date() })
      .where(eq(debates.id, debateId))

    emitDebateEvent(companyId, 'round-ended', { debateId, roundNum })
  }

  // Detect consensus
  const result = await detectConsensus(debate.topic, allRounds, participants, context, agentMap)

  // Update to completed
  await db
    .update(debates)
    .set({
      status: 'completed' as DebateStatus,
      rounds: allRounds,
      result,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(debates.id, debateId))

  emitDebateEvent(companyId, 'debate-done', { debateId, result })
}

export function buildSpeechPrompt(
  topic: string,
  participant: DebateParticipant,
  roundNum: number,
  previousRounds: DebateRound[],
): string {
  const parts: string[] = []

  parts.push(`당신은 ${participant.agentName}(${participant.role})입니다.`)
  parts.push(`주제: ${topic}`)

  if (roundNum === 1 || previousRounds.length === 0) {
    parts.push(ROUND_PROMPTS[1])
  } else {
    // Include previous round speeches as context
    parts.push('\n--- 이전 토론 내용 ---')
    for (const round of previousRounds) {
      parts.push(`\n[라운드 ${round.roundNum}]`)
      for (const speech of round.speeches) {
        if (speech.position !== 'error') {
          parts.push(`${speech.agentName}: ${speech.content}`)
        }
      }
    }
    parts.push('\n--- 이전 토론 끝 ---\n')
    parts.push(ROUND_PROMPTS[roundNum] || ROUND_PROMPTS[2])
  }

  return parts.join('\n')
}

export async function detectConsensus(
  topic: string,
  rounds: DebateRound[],
  participants: DebateParticipant[],
  context: LLMRouterContext,
  agentMap: Map<string, typeof agents.$inferSelect>,
): Promise<DebateResult> {
  // Use first participant as synthesis agent (or fallback)
  const firstAgent = agentMap.get(participants[0]?.agentId)

  const synthesisConfig: AgentConfig = firstAgent ? {
    id: firstAgent.id,
    companyId: context.companyId,
    name: firstAgent.name,
    nameEn: firstAgent.nameEn,
    tier: 'manager',
    modelName: firstAgent.modelName || 'claude-sonnet-4-6',
    soul: null,
    allowedTools: [],
    isActive: true,
  } : {
    id: 'agora-synthesis',
    companyId: context.companyId,
    name: 'AGORA 종합관',
    tier: 'manager',
    modelName: 'claude-sonnet-4-6',
    soul: null,
    allowedTools: [],
    isActive: true,
  }

  const allSpeeches = rounds.flatMap(r =>
    r.speeches.filter(s => s.position !== 'error').map(s => `[라운드 ${r.roundNum}] ${s.agentName}: ${s.content}`)
  ).join('\n')

  const prompt = `다음 토론의 모든 발언을 분석하여 합의 결과를 JSON으로 반환하세요.

주제: ${topic}
참여자: ${participants.map(p => p.agentName).join(', ')}

토론 내용:
${allSpeeches}

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "consensus": "consensus" | "dissent" | "partial",
  "summary": "토론 결과 종합 요약 (200자 이내)",
  "majorityPosition": "다수파 의견 요약",
  "minorityPosition": "소수파 의견 요약 (없으면 빈 문자열)",
  "keyArguments": ["핵심 논점 1", "핵심 논점 2", "핵심 논점 3"]
}`

  try {
    const result = await agentRunner.execute(
      synthesisConfig,
      { messages: [{ role: 'user', content: prompt }] },
      context,
    )

    const parsed = parseConsensusResponse(result.content || '', rounds.length)
    return parsed
  } catch {
    // Fallback: determine consensus from positions
    return synthesizeFallback(rounds, participants)
  }
}

function parseConsensusResponse(content: string, roundCount: number): DebateResult {
  // Try to extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      consensus: 'partial',
      summary: content.slice(0, 200),
      majorityPosition: '',
      minorityPosition: '',
      keyArguments: [],
      roundCount,
    }
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    const validConsensus: ConsensusResult[] = ['consensus', 'dissent', 'partial']
    return {
      consensus: validConsensus.includes(parsed.consensus) ? parsed.consensus : 'partial',
      summary: String(parsed.summary || '').slice(0, 500),
      majorityPosition: String(parsed.majorityPosition || ''),
      minorityPosition: String(parsed.minorityPosition || ''),
      keyArguments: Array.isArray(parsed.keyArguments) ? parsed.keyArguments.map(String).slice(0, 10) : [],
      roundCount,
    }
  } catch {
    return {
      consensus: 'partial',
      summary: content.slice(0, 200),
      majorityPosition: '',
      minorityPosition: '',
      keyArguments: [],
      roundCount,
    }
  }
}

function synthesizeFallback(rounds: DebateRound[], participants: DebateParticipant[]): DebateResult {
  const allSpeeches = rounds.flatMap(r => r.speeches.filter(s => s.position !== 'error'))
  const positions = allSpeeches.map(s => s.position)
  const uniquePositions = [...new Set(positions.filter(p => p && p !== 'error'))]

  let consensus: ConsensusResult = 'partial'
  if (uniquePositions.length <= 1) {
    consensus = 'consensus'
  } else if (uniquePositions.length >= participants.length) {
    consensus = 'dissent'
  }

  return {
    consensus,
    summary: `${participants.length}명이 ${rounds.length}라운드 토론. ${uniquePositions.length}개 입장 도출.`,
    majorityPosition: allSpeeches[0]?.content?.slice(0, 200) || '',
    minorityPosition: allSpeeches.length > 1 ? allSpeeches[allSpeeches.length - 1]?.content?.slice(0, 200) || '' : '',
    keyArguments: allSpeeches.slice(0, 3).map(s => s.content.slice(0, 100)),
    roundCount: rounds.length,
  }
}

function extractPosition(content: string): string {
  // Simple heuristic: first sentence or first 50 chars
  const firstSentence = content.split(/[.!?。]/)[0]?.trim() || ''
  return firstSentence.slice(0, 100) || content.slice(0, 100)
}

async function handleDebateError(debateId: string, err: unknown): Promise<void> {
  const errorMsg = err instanceof Error ? err.message : String(err)
  await db
    .update(debates)
    .set({
      status: 'failed' as DebateStatus,
      error: errorMsg,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(debates.id, debateId))
}

// === Query Functions ===

export async function getDebate(debateId: string, companyId: string) {
  const [debate] = await db
    .select()
    .from(debates)
    .where(and(eq(debates.id, debateId), eq(debates.companyId, companyId)))

  return debate || null
}

export async function listDebates(companyId: string, limit = 20, offset = 0) {
  const results = await db
    .select()
    .from(debates)
    .where(eq(debates.companyId, companyId))
    .orderBy(desc(debates.createdAt))
    .limit(limit)
    .offset(offset)

  return results
}
