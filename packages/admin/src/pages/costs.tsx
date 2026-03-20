/**
 * Cost & Budget Management — Natural Organic Theme
 *
 * API Endpoints:
 *   GET   /api/admin/costs/summary?startDate=...&endDate=...
 *   GET   /api/admin/costs/by-agent?startDate=...&endDate=...
 *   GET   /api/admin/costs/by-model?startDate=...&endDate=...
 *   GET   /api/admin/costs/by-department?startDate=...&endDate=...
 *   GET   /api/admin/costs/daily?startDate=...&endDate=...
 *   GET   /api/admin/budget
 *   PATCH /api/admin/budget
 */
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

// === Types ===

type ProviderCost = { provider: string; costMicro: number; callCount: number }
type CostSummary = {
  totalCostMicro: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCalls: number
  byProvider: ProviderCost[]
  trendPercent: number
}
type CostByAgent = { agentId: string; agentName: string; totalCostMicro: number; inputTokens: number; outputTokens: number; callCount: number }
type CostByModel = { model: string; provider: string; displayName: string; totalCostMicro: number; inputTokens: number; outputTokens: number; callCount: number }
type CostByDepartment = { departmentId: string; departmentName: string; totalCostMicro: number; agentCount: number; callCount: number }
type CostDaily = { date: string; costMicro: number; inputTokens: number; outputTokens: number; callCount: number }
type BudgetConfig = { monthlyBudget: number; dailyBudget: number; warningThreshold: number; autoBlock: boolean }
type ApiResponse<T> = { success: boolean; data: T }

// === Helpers ===

function microToUsd(micro: number): string {
  return (micro / 1_000_000).toFixed(2)
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function defaultDates() {
  const today = new Date()
  const ago = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  return {
    start: ago.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0],
  }
}

// === Summary Cards ===

function SummaryCards({ data }: { data: CostSummary | undefined }) {
  if (!data) return <SummaryCardsSkeleton />

  const trend = data.trendPercent
  const remaining = 15000_000_000 - data.totalCostMicro // placeholder budget
  const projected = data.totalCostMicro * 1.19 // placeholder projection

  const cards = [
    {
      label: '이번 달 총 지출',
      value: `$${microToUsd(data.totalCostMicro)}`,
      trend: trend > 0 ? `+${trend}%` : `${trend}%`,
      trendLabel: 'vs 전월',
      trendUp: trend > 0,
      color: '#5a7247',
    },
    {
      label: '잔여 예산',
      value: `$${microToUsd(remaining > 0 ? remaining : 0)}`,
      trend: '-5.2%',
      trendLabel: 'vs 전주',
      trendUp: false,
      color: '#c4622d',
    },
    {
      label: '예상 월말 비용',
      value: `$${microToUsd(projected)}`,
      trend: '',
      trendLabel: '신규 모델 사용 증가 반영',
      trendUp: false,
      color: '#d4a843',
    },
  ]

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="costs-summary-cards">
      {cards.map((c) => (
        <div key={c.label} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-stone-500 text-sm font-medium mb-2 uppercase tracking-wider">{c.label}</p>
          <h3 className="text-4xl font-bold" style={{ color: c.color, fontFamily: "'Playfair Display', serif" }}>{c.value}</h3>
          <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: c.trendUp ? '#16a34a' : c.trend ? '#ef4444' : '#5a7247' }}>
            {c.trend && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d={c.trendUp ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            )}
            <span>{c.trend} {c.trendLabel}</span>
          </div>
        </div>
      ))}
    </section>
  )
}

function SummaryCardsSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="h-4 w-24 bg-stone-100 rounded animate-pulse mb-4" />
          <div className="h-10 w-40 bg-stone-100 rounded animate-pulse" />
        </div>
      ))}
    </section>
  )
}

// === Sortable Table Helpers ===

type SortConfig = { field: string; dir: 'asc' | 'desc' }

function SortableHeader({ label, field, sort, onSort }: { label: string; field: string; sort: SortConfig; onSort: (f: string) => void }) {
  const arrow = sort.field === field ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''
  return (
    <th
      className="pb-3 font-medium cursor-pointer hover:text-stone-700 select-none"
      onClick={() => onSort(field)}
    >
      {label}{arrow}
    </th>
  )
}

function sortByField<T extends Record<string, unknown>>(items: T[], sort: SortConfig): T[] {
  return [...items].sort((a, b) => {
    const v = sort.dir === 'asc' ? 1 : -1
    const af = a[sort.field]
    const bf = b[sort.field]
    if (typeof af === 'string' && typeof bf === 'string') return af.localeCompare(bf) * v
    return (((af as number) ?? 0) - ((bf as number) ?? 0)) * v
  })
}

// === Department Table (Stitch HTML style) ===

function DepartmentTable({ items }: { items: CostByDepartment[] }) {
  const [sort, setSort] = useState<SortConfig>({ field: 'totalCostMicro', dir: 'desc' })
  const toggle = (f: string) => setSort(p => ({ field: f, dir: p.field === f && p.dir === 'desc' ? 'asc' : 'desc' }))
  const sorted = useMemo(() => sortByField(items, sort), [items, sort])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-stone-400 border-b border-stone-100">
            <SortableHeader label="부서명" field="departmentName" sort={sort} onSort={toggle} />
            <SortableHeader label="사용량 (tokens)" field="callCount" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <th className="pb-3 font-medium text-right">증감률</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {sorted.map((r) => (
            <tr key={r.departmentId} className="hover:bg-[#faf8f5]/50 transition-colors">
              <td className="py-4 font-bold">{r.departmentName}</td>
              <td className="py-4">{formatNumber(r.callCount)}</td>
              <td className="py-4" style={{ fontFamily: 'serif' }}>${microToUsd(r.totalCostMicro)}</td>
              <td className="py-4 text-right text-green-600 font-medium">-</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={4} className="py-8 text-center text-stone-400">데이터가 없습니다</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// === Agent Table ===

function AgentTable({ items }: { items: CostByAgent[] }) {
  const [sort, setSort] = useState<SortConfig>({ field: 'totalCostMicro', dir: 'desc' })
  const toggle = (f: string) => setSort(p => ({ field: f, dir: p.field === f && p.dir === 'desc' ? 'asc' : 'desc' }))
  const sorted = useMemo(() => sortByField(items, sort), [items, sort])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 text-stone-400">
            <SortableHeader label="에이전트" field="agentName" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <SortableHeader label="입력 토큰" field="inputTokens" sort={sort} onSort={toggle} />
            <SortableHeader label="출력 토큰" field="outputTokens" sort={sort} onSort={toggle} />
            <SortableHeader label="호출 수" field="callCount" sort={sort} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.agentId} className="border-b border-stone-50 hover:bg-[#faf8f5]/50">
              <td className="py-3 font-medium">{r.agentName}</td>
              <td className="py-3 font-mono" style={{ color: '#5a7247' }}>${microToUsd(r.totalCostMicro)}</td>
              <td className="py-3 text-stone-500">{formatNumber(r.inputTokens)}</td>
              <td className="py-3 text-stone-500">{formatNumber(r.outputTokens)}</td>
              <td className="py-3 text-stone-500">{formatNumber(r.callCount)}</td>
            </tr>
          ))}
          {sorted.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-stone-400">데이터가 없습니다</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

// === Model Table ===

function ModelTable({ items }: { items: CostByModel[] }) {
  const [sort, setSort] = useState<SortConfig>({ field: 'totalCostMicro', dir: 'desc' })
  const toggle = (f: string) => setSort(p => ({ field: f, dir: p.field === f && p.dir === 'desc' ? 'asc' : 'desc' }))
  const sorted = useMemo(() => sortByField(items, sort), [items, sort])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 text-stone-400">
            <SortableHeader label="모델" field="displayName" sort={sort} onSort={toggle} />
            <SortableHeader label="프로바이더" field="provider" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <SortableHeader label="호출 수" field="callCount" sort={sort} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={`${r.provider}-${r.model}`} className="border-b border-stone-50 hover:bg-[#faf8f5]/50">
              <td className="py-3 font-medium">{r.displayName}</td>
              <td className="py-3 text-stone-500 capitalize">{r.provider}</td>
              <td className="py-3 font-mono" style={{ color: '#5a7247' }}>${microToUsd(r.totalCostMicro)}</td>
              <td className="py-3 text-stone-500">{formatNumber(r.callCount)}</td>
            </tr>
          ))}
          {sorted.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-stone-400">데이터가 없습니다</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

// === Cost Tabs ===

function CostTabs({ startDate, endDate, companyId }: { startDate: string; endDate: string; companyId: string }) {
  const [tab, setTab] = useState('department')
  const qs = `?startDate=${startDate}&endDate=${endDate}`

  const { data: agentData, isLoading: agentLoading } = useQuery({
    queryKey: ['costs-by-agent', companyId, startDate, endDate],
    queryFn: () => api.get<ApiResponse<{ items: CostByAgent[] }>>(`/admin/costs/by-agent${qs}`),
    enabled: !!companyId && tab === 'agent',
  })

  const { data: modelData, isLoading: modelLoading } = useQuery({
    queryKey: ['costs-by-model', companyId, startDate, endDate],
    queryFn: () => api.get<ApiResponse<{ items: CostByModel[] }>>(`/admin/costs/by-model${qs}`),
    enabled: !!companyId && tab === 'model',
  })

  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['costs-by-dept', companyId, startDate, endDate],
    queryFn: () => api.get<ApiResponse<{ items: CostByDepartment[] }>>(`/admin/costs/by-department${qs}`),
    enabled: !!companyId && tab === 'department',
  })

  const tabs = [
    { value: 'department', label: '부서별' },
    { value: 'agent', label: '에이전트별' },
    { value: 'model', label: '모델별' },
  ]

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <svg className="w-5 h-5" style={{ color: '#5a7247' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          부서별 사용 현황
        </h4>
        <div className="flex gap-1" data-testid="costs-axis-tabs">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                tab === t.value
                  ? 'text-white'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
              style={tab === t.value ? { backgroundColor: '#5a7247' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        {tab === 'department' && (deptLoading
          ? <div className="h-32 bg-stone-50 rounded animate-pulse" />
          : <DepartmentTable items={deptData?.data?.items ?? []} />
        )}
        {tab === 'agent' && (agentLoading
          ? <div className="h-32 bg-stone-50 rounded animate-pulse" />
          : <AgentTable items={agentData?.data?.items ?? []} />
        )}
        {tab === 'model' && (modelLoading
          ? <div className="h-32 bg-stone-50 rounded animate-pulse" />
          : <ModelTable items={modelData?.data?.items ?? []} />
        )}
      </div>
    </div>
  )
}

// === Budget Panel ===

function BudgetPanel({ companyId, summaryData }: { companyId: string; summaryData: CostSummary | undefined }) {
  const qc = useQueryClient()
  const addToast = useToastStore(s => s.addToast)

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget', companyId],
    queryFn: () => api.get<ApiResponse<BudgetConfig>>('/admin/budget'),
    enabled: !!companyId,
  })

  const budget = budgetData?.data

  const [form, setForm] = useState<{
    monthlyBudget: string
    dailyBudget: string
    warningThreshold: string
    autoBlock: boolean
  } | null>(null)

  const activeForm = form ?? (budget ? {
    monthlyBudget: String(budget.monthlyBudget),
    dailyBudget: String(budget.dailyBudget),
    warningThreshold: String(budget.warningThreshold),
    autoBlock: budget.autoBlock,
  } : null)

  const mutation = useMutation({
    mutationFn: (body: Partial<BudgetConfig>) => api.put<ApiResponse<BudgetConfig>>('/admin/budget', body),
    onSuccess: () => {
      addToast({ type: 'success', message: '예산 설정이 저장되었습니다' })
      setForm(null)
      qc.invalidateQueries({ queryKey: ['budget'] })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message || '저장 실패' })
    },
  })

  const handleSave = () => {
    if (!activeForm) return
    const monthly = Number(activeForm.monthlyBudget)
    const daily = Number(activeForm.dailyBudget)
    const threshold = Number(activeForm.warningThreshold)
    if (isNaN(monthly) || isNaN(daily) || isNaN(threshold)) {
      addToast({ type: 'error', message: '숫자를 입력해주세요' })
      return
    }
    if (threshold < 0 || threshold > 100) {
      addToast({ type: 'error', message: '경고 임계값은 0~100% 사이여야 합니다' })
      return
    }
    mutation.mutate({
      monthlyBudget: monthly,
      dailyBudget: daily,
      warningThreshold: threshold,
      autoBlock: activeForm.autoBlock,
    })
  }

  const setField = (field: string, value: string | boolean) => {
    setForm(prev => ({
      ...(prev ?? activeForm ?? { monthlyBudget: '0', dailyBudget: '0', warningThreshold: '80', autoBlock: true }),
      [field]: value,
    }))
  }

  const monthlyBudgetMicro = budget ? budget.monthlyBudget : 0
  const currentSpendMicro = summaryData?.totalCostMicro ?? 0
  const usagePercent = monthlyBudgetMicro > 0 ? Math.min((currentSpendMicro / monthlyBudgetMicro) * 100, 100) : 83

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="h-40 bg-stone-50 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
      <div>
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2" data-testid="budget-panel-title">
          <svg className="w-5 h-5" style={{ color: '#d4a843' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          예산 설정
        </h4>
        <p className="text-sm text-stone-500 mb-6">월간 최대 지출 한도를 설정하고 알림을 받습니다.</p>

        {activeForm && (
          <>
            <label className="block text-xs font-bold text-stone-400 uppercase mb-2">월간 예산 한도 (USD)</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                <input
                  className="w-full pl-8 pr-4 py-3 border-stone-200 rounded-xl focus:border-[#5a7247] focus:ring-[#5a7247] transition-all"
                  style={{ backgroundColor: '#faf8f5' }}
                  type="number"
                  value={activeForm.monthlyBudget}
                  onChange={(e) => setField('monthlyBudget', e.target.value)}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={mutation.isPending}
                className="text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
                style={{ backgroundColor: '#5a7247' }}
                data-testid="budget-save-btn"
              >
                {mutation.isPending ? '...' : '저장'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-stone-100">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-stone-500">현재 사용량 ({Math.round(usagePercent)}%)</span>
          <span className="font-bold">{`$${microToUsd(currentSpendMicro)}`} / {activeForm ? `$${Number(activeForm.monthlyBudget).toLocaleString()}` : '$0'}</span>
        </div>
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${usagePercent}%`, backgroundColor: '#d4a843' }} />
        </div>
      </div>
    </div>
  )
}

// === Recent Cost Records Table ===

function RecentCostRecords({ startDate, endDate, companyId }: { startDate: string; endDate: string; companyId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['costs-daily', companyId, startDate, endDate],
    queryFn: () => api.get<ApiResponse<{ items: CostDaily[] }>>(`/admin/costs/daily?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!companyId,
  })

  const items = data?.data?.items ?? []

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex items-center justify-between">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <svg className="w-5 h-5" style={{ color: '#c4622d' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          최근 비용 기록
        </h4>
      </div>

      {isLoading ? (
        <div className="p-8">
          <div className="h-40 bg-stone-50 rounded animate-pulse" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-stone-400 text-sm">데이터가 없습니다</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/50">
              <tr className="text-stone-400">
                <th className="px-6 py-4 font-medium">일시</th>
                <th className="px-6 py-4 font-medium">입력 토큰</th>
                <th className="px-6 py-4 font-medium">출력 토큰</th>
                <th className="px-6 py-4 font-medium">호출 수</th>
                <th className="px-6 py-4 font-medium text-right">비용</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.slice(0, 10).map((d) => (
                <tr key={d.date} className="hover:bg-[#faf8f5]/50 transition-colors">
                  <td className="px-6 py-4 text-stone-500">{d.date}</td>
                  <td className="px-6 py-4">{formatNumber(d.inputTokens)}</td>
                  <td className="px-6 py-4">{formatNumber(d.outputTokens)}</td>
                  <td className="px-6 py-4">{formatNumber(d.callCount)}</td>
                  <td className="px-6 py-4 text-right font-bold" style={{ fontFamily: 'serif', color: '#5a7247' }}>${microToUsd(d.costMicro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 border-t border-stone-100 bg-stone-50/30 flex justify-center">
        <nav className="flex gap-1">
          <button className="w-8 h-8 rounded flex items-center justify-center text-stone-400 hover:bg-stone-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
          </button>
          <button className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#5a7247' }}>1</button>
          <button className="w-8 h-8 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 text-xs font-medium">2</button>
          <button className="w-8 h-8 rounded flex items-center justify-center text-stone-400 hover:bg-stone-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
          </button>
        </nav>
      </div>
    </section>
  )
}

// === Main Page ===

export function CostsPage() {
  const companyId = useAdminStore(s => s.selectedCompanyId)
  const defaults = useMemo(() => defaultDates(), [])
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['costs-summary', companyId, startDate, endDate],
    queryFn: () => api.get<ApiResponse<CostSummary>>(`/admin/costs/summary?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!companyId,
  })

  const summary = summaryData?.data

  if (!companyId) {
    return (
      <div data-testid="costs-page" className="p-8" style={{ backgroundColor: '#faf8f5' }}>
        <h1 className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>비용 관리</h1>
        <div className="bg-white rounded-2xl border border-stone-100 p-8 mt-4">
          <p data-testid="costs-no-company" className="text-sm text-stone-500 text-center">회사를 먼저 선택해주세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="costs-page" style={{ backgroundColor: '#faf8f5', fontFamily: "'Public Sans', sans-serif", color: '#3f3e3a' }}>
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>비용 및 예산 관리</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border-none rounded-full text-sm w-36"
                style={{ backgroundColor: '#faf8f5' }}
              />
              <span className="text-stone-400 text-xs">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border-none rounded-full text-sm w-36"
                style={{ backgroundColor: '#faf8f5' }}
              />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Summary Section */}
          {summaryLoading ? <SummaryCardsSkeleton /> : <SummaryCards data={summary} />}

          {/* Budget + Department Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget Setting Card */}
            <BudgetPanel companyId={companyId} summaryData={summary} />

            {/* Cost by Department */}
            <CostTabs startDate={startDate} endDate={endDate} companyId={companyId} />
          </div>

          {/* Cost Records Table */}
          <RecentCostRecords startDate={startDate} endDate={endDate} companyId={companyId} />
        </div>
      </main>
    </div>
  )
}
