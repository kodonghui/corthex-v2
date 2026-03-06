/**
 * 반복 스케줄 워커 — nightJobSchedules 테이블 폴링
 * nextRunAt 도달 시 nightJobs에 새 작업 생성 + nextRunAt 갱신
 */

import { db } from '../db'
import { nightJobSchedules } from '../db/schema'
import { eq, and, lte, or, isNull } from 'drizzle-orm'
import { queueNightJob } from './job-queue'
import { getNextCronDate } from './cron-utils'
import { eventBus } from './event-bus'

const SCHEDULE_POLL_INTERVAL_MS = 60_000 // 60초마다 폴링

let scheduleTimer: ReturnType<typeof setInterval> | null = null

async function pollSchedules() {
  try {
    const now = new Date()

    // isActive + (nextRunAt <= now OR nextRunAt IS NULL) 조건
    // 한 폴링당 최대 50건 처리 — 대량 스케줄 시 워커 블로킹 방지
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
      try {
        // nextRunAt을 먼저 갱신하여 중복 생성 방지 (race condition 대책)
        const nextRun = getNextCronDate(schedule.cronExpression, now)
        await db
          .update(nightJobSchedules)
          .set({ nextRunAt: nextRun, updatedAt: new Date() })
          .where(eq(nightJobSchedules.id, schedule.id))

        // nightJobs에 새 작업 생성 (scheduleId 연결)
        const newJob = await queueNightJob({
          companyId: schedule.companyId,
          userId: schedule.userId,
          agentId: schedule.agentId,
          instruction: schedule.instruction,
          scheduleId: schedule.id,
        })

        // WebSocket 이벤트: 새 작업 생성 알림
        eventBus.emit('night-job', {
          companyId: schedule.companyId,
          payload: { type: 'job-queued', jobId: newJob.id },
        })

        console.log(`📅 스케줄 작업 생성: ${schedule.id} — 다음 실행: ${nextRun.toISOString()}`)
      } catch (err) {
        // 개별 스케줄 실패 시 건너뛰고 계속
        console.error(`❌ 스케줄 처리 실패 (${schedule.id}):`, err instanceof Error ? err.message : err)
      }
    }
  } catch (err) {
    console.error('스케줄 워커 폴링 오류:', err)
  }
}

export function startScheduleWorker() {
  if (scheduleTimer) return
  console.log(`📅 스케줄 워커 시작 (폴링 간격: ${SCHEDULE_POLL_INTERVAL_MS / 1000}초)`)
  scheduleTimer = setInterval(pollSchedules, SCHEDULE_POLL_INTERVAL_MS)
  // 즉시 1회 실행
  pollSchedules()
}

export function stopScheduleWorker() {
  if (scheduleTimer) {
    clearInterval(scheduleTimer)
    scheduleTimer = null
    console.log('🛑 스케줄 워커 중지')
  }
}
