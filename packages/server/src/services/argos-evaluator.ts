// ARGOS Evaluator — Condition Evaluation Engine + Auto-Collection
// Story 14-3: ARGOS Trigger Condition Auto-Collect

import { db } from '../db'
import { nightJobTriggers, argosEvents, chatSessions, chatMessages, agentMemory, reports, agents } from '../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { eventBus } from '../lib/event-bus'
import { createEvent, updateEventStatus } from './argos-service'
import { collectAgentResponse, renderSoul } from '../engine'
import type { SessionContext } from '../engine'
import { getMaxHandoffDepth } from './handoff-depth-settings'

const ARGOS_POLL_INTERVAL_MS = 60_000 // 60초
const MAX_CONCURRENT_EVALUATIONS = 3

type TriggerRow = typeof nightJobTriggers.$inferSelect

let evaluatorTimer: ReturnType<typeof setInterval> | null = null
let shuttingDown = false
let lastCheckAt: Date | null = null
const runningExecutions = new Set<string>()

// === Interruptible Sleep (shutdown-safe) ===
async function interruptibleSleep(ms: number): Promise<void> {
  const steps = Math.ceil(ms / 1000)
  for (let i = 0; i < steps; i++) {
    if (shuttingDown) return
    await new Promise(resolve => setTimeout(resolve, Math.min(1000, ms - i * 1000)))
  }
}

// === Cooldown Check ===
function isCooldownActive(trigger: TriggerRow): boolean {
  if (!trigger.lastTriggeredAt) return false
  const cooldownMs = (trigger.cooldownMinutes ?? 30) * 60 * 1000
  return Date.now() - trigger.lastTriggeredAt.getTime() < cooldownMs
}

// === Event Data Hash for Deduplication ===
function hashEventData(data: Record<string, unknown>): string {
  return JSON.stringify(data, Object.keys(data).sort())
}

// === Condition Evaluators ===

async function evaluatePrice(trigger: TriggerRow): Promise<{ matched: boolean; data: Record<string, unknown> }> {
  const condition = trigger.condition as Record<string, unknown>

  // Support both new (price type) and legacy (price-above/price-below) formats
  if (trigger.triggerType === 'price-above' || trigger.triggerType === 'price-below') {
    // Legacy format: stockCode + targetPrice — use KIS API via import
    const stockCode = String(condition.stockCode || '')
    const targetPrice = Number(condition.targetPrice || 0)
    if (!stockCode || !targetPrice) return { matched: false, data: {} }

    try {
      const { getCredentials } = await import('./credential-vault')
      const { getKisToken, kisHeaders, KIS_BASE_URL } = await import('../lib/tool-handlers/builtins/kis-auth')

      const creds = await getCredentials(trigger.companyId, 'kis')
      const token = await getKisToken(creds.app_key, creds.app_secret)
      const params = new URLSearchParams({
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: stockCode,
      })

      const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`, {
        headers: kisHeaders(token, creds.app_key, creds.app_secret, 'FHKST01010100'),
        signal: AbortSignal.timeout(15_000),
      })

      if (!res.ok) return { matched: false, data: {} }
      const apiData = (await res.json()) as { rt_cd?: string; output?: { stck_prpr?: string } }
      if (apiData.rt_cd !== '0') return { matched: false, data: {} }

      const currentPrice = Number(apiData.output?.stck_prpr || 0)
      if (currentPrice <= 0) return { matched: false, data: {} }

      const matched = trigger.triggerType === 'price-above'
        ? currentPrice >= targetPrice
        : currentPrice <= targetPrice

      return { matched, data: { currentPrice, targetPrice, stockCode } }
    } catch {
      return { matched: false, data: {} }
    }
  }

  // New price format
  const ticker = String(condition.ticker || '')
  const operator = String(condition.operator || '')
  const value = Number(condition.value || 0)
  if (!ticker || !value) return { matched: false, data: {} }

  // For now, use a simplified price check (real implementation would use KIS/data cache)
  try {
    const { getCredentials } = await import('./credential-vault')
    const { getKisToken, kisHeaders, KIS_BASE_URL } = await import('../lib/tool-handlers/builtins/kis-auth')

    const creds = await getCredentials(trigger.companyId, 'kis')
    const token = await getKisToken(creds.app_key, creds.app_secret)
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: ticker,
    })

    const res = await fetch(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`, {
      headers: kisHeaders(token, creds.app_key, creds.app_secret, 'FHKST01010100'),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) return { matched: false, data: {} }
    const apiData = (await res.json()) as { rt_cd?: string; output?: { stck_prpr?: string } }
    if (apiData.rt_cd !== '0') return { matched: false, data: {} }

    const currentPrice = Number(apiData.output?.stck_prpr || 0)
    if (currentPrice <= 0) return { matched: false, data: {} }

    let matched = false
    switch (operator) {
      case 'above': matched = currentPrice >= value; break
      case 'below': matched = currentPrice <= value; break
      case 'change_pct_above': matched = false; break // Would need previous price
      case 'change_pct_below': matched = false; break
    }

    return { matched, data: { currentPrice, targetValue: value, operator, ticker } }
  } catch {
    return { matched: false, data: {} }
  }
}

function evaluateMarketTime(trigger: TriggerRow): { matched: boolean; data: Record<string, unknown> } {
  const now = new Date()
  const kstHour = (now.getUTCHours() + 9) % 24
  const kstMinute = now.getUTCMinutes()

  if (trigger.triggerType === 'market-open') {
    if (kstHour === 9 && kstMinute <= 1) {
      // Check if already triggered today
      const todayKst = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
      if (trigger.lastTriggeredAt) {
        const lastDate = new Date(trigger.lastTriggeredAt.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
        if (lastDate === todayKst) return { matched: false, data: {} }
      }
      return { matched: true, data: { event: 'market-open', kstTime: `${kstHour}:${String(kstMinute).padStart(2, '0')}` } }
    }
  }

  if (trigger.triggerType === 'market-close') {
    if (kstHour === 15 && (kstMinute === 30 || kstMinute === 31)) {
      const todayKst = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
      if (trigger.lastTriggeredAt) {
        const lastDate = new Date(trigger.lastTriggeredAt.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
        if (lastDate === todayKst) return { matched: false, data: {} }
      }
      return { matched: true, data: { event: 'market-close', kstTime: `${kstHour}:${String(kstMinute).padStart(2, '0')}` } }
    }
  }

  return { matched: false, data: {} }
}

async function evaluateNews(trigger: TriggerRow): Promise<{ matched: boolean; data: Record<string, unknown> }> {
  const condition = trigger.condition as Record<string, unknown>
  const keywords = condition.keywords as string[]
  const matchMode = (condition.matchMode as string) || 'any'
  const excludeKeywords = (condition.excludeKeywords as string[]) || []

  if (!keywords || keywords.length === 0) return { matched: false, data: {} }

  const naverClientId = process.env.NAVER_CLIENT_ID
  const naverSecret = process.env.NAVER_CLIENT_SECRET
  if (!naverClientId || !naverSecret) return { matched: false, data: {} }

  // Search news via Naver API
  try {
    // Collect news results per keyword for 'all' mode support
    const keywordHits = new Map<string, Array<{ title: string; description: string }>>()

    for (const keyword of keywords) {
      const params = new URLSearchParams({
        query: keyword,
        display: '5',
        sort: 'date',
      })

      const res = await fetch(`https://openapi.naver.com/v1/search/news.json?${params}`, {
        headers: {
          'X-Naver-Client-Id': naverClientId,
          'X-Naver-Client-Secret': naverSecret,
        },
        signal: AbortSignal.timeout(10_000),
      })

      if (!res.ok) continue

      const data = (await res.json()) as { items?: Array<{ title: string; description: string; link: string; pubDate: string }> }
      const items = data.items || []

      // Filter out excluded keywords
      const filtered = items.filter(item => {
        const text = `${item.title} ${item.description}`.toLowerCase()
        return !excludeKeywords.some(ex => text.includes(ex.toLowerCase()))
      })

      if (filtered.length > 0) {
        keywordHits.set(keyword, filtered)

        if (matchMode === 'any') {
          return {
            matched: true,
            data: {
              matchedKeyword: keyword,
              newsCount: filtered.length,
              topNews: filtered[0]?.title?.replace(/<[^>]*>/g, '') || '',
            },
          }
        }
      }
    }

    // For 'all' mode: every keyword must have at least one news hit
    if (matchMode === 'all' && keywordHits.size === keywords.length) {
      const firstHit = keywordHits.values().next().value
      return {
        matched: true,
        data: {
          matchedKeywords: [...keywordHits.keys()],
          newsCount: [...keywordHits.values()].reduce((sum, items) => sum + items.length, 0),
          topNews: firstHit?.[0]?.title?.replace(/<[^>]*>/g, '') || '',
        },
      }
    }

    return { matched: false, data: {} }
  } catch {
    return { matched: false, data: {} }
  }
}

function evaluateSchedule(trigger: TriggerRow): { matched: boolean; data: Record<string, unknown> } {
  const condition = trigger.condition as Record<string, unknown>
  const intervalMinutes = Number(condition.intervalMinutes || 0)
  if (intervalMinutes <= 0) return { matched: false, data: {} }

  const now = new Date()
  const kstHour = (now.getUTCHours() + 9) % 24
  const kstDay = now.getUTCDay()

  // Check active hours
  const activeHours = condition.activeHours as { start: number; end: number } | undefined
  if (activeHours) {
    if (kstHour < activeHours.start || kstHour >= activeHours.end) {
      return { matched: false, data: {} }
    }
  }

  // Check active days
  const activeDays = condition.activeDays as number[] | undefined
  if (activeDays && activeDays.length > 0) {
    if (!activeDays.includes(kstDay)) {
      return { matched: false, data: {} }
    }
  }

  // Check interval since last trigger
  if (trigger.lastTriggeredAt) {
    const elapsed = Date.now() - trigger.lastTriggeredAt.getTime()
    if (elapsed < intervalMinutes * 60 * 1000) {
      return { matched: false, data: {} }
    }
  }

  return { matched: true, data: { intervalMinutes, kstHour, kstDay } }
}

function evaluateCustom(trigger: TriggerRow): { matched: boolean; data: Record<string, unknown> } {
  // Custom trigger: generic field/operator/value evaluation
  // For now, always returns false unless explicitly triggered via API
  return { matched: false, data: {} }
}

// === Main Evaluation Function ===

async function evaluateTrigger(trigger: TriggerRow): Promise<{ matched: boolean; data: Record<string, unknown> }> {
  switch (trigger.triggerType) {
    case 'price':
    case 'price-above':
    case 'price-below':
      return evaluatePrice(trigger)
    case 'market-open':
    case 'market-close':
      return evaluateMarketTime(trigger)
    case 'news':
      return evaluateNews(trigger)
    case 'schedule':
      return evaluateSchedule(trigger)
    case 'custom':
      return evaluateCustom(trigger)
    default:
      return { matched: false, data: {} }
  }
}

// === Execute Triggered Action ===

async function executeTriggeredAction(trigger: TriggerRow, eventData: Record<string, unknown>): Promise<void> {
  const startTime = Date.now()

  // Create ARGOS event
  let event
  try {
    event = await createEvent({
      companyId: trigger.companyId,
      triggerId: trigger.id,
      eventType: trigger.triggerType,
      eventData,
    })
  } catch (err) {
    console.error(`❌ ARGOS 이벤트 생성 실패: ${trigger.id}`, err instanceof Error ? err.message : err)
    return
  }

  // Update trigger lastTriggeredAt
  await db
    .update(nightJobTriggers)
    .set({ lastTriggeredAt: new Date() })
    .where(eq(nightJobTriggers.id, trigger.id))

  // Emit trigger-fired WebSocket event
  eventBus.emit('argos', {
    companyId: trigger.companyId,
    payload: {
      type: 'argos-trigger-fired',
      triggerId: trigger.id,
      triggerName: trigger.name || trigger.triggerType,
      eventData,
      eventId: event.id,
    },
  })

  console.log(`⚡ ARGOS 트리거 발동: ${trigger.name || trigger.id} (${trigger.triggerType})`)

  // Update event status to executing
  await updateEventStatus(event.id, 'executing')

  try {
    // Get agent info
    const [agent] = await db
      .select({ id: agents.id, name: agents.name, isSecretary: agents.isSecretary, soul: agents.soul })
      .from(agents)
      .where(eq(agents.id, trigger.agentId))
      .limit(1)

    if (!agent) throw new Error('에이전트를 찾을 수 없습니다')

    // Create chat session for the execution
    const [session] = await db
      .insert(chatSessions)
      .values({
        companyId: trigger.companyId,
        userId: trigger.userId,
        agentId: trigger.agentId,
        title: `[ARGOS] ${trigger.name || trigger.triggerType}`,
      })
      .returning()

    // Insert user message
    await db.insert(chatMessages).values({
      sessionId: session.id,
      companyId: trigger.companyId,
      sender: 'user',
      content: trigger.instruction,
    })

    // Execute via engine/agent-loop (D6 single entry point)
    const soul = agent.soul
      ? await renderSoul(agent.soul, agent.id, trigger.companyId)
      : ''

    const ctx: SessionContext = {
      cliToken: process.env.ANTHROPIC_API_KEY || '',
      userId: trigger.userId,
      companyId: trigger.companyId,
      depth: 0,
      sessionId: session.id,
      startedAt: Date.now(),
      maxDepth: await getMaxHandoffDepth(trigger.companyId),
      visitedAgents: [agent.id],
    }

    const result = await collectAgentResponse({ ctx, soul, message: trigger.instruction })

    if (!result) {
      throw new Error('에이전트 응답이 비어 있습니다')
    }

    // Save agent message
    await db.insert(chatMessages).values({
      sessionId: session.id,
      companyId: trigger.companyId,
      sender: 'agent',
      content: result,
    })

    // Save to agent memory
    try {
      await db.insert(agentMemory).values({
        companyId: trigger.companyId,
        agentId: trigger.agentId,
        key: `argos-${trigger.triggerType}-${Date.now()}`,
        value: `[ARGOS 자동 실행] ${trigger.name || trigger.triggerType}: ${result.slice(0, 500)}`,
      })
    } catch { /* memory save is optional */ }

    // Auto-generate report
    try {
      const reportContent = result.slice(0, 50_000)
      await db.insert(reports).values({
        companyId: trigger.companyId,
        authorId: trigger.userId,
        title: `[ARGOS] ${trigger.name || trigger.triggerType} 결과`,
        content: reportContent,
        status: 'submitted',
      })
    } catch { /* report save is optional */ }

    const durationMs = Date.now() - startTime

    // Update event as completed
    await updateEventStatus(event.id, 'completed', {
      result: result.slice(0, 2000),
      durationMs,
    })

    // WebSocket: execution completed
    eventBus.emit('argos', {
      companyId: trigger.companyId,
      payload: {
        type: 'argos-execution-completed',
        triggerId: trigger.id,
        triggerName: trigger.name || trigger.triggerType,
        eventId: event.id,
        durationMs,
        resultPreview: result.slice(0, 200),
      },
    })

    console.log(`✅ ARGOS 실행 완료: ${trigger.name || trigger.id} (${durationMs}ms)`)
  } catch (err) {
    const durationMs = Date.now() - startTime
    const errorMsg = err instanceof Error ? err.message : String(err)

    await updateEventStatus(event.id, 'failed', {
      error: errorMsg,
      durationMs,
    })

    eventBus.emit('argos', {
      companyId: trigger.companyId,
      payload: {
        type: 'argos-execution-failed',
        triggerId: trigger.id,
        triggerName: trigger.name || trigger.triggerType,
        eventId: event.id,
        error: errorMsg,
      },
    })

    console.error(`❌ ARGOS 실행 실패: ${trigger.name || trigger.id}`, errorMsg)
  } finally {
    runningExecutions.delete(trigger.id)
  }
}

// === Polling Loop ===

async function pollTriggers(): Promise<void> {
  if (shuttingDown) return

  try {
    lastCheckAt = new Date()

    const activeTriggers = await db
      .select()
      .from(nightJobTriggers)
      .where(eq(nightJobTriggers.isActive, true))

    for (const trigger of activeTriggers) {
      if (shuttingDown) break
      if (runningExecutions.has(trigger.id)) continue // Already executing
      if (runningExecutions.size >= MAX_CONCURRENT_EVALUATIONS) break

      try {
        // Check cooldown
        if (isCooldownActive(trigger)) continue

        // Evaluate condition
        const { matched, data } = await evaluateTrigger(trigger)
        if (!matched) continue

        // Execute triggered action
        runningExecutions.add(trigger.id)
        executeTriggeredAction(trigger, data).catch(err => {
          console.error(`❌ ARGOS 트리거 실행 오류: ${trigger.id}`, err)
          runningExecutions.delete(trigger.id)
        })
      } catch (err) {
        console.error(`🔍 ARGOS 트리거 평가 실패: ${trigger.id}`, err instanceof Error ? err.message : err)
      }
    }
  } catch (err) {
    console.error('🔍 ARGOS 폴링 오류:', err)
  }
}

// === Lifecycle ===

export function startArgosEngine(): void {
  if (evaluatorTimer) return
  shuttingDown = false
  console.log(`🔍 ARGOS 엔진 시작 (폴링 간격: ${ARGOS_POLL_INTERVAL_MS / 1000}초)`)

  // Run immediately on start
  pollTriggers()
  evaluatorTimer = setInterval(pollTriggers, ARGOS_POLL_INTERVAL_MS)
}

export async function stopArgosEngine(): Promise<void> {
  shuttingDown = true
  if (evaluatorTimer) {
    clearInterval(evaluatorTimer)
    evaluatorTimer = null
  }

  // Wait for running executions (max 30s)
  if (runningExecutions.size > 0) {
    console.log(`🔍 ARGOS: ${runningExecutions.size}개 실행 중 — 완료 대기...`)
    const timeout = new Promise<void>(resolve => setTimeout(resolve, 30_000))
    const waitForAll = new Promise<void>(resolve => {
      const check = setInterval(() => {
        if (runningExecutions.size === 0) {
          clearInterval(check)
          resolve()
        }
      }, 500)
    })
    await Promise.race([waitForAll, timeout])
  }

  console.log('🛑 ARGOS 엔진 중지')
}

export function getLastCheckAt(): Date | null {
  return lastCheckAt
}

// === Test Helpers ===
export const _testHelpers = {
  pollTriggers,
  evaluateTrigger,
  executeTriggeredAction,
  isCooldownActive,
  hashEventData,
  evaluatePrice,
  evaluateNews,
  evaluateSchedule,
  evaluateCustom,
  evaluateMarketTime,
  resetState: () => {
    shuttingDown = false
    lastCheckAt = null
    runningExecutions.clear()
    if (evaluatorTimer) {
      clearInterval(evaluatorTimer)
      evaluatorTimer = null
    }
  },
}
