import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { Card, CardContent, Skeleton, Tabs, Toggle, Input, Button, ProgressBar } from '@corthex/ui'

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

  const anthropicCost = data.byProvider.find(p => p.provider === 'anthropic')?.costMicro ?? 0
  const openaiCost = data.byProvider.find(p => p.provider === 'openai')?.costMicro ?? 0
  const trend = data.trendPercent

  const cards = [
    { label: '총 비용', value: `$${microToUsd(data.totalCostMicro)}`, sub: `${formatNumber(data.totalCalls)} calls` },
    { label: 'Anthropic', value: `$${microToUsd(anthropicCost)}`, sub: 'Claude' },
    { label: 'OpenAI', value: `$${microToUsd(openaiCost)}`, sub: 'GPT' },
    {
      label: '전월 대비',
      value: `${trend > 0 ? '+' : ''}${trend}%`,
      sub: trend > 0 ? '증가' : trend < 0 ? '감소' : '변동 없음',
      color: trend > 0 ? 'text-red-500' : trend < 0 ? 'text-emerald-500' : 'text-zinc-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <Card key={c.label}>
          <CardContent>
            <p className="text-xs text-zinc-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color ?? 'text-zinc-900 dark:text-zinc-100'}`}>{c.value}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}><CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
      ))}
    </div>
  )
}

// === Sortable Table ===

type SortConfig = { field: string; dir: 'asc' | 'desc' }

function SortableHeader({ label, field, sort, onSort }: { label: string; field: string; sort: SortConfig; onSort: (f: string) => void }) {
  const arrow = sort.field === field ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''
  return (
    <th
      className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 select-none"
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

function AgentTable({ items }: { items: CostByAgent[] }) {
  const [sort, setSort] = useState<SortConfig>({ field: 'totalCostMicro', dir: 'desc' })
  const toggle = (f: string) => setSort(p => ({ field: f, dir: p.field === f && p.dir === 'desc' ? 'asc' : 'desc' }))

  const sorted = useMemo(() => sortByField(items, sort), [items, sort])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <SortableHeader label="에이전트" field="agentName" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <SortableHeader label="입력 토큰" field="inputTokens" sort={sort} onSort={toggle} />
            <SortableHeader label="출력 토큰" field="outputTokens" sort={sort} onSort={toggle} />
            <SortableHeader label="호출 수" field="callCount" sort={sort} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.agentId} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
              <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{r.agentName}</td>
              <td className="px-3 py-2 font-mono text-zinc-700 dark:text-zinc-300">${microToUsd(r.totalCostMicro)}</td>
              <td className="px-3 py-2 text-zinc-500">{formatNumber(r.inputTokens)}</td>
              <td className="px-3 py-2 text-zinc-500">{formatNumber(r.outputTokens)}</td>
              <td className="px-3 py-2 text-zinc-500">{formatNumber(r.callCount)}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={5} className="px-3 py-8 text-center text-zinc-400">데이터가 없습니다</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ModelTable({ items }: { items: CostByModel[] }) {
  const [sort, setSort] = useState<SortConfig>({ field: 'totalCostMicro', dir: 'desc' })
  const toggle = (f: string) => setSort(p => ({ field: f, dir: p.field === f && p.dir === 'desc' ? 'asc' : 'desc' }))

  const sorted = useMemo(() => sortByField(items, sort), [items, sort])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <SortableHeader label="모델" field="displayName" sort={sort} onSort={toggle} />
            <SortableHeader label="프로바이더" field="provider" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <SortableHeader label="입력 토큰" field="inputTokens" sort={sort} onSort={toggle} />
            <SortableHeader label="출력 토큰" field="outputTokens" sort={sort} onSort={toggle} />
            <SortableHeader label="호출 수" field="callCount" sort={sort} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={`${r.provider}-${r.model}`} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
              <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{r.displayName}</td>
              <td className="px-3 py-2 text-zinc-500 capitalize">{r.provider}</td>
              <td className="px-3 py-2 font-mono text-zinc-700 dark:text-zinc-300">${microToUsd(r.totalCostMicro)}</td>
              <td className="px-3 py-2 text-zinc-500">{formatNumber(r.inputTokens)}</td>
              <td className="px-3 py-2 text-zinc-500">{formatNumber(r.outputTokens)}</td>
              <td className="px-3 py-2 text-zinc-500">{formatNumber(r.callCount)}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={6} className="px-3 py-8 text-center text-zinc-400">데이터가 없습니다</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function DepartmentTable({ items }: { items: CostByDepartment[] }) {
  const [sort, setSort] = useState<SortConfig>({ field: 'totalCostMicro', dir: 'desc' })
  const toggle = (f: string) => setSort(p => ({ field: f, dir: p.field === f && p.dir === 'desc' ? 'asc' : 'desc' }))

  const sorted = useMemo(() => sortByField(items, sort), [items, sort])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <SortableHeader label="부서" field="departmentName" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <SortableHeader label="에이전트 수" field="agentCount" sort={sort} onSort={toggle} />
            <SortableHeader label="호출 수" field="callCount" sort={sort} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.departmentId} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
              <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{r.departmentName}</td>
              <td className="px-3 py-2 font-mono text-zinc-700 dark:text-zinc-300">${microToUsd(r.totalCostMicro)}</td>
              <td className="px-3 py-2 text-zinc-500">{r.agentCount}</td>
              <td className="px-3 py-2 text-zinc-500">{formatNumber(r.callCount)}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={4} className="px-3 py-8 text-center text-zinc-400">데이터가 없습니다</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// === 3-Axis Cost Tabs ===

function CostTabs({ startDate, endDate, companyId }: { startDate: string; endDate: string; companyId: string }) {
  const [tab, setTab] = useState('agent')

  const tabs = [
    { value: 'agent', label: '에이전트별' },
    { value: 'model', label: '모델별' },
    { value: 'department', label: '부서별' },
  ]

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

  return (
    <Card>
      <CardContent>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">3축 비용 분석</h2>
        <Tabs items={tabs} value={tab} onChange={setTab} />
        <div className="mt-4">
          {tab === 'agent' && (agentLoading ? <Skeleton className="h-32 w-full" /> : <AgentTable items={agentData?.data?.items ?? []} />)}
          {tab === 'model' && (modelLoading ? <Skeleton className="h-32 w-full" /> : <ModelTable items={modelData?.data?.items ?? []} />)}
          {tab === 'department' && (deptLoading ? <Skeleton className="h-32 w-full" /> : <DepartmentTable items={deptData?.data?.items ?? []} />)}
        </div>
      </CardContent>
    </Card>
  )
}

// === Daily Cost Bar Chart ===

const CHART_PERIODS = [
  { value: '7', label: '7일' },
  { value: '30', label: '30일' },
]

function DailyChart({ companyId, endDate }: { companyId: string; endDate: string }) {
  const [days, setDays] = useState('30')

  const chartStart = useMemo(() => {
    const d = new Date(endDate)
    d.setDate(d.getDate() - Number(days))
    return d.toISOString().split('T')[0]
  }, [endDate, days])

  const { data, isLoading } = useQuery({
    queryKey: ['costs-daily', companyId, chartStart, endDate],
    queryFn: () => api.get<ApiResponse<{ items: CostDaily[] }>>(`/admin/costs/daily?startDate=${chartStart}&endDate=${endDate}`),
    enabled: !!companyId,
  })

  const items = data?.data?.items ?? []
  const maxCost = Math.max(...items.map(d => d.costMicro), 1)

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">일일 비용 추이</h2>
          <div className="flex gap-1">
            {CHART_PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setDays(p.value)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  days === p.value
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : items.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-zinc-400 text-sm">데이터가 없습니다</div>
        ) : (
          <div className="flex items-end gap-[2px] h-40">
            {items.map(d => {
              const pct = (d.costMicro / maxCost) * 100
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative">
                  <div
                    className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t transition-all hover:bg-indigo-600 dark:hover:bg-indigo-300 min-h-[2px]"
                    style={{ height: `${Math.max(pct, 1)}%` }}
                  />
                  <span className="text-[8px] text-zinc-400 mt-1 truncate w-full text-center">
                    {d.date.slice(5)}
                  </span>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    ${microToUsd(d.costMicro)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// === Budget Settings Panel ===

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

  // Sync form with loaded data
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

  // Budget usage progress
  const monthlyBudgetMicro = budget ? budget.monthlyBudget : 0
  const currentSpendMicro = summaryData?.totalCostMicro ?? 0
  const usagePercent = monthlyBudgetMicro > 0 ? Math.min((currentSpendMicro / monthlyBudgetMicro) * 100, 100) : 0

  if (isLoading) return <Card><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>

  return (
    <Card>
      <CardContent>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">예산 설정</h2>

        {monthlyBudgetMicro > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>이번 달 사용량</span>
              <span>${microToUsd(currentSpendMicro)} / ${microToUsd(monthlyBudgetMicro)}</span>
            </div>
            <ProgressBar value={usagePercent} />
          </div>
        )}

        {activeForm && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">월간 예산 (microdollars, 0 = 무제한)</label>
              <Input
                type="number"
                min="0"
                value={activeForm.monthlyBudget}
                onChange={e => setField('monthlyBudget', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">일일 예산 (microdollars, 0 = 무제한)</label>
              <Input
                type="number"
                min="0"
                value={activeForm.dailyBudget}
                onChange={e => setField('dailyBudget', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">경고 임계값 (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={activeForm.warningThreshold}
                onChange={e => setField('warningThreshold', e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">초과 시 자동 차단</span>
              <Toggle
                checked={activeForm.autoBlock}
                onChange={v => setField('autoBlock', v)}
                label=""
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? '저장 중...' : '설정 저장'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// === Date Range Filter ===

function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange }: {
  startDate: string; endDate: string; onStartChange: (v: string) => void; onEndChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={startDate}
        onChange={e => onStartChange(e.target.value)}
        className="w-36 text-xs"
      />
      <span className="text-zinc-400 text-xs">~</span>
      <Input
        type="date"
        value={endDate}
        onChange={e => onEndChange(e.target.value)}
        className="w-36 text-xs"
      />
    </div>
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
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">비용 관리</h1>
        <Card><CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">회사를 먼저 선택해주세요.</p>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">비용 관리</h1>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      {/* Summary Cards */}
      {summaryLoading ? <SummaryCardsSkeleton /> : <SummaryCards data={summary} />}

      {/* Main Content: 3-Axis Table + Budget Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CostTabs startDate={startDate} endDate={endDate} companyId={companyId} />
        </div>
        <div>
          <BudgetPanel companyId={companyId} summaryData={summary} />
        </div>
      </div>

      {/* Daily Chart */}
      <DailyChart companyId={companyId} endDate={endDate} />
    </div>
  )
}
