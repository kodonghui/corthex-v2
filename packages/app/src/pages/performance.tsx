import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Skeleton, SkeletonTable, EmptyState, Modal, ConfirmDialog, toast } from '@corthex/ui'
import { api } from '../lib/api'
import type {
  PerformanceSummary,
  AgentPerformance,
  AgentPerformanceDetail,
  SoulGymSuggestion,
} from '@corthex/shared'

// === Constants ===

const PERFORMANCE_BADGE: Record<string, { label: string; className: string }> = {
  high: { label: '우수', className: 'bg-emerald-500/15 text-emerald-400' },
  mid: { label: '보통', className: 'bg-amber-500/15 text-amber-400' },
  low: { label: '개선 필요', className: 'bg-red-500/15 text-red-400' },
}

const SUGGESTION_TYPE_BADGE: Record<string, { label: string; className: string }> = {
  'prompt-improve': { label: '프롬프트 개선', className: 'bg-purple-500/15 text-purple-400' },
  'add-tool': { label: '도구 추가', className: 'bg-blue-500/15 text-blue-400' },
  'change-model': { label: '모델 변경', className: 'bg-amber-500/15 text-amber-400' },
}

const SUGGESTION_TYPE_LABEL: Record<string, string> = {
  'prompt-improve': '프롬프트 개선',
  'add-tool': '도구 추가',
  'change-model': '모델 변경',
}

const ROLE_LABEL: Record<string, string> = {
  manager: '팀장',
  specialist: '전문가',
  worker: '실무자',
}

const ROLE_BADGE: Record<string, string> = {
  manager: 'bg-blue-500/15 text-blue-400',
  specialist: 'bg-purple-500/15 text-purple-400',
  worker: 'bg-slate-500/15 text-slate-400',
}

function getPerformanceLevel(successRate: number): string {
  if (successRate >= 80) return 'high'
  if (successRate >= 50) return 'mid'
  return 'low'
}

// === Summary Cards ===

function OverallScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative flex h-[80px] w-[80px] items-center justify-center rounded-full bg-slate-900 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle className="stroke-cyan-500/20" cx="50" cy="50" fill="transparent" r="45" strokeWidth="8" />
        <circle
          className="stroke-cyan-400 transition-all duration-700"
          cx="50" cy="50" fill="transparent" r="45"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <span className="text-slate-100 font-mono font-bold text-lg z-10">{score}%</span>
    </div>
  )
}

function SummaryCards({ data }: { data: PerformanceSummary }) {
  const cards = [
    {
      icon: '🤖',
      label: '전체 에이전트',
      value: `${data.totalAgents}명`,
      change: data.changes.agents,
      changeSuffix: '',
    },
    {
      icon: '🎯',
      label: '평균 성공률',
      value: `${data.avgSuccessRate}%`,
      change: data.changes.successRate,
      changeSuffix: '%',
    },
    {
      icon: '💰',
      label: '이번 달 비용',
      value: `$${data.totalCostThisMonth.toFixed(2)}`,
      change: data.changes.cost,
      changeSuffix: '',
    },
    {
      icon: '⏱️',
      label: '평균 응답 시간',
      value: data.avgResponseTimeMs > 1000
        ? `${(data.avgResponseTimeMs / 1000).toFixed(1)}s`
        : `${data.avgResponseTimeMs}ms`,
      change: data.changes.responseTime,
      changeSuffix: '',
    },
  ]

  return (
    <div data-testid="summary-cards">
      {/* Mobile: Overall score ring + 2x2 metric grid */}
      <div className="flex items-center justify-between rounded-xl bg-cyan-500/5 border border-cyan-500/10 p-5 mb-4 sm:hidden">
        <div className="flex flex-col gap-1">
          <p className="text-slate-300 text-sm font-bold">Overall Score</p>
          <p className="text-cyan-400 text-2xl font-mono font-bold">{data.avgSuccessRate}점</p>
        </div>
        <OverallScoreRing score={data.avgSuccessRate} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-lg mb-1">{card.icon}</div>
            <div className="text-xs text-slate-400 font-medium">{card.label}</div>
            <div className="text-xl font-bold text-slate-50 mt-0.5 font-mono">{card.value}</div>
            <div className="flex items-center gap-1 mt-1">
              {card.change > 0 ? (
                <span className="text-[10px] text-emerald-400">↑ +{card.change}{card.changeSuffix}</span>
              ) : card.change < 0 ? (
                <span className="text-[10px] text-red-400">↓ {card.change}{card.changeSuffix}</span>
              ) : (
                <span className="text-[10px] text-slate-500">— 0</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// === Performance Badge ===

function PerformanceBadge({ successRate }: { successRate: number }) {
  const level = getPerformanceLevel(successRate)
  const badge = PERFORMANCE_BADGE[level]
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
      {badge.label}
    </span>
  )
}

// === Mobile Agent Ranking Bars ===

const RANK_COLORS = [
  { bg: 'bg-yellow-500/20', text: 'text-yellow-500', barBg: 'bg-cyan-400', cardBg: 'bg-cyan-500/10 border-cyan-500/20' },
  { bg: 'bg-slate-300/20', text: 'text-slate-300', barBg: 'bg-cyan-400/80', cardBg: 'bg-cyan-500/5 border-cyan-500/10' },
  { bg: 'bg-orange-400/20', text: 'text-orange-400', barBg: 'bg-cyan-400/60', cardBg: 'bg-cyan-500/5 border-cyan-500/10' },
]

function MobileAgentRanking({ onSelectAgent }: { onSelectAgent: (id: string) => void }) {
  const { data: res, isLoading } = useQuery({
    queryKey: ['performance-agents', 1, 'successRate', 'desc', '', ''],
    queryFn: () =>
      api.get<{ data: { items: AgentPerformance[]; page: number; total: number; totalPages: number } }>(
        '/workspace/performance/agents?page=1&limit=5&sortBy=successRate&sortOrder=desc',
      ),
  })

  const items = res?.data?.items ?? []

  if (isLoading || items.length === 0) return null

  return (
    <div className="sm:hidden" data-testid="mobile-agent-ranking">
      <h3 className="text-base font-bold text-slate-100 mb-3">Agent Ranking</h3>
      <div className="flex flex-col gap-2">
        {items.slice(0, 5).map((agent, idx) => {
          const rankStyle = RANK_COLORS[idx] || { bg: 'bg-slate-700', text: 'text-slate-400', barBg: 'bg-slate-500', cardBg: 'bg-transparent border-transparent' }
          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`flex items-center gap-3 rounded-xl p-3 border cursor-pointer transition-colors hover:border-cyan-500/30 ${rankStyle.cardBg}`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${rankStyle.bg} ${rankStyle.text} font-bold text-sm`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-100 font-medium text-sm">{agent.name}</span>
                  <span className="text-cyan-400 font-mono text-sm">{agent.successRate}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-cyan-500/10 overflow-hidden">
                  <div className={`h-full ${rankStyle.barBg} rounded-full transition-all`} style={{ width: `${agent.successRate}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// === Agent Performance Table ===

type SortConfig = { by: string; order: 'asc' | 'desc' }

function AgentPerformanceTable({
  onSelectAgent,
}: {
  onSelectAgent: (id: string) => void
}) {
  const [page, setPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ by: 'successRate', order: 'desc' })
  const [roleFilter, setRoleFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')

  const { data: res, isLoading } = useQuery({
    queryKey: ['performance-agents', page, sortConfig.by, sortConfig.order, roleFilter, levelFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sortBy: sortConfig.by,
        sortOrder: sortConfig.order,
      })
      if (roleFilter) params.set('role', roleFilter)
      if (levelFilter) params.set('level', levelFilter)
      return api.get<{ data: { items: AgentPerformance[]; page: number; total: number; totalPages: number } }>(
        `/workspace/performance/agents?${params}`,
      )
    },
  })

  const items = res?.data?.items ?? []
  const total = res?.data?.total ?? 0
  const totalPages = res?.data?.totalPages ?? 1

  const handleSort = (column: string) => {
    setSortConfig((prev) =>
      prev.by === column
        ? { by: column, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { by: column, order: 'desc' },
    )
    setPage(1)
  }

  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <th
      className={`text-[11px] font-medium uppercase tracking-wider px-4 py-3 text-left cursor-pointer select-none transition-colors ${
        sortConfig.by === column ? 'text-slate-300' : 'text-slate-500 hover:text-slate-300'
      }`}
      onClick={() => handleSort(column)}
    >
      {label}
      {sortConfig.by === column && (
        <span className="ml-1">{sortConfig.order === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  )

  const activeFilters = [
    ...(roleFilter ? [{ key: 'role', label: `역할: ${ROLE_LABEL[roleFilter] || roleFilter}` }] : []),
    ...(levelFilter ? [{ key: 'level', label: `수준: ${PERFORMANCE_BADGE[levelFilter]?.label || levelFilter}` }] : []),
  ]

  return (
    <div data-testid="agent-performance-table">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-3">
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5"
          data-testid="role-filter"
        >
          <option value="">전체 역할</option>
          <option value="manager">Manager</option>
          <option value="specialist">Specialist</option>
          <option value="worker">Worker</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(1) }}
          className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5"
          data-testid="level-filter"
        >
          <option value="">전체 수준</option>
          <option value="high">우수 (≥80%)</option>
          <option value="mid">보통 (50-79%)</option>
          <option value="low">개선 필요 (&lt;50%)</option>
        </select>

        {activeFilters.length > 0 && (
          <div className="flex gap-1 ml-2">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="bg-blue-500/10 text-blue-400 text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                {f.label}
                <button
                  onClick={() => {
                    if (f.key === 'role') setRoleFilter('')
                    if (f.key === 'level') setLevelFilter('')
                    setPage(1)
                  }}
                  className="hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={5} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            조건에 맞는 에이전트가 없습니다
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700">
                    <SortableHeader column="name" label="에이전트" />
                    <th className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3 text-left">역할</th>
                    <SortableHeader column="totalCalls" label="호출 수" />
                    <SortableHeader column="successRate" label="성공률" />
                    <SortableHeader column="avgCostUsd" label="평균 비용" />
                    <SortableHeader column="avgResponseTimeMs" label="평균 시간" />
                    <th className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-3 text-left">Soul Gym</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((agent) => {
                    const roleBadge = ROLE_BADGE[agent.role] || ROLE_BADGE.worker
                    return (
                      <tr
                        key={agent.id}
                        className="border-b border-slate-700/30 hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => onSelectAgent(agent.id)}
                        data-testid={`agent-row-${agent.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-slate-200">{agent.name}</div>
                          <div className="text-[10px] text-slate-500">{agent.departmentName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${roleBadge}`}>
                            {ROLE_LABEL[agent.role] || agent.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-300 font-mono text-right">{agent.totalCalls}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <PerformanceBadge successRate={agent.successRate} />
                            <span className="text-xs font-mono ml-1">{agent.successRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-300 font-mono text-right">${agent.avgCostUsd.toFixed(3)}</td>
                        <td className="px-4 py-3 text-xs text-slate-300 font-mono text-right">{agent.avgResponseTimeMs}ms</td>
                        <td className="px-4 py-3">
                          {agent.soulGymStatus === 'needs-attention' ? (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                          ) : agent.soulGymStatus === 'has-suggestions' ? (
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">총 {total}명</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                          page === p
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// === Agent Detail Modal ===

function AgentDetailModal({
  agentId,
  onClose,
}: {
  agentId: string
  onClose: () => void
}) {
  const { data: res, isLoading } = useQuery({
    queryKey: ['performance-agent-detail', agentId],
    queryFn: () =>
      api.get<{ data: AgentPerformanceDetail }>(`/workspace/performance/agents/${agentId}`),
    enabled: !!agentId,
  })

  const detail = res?.data

  if (!agentId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="agent-detail-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        {isLoading || !detail ? (
          <div className="p-5 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-700">
              <div className="text-lg font-semibold text-slate-50">{detail.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{detail.departmentName} · {ROLE_LABEL[detail.role] || detail.role}</div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-3 px-5 py-4">
              {[
                { label: '호출 수', value: String(detail.totalCalls) },
                { label: '성공률', value: `${detail.successRate}%` },
                { label: '평균 비용', value: `$${detail.avgCostUsd.toFixed(4)}` },
                { label: '평균 시간', value: detail.avgResponseTimeMs > 1000 ? `${(detail.avgResponseTimeMs / 1000).toFixed(1)}s` : `${detail.avgResponseTimeMs}ms` },
              ].map((m) => (
                <div key={m.label} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-center">
                  <div className="text-[10px] text-slate-500 font-medium">{m.label}</div>
                  <div className="text-sm font-bold text-slate-50 mt-1">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Performance Trend Chart */}
            {detail.dailyMetrics.length > 0 && (
              <div className="px-5 py-4">
                <div className="text-xs font-medium text-slate-300 mb-3">30일 성능 추이</div>
                <div className="flex items-end gap-0.5 h-32 bg-slate-900/30 border border-slate-700 rounded-lg p-3">
                  {detail.dailyMetrics.map((day) => (
                    <div
                      key={day.date}
                      className="flex-1 group relative"
                      title={`${day.date}: ${day.successRate}%`}
                    >
                      <div
                        className="w-full rounded-t bg-blue-500/60 hover:bg-blue-500 transition-colors"
                        style={{ height: `${Math.max(day.successRate, 2)}%` }}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                        <div className="bg-slate-900 text-slate-200 text-[10px] px-2 py-1 rounded whitespace-nowrap shadow border border-slate-700">
                          {day.date.slice(5)}: {day.successRate}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-slate-600">{detail.dailyMetrics[0]?.date.slice(5)}</span>
                  <span className="text-[9px] text-slate-600">{detail.dailyMetrics[Math.floor(detail.dailyMetrics.length / 2)]?.date.slice(5)}</span>
                  <span className="text-[9px] text-slate-600">{detail.dailyMetrics[detail.dailyMetrics.length - 1]?.date.slice(5)}</span>
                </div>
              </div>
            )}

            {/* Quality Distribution */}
            {detail.qualityDistribution.length > 0 && (
              <div className="px-5 py-3">
                <div className="text-xs font-medium text-slate-300 mb-2">품질 점수 분포</div>
                <div className="space-y-1">
                  {detail.qualityDistribution.map((q) => {
                    const maxCount = Math.max(...detail.qualityDistribution.map((d) => d.count), 1)
                    return (
                      <div key={q.label} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-12">{q.label}</span>
                        <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500/60 rounded-full"
                            style={{ width: `${(q.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 w-8 text-right">{q.count}건</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent Tasks */}
            {detail.recentTasks.length > 0 && (
              <div className="px-5 py-3">
                <div className="text-xs font-medium text-slate-300 mb-2">최근 작업 (10건)</div>
                <div className="space-y-0">
                  {detail.recentTasks.map((task, i) => (
                    <div key={i} className="text-[10px] py-1.5 border-b border-slate-700/30 flex items-center justify-between">
                      <span className="text-slate-300 truncate max-w-[250px]">{task.commandText}</span>
                      <div className="flex items-center gap-2">
                        <span className={task.status === 'completed' ? 'text-emerald-400' : task.status === 'failed' ? 'text-red-400' : 'text-slate-500'}>
                          {task.status === 'completed' ? '성공' : task.status === 'failed' ? '실패' : task.status}
                        </span>
                        <span className="text-slate-500 font-mono">${task.costUsd?.toFixed(3) ?? '0.000'}</span>
                        <span className="text-slate-500 font-mono">
                          {task.durationMs > 1000 ? `${(task.durationMs / 1000).toFixed(1)}s` : `${task.durationMs}ms`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soul Info */}
            <div className="px-5 py-3 border-t border-slate-700">
              <div className="text-xs font-medium text-slate-300 mb-2">에이전트 정보</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] text-slate-500">모델</div>
                  <div className="text-xs text-slate-300">{detail.soulInfo.modelName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">도구 수</div>
                  <div className="text-xs text-slate-300">{detail.soulInfo.allowedToolsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">프롬프트 요약</div>
                  <div className="text-xs text-slate-300 truncate">{detail.soulInfo.systemPromptSummary}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// === Soul Gym Panel ===

function SoulGymPanel() {
  const queryClient = useQueryClient()
  const [confirmTarget, setConfirmTarget] = useState<SoulGymSuggestion | null>(null)

  const { data: res, isLoading } = useQuery({
    queryKey: ['soul-gym-suggestions'],
    queryFn: () => api.get<{ data: SoulGymSuggestion[] }>('/workspace/performance/soul-gym'),
  })

  const applyMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`/workspace/performance/soul-gym/${id}/apply`, {}),
    onSuccess: () => {
      toast.success('개선 제안이 적용되었습니다')
      queryClient.invalidateQueries({ queryKey: ['soul-gym-suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['performance-agents'] })
      queryClient.invalidateQueries({ queryKey: ['performance-summary'] })
      setConfirmTarget(null)
    },
    onError: () => {
      toast.error('적용에 실패했습니다')
      setConfirmTarget(null)
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) =>
      api.post(`/workspace/performance/soul-gym/${id}/dismiss`, {}),
    onSuccess: () => {
      toast.success('제안을 무시했습니다')
      queryClient.invalidateQueries({ queryKey: ['soul-gym-suggestions'] })
    },
  })

  const suggestions = res?.data ?? []

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden" data-testid="soul-gym-panel">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span>💪</span>
          <span className="text-sm font-semibold text-slate-50">Soul Gym 개선 제안</span>
        </div>
        {suggestions.length > 0 && (
          <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">{suggestions.length}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-6">
            <div className="mb-1">✨</div>
            현재 개선이 필요한 에이전트가 없습니다
          </div>
        ) : (
          suggestions.map((s) => {
            const typeBadge = SUGGESTION_TYPE_BADGE[s.suggestionType] || SUGGESTION_TYPE_BADGE['prompt-improve']
            return (
              <div key={s.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{s.agentName}</span>
                    <span className="text-[10px] text-slate-500">현재 {s.currentSuccessRate}%</span>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeBadge.className}`}>
                    {typeBadge.label}
                  </span>
                </div>

                {/* Improvement Bar */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">예상 개선</span>
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${s.expectedImprovement}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">+{s.expectedImprovement}%</span>
                  <span className="text-[10px] text-slate-500">(신뢰도 {s.confidence}%)</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.description}</p>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => dismissMutation.mutate(s.id)}
                    className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700/50"
                  >
                    무시
                  </button>
                  <button
                    onClick={() => setConfirmTarget(s)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                  >
                    적용
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={!!confirmTarget}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && applyMutation.mutate(confirmTarget.id)}
        title="Soul Gym 제안 적용"
        description={
          confirmTarget
            ? `${confirmTarget.agentName}에게 '${SUGGESTION_TYPE_LABEL[confirmTarget.suggestionType]}' 제안을 적용하시겠습니까? 이 작업은 에이전트의 설정을 변경합니다.`
            : ''
        }
        confirmText="적용"
        variant="default"
      />
    </div>
  )
}

// === Loading Skeleton ===

function PerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <SkeletonTable rows={5} />
    </div>
  )
}

// === Quality Dashboard Types ===

type QualitySummaryData = {
  totalReviews: number
  passCount: number
  failCount: number
  passRate: number
  avgScore: number
}

type TrendItem = { date: string; passCount: number; failCount: number }

type DepartmentStat = {
  departmentId: string
  departmentName: string
  totalReviews: number
  passRate: number
  avgScore: number
}

type QAgentStat = {
  agentId: string
  agentName: string
  departmentName: string
  totalReviews: number
  passRate: number
  avgScore: number
  recentFailCount: number
}

type FailedItem = {
  reviewId: string
  commandId: string
  commandText: string
  agentName: string
  avgScore: number
  feedback: string | null
  attemptNumber: number
  createdAt: string
}

type QualityDashboardData = {
  summary: QualitySummaryData
  trend: TrendItem[]
  departmentStats: DepartmentStat[]
  agentStats: QAgentStat[]
  failedList: FailedItem[]
}

type QSortKey = 'agentName' | 'totalReviews' | 'passRate' | 'avgScore' | 'recentFailCount'

// === Quality color helpers ===

function qPassRateBg(rate: number) {
  if (rate >= 80) return 'bg-emerald-500'
  if (rate >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function qPassRateBarBg(rate: number) {
  if (rate >= 80) return 'bg-emerald-500/70'
  if (rate >= 50) return 'bg-amber-500/70'
  return 'bg-red-500/70'
}

// === Quality Summary Cards ===

function QualitySummaryCards({ summary }: { summary: QualitySummaryData }) {
  return (
    <div className="grid grid-cols-3 gap-3" data-testid="quality-summary-cards">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="text-xs text-slate-400 font-medium">전체 리뷰</div>
        <div className="text-xl font-bold text-slate-50 mt-1">{summary.totalReviews.toLocaleString()}</div>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="text-xs text-slate-400 font-medium">통과율</div>
        <div className="text-xl font-bold text-slate-50 mt-1">{summary.passRate}%</div>
        <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
          <div className={`h-full rounded-full ${qPassRateBg(summary.passRate)}`} style={{ width: `${summary.passRate}%` }} />
        </div>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="text-xs text-slate-400 font-medium">평균 점수</div>
        <div className="text-xl font-bold text-slate-50 mt-1">{summary.avgScore.toFixed(1)}/10</div>
        <div className="w-full h-2 bg-slate-700 rounded-full mt-2">
          <div className={`h-full rounded-full ${qPassRateBg(summary.avgScore * 10)}`} style={{ width: `${summary.avgScore * 10}%` }} />
        </div>
      </div>
    </div>
  )
}

// === Trend Chart ===

function QualityTrendChart({ data }: { data: TrendItem[] }) {
  const maxTotal = useMemo(() => Math.max(...data.map((d) => d.passCount + d.failCount), 1), [data])

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="text-xs font-medium text-slate-300 mb-3">품질 추이</div>
        <div className="h-40 flex items-center justify-center text-xs text-slate-500">데이터가 없습니다</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-4" data-testid="quality-trend-chart">
      <div className="text-xs font-medium text-slate-300 mb-3">품질 추이</div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-400">통과</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-slate-400">실패</span>
        </div>
      </div>
      {/* Chart */}
      <div className="flex items-end gap-1 h-40">
        {data.map((day) => {
          const total = day.passCount + day.failCount
          const heightPercent = (total / maxTotal) * 100
          const passPercent = total > 0 ? (day.passCount / total) * 100 : 0
          return (
            <div key={day.date} className="flex-1 flex flex-col justify-end relative group" title={`${day.date}: 통과 ${day.passCount}건, 실패 ${day.failCount}건`}>
              <div className="w-full rounded-t overflow-hidden" style={{ height: `${heightPercent}%`, minHeight: total > 0 ? 2 : 0 }}>
                <div className="bg-emerald-500/70" style={{ height: `${passPercent}%` }} />
                <div className="bg-red-500/70" style={{ height: `${100 - passPercent}%` }} />
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-slate-900 text-slate-200 text-[10px] px-2 py-1 rounded whitespace-nowrap shadow border border-slate-700">
                  {day.date.slice(5)}: 통과 {day.passCount}건, 실패 {day.failCount}건
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[9px] text-slate-600">{data[0]?.date.slice(5)}</span>
        <span className="text-[9px] text-slate-600">{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  )
}

// === Department Chart ===

function DepartmentChart({ data }: { data: DepartmentStat[] }) {
  if (data.length === 0) return null
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-4" data-testid="department-chart">
      <div className="text-xs font-medium text-slate-300 mb-3">부서별 품질</div>
      <div className="space-y-2">
        {data.map((dept) => (
          <div key={dept.departmentId} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-24 truncate text-right">{dept.departmentName}</span>
            <div className="flex-1 h-5 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${qPassRateBarBg(dept.passRate)}`} style={{ width: `${dept.passRate}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 w-20 text-right">{dept.passRate}% ({dept.totalReviews}건)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// === Quality Agent Table ===

function QualityAgentTable({ data }: { data: QAgentStat[] }) {
  const [sortKey, setSortKey] = useState<QSortKey>('totalReviews')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    const arr = [...data]
    arr.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'string' && typeof bv === 'string') return sortOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortOrder === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
    return arr
  }, [data, sortKey, sortOrder])

  function toggleSort(key: QSortKey) {
    if (sortKey === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortOrder('desc') }
  }

  function QSortTh({ col, label }: { col: QSortKey; label: string }) {
    return (
      <th
        className={`text-[11px] font-medium uppercase tracking-wider px-4 py-2.5 cursor-pointer select-none transition-colors ${
          sortKey === col ? 'text-slate-300' : 'text-slate-500 hover:text-slate-300'
        }`}
        onClick={() => toggleSort(col)}
      >
        {label}
        {sortKey === col && <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
      </th>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mt-4">
        <div className="px-4 py-3 border-b border-slate-700">
          <span className="text-xs font-medium text-slate-300">에이전트별 품질</span>
        </div>
        <div className="h-24 flex items-center justify-center text-xs text-slate-500">데이터가 없습니다</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mt-4" data-testid="quality-agent-table">
      <div className="px-4 py-3 border-b border-slate-700">
        <span className="text-xs font-medium text-slate-300">에이전트별 품질</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <QSortTh col="agentName" label="에이전트" />
              <th className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-4 py-2.5 text-left hidden sm:table-cell">부서</th>
              <QSortTh col="totalReviews" label="리뷰" />
              <QSortTh col="passRate" label="통과율" />
              <QSortTh col="avgScore" label="평균 점수" />
              <QSortTh col="recentFailCount" label="최근 실패" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent) => (
              <tr key={agent.agentId} className="border-b border-slate-700/30 hover:bg-slate-800/50">
                <td className="px-4 py-2.5 text-xs font-medium text-slate-200">{agent.agentName}</td>
                <td className="px-4 py-2.5 text-xs text-slate-400 hidden sm:table-cell">{agent.departmentName}</td>
                <td className="px-4 py-2.5 text-xs text-slate-300 font-mono">{agent.totalReviews}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    agent.passRate >= 80 ? 'bg-emerald-500/15 text-emerald-400'
                    : agent.passRate >= 50 ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-red-500/15 text-red-400'
                  }`}>
                    {agent.passRate}%
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs font-mono text-slate-300">{agent.avgScore.toFixed(1)}/10</td>
                <td className="px-4 py-2.5 text-xs font-mono">
                  {agent.recentFailCount > 0 ? (
                    <span className="text-red-400">{agent.recentFailCount}</span>
                  ) : (
                    <span className="text-slate-500">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// === Failed List ===

function QualityFailedList({ data }: { data: FailedItem[] }) {
  const navigate = useNavigate()

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mt-4">
        <div className="px-4 py-3 border-b border-slate-700">
          <span className="text-xs font-medium text-slate-300">최근 실패 리뷰</span>
        </div>
        <div className="text-xs text-slate-500 text-center py-6">실패한 리뷰가 없습니다 ✨</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mt-4" data-testid="failed-reviews-list">
      <div className="px-4 py-3 border-b border-slate-700">
        <span className="text-xs font-medium text-slate-300">최근 실패 리뷰</span>
      </div>
      <div>
        {data.map((item) => (
          <div
            key={item.reviewId}
            className="px-4 py-2.5 border-b border-slate-700/30 hover:bg-slate-800/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/activity-log?commandId=${item.commandId}`)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300 truncate max-w-[250px]">{item.commandText || '(명령 없음)'}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.agentName}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-red-400">{item.avgScore.toFixed(1)}/10</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{item.feedback || '-'}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(item.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// === Quality Dashboard Tab Content ===

function QualityDashboardTab() {
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d')
  const [departmentId, setDepartmentId] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['quality-dashboard', period, departmentId],
    queryFn: () => {
      const params = new URLSearchParams({ period })
      if (departmentId) params.set('departmentId', departmentId)
      return api.get<{ data: QualityDashboardData }>(`/workspace/quality-dashboard?${params}`)
    },
    refetchInterval: 60000,
  })

  const dashboard = data?.data

  const departmentOptions = useMemo(() => {
    if (!dashboard?.departmentStats) return []
    return dashboard.departmentStats.map((d) => ({ value: d.departmentId, label: d.departmentName }))
  }, [dashboard?.departmentStats])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-52" />
        <SkeletonTable rows={5} />
      </div>
    )
  }

  if (!dashboard) {
    return (
      <EmptyState
        icon="📊"
        title="품질 리뷰 데이터가 없습니다"
        description="사령관실에서 명령을 실행하면 품질 검수 데이터가 수집됩니다"
      />
    )
  }

  return (
    <div className="space-y-0" data-testid="quality-dashboard">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-slate-800/50 rounded-lg p-0.5">
          {(['7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                period === p
                  ? 'bg-slate-700 text-slate-50'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {p === '7d' ? '7일' : p === '30d' ? '30일' : '전체'}
            </button>
          ))}
        </div>
        {departmentOptions.length > 0 && (
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5"
          >
            <option value="">전체 부서</option>
            {departmentOptions.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        )}
      </div>

      <QualitySummaryCards summary={dashboard.summary} />
      <QualityTrendChart data={dashboard.trend} />
      <DepartmentChart data={dashboard.departmentStats} />
      <QualityAgentTable data={dashboard.agentStats} />
      <QualityFailedList data={dashboard.failedList} />
    </div>
  )
}

// === Main Page ===

export function PerformancePage() {
  const [activeTab, setActiveTab] = useState<'agent' | 'quality'>('agent')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  const { data: summaryRes, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['performance-summary'],
    queryFn: () => api.get<{ data: PerformanceSummary }>('/workspace/performance/summary'),
    refetchInterval: 30000,
  })

  const summary = summaryRes?.data

  useEffect(() => {
    document.title = '전력분석 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50" data-testid="performance-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-lg sm:text-xl font-bold text-slate-50">전력분석</h1>
          <p className="text-sm text-slate-400 mt-1">에이전트 성능 분석, Soul Gym 개선 제안, 품질 대시보드</p>
        </div>

        {/* Tab Bar */}
        <div className="flex bg-slate-800/50 border border-slate-700 rounded-xl p-1 mb-6" data-testid="tab-bar">
          {(['agent', 'quality'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center text-sm py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-700 text-slate-50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === 'agent' ? '에이전트 성능' : '품질 대시보드'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'agent' && (
          <>
            {summaryLoading && !summary ? (
              <PerformanceSkeleton />
            ) : summaryError && !summary ? (
              <EmptyState
                icon="📊"
                title="에이전트 성능 데이터가 없습니다"
                description="사령관실에서 명령을 실행하면 성능 데이터가 수집됩니다"
              />
            ) : (
              <div className="space-y-6">
                {summary && <SummaryCards data={summary} />}
                {/* Mobile Agent Ranking Bars — shown only on small screens */}
                <MobileAgentRanking onSelectAgent={(id) => setSelectedAgentId(id)} />
                <AgentPerformanceTable onSelectAgent={(id) => setSelectedAgentId(id)} />
                <SoulGymPanel />
              </div>
            )}
          </>
        )}

        {activeTab === 'quality' && <QualityDashboardTab />}
      </div>

      {selectedAgentId && (
        <AgentDetailModal
          agentId={selectedAgentId}
          onClose={() => setSelectedAgentId(null)}
        />
      )}
    </div>
  )
}
