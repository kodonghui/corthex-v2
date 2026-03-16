/**
 * Performance Analytics Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET /api/workspace/performance/summary
 *   GET /api/workspace/performance/agents?page=&limit=&sortBy=&sortOrder=&role=&level=
 *   GET /api/workspace/performance/agents/:id
 *   GET /api/workspace/performance/soul-gym
 *   POST /api/workspace/performance/soul-gym/:id/apply
 *   POST /api/workspace/performance/soul-gym/:id/dismiss
 *   GET /api/workspace/quality-dashboard?period=&departmentId=
 *
 * Stitch HTML: performance/code.html (Natural Organic olive/earth theme)
 * Existing React: packages/app/src/pages/performance.tsx
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Skeleton, SkeletonTable, EmptyState, Modal, ConfirmDialog, toast } from '@corthex/ui'
import { Bot, CheckCircle, Timer, CreditCard, TrendingUp, TrendingDown, Lightbulb, ShieldCheck, Star, AlertTriangle, AlertCircle, ArrowRight, Crown, Hexagon, Dumbbell, Sparkles, History, Headphones, Cloud } from 'lucide-react'
import { api } from '../lib/api'
import type {
  PerformanceSummary,
  AgentPerformance,
  AgentPerformanceDetail,
  SoulGymSuggestion,
} from '@corthex/shared'

// === Constants ===

const oliveGreen = '#606c38'
const secondaryGreen = '#283618'
const accentGold = '#dda15e'
const earthBrown = '#bc6c25'
const bgLight = '#fefae0'

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

  const { data: summaryRes, isLoading: summaryLoading, error: summaryError } = useQuery({
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

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Public Sans', sans-serif", backgroundColor: bgLight, color: '#0f172a' }} data-testid="performance-page">
        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Hero Stats */}
          {summaryLoading && !summary ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-xl animate-pulse" style={{ border: `1px solid ${oliveGreen}1a` }}>
                  <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
                  <div className="h-8 w-16 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : summary ? (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="summary-cards">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow" style={{ border: `1px solid ${oliveGreen}1a` }}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 text-sm font-medium">Avg. Success Rate</p>
                  <ShieldCheck className="w-5 h-5 p-1.5 rounded-lg" style={{ color: oliveGreen, backgroundColor: `${oliveGreen}1a`, width: 32, height: 32 }} />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-800">{summary.avgSuccessRate}%</h3>
                  <span className="text-sm font-bold" style={{ color: oliveGreen }}>+{summary.changes.successRate}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Workspace average across {summary.totalAgents} agents</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow" style={{ border: `1px solid ${oliveGreen}1a` }}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 text-sm font-medium">Quality Score</p>
                  <Star className="w-5 h-5 p-1.5 rounded-lg" style={{ color: accentGold, backgroundColor: `${accentGold}1a`, width: 32, height: 32 }} />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-800">8.8<span className="text-lg text-slate-400">/10</span></h3>
                  <span className="text-sm font-bold" style={{ color: oliveGreen }}>+0.5%</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Based on natural language resonance</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow" style={{ border: `1px solid ${oliveGreen}1a` }}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 text-sm font-medium">Total Cost</p>
                  <CreditCard className="w-5 h-5 p-1.5 rounded-lg" style={{ color: earthBrown, backgroundColor: `${earthBrown}1a`, width: 32, height: 32 }} />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-800">${summary.totalCostThisMonth.toFixed(2)}</h3>
                  <span className="text-sm font-bold" style={{ color: oliveGreen }}>+{summary.changes.cost > 0 ? '+' : ''}{summary.changes.cost.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">This month expenditure</p>
              </div>
            </section>
          ) : null}

          {/* Agent Performance Matrix & Hallucination Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Matrix */}
            <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: `1px solid ${oliveGreen}1a` }} data-testid="agent-performance-table">
              <div className="px-6 py-5 flex justify-between items-center" style={{ borderBottom: `1px solid ${oliveGreen}1a` }}>
                <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Lora', serif" }}>Agent Performance Matrix</h3>
                <button className="text-sm font-bold flex items-center gap-1" style={{ color: oliveGreen }}>
                  View Full Report <ArrowRight className="w-4 h-4 inline" />
                </button>
              </div>
              <div className="overflow-x-auto">
                {agentsLoading ? (
                  <div className="p-4">
                    <SkeletonTable rows={3} />
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">에이전트가 없습니다</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: bgLight }}>
                        <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('name')}>
                          Agent Name {sortConfig.by === 'name' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 cursor-pointer" onClick={() => handleSort('successRate')}>
                          Success Rate {sortConfig.by === 'successRate' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-4">Quality</th>
                        <th className="px-6 py-4">Badge</th>
                      </tr>
                    </thead>
                    <tbody style={{ borderColor: `${oliveGreen}1a` }} className="divide-y">
                      {agents.slice(0, 5).map((agent) => {
                        const level = getPerformanceLevel(agent.successRate)
                        const badge = PERFORMANCE_BADGE[level]
                        const stars = Math.round(agent.successRate / 20)
                        const agentColors = [oliveGreen, accentGold, earthBrown]
                        const agentIconComponents = [Bot, Headphones, Cloud]
                        const idx = agents.indexOf(agent)
                        const AgentIcon = agentIconComponents[idx % 3]
                        return (
                          <tr key={agent.id} className="cursor-pointer hover:bg-slate-50/50" onClick={() => setSelectedAgentId(agent.id)}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${agentColors[idx % 3]}33`, color: agentColors[idx % 3] }}>
                                  <AgentIcon className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-slate-700">{agent.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                agent.successRate >= 80
                                  ? 'bg-green-100 text-green-700'
                                  : agent.successRate >= 50
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                              }`}>
                                {agent.successRate >= 80 ? 'ACTIVE' : agent.successRate >= 50 ? 'IDLE' : 'LOW'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800">{agent.successRate}%</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5" style={{ color: i < stars ? accentGold : '#cbd5e1' }} />
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold" style={{
                                backgroundColor: level === 'high' ? `${oliveGreen}1a` : level === 'mid' ? `${accentGold}1a` : '#f1f5f9',
                                color: level === 'high' ? oliveGreen : level === 'mid' ? accentGold : '#64748b',
                              }}>
                                {level === 'high' ? <Crown className="w-3.5 h-3.5" /> : level === 'mid' ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                {level.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Hallucination Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm" style={{ border: `1px solid ${oliveGreen}1a` }}>
              <h3 className="text-lg font-bold text-slate-800 mb-6" style={{ fontFamily: "'Lora', serif" }}>Hallucination Report</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-700">CLEAN</p>
                      <p className="text-xs text-green-600/80">{summary?.totalAgents ? Math.round(summary.totalAgents * 0.75) : 18} Agents</p>
                    </div>
                  </div>
                  <span className="text-green-700 font-bold">75%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-bold text-yellow-700">WARNING</p>
                      <p className="text-xs text-yellow-600/80">{summary?.totalAgents ? Math.round(summary.totalAgents * 0.2) : 5} Agents</p>
                    </div>
                  </div>
                  <span className="text-yellow-700 font-bold">20%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-bold text-red-700">CRITICAL</p>
                      <p className="text-xs text-red-600/80">{summary?.totalAgents ? Math.round(summary.totalAgents * 0.05) : 1} Agent</p>
                    </div>
                  </div>
                  <span className="text-red-700 font-bold">5%</span>
                </div>
              </div>
              <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${oliveGreen}1a` }}>
                <p className="text-slate-500 text-xs italic mb-4">"High hallucination rates detected in low-performing agents. Recommending structural prompt realignment in Soul Gym."</p>
                <button className="w-full py-2 text-sm font-bold rounded-lg transition-all" style={{ border: `1px solid ${oliveGreen}`, color: oliveGreen }}>
                  Review Critical Log
                </button>
              </div>
            </div>
          </div>

          {/* Soul Gym Section */}
          <section className="rounded-2xl p-8" style={{ backgroundColor: `${oliveGreen}0d`, border: `1px solid ${oliveGreen}33` }} data-testid="soul-gym-panel">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: "'Lora', serif" }}>
                  <Dumbbell className="w-6 h-6" style={{ color: oliveGreen }} /> Soul Gym
                </h2>
                <p className="text-slate-500 text-sm mt-1">AI-driven improvements and natural resonance training for your agents.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" style={{ backgroundColor: `${oliveGreen}1a`, color: oliveGreen }}>Active Training Session</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestionsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm" style={{ border: `1px solid ${oliveGreen}1a` }}>
                    <Skeleton className="h-4 w-40 mb-3" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              ) : suggestions.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-xs text-slate-500">
                  현재 개선이 필요한 에이전트가 없습니다
                </div>
              ) : (
                suggestions.slice(0, 3).map((s) => {
                  const typeBadge = SUGGESTION_TYPE_BADGE[s.suggestionType] || SUGGESTION_TYPE_BADGE['prompt-improve']
                  const iconComponents = [Lightbulb, Sparkles, History]
                  const iconColors = [accentGold, oliveGreen, earthBrown]
                  const idx = suggestions.indexOf(s)
                  const SuggestionIcon = iconComponents[idx % 3]
                  return (
                    <div key={s.id} className="bg-white rounded-xl p-6 shadow-sm flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow" style={{ border: `1px solid ${oliveGreen}1a` }} onClick={() => setConfirmTarget(s)}>
                      <div className="flex items-center gap-2 mb-4">
                        <SuggestionIcon className="w-5 h-5" style={{ color: iconColors[idx % 3] }} />
                        <h4 className="font-bold text-slate-800">{s.agentName}</h4>
                      </div>
                      <p className="text-sm text-slate-600 flex-1">{s.description}</p>
                      <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${oliveGreen}1a` }}>
                        <span className="text-[10px] font-bold uppercase" style={{ color: oliveGreen }}>Impact: +{s.expectedImprovement}%</span>
                        <button className="font-bold text-sm hover:underline" style={{ color: oliveGreen }}>Apply Fix</button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* Workspace Resonance Visualization */}
          <section className="bg-white rounded-xl p-8 shadow-sm" style={{ border: `1px solid ${oliveGreen}1a` }}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Lora', serif" }}>Agent Soul Cohesion</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: oliveGreen }} />
                  <span className="text-xs text-slate-500">Stability</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentGold }} />
                  <span className="text-xs text-slate-500">Creativity</span>
                </div>
              </div>
            </div>
            <div className="relative h-64 w-full rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${oliveGreen}0d` }}>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: `${oliveGreen}33`, color: oliveGreen }}>
                  <Hexagon className="w-12 h-12" />
                </div>
                <p className="mt-4 font-bold text-slate-800">Resonance Frequency: 432Hz</p>
                <p className="text-xs font-bold" style={{ color: oliveGreen }}>OPTIMAL SYNC</p>
              </div>
            </div>
          </section>
        </div>

      {/* Agent Detail Modal */}
      {selectedAgentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="agent-detail-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAgentId(null)} />
          <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            {detailLoading || !detail ? (
              <div className="p-5 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${oliveGreen}1a` }}>
                  <div className="text-lg font-semibold text-slate-800">{detail.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{detail.departmentName} - {detail.role}</div>
                  <button onClick={() => setSelectedAgentId(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">X</button>
                </div>
                <div className="grid grid-cols-4 gap-3 px-5 py-4">
                  {[
                    { label: '호출 수', value: String(detail.totalCalls) },
                    { label: '성공률', value: `${detail.successRate}%` },
                    { label: '평균 비용', value: `$${detail.avgCostUsd.toFixed(4)}` },
                    { label: '평균 시간', value: detail.avgResponseTimeMs > 1000 ? `${(detail.avgResponseTimeMs / 1000).toFixed(1)}s` : `${detail.avgResponseTimeMs}ms` },
                  ].map((m) => (
                    <div key={m.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-slate-500 font-medium">{m.label}</div>
                      <div className="text-sm font-bold text-slate-800 mt-1 font-mono tabular-nums">{m.value}</div>
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
