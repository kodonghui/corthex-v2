// Trading Settings Service
// Manages risk profiles, execution modes, and trading parameter limits.
// Ports v1 RISK_PROFILES from web/trading_engine.py

import { db } from '../db'
import { companies } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { RiskProfile, ExecutionMode, TradingSettings, RiskProfileConfig, RiskRange } from '@corthex/shared'

// === Risk Profile Definitions (ported from v1 trading_engine.py) ===

export const RISK_PROFILES: Record<RiskProfile, RiskProfileConfig> = {
  aggressive: {
    label: '공격적', emoji: '🔥',
    cashReserve:       { min: 5,   max: 20,  default: 10 },
    maxPositionPct:    { min: 15,  max: 35,  default: 30 },
    minConfidence:     { min: 50,  max: 75,  default: 55 },
    defaultStopLoss:   { min: -12, max: -3,  default: -8 },
    defaultTakeProfit: { min: 5,   max: 40,  default: 15 },
    maxDailyTrades:    { min: 5,   max: 20,  default: 15 },
    maxDailyLossPct:   { min: 2,   max: 8,   default: 5 },
    orderSize:         { min: 0,   max: 10_000_000, default: 0 },
  },
  balanced: {
    label: '균형', emoji: '⚖️',
    cashReserve:       { min: 15,  max: 35,  default: 20 },
    maxPositionPct:    { min: 10,  max: 25,  default: 20 },
    minConfidence:     { min: 55,  max: 80,  default: 65 },
    defaultStopLoss:   { min: -8,  max: -2,  default: -5 },
    defaultTakeProfit: { min: 5,   max: 25,  default: 10 },
    maxDailyTrades:    { min: 3,   max: 15,  default: 10 },
    maxDailyLossPct:   { min: 1,   max: 5,   default: 3 },
    orderSize:         { min: 0,   max: 5_000_000, default: 0 },
  },
  conservative: {
    label: '보수적', emoji: '🐢',
    cashReserve:       { min: 30,  max: 60,  default: 40 },
    maxPositionPct:    { min: 5,   max: 15,  default: 10 },
    minConfidence:     { min: 65,  max: 90,  default: 75 },
    defaultStopLoss:   { min: -5,  max: -1,  default: -3 },
    defaultTakeProfit: { min: 3,   max: 15,  default: 8 },
    maxDailyTrades:    { min: 1,   max: 8,   default: 5 },
    maxDailyLossPct:   { min: 0.5, max: 2,   default: 1 },
    orderSize:         { min: 0,   max: 2_000_000, default: 0 },
  },
}

// === Default Settings ===

export const DEFAULT_TRADING_SETTINGS: TradingSettings = {
  executionMode: 'approval',
  riskProfile: 'balanced',
  customSettings: {},
  settingsHistory: [],
}

// === Clamp Setting (ported from v1 _clamp_setting) ===

const SETTING_KEYS = [
  'maxPositionPct', 'minConfidence', 'defaultStopLoss',
  'defaultTakeProfit', 'maxDailyTrades', 'maxDailyLossPct', 'orderSize',
] as const

export type SettingKey = (typeof SETTING_KEYS)[number]

export function clampSetting(key: string, value: number, profile: RiskProfile): number {
  const profileConfig = RISK_PROFILES[profile]
  const range = profileConfig[key as keyof RiskProfileConfig]
  if (!range || typeof range === 'string') return value
  const r = range as RiskRange
  return Math.max(r.min, Math.min(r.max, value))
}

/** Get effective value: customSettings override > profile default */
export function getEffectiveValue(key: SettingKey, settings: TradingSettings): number {
  const custom = settings.customSettings[key]
  if (custom !== undefined) return custom
  const profileConfig = RISK_PROFILES[settings.riskProfile]
  const range = profileConfig[key] as RiskRange
  return range.default
}

// === DB Operations ===

export async function getTradingSettings(companyId: string): Promise<TradingSettings> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company) return { ...DEFAULT_TRADING_SETTINGS, customSettings: {}, settingsHistory: [] }

  const settings = company.settings as Record<string, unknown> | null
  const tradingSettings = settings?.tradingSettings as Partial<TradingSettings> | undefined

  if (!tradingSettings) return { ...DEFAULT_TRADING_SETTINGS, customSettings: {}, settingsHistory: [] }

  return {
    executionMode: (tradingSettings.executionMode as ExecutionMode) || 'approval',
    riskProfile: (tradingSettings.riskProfile as RiskProfile) || 'balanced',
    customSettings: tradingSettings.customSettings || {},
    settingsHistory: tradingSettings.settingsHistory || [],
  }
}

export type UpdateTradingSettingsInput = {
  executionMode?: ExecutionMode
  riskProfile?: RiskProfile
  customSettings?: Partial<TradingSettings['customSettings']>
}

export async function updateTradingSettings(
  companyId: string,
  updates: UpdateTradingSettingsInput,
  changedBy: string,
  reason: string,
): Promise<{ settings: TradingSettings; applied: Record<string, unknown>; rejected: Record<string, unknown> }> {
  const current = await getTradingSettings(companyId)
  const applied: Record<string, unknown> = {}
  const rejected: Record<string, unknown> = {}

  // Update execution mode
  if (updates.executionMode && ['autonomous', 'approval'].includes(updates.executionMode)) {
    current.executionMode = updates.executionMode
    applied.executionMode = updates.executionMode
  }

  // Update risk profile
  if (updates.riskProfile && ['conservative', 'balanced', 'aggressive'].includes(updates.riskProfile)) {
    current.riskProfile = updates.riskProfile
    applied.riskProfile = updates.riskProfile
    // Reset custom settings when profile changes (they may be out of range)
    current.customSettings = {}
    applied.customSettingsReset = true
  }

  // Update custom settings with clamping
  if (updates.customSettings) {
    for (const [key, value] of Object.entries(updates.customSettings)) {
      if (value === undefined) continue
      const clamped = clampSetting(key, value, current.riskProfile)
      if (clamped !== value) {
        rejected[key] = `${value} → ${clamped} (안전 범위로 조정됨)`
      }
      current.customSettings[key as SettingKey] = clamped
      applied[key] = clamped
    }
  }

  // Record history
  const historyEntry = {
    changedAt: new Date().toISOString(),
    changedBy,
    action: '설정 변경',
    detail: reason,
    applied,
    rejected,
  }
  current.settingsHistory = [...current.settingsHistory.slice(-99), historyEntry]

  // Save to DB
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  const existingSettings = (company?.settings as Record<string, unknown>) || {}

  await db
    .update(companies)
    .set({
      settings: { ...existingSettings, tradingSettings: current },
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId))

  return { settings: current, applied, rejected }
}
