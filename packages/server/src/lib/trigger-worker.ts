// 이벤트 트리거 워커 — 30초 폴링으로 조건 확인 + 자동 실행

import { db } from '../db'
import { nightJobTriggers } from '../db/schema'
import { eq } from 'drizzle-orm'
import { queueNightJob } from './job-queue'
import { eventBus } from './event-bus'
import { getCredentials } from '../services/credential-vault'
import { getKisToken, kisHeaders, KIS_BASE_URL } from './tool-handlers/builtins/kis-auth'

const POLL_INTERVAL_MS = 30_000 // 30초

let workerTimer: ReturnType<typeof setInterval> | null = null

type TriggerRow = typeof nightJobTriggers.$inferSelect

// 현재가 조회 (KIS API)
async function fetchCurrentPrice(stockCode: string, companyId: string): Promise<number | null> {
  try {
    const creds = await getCredentials(companyId, 'kis')
    const token = await getKisToken(creds.app_key, creds.app_secret)
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: stockCode,
    })

    const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, 'FHKST01010100'),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) return null

    const data = (await res.json()) as { rt_cd?: string; output?: { stck_prpr?: string } }
    if (data.rt_cd !== '0') return null

    const priceStr = data.output?.stck_prpr
    if (!priceStr) return null
    const price = Number(priceStr)
    return price > 0 ? price : null
  } catch {
    return null
  }
}

// 장 시작/마감 시간 확인 (KST 기준)
function getKstHour(): number {
  const now = new Date()
  // UTC + 9 = KST
  const kstHour = (now.getUTCHours() + 9) % 24
  return kstHour
}

function getKstMinute(): number {
  return new Date().getUTCMinutes()
}

// 오늘 날짜 문자열 (KST)
function getTodayKst(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

// 트리거 조건 평가
async function evaluateTrigger(trigger: TriggerRow): Promise<boolean> {
  const condition = trigger.condition as Record<string, unknown>

  switch (trigger.triggerType) {
    case 'price-above': {
      const stockCode = String(condition.stockCode || '')
      const targetPrice = Number(condition.targetPrice || 0)
      if (!stockCode || !targetPrice) return false

      const currentPrice = await fetchCurrentPrice(stockCode, trigger.companyId)
      if (currentPrice === null) return false
      return currentPrice >= targetPrice
    }

    case 'price-below': {
      const stockCode = String(condition.stockCode || '')
      const targetPrice = Number(condition.targetPrice || 0)
      if (!stockCode || !targetPrice) return false

      const currentPrice = await fetchCurrentPrice(stockCode, trigger.companyId)
      if (currentPrice === null) return false
      return currentPrice <= targetPrice
    }

    case 'market-open': {
      const hour = getKstHour()
      const minute = getKstMinute()
      // 장 시작: 09:00 KST — 09:00~09:01 범위 (30초 폴링 drift 허용)
      if (hour === 9 && minute <= 1) {
        // 오늘 이미 발동했으면 건너뛰기
        const today = getTodayKst()
        if (trigger.lastTriggeredAt) {
          const lastDate = new Date(trigger.lastTriggeredAt.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
          if (lastDate === today) return false
        }
        return true
      }
      return false
    }

    case 'market-close': {
      const hour = getKstHour()
      const minute = getKstMinute()
      // 장 마감: 15:30 KST — 15:30~15:31 범위 (30초 폴링 drift 허용)
      if (hour === 15 && (minute === 30 || minute === 31)) {
        const today = getTodayKst()
        if (trigger.lastTriggeredAt) {
          const lastDate = new Date(trigger.lastTriggeredAt.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
          if (lastDate === today) return false
        }
        return true
      }
      return false
    }

    default:
      return false
  }
}

// 폴링 1회 실행
async function pollOnce() {
  try {
    const activeTriggers = await db
      .select()
      .from(nightJobTriggers)
      .where(eq(nightJobTriggers.isActive, true))

    for (const trigger of activeTriggers) {
      try {
        const conditionMet = await evaluateTrigger(trigger)
        if (!conditionMet) continue

        // 조건 충족 → 작업 생성 + 비활성화
        const newJob = await queueNightJob({
          companyId: trigger.companyId,
          userId: trigger.userId,
          agentId: trigger.agentId,
          instruction: trigger.instruction,
          triggerId: trigger.id,
        })

        // WebSocket 이벤트: 새 작업 생성 알림
        eventBus.emit('night-job', {
          companyId: trigger.companyId,
          payload: { type: 'job-queued', jobId: newJob.id },
        })

        await db
          .update(nightJobTriggers)
          .set({ isActive: false, lastTriggeredAt: new Date() })
          .where(eq(nightJobTriggers.id, trigger.id))

        console.log(`⚡ 트리거 발동: ${trigger.id} (${trigger.triggerType})`)
      } catch (err) {
        console.error(`트리거 처리 실패: ${trigger.id}`, err instanceof Error ? err.message : err)
      }
    }
  } catch (err) {
    console.error('트리거 워커 폴링 오류:', err)
  }
}

export function startTriggerWorker() {
  if (workerTimer) return
  console.log(`⚡ 트리거 워커 시작 (폴링 간격: ${POLL_INTERVAL_MS / 1000}초)`)
  workerTimer = setInterval(pollOnce, POLL_INTERVAL_MS)
}

export function stopTriggerWorker() {
  if (workerTimer) {
    clearInterval(workerTimer)
    workerTimer = null
    console.log('🛑 트리거 워커 중지')
  }
}
