// 스케줄 실행 워커 — 활성 스케줄의 nextRunAt 도달 시 night_jobs에 작업 등록

import { db } from '../db'
import { nightJobSchedules } from '../db/schema'
import { eq, and, lte } from 'drizzle-orm'
import { queueNightJob } from './job-queue'
import { getNextRunAt } from './cron-utils'

const SCHEDULE_POLL_INTERVAL_MS = 60_000  // 60초 (분 단위 정밀도)

let workerTimer: ReturnType<typeof setInterval> | null = null

async function pollSchedules() {
  try {
    const now = new Date()

    const dueSchedules = await db
      .select()
      .from(nightJobSchedules)
      .where(and(
        eq(nightJobSchedules.isActive, true),
        lte(nightJobSchedules.nextRunAt, now),
      ))

    for (const schedule of dueSchedules) {
      // 1. 작업 큐에 등록
      await queueNightJob({
        companyId: schedule.companyId,
        userId: schedule.userId,
        agentId: schedule.agentId,
        scheduleId: schedule.id,
        instruction: schedule.instruction,
        scheduledFor: new Date(),
      })

      // 2. nextRunAt을 다음 실행 시간으로 갱신
      const nextRun = getNextRunAt(schedule.cronExpression)
      await db
        .update(nightJobSchedules)
        .set({ nextRunAt: nextRun, updatedAt: new Date() })
        .where(eq(nightJobSchedules.id, schedule.id))

      console.log(`⏰ 스케줄 실행: ${schedule.id} → 다음: ${nextRun?.toISOString()}`)
    }
  } catch (err) {
    console.error('스케줄 워커 폴링 오류:', err)
  }
}

export function startScheduleWorker() {
  if (workerTimer) return
  console.log(`⏰ 스케줄 워커 시작 (폴링 간격: ${SCHEDULE_POLL_INTERVAL_MS / 1000}초)`)
  workerTimer = setInterval(pollSchedules, SCHEDULE_POLL_INTERVAL_MS)
  pollSchedules()
}

export function stopScheduleWorker() {
  if (workerTimer) {
    clearInterval(workerTimer)
    workerTimer = null
    console.log('🛑 스케줄 워커 중지')
  }
}
