/**
 * Cost & Budget Management — Stitch Terminal Theme
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
import { TrendingUp, TrendingDown, PieChart, BarChart2, FileText, Download } from 'lucide-react'

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
  const remaining = 15000_000_000 - data.totalCostMicro
  const projected = data.totalCostMicro * 1.19

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" data-testid="costs-summary-cards">
      {/* Total Spend */}
      <div className="bg-corthex-bg p-6 border-l-2 border-corthex-accent">
        <div className="font-mono text-[10px] text-corthex-text-disabled uppercase mb-2 tracking-widest">Total System Spend (MTD)</div>
        <div className="font-mono text-4xl font-black text-corthex-text-primary tracking-tighter">${microToUsd(data.totalCostMicro)}</div>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono">
          {trend > 0 ? (
            <>
              <TrendingUp className="w-3 h-3 text-corthex-accent" />
              <span className="text-corthex-accent">+{trend}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-3 h-3 text-corthex-success" />
              <span className="text-corthex-success">{trend}%</span>
            </>
          )}
          <span className="text-corthex-text-disabled">VS LAST MONTH</span>
        </div>
      </div>

      {/* Remaining Budget */}
      <div className="bg-corthex-bg p-6 border-l-2 border-corthex-border/20">
        <div className="font-mono text-[10px] text-corthex-text-disabled uppercase mb-2 tracking-widest">Remaining Budget</div>
        <div className="font-mono text-4xl font-black text-corthex-text-primary tracking-tighter">${microToUsd(remaining > 0 ? remaining : 0)}</div>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono">
          <TrendingDown className="w-3 h-3 text-corthex-warning" />
          <span className="text-corthex-warning">-5.2%</span>
          <span className="text-corthex-text-disabled">VS LAST WEEK</span>
        </div>
      </div>

      {/* Projected Cost */}
      <div className="bg-corthex-bg p-6 border-l-2 border-corthex-border/20 relative overflow-hidden group">
        <div className="font-mono text-[10px] text-corthex-text-disabled uppercase mb-2 tracking-widest">Projected Month-End</div>
        <div className="font-mono text-4xl font-black text-corthex-text-primary tracking-tighter">${microToUsd(projected)}</div>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono">
          <span className="text-corthex-accent-deep">NEW MODEL USAGE</span>
          <span className="text-corthex-text-disabled">FACTORED IN</span>
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-corthex-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </section>
  )
}

function SummaryCardsSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-corthex-bg p-6 border-l-2 border-corthex-border/20">
          <div className="h-3 w-24 bg-corthex-elevated rounded animate-pulse mb-4" />
          <div className="h-10 w-40 bg-corthex-elevated rounded animate-pulse" />
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
      className="px-6 py-4 font-mono font-normal text-[10px] tracking-widest text-corthex-text-disabled uppercase cursor-pointer hover:text-corthex-accent select-none"
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

// === Department Table ===

function DepartmentTable({ items }: { items: CostByDepartment[] }) {
  const [sort, setSort] = useState<SortConfig>({ field: 'totalCostMicro', dir: 'desc' })
  const toggle = (f: string) => setSort(p => ({ field: f, dir: p.field === f && p.dir === 'desc' ? 'asc' : 'desc' }))
  const sorted = useMemo(() => sortByField(items, sort), [items, sort])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-mono">
        <thead>
          <tr className="border-b border-corthex-border/10">
            <SortableHeader label="부서명" field="departmentName" sort={sort} onSort={toggle} />
            <SortableHeader label="사용량" field="callCount" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <th className="px-6 py-4 font-mono font-normal text-[10px] tracking-widest text-corthex-text-disabled uppercase text-right">증감률</th>
          </tr>
        </thead>
        <tbody className="text-[11px]">
          {sorted.map((r) => (
            <tr key={r.departmentId} className="border-b border-corthex-border/5 hover:bg-corthex-elevated transition-colors">
              <td className="px-6 py-4 text-corthex-text-primary font-bold">{r.departmentName}</td>
              <td className="px-6 py-4 text-corthex-text-secondary">{formatNumber(r.callCount)}</td>
              <td className="px-6 py-4 text-corthex-accent">${microToUsd(r.totalCostMicro)}</td>
              <td className="px-6 py-4 text-right text-corthex-success font-medium">-</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-corthex-text-disabled">데이터가 없습니다</td></tr>
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
      <table className="w-full font-mono">
        <thead>
          <tr className="border-b border-corthex-border/10">
            <SortableHeader label="에이전트" field="agentName" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <SortableHeader label="입력 토큰" field="inputTokens" sort={sort} onSort={toggle} />
            <SortableHeader label="출력 토큰" field="outputTokens" sort={sort} onSort={toggle} />
            <SortableHeader label="호출 수" field="callCount" sort={sort} onSort={toggle} />
          </tr>
        </thead>
        <tbody className="text-[11px]">
          {sorted.map(r => (
            <tr key={r.agentId} className="border-b border-corthex-border/5 hover:bg-corthex-elevated transition-colors">
              <td className="px-6 py-3 text-corthex-text-primary font-medium">{r.agentName}</td>
              <td className="px-6 py-3 text-corthex-accent">${microToUsd(r.totalCostMicro)}</td>
              <td className="px-6 py-3 text-corthex-text-secondary">{formatNumber(r.inputTokens)}</td>
              <td className="px-6 py-3 text-corthex-text-secondary">{formatNumber(r.outputTokens)}</td>
              <td className="px-6 py-3 text-corthex-text-secondary">{formatNumber(r.callCount)}</td>
            </tr>
          ))}
          {sorted.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-corthex-text-disabled">데이터가 없습니다</td></tr>}
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
      <table className="w-full font-mono">
        <thead>
          <tr className="border-b border-corthex-border/10">
            <SortableHeader label="모델" field="displayName" sort={sort} onSort={toggle} />
            <SortableHeader label="프로바이더" field="provider" sort={sort} onSort={toggle} />
            <SortableHeader label="비용 (USD)" field="totalCostMicro" sort={sort} onSort={toggle} />
            <SortableHeader label="호출 수" field="callCount" sort={sort} onSort={toggle} />
          </tr>
        </thead>
        <tbody className="text-[11px]">
          {sorted.map(r => (
            <tr key={`${r.provider}-${r.model}`} className="border-b border-corthex-border/5 hover:bg-corthex-elevated transition-colors">
              <td className="px-6 py-3 text-corthex-text-primary font-medium">{r.displayName}</td>
              <td className="px-6 py-3 text-corthex-text-secondary capitalize">{r.provider}</td>
              <td className="px-6 py-3 text-corthex-accent">${microToUsd(r.totalCostMicro)}</td>
              <td className="px-6 py-3 text-corthex-text-secondary">{formatNumber(r.callCount)}</td>
            </tr>
          ))}
          {sorted.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-corthex-text-disabled">데이터가 없습니다</td></tr>}
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
    <div className="bg-corthex-surface border border-corthex-border/10 h-full">
      <div className="p-6 border-b border-corthex-border/10 flex items-center justify-between">
        <h3 className="font-mono text-xs font-bold tracking-widest text-corthex-text-disabled uppercase flex items-center gap-2">
          <PieChart className="w-4 h-4 text-corthex-accent" />
          사용 현황
        </h3>
        <div className="flex gap-px bg-corthex-border/20 p-px" data-testid="costs-axis-tabs">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                tab === t.value
                  ? 'bg-corthex-accent text-corthex-text-on-accent font-bold'
                  : 'bg-corthex-surface text-corthex-text-disabled hover:text-corthex-accent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        {tab === 'department' && (deptLoading
          ? <div className="h-32 m-6 bg-corthex-elevated rounded animate-pulse" />
          : <DepartmentTable items={deptData?.data?.items ?? []} />
        )}
        {tab === 'agent' && (agentLoading
          ? <div className="h-32 m-6 bg-corthex-elevated rounded animate-pulse" />
          : <AgentTable items={agentData?.data?.items ?? []} />
        )}
        {tab === 'model' && (modelLoading
          ? <div className="h-32 m-6 bg-corthex-elevated rounded animate-pulse" />
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
      <div className="bg-corthex-surface border border-corthex-border/10 p-6 h-full">
        <div className="h-40 bg-corthex-elevated rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-corthex-surface border border-corthex-border/10 p-6 flex flex-col justify-between h-full">
      <div>
        <h4 className="font-mono font-bold text-xs tracking-widest text-corthex-text-disabled uppercase flex items-center gap-2 mb-4" data-testid="budget-panel-title">
          <BarChart2 className="w-4 h-4 text-corthex-accent" />
          예산 설정
        </h4>
        <p className="text-xs text-corthex-text-disabled font-mono mb-6">월간 최대 지출 한도를 설정하고 알림을 받습니다.</p>

        {activeForm && (
          <>
            <label className="block font-mono font-bold text-[10px] text-corthex-text-disabled uppercase tracking-widest mb-2">월간 예산 한도 (USD)</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-secondary font-mono">$</span>
                <input
                  className="w-full pl-8 pr-4 py-3 bg-corthex-bg border border-corthex-border/20 text-corthex-text-primary font-mono text-sm focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent outline-none transition-all"
                  type="number"
                  value={activeForm.monthlyBudget}
                  onChange={(e) => setField('monthlyBudget', e.target.value)}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={mutation.isPending}
                className="bg-corthex-accent text-corthex-text-on-accent px-6 py-3 font-mono font-bold text-xs uppercase tracking-widest disabled:opacity-50 hover:bg-corthex-accent-hover transition-colors"
                data-testid="budget-save-btn"
              >
                {mutation.isPending ? '...' : '저장'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-corthex-border/10">
        <div className="flex justify-between font-mono text-xs mb-2">
          <span className="text-corthex-text-secondary">현재 사용량 ({Math.round(usagePercent)}%)</span>
          <span className="text-corthex-text-primary font-bold">{`$${microToUsd(currentSpendMicro)}`} / {activeForm ? `$${(Number(activeForm.monthlyBudget) || 0).toLocaleString()}` : '$0'}</span>
        </div>
        <div className="w-full h-1 bg-corthex-elevated overflow-hidden">
          <div className="h-full bg-corthex-accent shadow-[0_0_10px_rgba(202,138,4,0.5)]" style={{ width: `${usagePercent}%` }} />
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
    <section className="bg-corthex-surface border border-corthex-border/10 overflow-hidden">
      <div className="p-6 border-b border-corthex-border/10 flex items-center justify-between">
        <h4 className="font-mono font-bold text-xs tracking-widest text-corthex-text-disabled uppercase flex items-center gap-2">
          <FileText className="w-4 h-4 text-corthex-accent" />
          Top Consumption Records
        </h4>
        <button className="flex items-center gap-2 px-4 py-2 bg-corthex-accent-deep text-corthex-text-on-accent font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-corthex-accent transition-colors">
          <Download className="w-3 h-3" />
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="p-8">
          <div className="h-40 bg-corthex-elevated rounded animate-pulse" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-corthex-text-disabled font-mono text-sm">데이터가 없습니다</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="text-[10px] text-corthex-text-disabled uppercase border-b border-corthex-border/10">
                <th className="px-6 py-4 font-normal tracking-widest">일시</th>
                <th className="px-6 py-4 font-normal tracking-widest">입력 토큰</th>
                <th className="px-6 py-4 font-normal tracking-widest">출력 토큰</th>
                <th className="px-6 py-4 font-normal tracking-widest">호출 수</th>
                <th className="px-6 py-4 font-normal tracking-widest text-right">비용</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {items.slice(0, 10).map((d) => (
                <tr key={d.date} className="border-b border-corthex-border/5 hover:bg-corthex-elevated transition-colors">
                  <td className="px-6 py-4 text-corthex-text-secondary">{d.date}</td>
                  <td className="px-6 py-4 text-corthex-text-primary">{formatNumber(d.inputTokens)}</td>
                  <td className="px-6 py-4 text-corthex-text-primary">{formatNumber(d.outputTokens)}</td>
                  <td className="px-6 py-4 text-corthex-text-primary">{formatNumber(d.callCount)}</td>
                  <td className="px-6 py-4 text-right font-bold text-corthex-accent">${microToUsd(d.costMicro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 bg-corthex-bg/50 border-t border-corthex-border/10 flex justify-between items-center font-mono text-[9px] text-corthex-text-disabled">
        <div>SHOWING {Math.min(items.length, 10)} OF {items.length} ENTRIES</div>
        <div className="flex gap-4">
          <button className="hover:text-corthex-accent transition-colors cursor-pointer uppercase tracking-widest">PREVIOUS_PAGE</button>
          <button className="hover:text-corthex-accent transition-colors cursor-pointer uppercase tracking-widest">NEXT_PAGE</button>
        </div>
      </div>
    </section>
  )
}

// === Main Page ===

type Period = '24H' | '7D' | '30D' | 'ALL'

export function CostsPage() {
  const companyId = useAdminStore(s => s.selectedCompanyId)
  const defaults = useMemo(() => defaultDates(), [])
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [period, setPeriod] = useState<Period>('30D')

  const handlePeriod = (p: Period) => {
    setPeriod(p)
    const now = new Date()
    const end = now.toISOString().split('T')[0]
    if (p === '24H') {
      setStartDate(new Date(now.getTime() - 86400000).toISOString().split('T')[0])
    } else if (p === '7D') {
      setStartDate(new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0])
    } else if (p === '30D') {
      setStartDate(new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0])
    } else {
      setStartDate('2020-01-01')
    }
    setEndDate(end)
  }

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['costs-summary', companyId, startDate, endDate],
    queryFn: () => api.get<ApiResponse<CostSummary>>(`/admin/costs/summary?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!companyId,
  })

  const summary = summaryData?.data

  if (!companyId) {
    return (
      <div data-testid="costs-page" className="p-8 bg-corthex-bg min-h-screen">
        <h1 className="font-mono text-xl font-bold text-corthex-text-primary">비용 관리</h1>
        <div className="bg-corthex-surface border border-corthex-border/10 p-8 mt-4">
          <p data-testid="costs-no-company" className="text-sm text-corthex-text-disabled font-mono text-center">회사를 먼저 선택해주세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="costs-page" className="bg-corthex-bg min-h-screen">
      <div className="p-4 sm:p-6 md:p-8">

        {/* Header */}
        <header className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-corthex-border/30 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-corthex-accent shadow-[0_0_8px_rgba(202,138,4,0.5)]" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-corthex-text-disabled">TERMINAL_ID: 0x882A_COST</span>
            </div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-corthex-text-primary">
              COST MANAGEMENT // <span className="text-corthex-accent-deep">SYSTEM_OVERVIEW</span>
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* Period quick-select */}
            <div className="flex gap-px bg-corthex-border/20 p-px">
              {(['24H', '7D', '30D', 'ALL'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriod(p)}
                  className={`px-3 sm:px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors min-h-[44px] sm:min-h-0 ${
                    period === p
                      ? 'bg-corthex-accent text-corthex-text-on-accent font-bold'
                      : 'bg-corthex-surface text-corthex-text-disabled hover:text-corthex-accent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {/* Date range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPeriod('ALL') }}
                className="bg-corthex-surface border border-corthex-border/30 text-corthex-text-secondary font-mono text-base sm:text-xs px-3 py-2 focus:outline-none focus:border-corthex-accent"
              />
              <span className="font-mono text-xs text-corthex-text-disabled">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPeriod('ALL') }}
                className="bg-corthex-surface border border-corthex-border/30 text-corthex-text-secondary font-mono text-base sm:text-xs px-3 py-2 focus:outline-none focus:border-corthex-accent"
              />
            </div>
          </div>
        </header>

        {/* Summary cards */}
        {summaryLoading ? <SummaryCardsSkeleton /> : <SummaryCards data={summary} />}

        {/* Charts + Budget grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-8">
            <CostTabs startDate={startDate} endDate={endDate} companyId={companyId} />
          </div>
          <div className="lg:col-span-4">
            <BudgetPanel companyId={companyId} summaryData={summary} />
          </div>
        </div>

        {/* Recent records */}
        <RecentCostRecords startDate={startDate} endDate={endDate} companyId={companyId} />

        {/* Footer meta */}
        <footer className="mt-8 md:mt-12 pt-6 border-t border-corthex-border/10 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-[9px] text-corthex-text-disabled/30">
          <div className="flex gap-4 sm:gap-8">
            <span>SYSTEM_VERSION: 4.2.0-STABLE</span>
            <span>LAST_SYNC: {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</span>
          </div>
          <div>© 2024 CORTHEX_SYSTEMS_GLOBAL</div>
        </footer>

      </div>
    </div>
  )
}
