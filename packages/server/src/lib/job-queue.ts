// 야간 작업 큐 엔진 — PostgreSQL 기반 폴링 워커
// Neon 서버리스 호환 (pg-boss 대신 자체 구현)

import { db } from '../db'
import { nightJobs, agents, chatSessions, chatMessages, agentMemory, reports } from '../db/schema'
import { eq, and, lte, asc } from 'drizzle-orm'
import { generateAgentResponse } from './ai'
import { orchestrateSecretary } from './orchestrator'
import { broadcastToCompany } from '../ws/channels'

const POLL_INTERVAL_MS = 30_000  // 30초마다 큐 확인
const MAX_RETRIES = 3

let workerTimer: ReturnType<typeof setInterval> | null = null

// 야간 작업 등록
export async function queueNightJob(params: {
  companyId: string
  userId: string
  agentId: string
  sessionId?: string
  scheduleId?: string
  triggerId?: string
  instruction: string
  scheduledFor?: Date
}) {
  const [job] = await db
    .insert(nightJobs)
    .values({
      companyId: params.companyId,
      userId: params.userId,
      agentId: params.agentId,
      sessionId: params.sessionId || null,
      scheduleId: params.scheduleId || null,
      triggerId: params.triggerId || null,
      instruction: params.instruction,
      scheduledFor: params.scheduledFor || new Date(),
      maxRetries: MAX_RETRIES,
    })
    .returning()

  console.log(`📋 야간 작업 등록: ${job.id} — "${params.instruction.slice(0, 50)}..."`)
  return job
}

// 다음 처리할 작업 선택 (FIFO, 스케줄 시간 도달한 것만)
async function pickNextJob() {
  const now = new Date()

  const [job] = await db
    .select()
    .from(nightJobs)
    .where(
      and(
        eq(nightJobs.status, 'queued'),
        lte(nightJobs.scheduledFor, now),
      ),
    )
    .orderBy(asc(nightJobs.createdAt))
    .limit(1)

  if (!job) return null

  // 상태를 processing으로 변경 (락 역할)
  await db
    .update(nightJobs)
    .set({ status: 'processing', startedAt: new Date() })
    .where(eq(nightJobs.id, job.id))

  return job
}

// 단일 작업 처리
async function processJob(job: typeof nightJobs.$inferSelect) {
  console.log(`🔄 야간 작업 처리 시작: ${job.id}`)

  // WS: 작업 시작 알림
  broadcastToCompany(job.companyId, 'night-jobs', {
    type: 'job-progress', jobId: job.id, statusMessage: '작업 처리 중...',
  })

  try {
    // 에이전트 정보 확인
    const [agent] = await db
      .select({ id: agents.id, isSecretary: agents.isSecretary, name: agents.name })
      .from(agents)
      .where(eq(agents.id, job.agentId))
      .limit(1)

    if (!agent) throw new Error('에이전트를 찾을 수 없습니다')

    // 세션이 없으면 생성
    let sessionId = job.sessionId
    if (!sessionId) {
      const [session] = await db
        .insert(chatSessions)
        .values({
          companyId: job.companyId,
          userId: job.userId,
          agentId: job.agentId,
          title: `[야간] ${job.instruction.slice(0, 30)}...`,
        })
        .returning()
      sessionId = session.id
    }

    // 유저 메시지 저장 (작업 지시)
    await db.insert(chatMessages).values({
      companyId: job.companyId,
      sessionId,
      sender: 'user',
      content: `[야간 작업] ${job.instruction}`,
    })

    // AI 응답 생성
    let result: string
    if (agent.isSecretary) {
      result = await orchestrateSecretary({
        secretaryAgentId: job.agentId,
        sessionId,
        companyId: job.companyId,
        userMessage: job.instruction,
        userId: job.userId,
      })
    } else {
      result = await generateAgentResponse({
        agentId: job.agentId,
        sessionId,
        companyId: job.companyId,
        userMessage: job.instruction,
        userId: job.userId,
      })
    }

    // 에이전트 응답 메시지 저장
    await db.insert(chatMessages).values({
      companyId: job.companyId,
      sessionId,
      sender: 'agent',
      content: result,
    })

    // 에이전트 메모리에 결과 저장
    await db.insert(agentMemory).values({
      companyId: job.companyId,
      agentId: job.agentId,
      key: `야간작업_${new Date().toISOString().slice(0, 10)}`,
      value: `지시: ${job.instruction}\n결과: ${result.slice(0, 500)}`,
      metadata: { jobId: job.id },
    })

    // 자동 보고서 생성
    let reportId: string | null = null
    try {
      const now = new Date()
      const [report] = await db.insert(reports).values({
        companyId: job.companyId,
        authorId: job.userId,
        title: `[야간] ${agent.name} — ${job.instruction.slice(0, 50)}`,
        content: `## 야간 작업 결과\n\n**에이전트:** ${agent.name}\n**실행 시간:** ${now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}\n**지시:** ${job.instruction}\n\n---\n\n${result}`,
        status: 'draft',
      }).returning()
      reportId = report.id
      console.log(`📝 자동 보고서 생성: ${report.id}`)
    } catch (reportErr) {
      console.error(`⚠️ 자동 보고서 생성 실패 (작업은 완료):`, reportErr)
    }

    // 작업 완료
    await db
      .update(nightJobs)
      .set({
        status: 'completed',
        result,
        resultData: reportId ? { reportId } : null,
        completedAt: new Date(),
        sessionId,
      })
      .where(eq(nightJobs.id, job.id))

    // WS: 작업 완료 알림
    broadcastToCompany(job.companyId, 'night-jobs', {
      type: 'job-completed',
      jobId: job.id,
      durationMs: job.startedAt ? Date.now() - new Date(job.startedAt).getTime() : 0,
      reportId: reportId || null,
    })

    console.log(`✅ 야간 작업 완료: ${job.id}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류'
    console.error(`❌ 야간 작업 실패: ${job.id} —`, errorMsg)

    const newRetryCount = job.retryCount + 1

    if (newRetryCount < job.maxRetries) {
      // 재시도: 지수 백오프 (30초 → 60초 → 120초)
      const backoffMs = 30_000 * Math.pow(2, newRetryCount - 1)
      const retryAt = new Date(Date.now() + backoffMs)

      await db
        .update(nightJobs)
        .set({
          status: 'queued',
          retryCount: newRetryCount,
          error: errorMsg,
          scheduledFor: retryAt,
        })
        .where(eq(nightJobs.id, job.id))

      console.log(`🔁 재시도 예약 (${newRetryCount}/${job.maxRetries}): ${retryAt.toISOString()}`)
    } else {
      // 최대 재시도 초과 → 실패 확정
      await db
        .update(nightJobs)
        .set({
          status: 'failed',
          retryCount: newRetryCount,
          error: `[재시도 ${job.maxRetries}회 초과] ${errorMsg}`,
          completedAt: new Date(),
        })
        .where(eq(nightJobs.id, job.id))

      // WS: 최종 실패 알림
      broadcastToCompany(job.companyId, 'night-jobs', {
        type: 'job-failed',
        jobId: job.id,
        errorMessage: errorMsg,
        retryCount: newRetryCount,
      })

      console.log(`💀 야간 작업 최종 실패: ${job.id} (재시도 ${job.maxRetries}회 초과)`)
    }
  }
}

// 폴링 워커 1회 실행
async function pollOnce() {
  try {
    const job = await pickNextJob()
    if (job) {
      await processJob(job)
    }
  } catch (err) {
    console.error('야간 워커 폴링 오류:', err)
  }
}

// 워커 시작
export function startJobWorker() {
  if (workerTimer) return
  console.log(`🌙 야간 작업 워커 시작 (폴링 간격: ${POLL_INTERVAL_MS / 1000}초)`)
  workerTimer = setInterval(pollOnce, POLL_INTERVAL_MS)
  // 즉시 1회 실행
  pollOnce()
}

// 워커 중지
export function stopJobWorker() {
  if (workerTimer) {
    clearInterval(workerTimer)
    workerTimer = null
    console.log('🛑 야간 작업 워커 중지')
  }
}
