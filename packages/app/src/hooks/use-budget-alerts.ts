import { useEffect, useRef, useState } from 'react'
import { useWsStore } from '../stores/ws-store'
import { toast } from '@corthex/ui'

// === Types ===

type BudgetWarningEvent = {
  type: 'budget-warning'
  level: 'monthly' | 'daily'
  currentSpendUsd: number
  budgetUsd: number
  usagePercent: number
  resetDate: string
}

type BudgetExceededEvent = {
  type: 'budget-exceeded'
  level: 'monthly' | 'daily'
  currentSpendUsd: number
  budgetUsd: number
  resetDate: string
}

type BudgetEvent = BudgetWarningEvent | BudgetExceededEvent

export type BudgetExceededModalData = {
  currentSpendUsd: number
  budgetUsd: number
  level: 'monthly' | 'daily'
}

// === localStorage helpers ===

const STORAGE_PREFIX = 'corthex_budget_alert_'

function getAlertKey(type: string, level: string, resetDate: string): string {
  return `${STORAGE_PREFIX}${type}_${level}_${resetDate}`
}

function wasAlertShown(type: string, level: string, resetDate: string): boolean {
  try {
    return localStorage.getItem(getAlertKey(type, level, resetDate)) === 'shown'
  } catch {
    return false
  }
}

function markAlertShown(type: string, level: string, resetDate: string): void {
  try {
    localStorage.setItem(getAlertKey(type, level, resetDate), 'shown')
  } catch {
    // localStorage unavailable
  }
}

export function cleanupExpiredAlerts(): void {
  try {
    const today = new Date().toISOString().split('T')[0]
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const parts = key.split('_')
        const resetDate = parts[parts.length - 1]
        if (resetDate && resetDate < today) {
          localStorage.removeItem(key)
        }
      }
    }
  } catch {
    // localStorage unavailable
  }
}

// === Hook ===

export function useBudgetAlerts() {
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const subscribedRef = useRef(false)
  const [exceededModal, setExceededModal] = useState<BudgetExceededModalData | null>(null)

  useEffect(() => {
    cleanupExpiredAlerts()
  }, [])

  useEffect(() => {
    if (!isConnected) {
      subscribedRef.current = false
      return
    }

    if (!subscribedRef.current) {
      subscribe('cost')
      subscribedRef.current = true
    }

    const handler = (data: unknown) => {
      const event = data as BudgetEvent
      if (!event || !event.type) return

      if (event.type === 'budget-warning') {
        if (wasAlertShown('warning', event.level, event.resetDate)) return
        markAlertShown('warning', event.level, event.resetDate)

        const levelLabel = event.level === 'monthly' ? '월간' : '일일'
        toast.warning(
          `${levelLabel} 예산 경고: ${event.usagePercent}% 사용 ($${event.currentSpendUsd} / $${event.budgetUsd})`,
        )
      }

      if (event.type === 'budget-exceeded') {
        if (wasAlertShown('exceeded', event.level, event.resetDate)) return
        markAlertShown('exceeded', event.level, event.resetDate)

        setExceededModal({
          currentSpendUsd: event.currentSpendUsd,
          budgetUsd: event.budgetUsd,
          level: event.level,
        })
      }
    }

    addListener('cost', handler)
    return () => removeListener('cost', handler)
  }, [isConnected, subscribe, addListener, removeListener])

  const dismissModal = () => setExceededModal(null)

  return { exceededModal, dismissModal }
}
