/**
 * 크론 실행 엔진 — nightJobSchedules 폴링 → 직접 실행 → cronRuns 기록
 * schedule-worker.ts의 간접 nightJobs 큐 대신 직접 실행 + 전용 실행 기록
 */

import { db } from '../db'
import { nightJobSchedules, cronRuns, agents, chatSessions, chatMessages, agentMemory, reports } from '../db/schema'
import { eq, and, lte, or, isNull } from 'drizzle-orm'
import { getNextCronDate } from '../lib/cron-utils'
import { generateAgentResponse } from '../lib/ai'
import { orchestrateSecretary } from '../lib/orchestrator'
import { eventBus } from '../lib/event-bus'

// === Configuration ===

const POLL_INTERVAL_MS = 60_000 // 60초마다 폴링
const MAX_CONCURRENT_CRON_JOBS = 5 // 동시 실행 제한
const MAX_RETRIES = 3 // 최대 재시도 횟수
const SHUTDOWN_TIMEOUT_MS = 30_000 // graceful shutdown 대기 시간
const MAX_REPORT_CONTENT = 50_000 // 보고서 최대 길이

// === State ===

let pollTimer: ReturnType<typeof setInterval> | null = null
const runningJobs = new Set<string>() // 현재 실행 중인 scheduleId 집합
let shuttingDown = false
const runningPromises = new Map<string, Promise<void>>() // graceful shutdown용

// === Types ===

type ScheduleRow = typeof nightJobSchedules.$inferSelect

// === Utilities ===

/**
 * shuttingDown 시 즉시 반환되는 sleep (불필요한 대기 방지)
 */
async function interruptibleSleep(ms: number): Promise<void> {
  const checkInterval = 1000 // 1초마다 shuttingDown 체크
  let elapsed = 0
  while (elapsed < ms && !shuttingDown) {
    await new Promise(resolve => setTimeout(resolve, Math.min(checkInterval, ms - elapsed)))
    elapsed += checkInterval
  }
}

// === Core Engine ===

/**
 * 예정된 스케줄을 폴링하고 실행합니다.
 */
async function pollDueSchedules() {
  if (shuttingDown) return

  try {
    const now = new Date()

    // isActive + (nextRunAt <= now) 조건으로 실행 대상 조회
    // 한 폴링당 최대 50건 조회 — 대량 스케줄 시 블로킹 방지
    const dueSchedules = await db
      .select()
      .from(nightJobSchedules)
      .where(
        and(
          eq(nightJobSchedules.isActive, true),
          or(
            lte(nightJobSchedules.nextRunAt, now),
            isNull(nightJobSchedules.nextRunAt),
          ),
        ),
      )
      .limit(50)

    for (const schedule of dueSchedules) {
      if (shuttingDown) break

      // 이미 실행 중인 스케줄은 건너뛰기 (중복 실행 방지)
      if (runningJobs.has(schedule.id)) {
        continue
      }

      // 동시 실행 제한 체크
      if (runningJobs.size >= MAX_CONCURRENT_CRON_JOBS) {
        console.log(`⏸️ 크론 동시 실행 제한 도달 (${MAX_CONCURRENT_CRON_JOBS}개) — 나머지 스케줄 다음 폴링으로 연기`)
        break
      }

      // nextRunAt을 먼저 갱신하여 중복 실행 방지 (optimistic lock)
      try {
        const nextRun = getNextCronDate(schedule.cronExpression, now)
        await db
          .update(nightJobSchedules)
          .set({ nextRunAt: nextRun, updatedAt: new Date() })
          .where(eq(nightJobSchedules.id, schedule.id))

        // 비동기로 실행 (블로킹하지 않음)
        runningJobs.add(schedule.id)
        const promise = executeCronJob(schedule).finally(() => {
          runningJobs.delete(schedule.id)
          runningPromises.delete(schedule.id)
        })
        runningPromises.set(schedule.id, promise)

        console.log(`📅 크론 실행 시작: "${schedule.name}" (${schedule.id}) — 다음 실행: ${nextRun.toISOString()}`)
      } catch (err) {
        console.error(`❌ 크론 스케줄 처리 실패 (${schedule.id}):`, err instanceof Error ? err.message : err)
      }
    }
  } catch (err) {
    console.error('크론 엔진 폴링 오류:', err)
  }
}

/**
 * 단일 크론 작업을 실행하고 cronRuns에 기록합니다.
 */
async function executeCronJob(schedule: ScheduleRow, retryCount = 0): Promise<void> {
  const startTime = Date.now()

  // cronRuns 레코드 생성 (status=running) — DB 실패 시 전체 작업 중단
  let run: { id: string }
  try {
    const [inserted] = await db
      .insert(cronRuns)
      .values({
        companyId: schedule.companyId,
        cronJobId: schedule.id,
        status: 'running',
        commandText: schedule.instruction,
        startedAt: new Date(),
      })
      .returning()
    run = inserted
  } catch (insertErr) {
    console.error(`❌ cronRuns 생성 실패 (${schedule.id}):`, insertErr instanceof Error ? insertErr.message : insertErr)
    return // DB 연결 실패 등 — 실행 불가
  }

  // WebSocket: 실행 시작 알림
  eventBus.emit('night-job', {
    companyId: schedule.companyId,
    payload: {
      type: 'cron-run-started',
      scheduleId: schedule.id,
      scheduleName: schedule.name,
      runId: run.id,
    },
  })

  try {
    // 에이전트 정보 확인
    const [agent] = await db
      .select({ id: agents.id, isSecretary: agents.isSecretary, name: agents.name })
      .from(agents)
      .where(eq(agents.id, schedule.agentId))
      .limit(1)

    if (!agent) throw new Error('에이전트를 찾을 수 없습니다')

    // 세션 생성
    const [session] = await db
      .insert(chatSessions)
      .values({
        companyId: schedule.companyId,
        userId: schedule.userId,
        agentId: schedule.agentId,
        title: `[크론] ${schedule.name}`,
      })
      .returning()

    // 유저 메시지 저장 (작업 지시)
    await db.insert(chatMessages).values({
      companyId: schedule.companyId,
      sessionId: session.id,
      sender: 'user',
      content: `[크론 자동실행] ${schedule.instruction}`,
    })

    // AI 응답 생성 — secretary or regular agent
    let result: string
    if (agent.isSecretary) {
      result = await orchestrateSecretary({
        secretaryAgentId: schedule.agentId,
        sessionId: session.id,
        companyId: schedule.companyId,
        userMessage: schedule.instruction,
        userId: schedule.userId,
      })
    } else {
      result = await generateAgentResponse({
        agentId: schedule.agentId,
        sessionId: session.id,
        companyId: schedule.companyId,
        userMessage: schedule.instruction,
        userId: schedule.userId,
      })
    }

    // 에이전트 응답 메시지 저장
    await db.insert(chatMessages).values({
      companyId: schedule.companyId,
      sessionId: session.id,
      sender: 'agent',
      content: result,
    })

    // 에이전트 메모리에 결과 저장
    await db.insert(agentMemory).values({
      companyId: schedule.companyId,
      agentId: schedule.agentId,
      key: `크론_${schedule.name}_${new Date().toISOString().slice(0, 10)}`,
      value: `지시: ${schedule.instruction}\n결과: ${result.slice(0, 500)}`,
      metadata: { cronRunId: run.id, scheduleName: schedule.name },
    })

    // 자동 보고서 생성
    let reportId: string | null = null
    try {
      const [report] = await db
        .insert(reports)
        .values({
          companyId: schedule.companyId,
          authorId: schedule.userId,
          title: `[크론] ${schedule.name}`,
          content: result.length > MAX_REPORT_CONTENT ? result.slice(0, MAX_REPORT_CONTENT) + '\n\n...(내용이 너무 길어 잘렸습니다)' : result,
          status: 'draft',
        })
        .returning()
      reportId = report.id
    } catch (reportErr) {
      console.error(`⚠️ 크론 보고서 생성 실패 (${schedule.id}):`, reportErr)
    }

    // cronRuns 성공 업데이트
    const durationMs = Date.now() - startTime
    await db
      .update(cronRuns)
      .set({
        status: 'success',
        result,
        completedAt: new Date(),
        durationMs,
      })
      .where(eq(cronRuns.id, run.id))

    // schedule lastRunAt 업데이트
    await db
      .update(nightJobSchedules)
      .set({ lastRunAt: new Date(), updatedAt: new Date() })
      .where(eq(nightJobSchedules.id, schedule.id))

    // WebSocket: 실행 완료 알림
    eventBus.emit('night-job', {
      companyId: schedule.companyId,
      payload: {
        type: 'cron-run-completed',
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        runId: run.id,
        durationMs,
        resultPreview: result.slice(0, 200),
        reportId,
      },
    })

    console.log(`✅ 크론 실행 완료: "${schedule.name}" (${durationMs}ms)`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류'
    const durationMs = Date.now() - startTime

    // cronRuns 실패 업데이트
    await db
      .update(cronRuns)
      .set({
        status: 'failed',
        error: errorMsg,
        completedAt: new Date(),
        durationMs,
      })
      .where(eq(cronRuns.id, run.id))

    // schedule lastRunAt 업데이트 (실패해도 업데이트)
    await db
      .update(nightJobSchedules)
      .set({ lastRunAt: new Date(), updatedAt: new Date() })
      .where(eq(nightJobSchedules.id, schedule.id))

    console.error(`❌ 크론 실행 실패: "${schedule.name}" — ${errorMsg}`)

    // 재시도 로직
    if (retryCount < MAX_RETRIES - 1) {
      const backoffMs = 60_000 * Math.pow(2, retryCount) // 60s, 120s, 240s
      console.log(`🔁 크론 재시도 예약 (${retryCount + 1}/${MAX_RETRIES}): ${backoffMs / 1000}초 후`)

      // WebSocket: 재시도 알림
      eventBus.emit('night-job', {
        companyId: schedule.companyId,
        payload: {
          type: 'cron-run-failed',
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          runId: run.id,
          error: errorMsg,
          retryCount: retryCount + 1,
          maxRetries: MAX_RETRIES,
          willRetry: true,
        },
      })

      // 지연 후 재시도 (shuttingDown 체크 포함 — 불필요한 대기 방지)
      await interruptibleSleep(backoffMs)
      if (!shuttingDown) {
        await executeCronJob(schedule, retryCount + 1)
      }
    } else {
      // 최대 재시도 초과 — 최종 실패
      console.log(`💀 크론 최종 실패: "${schedule.name}" (재시도 ${MAX_RETRIES}회 초과)`)

      // WebSocket: 최종 실패 알림
      eventBus.emit('night-job', {
        companyId: schedule.companyId,
        payload: {
          type: 'cron-run-failed',
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          runId: run.id,
          error: errorMsg,
          retryCount: MAX_RETRIES,
          maxRetries: MAX_RETRIES,
          willRetry: false,
        },
      })
    }
  }
}

// === Lifecycle ===

/**
 * 크론 실행 엔진을 시작합니다.
 */
export function startCronEngine() {
  if (pollTimer) return
  shuttingDown = false
  console.log(`📅 크론 실행 엔진 시작 (폴링 간격: ${POLL_INTERVAL_MS / 1000}초, 동시 실행 제한: ${MAX_CONCURRENT_CRON_JOBS}개)`)
  pollTimer = setInterval(pollDueSchedules, POLL_INTERVAL_MS)
  // 즉시 1회 실행
  pollDueSchedules()
}

/**
 * 크론 실행 엔진을 중지합니다.
 * 현재 실행 중인 작업이 완료될 때까지 대기합니다 (최대 30초).
 */
export async function stopCronEngine(): Promise<void> {
  shuttingDown = true

  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }

  if (runningPromises.size > 0) {
    console.log(`⏳ 크론 엔진 종료 대기: ${runningPromises.size}개 작업 실행 중...`)

    // 실행 중인 작업 완료 대기 (최대 SHUTDOWN_TIMEOUT_MS)
    const timeout = new Promise<void>(resolve =>
      setTimeout(() => {
        console.log('⚠️ 크론 엔진 종료 타임아웃 — 남은 작업 강제 종료')
        resolve()
      }, SHUTDOWN_TIMEOUT_MS)
    )

    await Promise.race([
      Promise.allSettled(Array.from(runningPromises.values())),
      timeout,
    ])
  }

  runningJobs.clear()
  runningPromises.clear()
  console.log('🛑 크론 실행 엔진 중지')
}

// === Test Helpers (테스트 전용) ===

export const _testHelpers = {
  pollDueSchedules,
  executeCronJob,
  getRunningJobs: () => runningJobs,
  getRunningPromises: () => runningPromises,
  isShuttingDown: () => shuttingDown,
  resetState: () => {
    runningJobs.clear()
    runningPromises.clear()
    shuttingDown = false
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  },
  MAX_CONCURRENT_CRON_JOBS,
  MAX_RETRIES,
  POLL_INTERVAL_MS,
}
