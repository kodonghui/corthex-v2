import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type BudgetConfig = {
  monthlyBudget: number
  dailyBudget: number
  warningThreshold: number
  autoBlock: boolean
}

type CostSummary = {
  totalCostMicro: number
}

type ApiResponse<T> = { success: boolean; data: T }

const STORAGE_PREFIX = 'corthex_admin_budget_alert_'

function getAlertKey(type: string, month: string): string {
  return `${STORAGE_PREFIX}${type}_${month}`
}

function wasAlertShown(type: string, month: string): boolean {
  try {
    return localStorage.getItem(getAlertKey(type, month)) === 'shown'
  } catch {
    return false
  }
}

function markAlertShown(type: string, month: string): void {
  try {
    localStorage.setItem(getAlertKey(type, month), 'shown')
  } catch {
    // localStorage unavailable
  }
}

/**
 * Admin budget polling alert — polls budget+spend every 60s and shows toast when thresholds crossed.
 * Admin has no WS, so we poll instead.
 */
export function useAdminBudgetAlerts() {
  const companyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  const { data: budgetData } = useQuery({
    queryKey: ['budget', companyId],
    queryFn: () => api.get<ApiResponse<BudgetConfig>>('/admin/budget'),
    enabled: !!companyId,
    refetchInterval: 60_000,
  })

  const { monthStart, today, monthKey } = useMemo(() => {
    const now = new Date()
    return {
      monthStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      today: now.toISOString().split('T')[0],
      monthKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    }
  }, [])

  const { data: summaryData } = useQuery({
    queryKey: ['costs-summary-alert', companyId, monthStart, today],
    queryFn: () => api.get<ApiResponse<CostSummary>>(`/admin/costs/summary?startDate=${monthStart}&endDate=${today}`),
    enabled: !!companyId,
    refetchInterval: 60_000,
  })

  const budget = budgetData?.data
  const spend = summaryData?.data?.totalCostMicro ?? 0

  useEffect(() => {
    if (!budget || !companyId) return
    if (budget.monthlyBudget <= 0) return

    const percentage = (spend / budget.monthlyBudget) * 100

    if (percentage >= 100 && !wasAlertShown('exceeded', monthKey)) {
      markAlertShown('exceeded', monthKey)
      addToast({ type: 'error', message: `월간 예산 초과! 현재 ${(spend / 1_000_000).toFixed(2)} USD (한도: ${(budget.monthlyBudget / 1_000_000).toFixed(2)} USD)` })
    } else if (percentage >= budget.warningThreshold && !wasAlertShown('warning', monthKey)) {
      markAlertShown('warning', monthKey)
      addToast({ type: 'info', message: `월간 예산 경고: ${Math.round(percentage)}% 사용 중` })
    }
  }, [budget, spend, companyId, monthKey, addToast])
}
