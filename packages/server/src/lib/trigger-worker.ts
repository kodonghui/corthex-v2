// 트리거 감시 워커 — 활성 트리거의 조건 충족 시 night_jobs에 작업 등록

import { db } from '../db'
import { nightJobTriggers } from '../db/schema'
import { eq } from 'drizzle-orm'
import { queueNightJob } from './job-queue'

const TRIGGER_POLL_INTERVAL_MS = 30_000  // 30초

let workerTimer: ReturnType<typeof setInterval> | null = null

// 한국 시간 기준 현재 시/분 및 요일 반환
function getKSTTime() {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000) // UTC+9
  return {
    hour: kst.getUTCHours(),
    minute: kst.getUTCMinutes(),
    day: kst.getUTCDay(), // 0=일, 1=월, ..., 6=토
    dateStr: kst.toISOString().slice(0, 10),
  }
}

// 평일 체크 (월~금)
function isWeekday(day: number): boolean {
  return day >= 1 && day <= 5
}

// 조건 평가 함수
async function evaluateCondition(trigger: {
  triggerType: string
  condition: unknown
  lastTriggeredAt: Date | null
}): Promise<boolean> {
  const condition = trigger.condition as { symbol?: string; targetPrice?: number }
  const kst = getKSTTime()

  switch (trigger.triggerType) {
    case 'price-above':
    case 'price-below': {
      // 주가 트리거: 간단한 stub (실제 KIS API 연동은 향후)
      // 실운영에서는 KIS 현재가 API를 호출해야 함
      // 지금은 조건만 평가 구조를 갖추고, 실제 주가 체크는 TODO로 남김
      if (!condition.symbol || !condition.targetPrice) return false

      // TODO: KIS API로 현재가 조회
      // const currentPrice = await fetchCurrentPrice(condition.symbol)
      // if (trigger.triggerType === 'price-above') return currentPrice >= condition.targetPrice
      // if (trigger.triggerType === 'price-below') return currentPrice <= condition.targetPrice
      console.log(`📊 주가 트리거 체크: ${condition.symbol} ${trigger.triggerType} ${condition.targetPrice} (KIS 연동 대기)`)
      return false
    }

    case 'market-open': {
      // 장 시작: 평일 09:00 KST
      if (!isWeekday(kst.day)) return false
      if (kst.hour !== 9 || kst.minute > 1) return false // 09:00~09:01 구간에만 발동

      // 오늘 이미 발동했으면 스킵
      if (trigger.lastTriggeredAt) {
        const lastDate = new Date(trigger.lastTriggeredAt.getTime() + 9 * 60 * 60 * 1000)
        if (lastDate.toISOString().slice(0, 10) === kst.dateStr) return false
      }
      return true
    }

    case 'market-close': {
      // 장 마감: 평일 15:30 KST
      if (!isWeekday(kst.day)) return false
      if (kst.hour !== 15 || kst.minute < 30 || kst.minute > 31) return false // 15:30~15:31

      if (trigger.lastTriggeredAt) {
        const lastDate = new Date(trigger.lastTriggeredAt.getTime() + 9 * 60 * 60 * 1000)
        if (lastDate.toISOString().slice(0, 10) === kst.dateStr) return false
      }
      return true
    }

    default:
      return false
  }
}

async function pollTriggers() {
  try {
    // 활성 트리거만 조회
    const activeTriggers = await db
      .select()
      .from(nightJobTriggers)
      .where(eq(nightJobTriggers.isActive, true))

    for (const trigger of activeTriggers) {
      const shouldFire = await evaluateCondition(trigger)

      if (shouldFire) {
        // 1. 작업 큐에 등록
        await queueNightJob({
          companyId: trigger.companyId,
          userId: trigger.userId,
          agentId: trigger.agentId,
          triggerId: trigger.id,
          instruction: trigger.instruction,
          scheduledFor: new Date(),
        })

        // 2. 1회 실행 후 비활성화 + lastTriggeredAt 갱신
        await db
          .update(nightJobTriggers)
          .set({
            isActive: false,
            lastTriggeredAt: new Date(),
          })
          .where(eq(nightJobTriggers.id, trigger.id))

        console.log(`🎯 트리거 발동: ${trigger.id} (${trigger.triggerType}) → 작업 등록 + 비활성화`)
      }
    }
  } catch (err) {
    console.error('트리거 워커 폴링 오류:', err)
  }
}

export function startTriggerWorker() {
  if (workerTimer) return
  console.log(`🎯 트리거 워커 시작 (폴링 간격: ${TRIGGER_POLL_INTERVAL_MS / 1000}초)`)
  workerTimer = setInterval(pollTriggers, TRIGGER_POLL_INTERVAL_MS)
  pollTriggers()
}

export function stopTriggerWorker() {
  if (workerTimer) {
    clearInterval(workerTimer)
    workerTimer = null
    console.log('🛑 트리거 워커 중지')
  }
}
