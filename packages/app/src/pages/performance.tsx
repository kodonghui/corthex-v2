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
  MoreHorizontal, Award,
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf8f5' }} data-testid="performance-page">
      <div className="p-8 max-w-[1440px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1a1a1a]">성과 분석 Performance</h1>
            <p className="text-[#6b705c] text-lg">에이전트 성과를 분석하고 최적화합니다</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#f0ebe0] px-4 py-2.5 rounded-xl text-[#6b705c] text-sm font-medium hover:bg-[#e5e1d3] transition-colors">
              <Calendar className="w-[18px] h-[18px]" />
              최근 30일
              <ChevronDown className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => toast.info('이 기능은 준비 중입니다')}
              className="flex items-center gap-2 bg-[#f0ebe0] text-[#606C38] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:translate-y-[-1px] active:scale-95 transition-all"
            >
              <Download className="w-[18px] h-[18px]" />
              보고서 다운로드 Download Report
            </button>
          </div>
        </header>

        {/* Metric Cards */}
        {summaryLoading && !summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e1d3] animate-pulse">
                <div className="h-4 w-24 bg-[#f0ebe0] rounded mb-4" />
                <div className="h-8 w-16 bg-[#f0ebe0] rounded" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="summary-cards">
            {/* Avg Response */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e1d3]">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b705c] font-mono">Avg Response</span>
                <div className="bg-[#606C38]/10 p-1.5 rounded-lg">
                  <Timer className="w-5 h-5 text-[#606C38]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tracking-tighter">2.4초</span>
                <span className="flex items-center text-xs font-bold text-[#4d7c0f]">
                  <ArrowDown className="w-3.5 h-3.5" /> 12%
                </span>
              </div>
              <p className="text-[11px] text-[#6b705c] mt-1">평균 응답시간</p>
            </div>
            {/* Success Rate */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e1d3]">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b705c] font-mono">Success Rate</span>
                <div className="bg-[#606C38]/10 p-1.5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[#606C38]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tracking-tighter">{summary.avgSuccessRate}%</span>
                <span className="flex items-center text-xs font-bold text-[#4d7c0f]">
                  <ArrowUp className="w-3.5 h-3.5" /> {summary.changes.successRate}%
                </span>
              </div>
              <p className="text-[11px] text-[#6b705c] mt-1">전체 성공률</p>
            </div>
            {/* Throughput */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e1d3]">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b705c] font-mono">Throughput</span>
                <div className="bg-[#606C38]/10 p-1.5 rounded-lg">
                  <Zap className="w-5 h-5 text-[#606C38]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tracking-tighter">{summary.totalAgents > 0 ? `${Math.round(summary.totalAgents * 52)}건/일` : '---'}</span>
              </div>
              <p className="text-[11px] text-[#6b705c] mt-1">작업 처리량</p>
            </div>
            {/* Cost Efficiency */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e1d3]">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b705c] font-mono">Cost Efficiency</span>
                <div className="bg-[#606C38]/10 p-1.5 rounded-lg">
                  <DollarSign className="w-5 h-5 text-[#606C38]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tracking-tighter">${summary.totalAgents > 0 ? (summary.totalCostThisMonth / (summary.totalAgents * 30)).toFixed(3) : '---'}</span>
              </div>
              <p className="text-[11px] text-[#6b705c] mt-1">작업당 비용</p>
            </div>
          </div>
        ) : null}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Response Time Trend */}
          <div className="bg-[#f5f0e8] p-8 rounded-2xl border border-[#e5e1d3]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-bold text-lg text-[#1a1a1a]">응답 시간 추이 Response Time Trend</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#606C38]" />
                <span className="text-[10px] font-mono font-bold uppercase text-[#6b705c]">Avg 2.4s</span>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-1 relative">
              <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] font-mono text-[#908a78] leading-none -translate-x-8">
                <span>5.0s</span><span>2.5s</span><span>0.0s</span>
              </div>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-b border-[#e5e1d3]" />
                <div className="w-full border-b-2 border-dashed border-[#606C38]/30" />
                <div className="w-full border-b border-[#e5e1d3]" />
              </div>
              <div className="flex-1 flex items-end justify-around h-full pt-4 z-10">
                {[60, 55, 70, 40, 45, 50, 48, 60, 65, 45].map((h, i) => (
                  <div key={i} className={`w-2 rounded-t-sm ${i === 6 ? 'bg-[#606C38] shadow-lg' : 'bg-[#606C38]/20'}`} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-mono text-[#908a78] px-2">
              <span>Oct 01</span><span>Oct 15</span><span>Oct 30</span>
            </div>
          </div>

          {/* Success Rate Trend */}
          <div className="bg-[#f5f0e8] p-8 rounded-2xl border border-[#e5e1d3]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-bold text-lg text-[#1a1a1a]">성공률 추이 Success Rate Trend</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#dc2626]" />
                <span className="text-[10px] font-mono font-bold uppercase text-[#6b705c]">Target 95%</span>
              </div>
            </div>
            <div className="h-64 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#606C38]/10 to-transparent rounded-lg" />
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                <path d="M0 200 L0 50 C 50 40, 100 60, 150 45 S 250 20, 300 30 S 400 10, 400 10 L 400 200 Z" fill="url(#perfGrad)" fillOpacity="0.4" />
                <path d="M0 50 C 50 40, 100 60, 150 45 S 250 20, 300 30 S 400 10, 400 10" fill="none" stroke="#606C38" strokeWidth="3" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#dc2626" strokeDasharray="5,5" strokeWidth="1" />
                <defs>
                  <linearGradient id="perfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#606C38', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#606C38', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] font-mono text-[#908a78] leading-none -translate-x-8">
                <span>100%</span><span>95%</span><span>90%</span>
              </div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-mono text-[#908a78] px-2">
              <span>Oct 01</span><span>Oct 15</span><span>Oct 30</span>
            </div>
          </div>

          {/* Cost Efficiency Scatter */}
          <div className="bg-[#f5f0e8] p-8 rounded-2xl border border-[#e5e1d3]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[#1a1a1a]">비용 효율성 산점도 Cost Efficiency Scatter</h3>
            </div>
            <div className="h-80 relative border-l border-b border-[#e5e1d3] bg-[#f0ebe0]/50">
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[#4d7c0f]/10 rounded-tr-3xl border-t border-r border-[#4d7c0f]/20">
                <span className="absolute top-2 right-4 text-[9px] font-bold text-[#4d7c0f] uppercase">Ideal Zone</span>
              </div>
              {agents.slice(0, 4).map((agent, i) => {
                const positions = [
                  { bottom: '40%', left: '30%' },
                  { bottom: '55%', left: '45%' },
                  { bottom: '70%', left: '60%' },
                  { bottom: '20%', left: '80%' },
                ]
                const pos = positions[i]
                return (
                  <div key={agent.id} className="absolute group" style={{ bottom: pos.bottom, left: pos.left }}>
                    <div className="w-3 h-3 bg-[#606C38] rounded-full shadow-lg ring-4 ring-white transition-transform group-hover:scale-150 cursor-pointer" />
                    <span className="absolute top-4 left-0 whitespace-nowrap text-[10px] font-bold bg-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {agent.name}
                    </span>
                  </div>
                )
              })}
              <span className="absolute -left-12 top-1/2 -rotate-90 text-[10px] font-mono text-[#908a78]">Cost per Task (USD)</span>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#908a78]">Tasks Completed (Units)</span>
            </div>
          </div>

          {/* Agent Leaderboard */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e1d3]" data-testid="agent-performance-table">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[#1a1a1a]">에이전트 리더보드 Agent Leaderboard</h3>
              <MoreHorizontal className="w-5 h-5 text-[#908a78]" />
            </div>
            <div className="overflow-x-auto">
              {agentsLoading ? (
                <div className="p-4"><SkeletonTable rows={3} /></div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#908a78]">에이전트가 없습니다</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-mono font-bold uppercase text-[#908a78] border-b border-[#e5e1d3]">
                      <th className="pb-3 px-2">순위 Rank</th>
                      <th className="pb-3 px-2 cursor-pointer" onClick={() => handleSort('name')}>에이전트 Agent</th>
                      <th className="pb-3 px-2 cursor-pointer" onClick={() => handleSort('successRate')}>성공률</th>
                      <th className="pb-3 px-2">응답시간</th>
                      <th className="pb-3 px-2">비용/작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e1d3]/50">
                    {agents.slice(0, 5).map((agent, i) => (
                      <tr key={agent.id} className="group hover:bg-[#f5f0e8]/50 transition-colors cursor-pointer" onClick={() => setSelectedAgentId(agent.id)}>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg">{i + 1}</span>
                            {i < 3 && <Award className="w-5 h-5" style={{ color: MEDAL_COLORS[i] }} />}
                          </div>
                        </td>
                        <td className="py-4 px-2 font-medium">{agent.name}</td>
                        <td className={`py-4 px-2 font-mono font-bold ${agent.successRate >= 80 ? 'text-[#606C38]' : ''}`}>{agent.successRate}%</td>
                        <td className="py-4 px-2 font-mono">{agent.avgResponseTimeMs > 1000 ? `${(agent.avgResponseTimeMs / 1000).toFixed(1)}s` : `${agent.avgResponseTimeMs}ms`}</td>
                        <td className="py-4 px-2 font-mono">${agent.avgCostUsd.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Soul Gym Section */}
        <section className="rounded-2xl p-8 bg-[#606C38]/5 border border-[#606C38]/20" data-testid="soul-gym-panel">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-[#606C38]" /> Soul Gym
              </h2>
              <p className="text-[#6b705c] text-sm mt-1">AI-driven improvements and training for your agents.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[#606C38]/10 text-[#606C38]">Active Training Session</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e1d3]">
                  <Skeleton className="h-4 w-40 mb-3" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : suggestions.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-xs text-[#908a78]">
                현재 개선이 필요한 에이전트가 없습니다
              </div>
            ) : (
              suggestions.slice(0, 3).map((s, idx) => {
                const icons = [Lightbulb, Sparkles, History]
                const SuggestionIcon = icons[idx % 3]
                return (
                  <div key={s.id} className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow border border-[#e5e1d3]" onClick={() => setConfirmTarget(s)}>
                    <div className="flex items-center gap-2 mb-4">
                      <SuggestionIcon className="w-5 h-5 text-[#606C38]" />
                      <h4 className="font-bold text-[#1a1a1a]">{s.agentName}</h4>
                    </div>
                    <p className="text-sm text-[#6b705c] flex-1">{s.description}</p>
                    <div className="mt-6 pt-4 flex items-center justify-between border-t border-[#e5e1d3]">
                      <span className="text-[10px] font-bold uppercase text-[#606C38]">Impact: +{s.expectedImprovement}%</span>
                      <button className="font-bold text-sm text-[#606C38] hover:underline">Apply Fix</button>
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
          <div className="relative bg-white border border-[#e5e1d3] rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            {detailLoading || !detail ? (
              <div className="p-5 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-[#e5e1d3]">
                  <div className="text-lg font-semibold text-[#1a1a1a]">{detail.name}</div>
                  <div className="text-xs text-[#6b705c] mt-0.5">{detail.departmentName} - {detail.role}</div>
                  <button onClick={() => setSelectedAgentId(null)} className="absolute top-4 right-4 text-[#908a78] hover:text-[#1a1a1a]">X</button>
                </div>
                <div className="grid grid-cols-4 gap-3 px-5 py-4">
                  {[
                    { label: '호출 수', value: String(detail.totalCalls) },
                    { label: '성공률', value: `${detail.successRate}%` },
                    { label: '평균 비용', value: `$${detail.avgCostUsd.toFixed(4)}` },
                    { label: '평균 시간', value: detail.avgResponseTimeMs > 1000 ? `${(detail.avgResponseTimeMs / 1000).toFixed(1)}s` : `${detail.avgResponseTimeMs}ms` },
                  ].map((m) => (
                    <div key={m.label} className="bg-[#f5f0e8] border border-[#e5e1d3] rounded-lg p-3 text-center">
                      <div className="text-[10px] text-[#6b705c] font-medium">{m.label}</div>
                      <div className="text-sm font-bold text-[#1a1a1a] mt-1 font-mono tabular-nums">{m.value}</div>
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
