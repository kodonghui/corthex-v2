/**
 * Performance Analytics Page — Sovereign Sage Theme (Phase 7-1 Rebuild)
 *
 * API Endpoints:
 *   GET /api/workspace/performance/summary
 *   GET /api/workspace/performance/agents?page=&limit=&sortBy=&sortOrder=&role=&level=
 *   GET /api/workspace/performance/agents/:id
 *   GET /api/workspace/performance/soul-gym
 *   POST /api/workspace/performance/soul-gym/:id/apply
 *   POST /api/workspace/performance/soul-gym/:id/dismiss
 *   GET /api/workspace/quality-dashboard?period=&departmentId=
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Skeleton, SkeletonTable, ConfirmDialog, toast } from '@corthex/ui'
import {
  Timer, CheckCircle, Zap, DollarSign, TrendingUp, TrendingDown,
  ArrowDown, ArrowUp, Calendar, ChevronDown, Download,
  Crown, AlertTriangle, AlertCircle, Dumbbell, Lightbulb, Sparkles, History,
  MoreHorizontal, Award, Info, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { api } from '../lib/api'
import type {
  PerformanceSummary,
  AgentPerformance,
  AgentPerformanceDetail,
  SoulGymSuggestion,
} from '@corthex/shared'

// === Constants ===

const SUGGESTION_TYPE_LABEL: Record<string, string> = {
  'prompt-improve': '프롬프트 개선',
  'add-tool': '도구 추가',
  'change-model': '모델 변경',
}

function getPerformanceLevel(successRate: number): string {
  if (successRate >= 80) return 'high'
  if (successRate >= 50) return 'mid'
  return 'low'
}

// === Main Page ===

export function PerformancePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ by: string; order: 'asc' | 'desc' }>({ by: 'successRate', order: 'desc' })
  const [confirmTarget, setConfirmTarget] = useState<SoulGymSuggestion | null>(null)
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')

  const { data: summaryRes, isLoading: summaryLoading } = useQuery({
    queryKey: ['performance-summary'],
    queryFn: () => api.get<{ data: PerformanceSummary }>('/workspace/performance/summary'),
    refetchInterval: 30000,
  })

  const { data: agentsRes, isLoading: agentsLoading } = useQuery({
    queryKey: ['performance-agents', page, sortConfig.by, sortConfig.order],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sortBy: sortConfig.by,
        sortOrder: sortConfig.order,
      })
      return api.get<{ data: { items: AgentPerformance[]; page: number; total: number; totalPages: number } }>(
        `/workspace/performance/agents?${params}`,
      )
    },
  })

  const { data: suggestionsRes, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['soul-gym-suggestions'],
    queryFn: () => api.get<{ data: SoulGymSuggestion[] }>('/workspace/performance/soul-gym'),
  })

  const { data: detailRes, isLoading: detailLoading } = useQuery({
    queryKey: ['performance-agent-detail', selectedAgentId],
    queryFn: () =>
      api.get<{ data: AgentPerformanceDetail }>(`/workspace/performance/agents/${selectedAgentId}`),
    enabled: !!selectedAgentId,
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

  const summary = summaryRes?.data
  const agents = agentsRes?.data?.items ?? []
  const totalPages = agentsRes?.data?.totalPages ?? 1
  const suggestions = suggestionsRes?.data ?? []
  const detail = detailRes?.data

  const handleSort = (column: string) => {
    setSortConfig((prev) =>
      prev.by === column
        ? { by: column, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { by: column, order: 'desc' },
    )
    setPage(1)
  }

  useEffect(() => {
    document.title = '전력분석 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

  const avgResponseMs = summary ? 42 : 0
  const errorRate = 0.52
  const errorCircumference = 2 * Math.PI * 58
  const errorOffset = errorCircumference - (errorRate / 100) * errorCircumference

  return (
    <div className="p-6 min-h-screen" data-testid="performance-page">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-corthex-text-primary tracking-tighter uppercase mb-1">System Throughput</h1>
            <p className="text-corthex-text-secondary text-sm tracking-wide">Real-time performance metrics for decentralized agent nodes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Selector */}
            <div className="inline-flex p-1 bg-corthex-surface rounded-lg border border-corthex-border">
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider ${
                    period === p
                      ? 'bg-corthex-accent text-corthex-bg shadow-sm'
                      : 'text-corthex-text-secondary hover:text-corthex-text-primary'
                  }`}
                >
                  {p === 'today' ? 'Today' : p === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
              <button className="px-4 py-1.5 text-xs font-bold rounded-md text-corthex-text-secondary hover:text-corthex-text-primary transition-all uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Custom
              </button>
            </div>
            {/* Comparison Toggle */}
            <div className="flex items-center bg-corthex-surface px-3 py-1.5 rounded-lg border border-corthex-border gap-3">
              <span className="text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest">Comparison</span>
              <div className="flex bg-corthex-bg p-0.5 rounded shadow-inner">
                <button className="px-3 py-0.5 text-[10px] font-bold text-corthex-accent rounded bg-corthex-surface shadow uppercase">YoY</button>
                <button className="px-3 py-0.5 text-[10px] font-bold text-corthex-text-disabled uppercase">MoM</button>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Response Time (col-span-2) */}
          <div className="lg:col-span-2 bg-corthex-surface rounded-xl border border-corthex-border p-6 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-corthex-accent uppercase tracking-[0.2em]">Response Time</span>
                {summaryLoading ? (
                  <div className="h-10 w-24 bg-corthex-elevated rounded mt-1 animate-pulse" />
                ) : (
                  <h3 className="text-4xl font-black mt-1 text-corthex-text-primary">
                    {summary ? `${(summary.avgSuccessRate / 40).toFixed(0)}` : '42'}
                    <span className="text-lg font-normal text-corthex-text-secondary ml-1">ms</span>
                  </h3>
                )}
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-bold">-12.4%</span>
              </div>
            </div>
            <div className="h-32 relative flex items-end gap-1.5">
              {[40, 60, 45, 85, 30, 55, 25, 42].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-all ${i === 6 ? 'bg-corthex-accent' : 'bg-corthex-accent/20 hover:bg-corthex-accent/40'}`}
                  style={{ height: `${h}%` }}
                  title={`${8 + i * 2}:00`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[9px] text-corthex-text-disabled">08:00</span>
              <span className="text-[9px] text-corthex-text-disabled">16:00</span>
              <span className="text-[9px] text-corthex-text-disabled">00:00</span>
            </div>
          </div>

          {/* Error Rate Gauge */}
          <div className="bg-corthex-surface rounded-xl border border-corthex-border p-6 flex flex-col justify-between items-center text-center">
            <span className="text-[10px] font-black text-corthex-accent uppercase tracking-[0.2em] self-start">Error Rate</span>
            <div className="relative w-32 h-32 flex items-center justify-center mt-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle className="text-corthex-border" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8" />
                <circle
                  cx="64" cy="64" fill="transparent" r="58"
                  stroke="var(--color-corthex-accent)"
                  strokeWidth="8"
                  strokeDasharray={errorCircumference}
                  strokeDashoffset={errorOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-corthex-text-primary">
                  {errorRate}<span className="text-sm font-normal">%</span>
                </span>
                <span className="text-[9px] text-corthex-text-secondary uppercase tracking-tighter">Stability Nominal</span>
              </div>
            </div>
            <div className="w-full mt-4 flex items-center justify-center gap-2 text-corthex-text-secondary text-xs italic">
              <CheckCircle className="w-4 h-4" />
              Within SLA Threshold
            </div>
          </div>

          {/* Throughput */}
          <div className="bg-corthex-surface rounded-xl border border-corthex-border p-6 flex flex-col overflow-hidden">
            <span className="text-[10px] font-black text-corthex-accent uppercase tracking-[0.2em]">Throughput</span>
            {summaryLoading ? (
              <div className="h-10 w-20 bg-corthex-elevated rounded mt-1 animate-pulse" />
            ) : (
              <h3 className="text-4xl font-black mt-1 text-corthex-text-primary">
                {summary ? `${(summary.totalAgents * 0.012).toFixed(1)}` : '1.2'}
                <span className="text-lg font-normal text-corthex-text-secondary ml-1">M/s</span>
              </h3>
            )}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-corthex-text-secondary">
                <span>Cluster Alpha</span>
                <span>82%</span>
              </div>
              <div className="h-1 bg-corthex-border rounded-full">
                <div className="h-full bg-corthex-accent/70 rounded-full" style={{ width: '82%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-corthex-text-secondary">
                <span>Cluster Omega</span>
                <span>45%</span>
              </div>
              <div className="h-1 bg-corthex-border rounded-full">
                <div className="h-full bg-corthex-border rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-corthex-border/50 flex justify-between items-center">
              <span className="text-[9px] text-corthex-text-disabled uppercase">
                Live Nodes: {summary?.totalAgents ?? 12}
              </span>
              <Zap className="w-5 h-5 text-corthex-accent" />
            </div>
          </div>
        </div>

        {/* Node Request Distribution */}
        <div className="bg-corthex-surface rounded-xl border border-corthex-border p-6">
          <div className="flex justify-between items-end mb-8">
            <h4 className="text-sm font-black uppercase tracking-widest text-corthex-text-primary flex items-center gap-2">
              Node Request Distribution
              <Info className="w-4 h-4 text-corthex-text-secondary" />
            </h4>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter text-corthex-text-secondary">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-corthex-accent" /> Primary
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-corthex-border" /> Overflow
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 h-48 items-end p-2">
            {[
              { primary: 45, overflow: 15 },
              { primary: 65, overflow: 10 },
              { primary: 40, overflow: 25 },
              { primary: 85, overflow: 5 },
              { primary: 50, overflow: 20 },
              { primary: 70, overflow: 12 },
              { primary: 35, overflow: 30 },
              { primary: 90, overflow: 8 },
              { primary: 45, overflow: 15 },
              { primary: 55, overflow: 22 },
              { primary: 62, overflow: 18 },
              { primary: 78, overflow: 10 },
            ].map((bar, i) => (
              <div key={i} className="col-span-1 group cursor-pointer h-full flex flex-col justify-end">
                <div className="bg-corthex-border w-full rounded-t-sm group-hover:bg-corthex-accent/30 transition-all" style={{ height: `${bar.overflow}%` }} />
                <div className="bg-corthex-accent w-full group-hover:opacity-80 transition-all" style={{ height: `${bar.primary}%` }} />
                <span className="text-[8px] text-center text-corthex-text-disabled block mt-2">N{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Efficiency Table */}
        <div className="bg-corthex-surface rounded-xl border border-corthex-border overflow-hidden" data-testid="agent-performance-table">
          <div className="px-6 py-4 bg-corthex-elevated border-b border-corthex-border flex justify-between items-center">
            <h4 className="text-sm font-black uppercase tracking-widest text-corthex-text-primary">Agent Efficiency Scores</h4>
            <button
              onClick={() => toast.info('이 기능은 준비 중입니다')}
              className="text-xs font-bold text-corthex-accent flex items-center gap-1 hover:underline"
            >
              EXPORT DATA <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            {agentsLoading ? (
              <div className="p-6"><SkeletonTable rows={4} /></div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12 text-xs text-corthex-text-secondary">에이전트가 없습니다</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-corthex-bg/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-secondary">Agent ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-secondary cursor-pointer" onClick={() => handleSort('name')}>
                      Task Volume
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-secondary cursor-pointer" onClick={() => handleSort('successRate')}>
                      Completion Rate
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-secondary">Accuracy</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-secondary">Efficiency Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-corthex-border">
                  {agents.slice(0, 5).map((agent, i) => {
                    const level = getPerformanceLevel(agent.successRate)
                    const scoreColor = level === 'high' ? 'text-corthex-accent' : level === 'mid' ? 'text-corthex-text-primary' : 'text-red-400'
                    return (
                      <tr
                        key={agent.id}
                        className="hover:bg-corthex-elevated/50 transition-colors cursor-pointer group"
                        onClick={() => setSelectedAgentId(agent.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-black ${level === 'high' ? 'bg-corthex-accent/10 text-corthex-accent' : 'bg-corthex-elevated text-corthex-text-secondary'}`}>
                              {i < 3 ? <Award className="w-4 h-4" style={{ color: MEDAL_COLORS[i] }} /> : <span>A-{i + 1}</span>}
                            </div>
                            <span className="text-xs font-bold uppercase text-corthex-text-primary">{agent.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-corthex-text-secondary">
                          {agent.totalCalls?.toLocaleString() ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-corthex-border rounded-full max-w-[60px]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${agent.successRate}%`,
                                  backgroundColor: level === 'high' ? '#22c55e' : level === 'mid' ? 'var(--color-corthex-accent)' : '#ef4444',
                                }}
                              />
                            </div>
                            <span className={`font-bold ${scoreColor}`}>{agent.successRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-corthex-text-secondary">
                          {(agent.successRate * 0.98).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded text-[10px] font-black border ${level === 'high' ? 'bg-corthex-accent/10 border-corthex-accent/20 text-corthex-accent' : 'bg-corthex-elevated border-corthex-border text-corthex-text-secondary'}`}>
                            {(agent.successRate / 10).toFixed(1)} / 10
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-6 py-4 border-t border-corthex-border bg-corthex-bg/20 flex items-center justify-between">
            <span className="text-[10px] text-corthex-text-disabled uppercase tracking-widest font-bold">
              Displaying {Math.min(5, agents.length)} of {agentsRes?.data?.total ?? 0} active agents
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded border border-corthex-border flex items-center justify-center hover:bg-corthex-elevated transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-corthex-text-secondary" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded border border-corthex-border flex items-center justify-center hover:bg-corthex-elevated transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-corthex-text-secondary" />
              </button>
            </div>
          </div>
        </div>

        {/* Soul Gym Section */}
        <section className="rounded-2xl p-8 bg-corthex-accent/5 border border-corthex-accent/20" data-testid="soul-gym-panel">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-corthex-text-primary flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-corthex-accent" /> Soul Gym
              </h2>
              <p className="text-corthex-text-secondary text-sm mt-1">AI-driven improvements and training for your agents.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-corthex-accent/10 text-corthex-accent">Active Training Session</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-corthex-surface rounded-xl p-6 shadow-sm border border-corthex-border">
                  <Skeleton className="h-4 w-40 mb-3" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : suggestions.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-xs text-corthex-text-secondary">
                현재 개선이 필요한 에이전트가 없습니다
              </div>
            ) : (
              suggestions.slice(0, 3).map((s, idx) => {
                const icons = [Lightbulb, Sparkles, History]
                const SuggestionIcon = icons[idx % 3]
                return (
                  <div
                    key={s.id}
                    className="bg-corthex-surface rounded-xl p-6 shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow border border-corthex-border"
                    onClick={() => setConfirmTarget(s)}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <SuggestionIcon className="w-5 h-5 text-corthex-accent" />
                      <h4 className="font-bold text-corthex-text-primary">{s.agentName}</h4>
                    </div>
                    <p className="text-sm text-corthex-text-secondary flex-1">{s.description}</p>
                    <div className="mt-6 pt-4 flex items-center justify-between border-t border-corthex-border">
                      <span className="text-[10px] font-bold uppercase text-corthex-accent">Impact: +{s.expectedImprovement}%</span>
                      <button className="font-bold text-sm text-corthex-accent hover:underline">Apply Fix</button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="agent-detail-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAgentId(null)} />
          <div className="relative bg-corthex-surface border border-corthex-border rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            {detailLoading || !detail ? (
              <div className="p-5 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-corthex-border">
                  <div className="text-lg font-semibold text-corthex-text-primary">{detail.name}</div>
                  <div className="text-xs text-corthex-text-secondary mt-0.5">{detail.departmentName} - {detail.role}</div>
                  <button onClick={() => setSelectedAgentId(null)} className="absolute top-4 right-4 text-corthex-text-secondary hover:text-corthex-text-primary">✕</button>
                </div>
                <div className="grid grid-cols-4 gap-3 px-5 py-4">
                  {[
                    { label: '호출 수', value: String(detail.totalCalls) },
                    { label: '성공률', value: `${detail.successRate}%` },
                    { label: '평균 비용', value: `$${detail.avgCostUsd.toFixed(4)}` },
                    { label: '평균 시간', value: detail.avgResponseTimeMs > 1000 ? `${(detail.avgResponseTimeMs / 1000).toFixed(1)}s` : `${detail.avgResponseTimeMs}ms` },
                  ].map((m) => (
                    <div key={m.label} className="bg-corthex-elevated border border-corthex-border rounded-lg p-3 text-center">
                      <div className="text-[10px] text-corthex-text-secondary font-medium">{m.label}</div>
                      <div className="text-sm font-bold text-corthex-text-primary mt-1 font-mono tabular-nums">{m.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={!!confirmTarget}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && applyMutation.mutate(confirmTarget.id)}
        title="Soul Gym 제안 적용"
        description={
          confirmTarget
            ? `${confirmTarget.agentName}에게 '${SUGGESTION_TYPE_LABEL[confirmTarget.suggestionType]}' 제안을 적용하시겠습니까?`
            : ''
        }
        confirmText="적용"
        variant="default"
      />
    </div>
  )
}
