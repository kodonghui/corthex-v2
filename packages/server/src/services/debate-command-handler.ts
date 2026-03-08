import { eq, and } from 'drizzle-orm'
import { db } from '../db'
import { commands, agents } from '../db/schema'
import { createDebate, startDebate, getDebate } from './agora-engine'
import { delegationTracker } from './delegation-tracker'
import type { DebateType, DebateResult, DebateRound, ConsensusResult } from '@corthex/shared'

// === Types ===

export type ProcessDebateCommandOptions = {
  commandId: string
  topic: string
  debateType: DebateType
  companyId: string
  userId: string
}

type DebateParticipantCandidate = {
  id: string
  name: string
  role: string | null
  tier: string
}

// === Constants ===

const MIN_PARTICIPANTS = 2
const MAX_PARTICIPANTS = 5
const POLL_INTERVAL_MS = 2_000
const MAX_POLL_DURATION_MS = 300_000

// === Participant Selection ===

export async function selectDebateParticipants(
  companyId: string,
): Promise<DebateParticipantCandidate[]> {
  // Query active agents: Manager/Specialist only, exclude secretary
  const candidates = await db
    .select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      tier: agents.tier,
    })
    .from(agents)
    .where(
      and(
        eq(agents.companyId, companyId),
        eq(agents.isActive, true),
        eq(agents.isSecretary, false),
      ),
    )

  // Filter to Manager/Specialist tiers (exclude Worker)
  const eligible = candidates.filter(a => a.tier === 'manager' || a.tier === 'specialist')

  if (eligible.length < MIN_PARTICIPANTS) {
    throw new Error('DEBATE_INSUFFICIENT_AGENTS: 토론에 참여할 수 있는 에이전트가 2명 미만입니다')
  }

  // Select up to MAX_PARTICIPANTS (prioritize managers first, then specialists)
  const managers = eligible.filter(a => a.tier === 'manager')
  const specialists = eligible.filter(a => a.tier === 'specialist')
  const selected = [...managers, ...specialists].slice(0, MAX_PARTICIPANTS)

  return selected
}

// === Report Formatting ===

const CONSENSUS_LABELS: Record<ConsensusResult, string> = {
  consensus: '합의 ✅',
  dissent: '비합의 ❌',
  partial: '부분합의 ⚠️',
}

const DEBATE_TYPE_LABELS: Record<DebateType, string> = {
  'debate': '일반 토론',
  'deep-debate': '심층 토론',
}

export function formatDebateReport(
  topic: string,
  debateType: DebateType,
  participants: { agentId: string; agentName: string; role: string }[],
  rounds: DebateRound[],
  result: DebateResult | null,
): string {
  const lines: string[] = []

  lines.push('## 🏛️ AGORA 토론 결과')
  lines.push('')
  lines.push(`**주제:** ${topic}`)
  lines.push(`**유형:** ${DEBATE_TYPE_LABELS[debateType] || debateType}`)
  lines.push(`**결과:** ${result ? CONSENSUS_LABELS[result.consensus] || result.consensus : '판정 없음'}`)
  lines.push('')

  // Participants
  lines.push('### 참여자')
  for (const p of participants) {
    lines.push(`- ${p.agentName} (${p.role})`)
  }
  lines.push('')

  // Summary
  if (result) {
    lines.push('### 토론 요약')
    lines.push(result.summary || '(요약 없음)')
    lines.push('')

    if (result.majorityPosition) {
      lines.push('### 다수파 의견')
      lines.push(result.majorityPosition)
      lines.push('')
    }

    if (result.minorityPosition) {
      lines.push('### 소수파 의견')
      lines.push(result.minorityPosition)
      lines.push('')
    }

    if (result.keyArguments && result.keyArguments.length > 0) {
      lines.push('### 핵심 논점')
      for (let i = 0; i < result.keyArguments.length; i++) {
        lines.push(`${i + 1}. ${result.keyArguments[i]}`)
      }
      lines.push('')
    }
  }

  // Round details
  if (rounds.length > 0) {
    lines.push('### 라운드 상세')
    for (const round of rounds) {
      lines.push(`#### 라운드 ${round.roundNum}`)
      for (const speech of round.speeches) {
        lines.push(`- **${speech.agentName}**: ${speech.content}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// === Polling for debate completion ===

async function waitForDebateCompletion(
  debateId: string,
  companyId: string,
  commandId: string,
  totalRounds: number,
): Promise<typeof import('../db/schema').debates.$inferSelect | null> {
  const startTime = Date.now()
  let lastRoundCount = 0

  while (Date.now() - startTime < MAX_POLL_DURATION_MS) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))

    const debate = await getDebate(debateId, companyId)
    if (!debate) return null

    // Emit round progress events
    const currentRounds = (debate.rounds as DebateRound[]) || []
    if (currentRounds.length > lastRoundCount) {
      for (let i = lastRoundCount; i < currentRounds.length; i++) {
        delegationTracker.debateRoundProgress(companyId, commandId, {
          debateId,
          roundNum: currentRounds[i].roundNum,
          totalRounds,
        })
      }
      lastRoundCount = currentRounds.length
    }

    if (debate.status === 'completed' || debate.status === 'failed') {
      return debate
    }
  }

  return null // timeout
}

// === Main Processing ===

export async function processDebateCommand(options: ProcessDebateCommandOptions): Promise<void> {
  const { commandId, topic, debateType, companyId, userId } = options

  // Update command to processing
  await db.update(commands)
    .set({ status: 'processing' })
    .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  delegationTracker.startCommand(companyId, commandId)

  try {
    // Validate topic
    if (!topic || topic.trim().length === 0) {
      throw new Error('DEBATE_TOPIC_REQUIRED: 토론 주제를 입력하세요. 사용법: /토론 [주제]')
    }

    // Select participants
    const participants = await selectDebateParticipants(companyId)
    const participantAgentIds = participants.map(p => p.id)

    // Create debate via AGORA engine
    const debate = await createDebate({
      companyId,
      topic: topic.trim(),
      debateType,
      participantAgentIds,
      createdBy: userId,
    })

    // Emit debate started event
    delegationTracker.debateStarted(companyId, commandId, {
      debateId: debate.id,
      topic: debate.topic,
      participants: participants.map(p => p.name),
    })

    // Store debateId in command metadata
    const [cmd] = await db
      .select({ metadata: commands.metadata })
      .from(commands)
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

    const existingMeta = (cmd?.metadata ?? {}) as Record<string, unknown>
    await db.update(commands)
      .set({ metadata: { ...existingMeta, debateId: debate.id } })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

    // Start debate (async execution in AGORA engine)
    await startDebate(debate.id, companyId)

    // Wait for completion
    const completedDebate = await waitForDebateCompletion(
      debate.id,
      companyId,
      commandId,
      debate.maxRounds,
    )

    if (!completedDebate) {
      throw new Error('DEBATE_TIMEOUT: 토론이 시간 내에 완료되지 않았습니다')
    }

    if (completedDebate.status === 'failed') {
      throw new Error(`DEBATE_FAILED: 토론 실행 중 오류 발생: ${completedDebate.error || '알 수 없는 오류'}`)
    }

    // Format report
    const debateParticipants = (completedDebate.participants as { agentId: string; agentName: string; role: string }[]) || []
    const debateRounds = (completedDebate.rounds as DebateRound[]) || []
    const debateResult = (completedDebate.result as DebateResult | null)

    const report = formatDebateReport(
      completedDebate.topic,
      completedDebate.debateType as DebateType,
      debateParticipants,
      debateRounds,
      debateResult,
    )

    // Emit completion
    delegationTracker.debateCompleted(companyId, commandId, {
      debateId: debate.id,
      consensus: debateResult?.consensus || 'partial',
      summary: debateResult?.summary || '',
    })

    // Update command with result
    delegationTracker.completed(companyId, commandId)

    await db.update(commands)
      .set({
        status: 'completed',
        result: report,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    delegationTracker.failed(companyId, commandId, errorMsg)

    await db.update(commands)
      .set({
        status: 'failed',
        result: errorMsg,
        completedAt: new Date(),
      })
      .where(and(eq(commands.id, commandId), eq(commands.companyId, companyId)))
  }
}
