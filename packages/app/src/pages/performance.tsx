import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Input, Skeleton, SkeletonTable, EmptyState, Modal, ConfirmDialog, toast, Tabs, Select } from '@corthex/ui'
import { api } from '../lib/api'
import type {
  PerformanceSummary,
  AgentPerformance,
  AgentPerformanceDetail,
  SoulGymSuggestion,
} from '@corthex/shared'

// === Constants ===

const PERFORMANCE_BADGE: Record<string, { label: string; color: string }> = {
  high: { label: '우수', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  mid: { label: '보통', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  low: { label: '개선 필요', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const SOUL_GYM_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  optimal: { label: '최적', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'has-suggestions': { label: '제안 있음', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  'needs-attention': { label: '주의 필요', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

const SUGGESTION_TYPE_LABEL: Record<string, string> = {
  'prompt-improve': '시스템 프롬프트 개선',
  'add-tool': '도구 추가',
  'change-model': '모델 변경',
}

const ROLE_LABEL: Record<string, string> = {
  manager: '팀장',
  specialist: '전문가',
  worker: '실무자',
}

function getPerformanceLevel(successRate: number): string {
  if (successRate >= 80) return 'high'
  if (successRate >= 50) return 'mid'
  return 'low'
}

function formatChangeValue(value: number, suffix: string = ''): { text: string; color: string } {
  if (value > 0) return { text: `+${value}${suffix}`, color: 'text-emerald-600 dark:text-emerald-400' }
  if (value < 0) return { text: `${value}${suffix}`, color: 'text-red-600 dark:text-red-400' }
  return { text: `0${suffix}`, color: 'text-zinc-400' }
}

// === Summary Cards ===

function SummaryCards({ data }: { data: PerformanceSummary }) {
  const cards = [
    {
      icon: '🤖',
      label: '총 에이전트',
      value: String(data.totalAgents),
      unit: '명',
      change: formatChangeValue(data.changes.agents, '명'),
    },
    {
      icon: '🎯',
      label: '평균 성공률',
      value: `${data.avgSuccessRate}`,
      unit: '%',
      change: formatChangeValue(data.changes.successRate, 'pp'),
    },
    {
      icon: '💰',
      label: '이번 달 비용',
      value: `$${data.totalCostThisMonth.toFixed(2)}`,
      unit: '',
      change: formatChangeValue(data.changes.cost, '%'),
    },
    {
      icon: '⏱️',
      label: '평균 응답시간',
      value: data.avgResponseTimeMs > 1000
        ? `${(data.avgResponseTimeMs / 1000).toFixed(1)}s`
        : `${data.avgResponseTimeMs}ms`,
      unit: '',
      change: formatChangeValue(data.changes.responseTime, '%'),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{card.icon}</span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {card.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {card.value}
              {card.unit && <span className="text-sm font-normal text-zinc-500 ml-1">{card.unit}</span>}
            </p>
            <p className={`text-xs mt-1 ${card.change.color}`}>
              {card.change.text} 전월 대비
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}

// === Performance Badge ===

function PerformanceBadge({ successRate }: { successRate: number }) {
  const level = getPerformanceLevel(successRate)
  const badge = PERFORMANCE_BADGE[level]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
      {badge.label}
    </span>
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
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')

  const { data: res, isLoading } = useQuery({
    queryKey: ['performance-agents', page, sortConfig.by, sortConfig.order, departmentFilter, roleFilter, levelFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sortBy: sortConfig.by,
        sortOrder: sortConfig.order,
      })
      if (departmentFilter) params.set('departmentId', departmentFilter)
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
      className="px-3 py-2 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 select-none"
      onClick={() => handleSort(column)}
    >
      {label}
      {sortConfig.by === column && (
        <span className="ml-1">{sortConfig.order === 'asc' ? '↑' : '↓'}</span>
      )}
    </th>
  )

  // Active filters display
  const activeFilters = [
    ...(roleFilter ? [{ key: 'role', label: `역할: ${ROLE_LABEL[roleFilter] || roleFilter}` }] : []),
    ...(levelFilter ? [{ key: 'level', label: `수준: ${PERFORMANCE_BADGE[levelFilter]?.label || levelFilter}` }] : []),
  ]

  return (
    <Card>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">에이전트 성능</h3>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="text-xs border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">전체 역할</option>
              <option value="manager">팀장</option>
              <option value="specialist">전문가</option>
              <option value="worker">실무자</option>
            </select>
            <select
              value={levelFilter}
              onChange={(e) => { setLevelFilter(e.target.value); setPage(1) }}
              className="text-xs border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <option value="">전체 수준</option>
              <option value="high">우수 (≥80%)</option>
              <option value="mid">보통 (50-79%)</option>
              <option value="low">개선 필요 (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {f.label}
                <button
                  onClick={() => {
                    if (f.key === 'role') setRoleFilter('')
                    if (f.key === 'level') setLevelFilter('')
                    setPage(1)
                  }}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  x
                </button>
              </span>
            ))}
            <button
              onClick={() => { setRoleFilter(''); setLevelFilter(''); setPage(1) }}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              전체 초기화
            </button>
          </div>
        )}

        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-sm text-zinc-400">
            조건에 맞는 에이전트가 없습니다
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <SortableHeader column="name" label="에이전트" />
                    <SortableHeader column="departmentName" label="부서" />
                    <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400">역할</th>
                    <SortableHeader column="totalCalls" label="호출 수" />
                    <SortableHeader column="successRate" label="성공률" />
                    <SortableHeader column="avgCostUsd" label="평균 비용" />
                    <SortableHeader column="avgResponseTimeMs" label="평균 시간" />
                    <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400">Soul Gym</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((agent) => {
                    const sgBadge = SOUL_GYM_STATUS_BADGE[agent.soulGymStatus] || SOUL_GYM_STATUS_BADGE.optimal
                    return (
                      <tr
                        key={agent.id}
                        className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                        onClick={() => onSelectAgent(agent.id)}
                      >
                        <td className="px-3 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{agent.name}</td>
                        <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{agent.departmentName}</td>
                        <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">{ROLE_LABEL[agent.role] || agent.role}</td>
                        <td className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300">{agent.totalCalls}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-700 dark:text-zinc-300">{agent.successRate}%</span>
                            <PerformanceBadge successRate={agent.successRate} />
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300">${agent.avgCostUsd.toFixed(4)}</td>
                        <td className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300">
                          {agent.avgResponseTimeMs > 1000
                            ? `${(agent.avgResponseTimeMs / 1000).toFixed(1)}s`
                            : `${agent.avgResponseTimeMs}ms`}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sgBadge.color}`}>
                            {sgBadge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
                <span>총 {total}개 에이전트</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    이전
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-2 py-1 rounded border ${
                          page === p
                            ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 border-transparent'
                            : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
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

  return (
    <Modal isOpen={!!agentId} onClose={onClose} title={detail?.name ? `${detail.name} 성능 상세` : '에이전트 상세'}>
      {isLoading || !detail ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
          {/* Agent overview */}
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{detail.name}</h3>
              <p className="text-sm text-zinc-500">{detail.departmentName} · {ROLE_LABEL[detail.role] || detail.role}</p>
            </div>
            <PerformanceBadge successRate={detail.successRate} />
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="호출 수" value={String(detail.totalCalls)} />
            <MetricCard label="성공률" value={`${detail.successRate}%`} />
            <MetricCard label="평균 비용" value={`$${detail.avgCostUsd.toFixed(4)}`} />
            <MetricCard
              label="평균 시간"
              value={detail.avgResponseTimeMs > 1000
                ? `${(detail.avgResponseTimeMs / 1000).toFixed(1)}s`
                : `${detail.avgResponseTimeMs}ms`}
            />
          </div>

          {/* Performance trend chart (simple div-based) */}
          {detail.dailyMetrics.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">성능 추이 (최근 30일)</h4>
              <div className="flex items-end gap-0.5 h-28" role="img" aria-label="일별 성공률 차트">
                {detail.dailyMetrics.map((day) => (
                  <div
                    key={day.date}
                    className="flex-1 group relative"
                    title={`${day.date}: 성공률 ${day.successRate}%, 비용 $${day.costUsd.toFixed(4)}`}
                  >
                    <div
                      className={`w-full rounded-t-sm ${
                        day.successRate >= 80
                          ? 'bg-emerald-400 dark:bg-emerald-500'
                          : day.successRate >= 50
                          ? 'bg-amber-400 dark:bg-amber-500'
                          : 'bg-red-400 dark:bg-red-500'
                      }`}
                      style={{ height: `${Math.max(day.successRate, 2)}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                      <div className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow">
                        {day.date.slice(5)} · {day.successRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-zinc-400">
                <span>{detail.dailyMetrics[0]?.date.slice(5)}</span>
                <span>{detail.dailyMetrics[detail.dailyMetrics.length - 1]?.date.slice(5)}</span>
              </div>
            </div>
          )}

          {/* Quality distribution */}
          {detail.qualityDistribution.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">품질 점수 분포</h4>
              <div className="flex gap-3">
                {detail.qualityDistribution.map((q) => (
                  <div key={q.label} className="flex-1 text-center">
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{q.count}</div>
                    <div className="text-xs text-zinc-500">{q.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent tasks */}
          {detail.recentTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">최근 작업 (10건)</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {detail.recentTasks.map((task, i) => (
                  <div key={i} className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-700 dark:text-zinc-300 truncate">{task.commandText}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <span className={task.status === 'completed' ? 'text-emerald-600' : task.status === 'failed' ? 'text-red-500' : 'text-zinc-400'}>
                        {task.status === 'completed' ? '성공' : task.status === 'failed' ? '실패' : task.status}
                      </span>
                      <span className="text-zinc-400">
                        {task.durationMs > 1000 ? `${(task.durationMs / 1000).toFixed(1)}s` : `${task.durationMs}ms`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soul info */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Soul 정보</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">모델</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{detail.soulInfo.modelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">허용 도구</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{detail.soulInfo.allowedToolsCount}개</span>
              </div>
              <div>
                <span className="text-zinc-500">시스템 프롬프트</span>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-[11px] whitespace-pre-wrap max-h-24 overflow-y-auto">
                  {detail.soulInfo.systemPromptSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 text-center">
      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{value}</div>
      <div className="text-[10px] text-zinc-500">{label}</div>
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
    <Card>
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">💪</span>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Soul Gym 개선 제안</h3>
          {suggestions.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
              {suggestions.length}
            </span>
          )}
        </div>

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
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500">모든 에이전트가 최적 상태입니다</p>
            <p className="text-xs text-zinc-400 mt-1">개선이 필요한 에이전트가 발견되면 여기에 제안이 표시됩니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.agentName}</p>
                    <p className="text-xs text-zinc-500">
                      현재 성공률 {s.currentSuccessRate}%
                      <span className="mx-1">·</span>
                      {SUGGESTION_TYPE_LABEL[s.suggestionType] || s.suggestionType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      +{s.expectedImprovement}% 예상
                    </p>
                    <p className="text-[10px] text-zinc-400">신뢰도 {s.confidence}%</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">{s.description}</p>
                {s.estimatedTokens > 0 && (
                  <p className="text-[10px] text-zinc-400 mb-2">예상 토큰: {s.estimatedTokens.toLocaleString()}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmTarget(s)}
                    className="text-xs px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    적용
                  </button>
                  <button
                    onClick={() => dismissMutation.mutate(s.id)}
                    className="text-xs px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    무시
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm dialog */}
        <ConfirmDialog
          isOpen={!!confirmTarget}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && applyMutation.mutate(confirmTarget.id)}
          title="개선 제안 적용"
          description={
            confirmTarget
              ? `"${confirmTarget.agentName}"에게 "${SUGGESTION_TYPE_LABEL[confirmTarget.suggestionType]}" 제안을 적용하시겠습니까? 예상 개선: +${confirmTarget.expectedImprovement}% (신뢰도 ${confirmTarget.confidence}%)`
              : ''
          }
          confirmText="적용"
          variant="default"
        />
      </div>
    </Card>
  )
}

// === Loading Skeleton ===

function PerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="px-4 py-3 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
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

function qPassRateColor(rate: number) {
  if (rate >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (rate >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function qPassRateBg(rate: number) {
  if (rate >= 80) return 'bg-emerald-500'
  if (rate >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

function qScoreColor(score: number) {
  if (score >= 4.0) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 3.0) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// === Quality Summary Cards ===

function QualitySummaryCards({ summary }: { summary: QualitySummaryData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">총 리뷰 수</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.totalReviews.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">
            통과 {summary.passCount} · 실패 {summary.failCount}
          </p>
        </div>
      </Card>
      <Card>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">통과율</p>
          <p className={`text-2xl font-bold ${qPassRateColor(summary.passRate)}`}>
            {summary.passRate}%
          </p>
          <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${qPassRateBg(summary.passRate)}`} style={{ width: `${summary.passRate}%` }} />
          </div>
        </div>
      </Card>
      <Card>
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">평균 점수</p>
          <p className={`text-2xl font-bold ${qScoreColor(summary.avgScore)}`}>
            {summary.avgScore.toFixed(1)} <span className="text-sm font-normal text-zinc-400">/ 5.0</span>
          </p>
          <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${qPassRateBg(summary.avgScore * 20)}`} style={{ width: `${(summary.avgScore / 5) * 100}%` }} />
          </div>
        </div>
      </Card>
    </div>
  )
}

// === Trend Chart ===

function QualityTrendChart({ data }: { data: TrendItem[] }) {
  const maxTotal = useMemo(() => Math.max(...data.map((d) => d.passCount + d.failCount), 1), [data])

  if (data.length === 0) {
    return (
      <Card>
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">통과율 추이</h3>
          <div className="h-40 flex items-center justify-center text-sm text-zinc-400">데이터가 없습니다</div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">통과율 추이</h3>
        <div className="flex items-end gap-1 h-40" role="img" aria-label="일별 통과/실패 추이 차트">
          {data.map((day) => {
            const total = day.passCount + day.failCount
            const heightPercent = (total / maxTotal) * 100
            const passPercent = total > 0 ? (day.passCount / total) * 100 : 0
            return (
              <div key={day.date} className="flex-1 flex flex-col justify-end relative group" title={`${day.date}: 통과 ${day.passCount}, 실패 ${day.failCount}`}>
                <div className="w-full rounded-t-sm overflow-hidden" style={{ height: `${heightPercent}%`, minHeight: total > 0 ? 2 : 0 }}>
                  <div className="bg-emerald-500" style={{ height: `${passPercent}%` }} />
                  <div className="bg-red-400" style={{ height: `${100 - passPercent}%` }} />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow">
                    {day.date.slice(5)}: {day.passCount}P / {day.failCount}F
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-1 mt-1">
          {data.map((day, i) => (
            <div key={day.date} className="flex-1 text-center">
              {i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2) ? (
                <span className="text-[9px] text-zinc-400">{day.date.slice(5)}</span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> 통과</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400" /> 실패</span>
        </div>
      </div>
    </Card>
  )
}

// === Department Chart ===

function DepartmentChart({ data }: { data: DepartmentStat[] }) {
  if (data.length === 0) return null
  return (
    <Card>
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">부서별 통과율</h3>
        <div className="space-y-3">
          {data.map((dept) => (
            <div key={dept.departmentId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{dept.departmentName}</span>
                <span className={`text-sm font-medium ${qPassRateColor(dept.passRate)}`}>
                  {dept.passRate}% ({dept.totalReviews}건)
                </span>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${qPassRateBg(dept.passRate)}`} style={{ width: `${dept.passRate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
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

  function QSortIcon({ col }: { col: QSortKey }) {
    if (sortKey !== col) return <span className="text-zinc-300 dark:text-zinc-600 ml-1">↕</span>
    return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
  }

  if (data.length === 0) {
    return (
      <Card>
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">에이전트별 품질</h3>
          <div className="h-24 flex items-center justify-center text-sm text-zinc-400">데이터가 없습니다</div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">에이전트별 품질</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-2 px-2 font-medium text-zinc-500 cursor-pointer select-none" onClick={() => toggleSort('agentName')}>에이전트<QSortIcon col="agentName" /></th>
                <th className="text-left py-2 px-2 font-medium text-zinc-500 hidden sm:table-cell">부서</th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500 cursor-pointer select-none" onClick={() => toggleSort('totalReviews')}>리뷰<QSortIcon col="totalReviews" /></th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500 cursor-pointer select-none" onClick={() => toggleSort('passRate')}>통과율<QSortIcon col="passRate" /></th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500 cursor-pointer select-none" onClick={() => toggleSort('avgScore')}>평균 점수<QSortIcon col="avgScore" /></th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500 cursor-pointer select-none" onClick={() => toggleSort('recentFailCount')}>최근 실패<QSortIcon col="recentFailCount" /></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((agent) => (
                <tr key={agent.agentId} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="py-2 px-2 text-zinc-900 dark:text-zinc-100 font-medium">{agent.agentName}</td>
                  <td className="py-2 px-2 text-zinc-500 hidden sm:table-cell">{agent.departmentName}</td>
                  <td className="py-2 px-2 text-right text-zinc-600 dark:text-zinc-400">{agent.totalReviews}</td>
                  <td className="py-2 px-2 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${agent.passRate >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : agent.passRate >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {agent.passRate}%
                    </span>
                  </td>
                  <td className={`py-2 px-2 text-right font-medium ${qScoreColor(agent.avgScore)}`}>{agent.avgScore.toFixed(1)}</td>
                  <td className="py-2 px-2 text-right">
                    {agent.recentFailCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{agent.recentFailCount}</span>
                    ) : (
                      <span className="text-zinc-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}

// === Failed List ===

function QualityFailedList({ data }: { data: FailedItem[] }) {
  const navigate = useNavigate()

  if (data.length === 0) {
    return (
      <Card>
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">실패 작업 목록</h3>
          <div className="h-24 flex items-center justify-center text-sm text-zinc-400">실패한 작업이 없습니다</div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          실패 작업 목록 <span className="text-zinc-400 font-normal">({data.length}건)</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-2 px-2 font-medium text-zinc-500">명령</th>
                <th className="text-left py-2 px-2 font-medium text-zinc-500 hidden sm:table-cell">에이전트</th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500">점수</th>
                <th className="text-left py-2 px-2 font-medium text-zinc-500 hidden md:table-cell">사유</th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500">시도</th>
                <th className="text-right py-2 px-2 font-medium text-zinc-500 hidden sm:table-cell">일시</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.reviewId}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                  onClick={() => navigate(`/activity-log?commandId=${item.commandId}`)}
                >
                  <td className="py-2 px-2 text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">{item.commandText || '(명령 없음)'}</td>
                  <td className="py-2 px-2 text-zinc-500 hidden sm:table-cell">{item.agentName}</td>
                  <td className={`py-2 px-2 text-right font-medium ${qScoreColor(item.avgScore)}`}>{item.avgScore.toFixed(1)}</td>
                  <td className="py-2 px-2 text-zinc-500 hidden md:table-cell max-w-[200px] truncate" title={item.feedback || ''}>{item.feedback || '-'}</td>
                  <td className="py-2 px-2 text-right text-zinc-600 dark:text-zinc-400">{item.attemptNumber}</td>
                  <td className="py-2 px-2 text-right text-zinc-400 hidden sm:table-cell text-xs">
                    {new Date(item.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
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
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {(['7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
              }`}
            >
              {p === '7d' ? '7일' : p === '30d' ? '30일' : '전체'}
            </button>
          ))}
        </div>
        {departmentOptions.length > 0 && (
          <Select
            value={departmentId}
            onChange={(e) => setDepartmentId((e as React.ChangeEvent<HTMLSelectElement>).target.value)}
            options={[{ value: '', label: '전체 부서' }, ...departmentOptions]}
          />
        )}
      </div>

      <QualitySummaryCards summary={dashboard.summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QualityTrendChart data={dashboard.trend} />
        <DepartmentChart data={dashboard.departmentStats} />
      </div>

      <QualityAgentTable data={dashboard.agentStats} />
      <QualityFailedList data={dashboard.failedList} />
    </div>
  )
}

// === Main Page ===

const PERF_TABS = [
  { value: 'agent', label: '에이전트 성능' },
  { value: 'quality', label: '품질 대시보드' },
]

export function PerformancePage() {
  const [activeTab, setActiveTab] = useState('agent')
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
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">전력분석</h2>
        <p className="text-xs text-zinc-500 mt-0.5">에이전트 성능 분석, Soul Gym 개선 제안, 품질 대시보드</p>
      </div>

      <div className="px-6 pt-2">
        <Tabs items={PERF_TABS} value={activeTab} onChange={setActiveTab} />
      </div>

      <div className="px-6 py-4 space-y-6 max-w-6xl">
        {activeTab === 'agent' && (
          <>
            {summaryLoading && !summary ? (
              <PerformanceSkeleton />
            ) : summaryError && !summary ? (
              <EmptyState
                icon="📊"
                title="에이전트 성능 데이터가 없습니다"
                description="사령관실에서 명령을 실행하면 성능 데이터가 수집됩니다"
                action={
                  <a href="/command-center" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    사령관실로 이동 →
                  </a>
                }
              />
            ) : (
              <>
                {summary && <SummaryCards data={summary} />}
                <AgentPerformanceTable onSelectAgent={(id) => setSelectedAgentId(id)} />
                <SoulGymPanel />
              </>
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
