/**
 * Story 28.8 — CEO Memory Dashboard
 *
 * GET /api/workspace/memory-dashboard/overview
 * GET /api/workspace/memory-dashboard/agent/:agentId/observations
 * GET /api/workspace/memory-dashboard/agent/:agentId/memories
 * GET /api/workspace/memory-dashboard/agent/:agentId/timeline
 * POST /api/workspace/memory-dashboard/agent/:agentId/memories/:memoryId/pin
 * DELETE /api/workspace/memory-dashboard/agent/:agentId/observations/:observationId
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Skeleton, Badge, toast } from '@corthex/ui'
import {
  Brain, Eye, Clock, Pin, Trash2, ArrowLeft,
  ChevronRight, AlertTriangle, Lightbulb, Filter,
  Gauge, TrendingUp, Crosshair, BookOpen, Zap, Shield, Wrench,
} from 'lucide-react'

// Types
type AgentOverview = {
  agentId: string
  agentName: string
  totalObservations: number
  unreflectedCount: number
  flaggedCount: number
  totalMemories: number
  lastReflectionAt: string | null
}

type Observation = {
  id: string
  content: string
  domain: string
  outcome: string
  toolUsed: string | null
  importance: number
  confidence: number
  reflected: boolean
  flagged: boolean
  observedAt: string
  createdAt: string
}

type Memory = {
  id: string
  memoryType: string
  key: string
  content: string
  context: string | null
  source: string
  confidence: number
  category: string | null
  pinned: boolean
  usageCount: number
  lastUsedAt: string | null
  createdAt: string
}

type TimelineEvent = {
  type: 'observation' | 'memory'
  id: string
  content: string
  timestamp: string
  metadata: Record<string, unknown>
}

// Domain/outcome/category badge colors
const domainColors: Record<string, string> = {
  conversation: 'bg-blue-100 text-blue-700',
  tool_use: 'bg-purple-100 text-purple-700',
  error: 'bg-red-100 text-red-700',
}

const outcomeColors: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  failure: 'bg-red-100 text-red-700',
  unknown: 'bg-stone-100 text-stone-600',
}

const categoryColors: Record<string, string> = {
  skill: 'bg-indigo-100 text-indigo-700',
  preference: 'bg-pink-100 text-pink-700',
  knowledge: 'bg-cyan-100 text-cyan-700',
  relationship: 'bg-orange-100 text-orange-700',
  pattern: 'bg-amber-100 text-amber-700',
}

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ConfidenceBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-stone-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#606C38] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-stone-500">{pct}%</span>
    </div>
  )
}

// Overview card for a single agent
function AgentCard({ agent, onClick }: { agent: AgentOverview; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full p-4 rounded-lg border border-[#e5e1d3] bg-white hover:border-[#606C38]/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-stone-800 truncate">{agent.agentName || agent.agentId.slice(0, 8)}</h3>
        <ChevronRight className="w-4 h-4 text-stone-400" />
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-lg font-semibold text-stone-800">{agent.totalObservations}</div>
          <div className="text-[10px] text-stone-500 uppercase">관찰</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-stone-800">{agent.totalMemories}</div>
          <div className="text-[10px] text-stone-500 uppercase">기억</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-stone-800">{agent.unreflectedCount}</div>
          <div className="text-[10px] text-stone-500 uppercase">미반영</div>
        </div>
      </div>
      {agent.lastReflectionAt && (
        <div className="mt-2 text-xs text-stone-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          마지막 리플렉션: {formatDate(agent.lastReflectionAt)}
        </div>
      )}
      {agent.flaggedCount > 0 && (
        <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          플래그: {agent.flaggedCount}건
        </div>
      )}
    </button>
  )
}

// Observations tab content
function ObservationsTab({ agentId }: { agentId: string }) {
  const [domainFilter, setDomainFilter] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('')
  const [flaggedFilter, setFlaggedFilter] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['memory-dashboard', 'observations', agentId, domainFilter, outcomeFilter, flaggedFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (domainFilter) params.set('domain', domainFilter)
      if (outcomeFilter) params.set('outcome', outcomeFilter)
      if (flaggedFilter) params.set('flagged', flaggedFilter)
      const qs = params.toString()
      return api.get<{ data: Observation[] }>(`/workspace/memory-dashboard/agent/${agentId}/observations${qs ? `?${qs}` : ''}`)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (obsId: string) => api.delete(`/workspace/memory-dashboard/agent/${agentId}/observations/${obsId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-dashboard'] })
      toast.success('관찰 삭제됨')
    },
  })

  const obs = data?.data ?? []

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-stone-400 mt-1" />
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}
          className="text-xs border rounded px-2 py-1 bg-white">
          <option value="">전체 도메인</option>
          <option value="conversation">conversation</option>
          <option value="tool_use">tool_use</option>
          <option value="error">error</option>
        </select>
        <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}
          className="text-xs border rounded px-2 py-1 bg-white">
          <option value="">전체 결과</option>
          <option value="success">success</option>
          <option value="failure">failure</option>
          <option value="unknown">unknown</option>
        </select>
        <select value={flaggedFilter} onChange={(e) => setFlaggedFilter(e.target.value)}
          className="text-xs border rounded px-2 py-1 bg-white">
          <option value="">전체</option>
          <option value="true">플래그됨</option>
          <option value="false">정상</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : obs.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>관찰 기록이 없습니다</p>
        </div>
      ) : (
        obs.map((o) => (
          <div key={o.id} className={`p-3 rounded-lg border ${o.flagged ? 'border-red-200 bg-red-50/50' : 'border-[#e5e1d3] bg-white'}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-stone-700 line-clamp-2 flex-1">{o.content}</p>
              <button
                onClick={() => deleteMut.mutate(o.id)}
                className="text-stone-400 hover:text-red-500 transition-colors shrink-0"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${domainColors[o.domain] ?? 'bg-stone-100 text-stone-600'}`}>
                {o.domain}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${outcomeColors[o.outcome] ?? 'bg-stone-100 text-stone-600'}`}>
                {o.outcome}
              </span>
              {o.flagged && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">flagged</span>
              )}
              {o.reflected && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">reflected</span>
              )}
              <ConfidenceBar value={o.confidence} max={1} />
              <span className="text-[10px] text-stone-400 ml-auto">{formatDate(o.observedAt)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Memories tab content
function MemoriesTab({ agentId }: { agentId: string }) {
  const [sourceFilter, setSourceFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['memory-dashboard', 'memories', agentId, sourceFilter, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (sourceFilter) params.set('source', sourceFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      const qs = params.toString()
      return api.get<{ data: Memory[] }>(`/workspace/memory-dashboard/agent/${agentId}/memories${qs ? `?${qs}` : ''}`)
    },
  })

  const pinMut = useMutation({
    mutationFn: (memId: string) => api.post(`/workspace/memory-dashboard/agent/${agentId}/memories/${memId}/pin`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-dashboard'] })
    },
  })

  const memories = data?.data ?? []

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-stone-400 mt-1" />
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          className="text-xs border rounded px-2 py-1 bg-white">
          <option value="">전체 출처</option>
          <option value="manual">manual</option>
          <option value="reflection">reflection</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs border rounded px-2 py-1 bg-white">
          <option value="">전체 카테고리</option>
          <option value="skill">skill</option>
          <option value="preference">preference</option>
          <option value="knowledge">knowledge</option>
          <option value="relationship">relationship</option>
          <option value="pattern">pattern</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>기억이 없습니다</p>
        </div>
      ) : (
        memories.map((m) => (
          <div key={m.id} className={`p-3 rounded-lg border ${m.pinned ? 'border-[#606C38]/40 bg-[#faf8f5]' : 'border-[#e5e1d3] bg-white'}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-stone-700 flex-1">{m.content}</p>
              <button
                onClick={() => pinMut.mutate(m.id)}
                className={`shrink-0 transition-colors ${m.pinned ? 'text-[#606C38]' : 'text-stone-300 hover:text-[#606C38]'}`}
                title={m.pinned ? '고정 해제' : '고정'}
              >
                <Pin className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.source === 'reflection' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}`}>
                {m.source}
              </span>
              {m.category && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${categoryColors[m.category] ?? 'bg-stone-100 text-stone-600'}`}>
                  {m.category}
                </span>
              )}
              <ConfidenceBar value={m.confidence} />
              {m.usageCount > 0 && (
                <span className="text-[10px] text-stone-400">사용: {m.usageCount}회</span>
              )}
              <span className="text-[10px] text-stone-400 ml-auto">{formatDate(m.createdAt)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Capability types
type CapabilityScore = {
  agentId: string
  companyId: string
  overall: number
  dimensions: {
    taskSuccessRate: number
    domainBreadth: number
    learningVelocity: number
    memoryRetention: number
    toolProficiency: number
  }
  evaluatedAt: string
  observationCount: number
  memoryCount: number
}

type CapabilityHistoryEntry = {
  id: string
  overallScore: number
  dimensions: Record<string, number>
  observationCount: number
  memoryCount: number
  evaluatedAt: string
}

const dimensionMeta: Record<string, { label: string; icon: typeof Crosshair; color: string }> = {
  taskSuccessRate: { label: 'Task Success', icon: Crosshair, color: 'text-green-600' },
  domainBreadth: { label: 'Domain Breadth', icon: BookOpen, color: 'text-blue-600' },
  learningVelocity: { label: 'Learning Velocity', icon: Zap, color: 'text-amber-600' },
  memoryRetention: { label: 'Memory Retention', icon: Shield, color: 'text-purple-600' },
  toolProficiency: { label: 'Tool Proficiency', icon: Wrench, color: 'text-cyan-600' },
}

function ScoreRing({ score }: { score: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 70 ? '#606C38' : score >= 40 ? '#d97706' : '#dc2626'
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e1d3" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-stone-800">{score}</span>
      </div>
    </div>
  )
}

// Capability tab content
function CapabilityTab({ agentId }: { agentId: string }) {
  const { data: scoreData, isLoading: scoreLoading } = useQuery({
    queryKey: ['capability', agentId],
    queryFn: () => api.get<{ data: CapabilityScore }>(`/workspace/capability/${agentId}`),
  })

  const { data: historyData } = useQuery({
    queryKey: ['capability', 'history', agentId],
    queryFn: () => api.get<{ data: CapabilityHistoryEntry[] }>(`/workspace/capability/${agentId}/history`),
  })

  const score = scoreData?.data
  const history = historyData?.data ?? []

  if (scoreLoading) {
    return <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
  }

  if (!score) {
    return (
      <div className="text-center py-12 text-stone-400">
        <Gauge className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>평가 데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex items-center gap-6 p-4 rounded-lg border border-[#e5e1d3] bg-white">
        <ScoreRing score={score.overall} />
        <div className="flex-1">
          <h3 className="font-medium text-stone-800 mb-1">Overall Capability</h3>
          <p className="text-sm text-stone-500">
            Based on {score.observationCount} observations and {score.memoryCount} memories
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Evaluated: {formatDate(score.evaluatedAt)}
          </p>
        </div>
      </div>

      {/* Dimensions Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(score.dimensions).map(([key, value]) => {
          const meta = dimensionMeta[key]
          if (!meta) return null
          const Icon = meta.icon
          return (
            <div key={key} className="p-3 rounded-lg border border-[#e5e1d3] bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${meta.color}`} />
                <span className="text-sm font-medium text-stone-700">{meta.label}</span>
                <span className="ml-auto text-sm font-semibold text-stone-800">{value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#606C38] transition-all"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* History Trend */}
      {history.length > 1 && (
        <div className="p-4 rounded-lg border border-[#e5e1d3] bg-white">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#606C38]" />
            <h3 className="text-sm font-medium text-stone-700">Score History</h3>
          </div>
          <div className="flex items-end gap-1 h-16">
            {history.slice(0, 20).reverse().map((h) => (
              <div
                key={h.id}
                className="flex-1 bg-[#606C38]/70 rounded-t hover:bg-[#606C38] transition-colors"
                style={{ height: `${Math.max(h.overallScore, 4)}%` }}
                title={`${h.overallScore} — ${formatDate(h.evaluatedAt)}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Timeline tab content
function TimelineTab({ agentId }: { agentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['memory-dashboard', 'timeline', agentId],
    queryFn: () => api.get<{ data: TimelineEvent[] }>(`/workspace/memory-dashboard/agent/${agentId}/timeline`),
  })

  const events = data?.data ?? []

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}</div>
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>타임라인 이벤트가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {events.map((ev) => (
        <div key={`${ev.type}-${ev.id}`} className="flex gap-3 py-2">
          <div className={`mt-1 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            ev.type === 'observation' ? 'bg-blue-100' : 'bg-purple-100'
          }`}>
            {ev.type === 'observation'
              ? <Eye className="w-3 h-3 text-blue-600" />
              : <Lightbulb className="w-3 h-3 text-purple-600" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-stone-700 line-clamp-1">{ev.content}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                ev.type === 'observation' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              }`}>
                {ev.type === 'observation' ? '관찰' : '기억'}
              </span>
              <span className="text-[10px] text-stone-400">{formatDate(ev.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Agent detail view
function AgentDetail({ agentId, agentName, onBack }: { agentId: string; agentName: string; onBack: () => void }) {
  const [tab, setTab] = useState<'observations' | 'memories' | 'timeline' | 'capability'>('observations')

  const tabs = [
    { key: 'observations' as const, label: '관찰', icon: Eye },
    { key: 'memories' as const, label: '기억', icon: Brain },
    { key: 'timeline' as const, label: '타임라인', icon: Clock },
    { key: 'capability' as const, label: '역량', icon: Gauge },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-stone-800">{agentName || agentId.slice(0, 8)}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e5e1d3]">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${
              tab === key
                ? 'border-[#606C38] text-[#283618] font-medium'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'observations' && <ObservationsTab agentId={agentId} />}
      {tab === 'memories' && <MemoriesTab agentId={agentId} />}
      {tab === 'timeline' && <TimelineTab agentId={agentId} />}
      {tab === 'capability' && <CapabilityTab agentId={agentId} />}
    </div>
  )
}

// Main page
export function MemoriesPage() {
  const [selectedAgent, setSelectedAgent] = useState<{ id: string; name: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['memory-dashboard', 'overview'],
    queryFn: () => api.get<{ data: { agents: AgentOverview[] } }>('/workspace/memory-dashboard/overview'),
  })

  const agents = data?.data?.agents ?? []

  if (selectedAgent) {
    return (
      <div className="space-y-6">
        <AgentDetail
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          onBack={() => setSelectedAgent(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="w-6 h-6 text-[#606C38]" />
        <h1 className="text-xl font-semibold text-stone-800">Memory Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">에이전트 기억이 아직 없습니다</p>
          <p className="text-sm mt-1">에이전트가 작업을 수행하면 관찰과 기억이 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.agentId}
              agent={agent}
              onClick={() => setSelectedAgent({ id: agent.agentId, name: agent.agentName })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
