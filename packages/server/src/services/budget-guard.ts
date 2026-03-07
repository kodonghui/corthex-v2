import { db } from '../db'
import { companies, costRecords } from '../db/schema'
import { eq, and, gte, sum } from 'drizzle-orm'
import { eventBus } from '../lib/event-bus'
import { microToUsd } from '../lib/cost-tracker'

// === Types ===

export type BudgetConfig = {
  monthlyBudget: number   // microdollars, 0 = unlimited
  dailyBudget: number     // microdollars, 0 = unlimited
  warningThreshold: number // percentage (0-100), default 80
  autoBlock: boolean       // default true
}

export type BudgetCheckResult = {
  allowed: boolean
  reason?: 'monthly_exceeded' | 'daily_exceeded'
  currentMonthSpendMicro: number
  currentDaySpendMicro: number
  monthlyBudgetMicro: number
  dailyBudgetMicro: number
  warningEmitted: boolean
  resetDate: string // ISO date string, first day of next month
}

// === Constants ===

const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  monthlyBudget: 0,       // unlimited by default
  dailyBudget: 0,         // unlimited by default
  warningThreshold: 80,
  autoBlock: true,
}

const CACHE_TTL_MS = 60_000 // 60 seconds

// === Cache ===

type CacheEntry = {
  config: BudgetConfig
  monthSpendMicro: number
  daySpendMicro: number
  warningEmitted: { monthly: boolean; daily: boolean }
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

// Exposed for testing
export function clearBudgetCache(): void {
  cache.clear()
}

// === Helpers ===

function monthStart(): Date {
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function todayStart(): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function nextMonthFirst(): string {
  const d = new Date()
  d.setUTCDate(1) // Set date to 1 BEFORE month increment to avoid rollover (e.g., Jan 31 + 1 month = Mar 3)
  d.setUTCMonth(d.getUTCMonth() + 1)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

function tomorrowStart(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 1)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

// === Budget Config Loader ===

export async function loadBudgetConfig(companyId: string): Promise<BudgetConfig> {
  const [row] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!row?.settings) return { ...DEFAULT_BUDGET_CONFIG }

  const settings = row.settings as Record<string, unknown>
  const bc = settings.budgetConfig as Partial<BudgetConfig> | undefined

  if (!bc) return { ...DEFAULT_BUDGET_CONFIG }

  return {
    monthlyBudget: typeof bc.monthlyBudget === 'number' ? bc.monthlyBudget : DEFAULT_BUDGET_CONFIG.monthlyBudget,
    dailyBudget: typeof bc.dailyBudget === 'number' ? bc.dailyBudget : DEFAULT_BUDGET_CONFIG.dailyBudget,
    warningThreshold: typeof bc.warningThreshold === 'number' ? bc.warningThreshold : DEFAULT_BUDGET_CONFIG.warningThreshold,
    autoBlock: typeof bc.autoBlock === 'boolean' ? bc.autoBlock : DEFAULT_BUDGET_CONFIG.autoBlock,
  }
}

// === Spend Query ===

async function getSpendSince(companyId: string, since: Date): Promise<number> {
  const [row] = await db
    .select({ total: sum(costRecords.costUsdMicro).mapWith(Number) })
    .from(costRecords)
    .where(and(
      eq(costRecords.companyId, companyId),
      gte(costRecords.createdAt, since),
    ))
  return row?.total ?? 0
}

// === Warning Emitter ===

function emitBudgetWarning(
  companyId: string,
  level: 'monthly' | 'daily',
  currentSpendMicro: number,
  budgetMicro: number,
  resetDate: string,
): void {
  const usagePercent = budgetMicro > 0 ? Math.round((currentSpendMicro / budgetMicro) * 100) : 0
  eventBus.emit('cost', {
    companyId,
    payload: {
      type: 'budget-warning',
      level,
      currentSpendUsd: microToUsd(currentSpendMicro),
      budgetUsd: microToUsd(budgetMicro),
      usagePercent,
      resetDate,
    },
  })
}

function emitBudgetExceeded(
  companyId: string,
  level: 'monthly' | 'daily',
  currentSpendMicro: number,
  budgetMicro: number,
  resetDate: string,
): void {
  eventBus.emit('cost', {
    companyId,
    payload: {
      type: 'budget-exceeded',
      level,
      currentSpendUsd: microToUsd(currentSpendMicro),
      budgetUsd: microToUsd(budgetMicro),
      resetDate,
    },
  })
}

// === Main Budget Check ===

export async function checkBudget(companyId: string): Promise<BudgetCheckResult> {
  const now = Date.now()

  // Check cache
  const cached = cache.get(companyId)
  if (cached && now < cached.expiresAt) {
    return evaluateBudget(companyId, cached.config, cached.monthSpendMicro, cached.daySpendMicro, cached.warningEmitted)
  }

  // Load fresh data
  const config = await loadBudgetConfig(companyId)
  const monthSpendMicro = await getSpendSince(companyId, monthStart())
  const daySpendMicro = await getSpendSince(companyId, todayStart())

  const warningEmitted = cached?.warningEmitted ?? { monthly: false, daily: false }

  // Update cache
  cache.set(companyId, {
    config,
    monthSpendMicro,
    daySpendMicro,
    warningEmitted,
    expiresAt: now + CACHE_TTL_MS,
  })

  return evaluateBudget(companyId, config, monthSpendMicro, daySpendMicro, warningEmitted)
}

function evaluateBudget(
  companyId: string,
  config: BudgetConfig,
  monthSpendMicro: number,
  daySpendMicro: number,
  warningEmitted: { monthly: boolean; daily: boolean },
): BudgetCheckResult {
  const resetDate = nextMonthFirst()
  let allowed = true
  let reason: BudgetCheckResult['reason']
  let warningTriggered = false

  // Monthly budget check
  if (config.monthlyBudget > 0) {
    if (monthSpendMicro >= config.monthlyBudget && config.autoBlock) {
      allowed = false
      reason = 'monthly_exceeded'
      emitBudgetExceeded(companyId, 'monthly', monthSpendMicro, config.monthlyBudget, resetDate)
    } else {
      // Warning threshold check
      const thresholdMicro = Math.round((config.warningThreshold / 100) * config.monthlyBudget)
      if (monthSpendMicro >= thresholdMicro && !warningEmitted.monthly) {
        warningTriggered = true
        warningEmitted.monthly = true
        emitBudgetWarning(companyId, 'monthly', monthSpendMicro, config.monthlyBudget, resetDate)
      }
    }
  }

  // Daily budget check (only if monthly didn't already block)
  if (allowed && config.dailyBudget > 0) {
    if (daySpendMicro >= config.dailyBudget && config.autoBlock) {
      allowed = false
      reason = 'daily_exceeded'
      emitBudgetExceeded(companyId, 'daily', daySpendMicro, config.dailyBudget, tomorrowStart())
    } else {
      const dayThresholdMicro = Math.round((config.warningThreshold / 100) * config.dailyBudget)
      if (daySpendMicro >= dayThresholdMicro && !warningEmitted.daily) {
        warningTriggered = true
        warningEmitted.daily = true
        emitBudgetWarning(companyId, 'daily', daySpendMicro, config.dailyBudget, tomorrowStart())
      }
    }
  }

  return {
    allowed,
    reason,
    currentMonthSpendMicro: monthSpendMicro,
    currentDaySpendMicro: daySpendMicro,
    monthlyBudgetMicro: config.monthlyBudget,
    dailyBudgetMicro: config.dailyBudget,
    warningEmitted: warningTriggered,
    resetDate,
  }
}
