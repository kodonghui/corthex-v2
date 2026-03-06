// 야간 작업 큐 엔진 — PostgreSQL 기반 폴링 워커
// Neon 서버리스 호환 (pg-boss 대신 자체 구현)

import { db } from '../db'
import { nightJobs, agents, chatSessions, chatMessages, agentMemory, reports } from '../db/schema'
import { eq, and, lte, asc } from 'drizzle-orm'
import { generateAgentResponse } from './ai'
import { orchestrateSecretary } from './orchestrator'
import { eventBus } from './event-bus'

const POLL_INTERVAL_MS = 30_000  // 30초마다 큐 확인
const MAX_RETRIES = 3

let workerTimer: ReturnType<typeof setInterval> | null = null

// 야간 작업 등록
export async function queueNightJob(params: {
  companyId: string
  userId: string
  agentId: string
  sessionId?: string
  instruction: string
  scheduledFor?: Date
  scheduleId?: string
  triggerId?: string
}) {
  const [job] = await db
    .insert(nightJobs)
    .values({
      companyId: params.companyId,
      userId: params.userId,
      agentId: params.agentId,
      sessionId: params.sessionId || null,
      instruction: params.instruction,
      scheduledFor: params.scheduledFor || new Date(),
      maxRetries: MAX_RETRIES,
      scheduleId: params.scheduleId || null,
      triggerId: params.triggerId || null,
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

// 진행률 이벤트 헬퍼
function emitProgress(companyId: string, jobId: string, progress: number, statusMessage: string) {
  eventBus.emit('night-job', {
    companyId,
    payload: { type: 'job-progress', jobId, progress, statusMessage },
  })
}

// 단일 작업 처리
async function processJob(job: typeof nightJobs.$inferSelect) {
  console.log(`🔄 야간 작업 처리 시작: ${job.id}`)
  const processStartedAt = Date.now()

  try {
    emitProgress(job.companyId, job.id, 0, '작업 준비 중...')

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

    emitProgress(job.companyId, job.id, 20, 'AI 분석 중...')

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

    emitProgress(job.companyId, job.id, 60, '응답 처리 중...')

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

    emitProgress(job.companyId, job.id, 80, '보고서 생성 중...')

    // 자동 보고서 생성
    let reportId: string | null = null
    try {
      const [report] = await db
        .insert(reports)
        .values({
          companyId: job.companyId,
          authorId: job.userId,
          title: `[야간] ${job.instruction.replace(/\n/g, ' ').slice(0, 50)}`,
          content: result,
          status: 'draft',
        })
        .returning()
      reportId = report.id
      console.log(`📝 야간 작업 보고서 생성: ${reportId}`)
    } catch (reportErr) {
      console.error(`⚠️ 야간 작업 보고서 생성 실패: ${job.id}`, reportErr)
    }

    // 작업 완료
    const resultData = { sessionId, reportId }
    await db
      .update(nightJobs)
      .set({
        status: 'completed',
        result,
        resultData,
        completedAt: new Date(),
        sessionId,
      })
      .where(eq(nightJobs.id, job.id))

    // 체인: 다음 작업 활성화 (이벤트 발행 전에 실행해야 UI가 즉시 반영됨)
    if (job.chainId) {
      await activateNextChainJob(job.id, job.chainId, job.companyId, result)
    }

    // WebSocket 이벤트 브로드캐스트
    const durationMs = Date.now() - processStartedAt
    eventBus.emit('night-job', {
      companyId: job.companyId,
      payload: { type: 'job-completed', jobId: job.id, resultData, durationMs, instruction: job.instruction },
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

      // 재시도 상태 변경 WebSocket 이벤트
      eventBus.emit('night-job', {
        companyId: job.companyId,
        payload: { type: 'job-retrying', jobId: job.id, retryCount: newRetryCount, maxRetries: job.maxRetries },
      })

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

      console.log(`💀 야간 작업 최종 실패: ${job.id} (재시도 ${job.maxRetries}회 초과)`)

      // WebSocket 이벤트 브로드캐스트
      eventBus.emit('night-job', {
        companyId: job.companyId,
        payload: { type: 'job-failed', jobId: job.id, errorCode: 'MAX_RETRIES_EXCEEDED', errorMessage: errorMsg, retryCount: newRetryCount, instruction: job.instruction },
      })

      // 체인: 후속 작업 전체 실패 처리
      if (job.chainId) {
        await failRemainingChainJobs(job.chainId, job.companyId)
      }
    }
  }
}

// 체인: 다음 blocked 작업을 queued로 활성화 + 이전 결과 주입
async function activateNextChainJob(parentJobId: string, chainId: string, companyId: string, previousResult: string) {
  const [nextJob] = await db
    .select()
    .from(nightJobs)
    .where(
      and(
        eq(nightJobs.parentJobId, parentJobId),
        eq(nightJobs.chainId, chainId),
        eq(nightJobs.status, 'blocked'),
      ),
    )
    .limit(1)

  if (!nextJob) return

  const enrichedInstruction = `[이전 작업 결과]\n${previousResult.slice(0, 500)}\n\n[현재 지시]\n${nextJob.instruction}`

  await db
    .update(nightJobs)
    .set({ status: 'queued', instruction: enrichedInstruction, scheduledFor: new Date() })
    .where(eq(nightJobs.id, nextJob.id))

  eventBus.emit('night-job', {
    companyId,
    payload: { type: 'job-queued', jobId: nextJob.id },
  })

  console.log(`🔗 체인 다음 작업 활성화: ${nextJob.id}`)
}

// 체인: 실패 시 남은 blocked 작업 전체 실패 처리
async function failRemainingChainJobs(chainId: string, companyId: string) {
  const updated = await db
    .update(nightJobs)
    .set({ status: 'failed', error: '이전 작업 실패로 취소됨', completedAt: new Date() })
    .where(
      and(
        eq(nightJobs.chainId, chainId),
        eq(nightJobs.status, 'blocked'),
      ),
    )
    .returning({ id: nightJobs.id })

  if (updated.length === 0) return

  eventBus.emit('night-job', {
    companyId,
    payload: { type: 'chain-failed', chainId, cancelledCount: updated.length },
  })

  console.log(`🔗 체인 실패: ${updated.length}개 후속 작업 취소됨`)
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
