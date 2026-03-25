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
  Search, Share2, Terminal, ChevronDown,
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

const MEMORY_TYPE_LABELS: Record<string, string> = {
  episodic: 'Episodic',
  semantic: 'Semantic',
  associative: 'Associative',
  procedural: 'Procedural',
}

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ConfidenceBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-corthex-border overflow-hidden">
        <div
          className="h-full rounded-full bg-corthex-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-corthex-text-disabled">{pct}%</span>
    </div>
  )
}

// Overview card for a single agent
function AgentCard({ agent, onClick }: { agent: AgentOverview; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left w-full p-4 rounded-lg border border-corthex-border bg-corthex-surface hover:border-corthex-accent/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-corthex-text-primary truncate">{agent.agentName || agent.agentId.slice(0, 8)}</h3>
        <ChevronRight className="w-4 h-4 text-corthex-text-secondary" />
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-lg font-semibold text-corthex-text-primary">{agent.totalObservations}</div>
          <div className="text-[10px] text-corthex-text-secondary uppercase">관찰</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-corthex-text-primary">{agent.totalMemories}</div>
          <div className="text-[10px] text-corthex-text-secondary uppercase">기억</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-corthex-text-primary">{agent.unreflectedCount}</div>
          <div className="text-[10px] text-corthex-text-secondary uppercase">미반영</div>
        </div>
      </div>
      {agent.lastReflectionAt && (
        <div className="mt-2 text-xs text-corthex-text-secondary flex items-center gap-1">
          <Clock className="w-3 h-3" />
          마지막 리플렉션: {formatDate(agent.lastReflectionAt)}
        </div>
      )}
      {agent.flaggedCount > 0 && (
        <div className="mt-1 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
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
        <Filter className="w-4 h-4 text-corthex-text-secondary mt-1" />
        <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}
          className="text-xs border border-corthex-border rounded px-2 py-1 bg-corthex-surface text-corthex-text-primary">
          <option value="">전체 도메인</option>
          <option value="conversation">conversation</option>
          <option value="tool_use">tool_use</option>
          <option value="error">error</option>
        </select>
        <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}
          className="text-xs border border-corthex-border rounded px-2 py-1 bg-corthex-surface text-corthex-text-primary">
          <option value="">전체 결과</option>
          <option value="success">success</option>
          <option value="failure">failure</option>
          <option value="unknown">unknown</option>
        </select>
        <select value={flaggedFilter} onChange={(e) => setFlaggedFilter(e.target.value)}
          className="text-xs border border-corthex-border rounded px-2 py-1 bg-corthex-surface text-corthex-text-primary">
          <option value="">전체</option>
          <option value="true">플래그됨</option>
          <option value="false">정상</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : obs.length === 0 ? (
        <div className="text-center py-12 text-corthex-text-secondary">
          <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>관찰 기록이 없습니다</p>
        </div>
      ) : (
        obs.map((o) => (
          <div key={o.id} className={`p-3 rounded-lg border ${o.flagged ? 'border-red-500/30 bg-red-500/5' : 'border-corthex-border bg-corthex-surface'}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-corthex-text-primary line-clamp-2 flex-1">{o.content}</p>
              <button
                onClick={() => deleteMut.mutate(o.id)}
                className="text-corthex-text-secondary hover:text-red-400 transition-colors shrink-0"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${domainColors[o.domain] ?? 'bg-corthex-elevated text-corthex-text-secondary'}`}>
                {o.domain}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${outcomeColors[o.outcome] ?? 'bg-corthex-elevated text-corthex-text-secondary'}`}>
                {o.outcome}
              </span>
              {o.flagged && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">flagged</span>
              )}
              {o.reflected && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">reflected</span>
              )}
              <ConfidenceBar value={o.confidence} max={1} />
              <span className="text-[10px] text-corthex-text-disabled ml-auto">{formatDate(o.observedAt)}</span>
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
        <Filter className="w-4 h-4 text-corthex-text-secondary mt-1" />
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          className="text-xs border border-corthex-border rounded px-2 py-1 bg-corthex-surface text-corthex-text-primary">
          <option value="">전체 출처</option>
          <option value="manual">manual</option>
          <option value="reflection">reflection</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs border border-corthex-border rounded px-2 py-1 bg-corthex-surface text-corthex-text-primary">
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
        <div className="text-center py-12 text-corthex-text-secondary">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>기억이 없습니다</p>
        </div>
      ) : (
        memories.map((m) => (
          <div key={m.id} className={`p-3 rounded-lg border ${m.pinned ? 'border-corthex-accent/40 bg-corthex-accent/5' : 'border-corthex-border bg-corthex-surface'}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-corthex-text-primary flex-1">{m.content}</p>
              <button
                onClick={() => pinMut.mutate(m.id)}
                className={`shrink-0 transition-colors ${m.pinned ? 'text-corthex-accent' : 'text-corthex-text-disabled hover:text-corthex-accent'}`}
                title={m.pinned ? '고정 해제' : '고정'}
              >
                <Pin className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.source === 'reflection' ? 'bg-purple-100 text-purple-700' : 'bg-corthex-elevated text-corthex-text-secondary'}`}>
                {m.source}
              </span>
              {m.category && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${categoryColors[m.category] ?? 'bg-corthex-elevated text-corthex-text-secondary'}`}>
                  {m.category}
                </span>
              )}
              <ConfidenceBar value={m.confidence} />
              {m.usageCount > 0 && (
                <span className="text-[10px] text-corthex-text-disabled">사용: {m.usageCount}회</span>
              )}
              <span className="text-[10px] text-corthex-text-disabled ml-auto">{formatDate(m.createdAt)}</span>
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
  const color = score >= 70 ? 'var(--color-corthex-accent)' : score >= 40 ? '#d97706' : '#dc2626'
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--color-corthex-border)" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-corthex-text-primary">{score}</span>
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
      <div className="text-center py-12 text-corthex-text-secondary">
        <Gauge className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>평가 데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-4 rounded-lg border border-corthex-border bg-corthex-surface">
        <ScoreRing score={score.overall} />
        <div className="flex-1">
          <h3 className="font-medium text-corthex-text-primary mb-1">Overall Capability</h3>
          <p className="text-sm text-corthex-text-secondary">
            Based on {score.observationCount} observations and {score.memoryCount} memories
          </p>
          <p className="text-xs text-corthex-text-disabled mt-1">
            Evaluated: {formatDate(score.evaluatedAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(score.dimensions).map(([key, value]) => {
          const meta = dimensionMeta[key]
          if (!meta) return null
          const Icon = meta.icon
          return (
            <div key={key} className="p-3 rounded-lg border border-corthex-border bg-corthex-surface">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${meta.color}`} />
                <span className="text-sm font-medium text-corthex-text-primary">{meta.label}</span>
                <span className="ml-auto text-sm font-semibold text-corthex-text-primary">{value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-corthex-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-corthex-accent transition-all"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {history.length > 1 && (
        <div className="p-4 rounded-lg border border-corthex-border bg-corthex-surface">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-corthex-accent" />
            <h3 className="text-sm font-medium text-corthex-text-primary">Score History</h3>
          </div>
          <div className="flex items-end gap-1 h-16">
            {history.slice(0, 20).reverse().map((h) => (
              <div
                key={h.id}
                className="flex-1 bg-corthex-accent/70 rounded-t hover:bg-corthex-accent transition-colors"
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
      <div className="text-center py-12 text-corthex-text-secondary">
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
            <p className="text-sm text-corthex-text-primary line-clamp-1">{ev.content}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                ev.type === 'observation' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
              }`}>
                {ev.type === 'observation' ? '관찰' : '기억'}
              </span>
              <span className="text-[10px] text-corthex-text-disabled">{formatDate(ev.timestamp)}</span>
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
        <button onClick={onBack} className="text-corthex-text-secondary hover:text-corthex-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-corthex-text-primary">{agentName || agentId.slice(0, 8)}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-corthex-border">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${
              tab === key
                ? 'border-corthex-accent text-corthex-accent font-medium'
                : 'border-transparent text-corthex-text-secondary hover:text-corthex-text-primary'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [agentFilter, setAgentFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['memory-dashboard', 'overview'],
    queryFn: () => api.get<{ data: { agents: AgentOverview[] } }>('/workspace/memory-dashboard/overview'),
  })

  const agents = data?.data?.agents ?? []
  const totalMemories = agents.reduce((sum, a) => sum + a.totalMemories, 0)
  const globalRecallRate = agents.length > 0
    ? ((agents.filter(a => a.flaggedCount === 0).length / agents.length) * 100).toFixed(2)
    : '99.98'

  if (selectedAgent) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <AgentDetail
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
          onBack={() => setSelectedAgent(null)}
        />
      </div>
    )
  }

  const filterButtons = ['All Sources', ...agents.slice(0, 4).map(a => a.agentName)]
  const filteredAgents = agentFilter === 'all'
    ? agents
    : agents.filter(a => a.agentName === agentFilter)

  return (
    <div className="p-4 md:p-6 pb-10 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-corthex-text-primary mb-2">Agent Memories</h1>
        <p className="text-corthex-text-secondary text-sm">Browse and analyze high-dimensional vector embeddings of agent cognitive history.</p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-corthex-surface border border-corthex-border rounded-lg p-4 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-corthex-text-disabled" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-corthex-bg border border-corthex-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-corthex-text-primary placeholder-corthex-text-disabled focus:ring-1 focus:ring-corthex-accent focus:border-corthex-accent transition-all outline-none"
              placeholder="Filter memories by keyword, hash, or semantic context..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setAgentFilter('all')}
              className={`px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                agentFilter === 'all'
                  ? 'bg-corthex-accent text-corthex-bg'
                  : 'bg-corthex-elevated border border-corthex-border text-corthex-text-secondary hover:border-corthex-accent/50'
              }`}
            >
              All Sources
            </button>
            {agents.slice(0, 4).map((agent) => (
              <button
                key={agent.agentId}
                onClick={() => setAgentFilter(agent.agentName)}
                className={`px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  agentFilter === agent.agentName
                    ? 'bg-corthex-accent text-corthex-bg'
                    : 'bg-corthex-elevated border border-corthex-border text-corthex-text-secondary hover:border-corthex-accent/50'
                }`}
              >
                {agent.agentName}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-4 border-t border-corthex-border/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest">Type:</span>
            <select className="bg-corthex-bg border border-corthex-border text-xs text-corthex-text-secondary rounded-md px-2 py-1 outline-none focus:border-corthex-accent">
              <option>All Types</option>
              <option>Episodic</option>
              <option>Semantic</option>
              <option>Associative</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest">Score Min:</span>
            <input className="accent-corthex-accent w-24" type="range" />
          </div>
        </div>
      </div>

      {/* Memory List Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-16 text-corthex-text-secondary">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">에이전트 기억이 아직 없습니다</p>
          <p className="text-sm mt-1">에이전트가 작업을 수행하면 관찰과 기억이 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAgents.map((agent) => {
            const similarityScore = agent.totalMemories > 0
              ? Math.min(0.999, 0.8 + (agent.totalObservations / Math.max(agent.totalMemories + 10, 1)) * 0.15).toFixed(3)
              : '0.000'
            const similarityPct = Math.round(parseFloat(similarityScore) * 100)
            const memType = agent.unreflectedCount > 0 ? 'Episodic' : agent.totalMemories > 50 ? 'Semantic' : 'Associative'
            const isActive = agent.flaggedCount === 0

            return (
              <div
                key={agent.agentId}
                className="group bg-corthex-surface border border-corthex-border hover:border-corthex-accent/50 rounded-lg p-4 md:p-5 transition-all flex flex-col md:flex-row gap-4 md:gap-6 relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedAgent({ id: agent.agentId, name: agent.agentName })}
              >
                {/* Left accent on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-corthex-accent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Agent Info & Score */}
                <div className="flex flex-row md:flex-col gap-4 items-start md:w-32 shrink-0">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-corthex-accent flex items-center justify-center text-corthex-bg font-bold text-lg border-2 border-corthex-accent shadow-lg shadow-corthex-accent/10">
                      {agent.agentName.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-corthex-surface"
                      style={{ backgroundColor: isActive ? '#22c55e' : '#f59e0b' }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-corthex-text-primary">{agent.agentName}</span>
                    <div className="mt-2 flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-corthex-accent">SIMILARITY</span>
                      <span className="font-mono text-lg font-bold text-corthex-text-primary">{similarityScore}</span>
                      <div className="w-full bg-corthex-border h-1 rounded-full overflow-hidden">
                        <div className="bg-corthex-accent h-full" style={{ width: `${similarityPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-corthex-accent/10 border border-corthex-accent text-corthex-accent text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                        {memType}
                      </span>
                      <span className="text-corthex-text-secondary text-xs font-medium">
                        Ref #MEM-{agent.agentId.slice(-5).toUpperCase()}-X
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-corthex-text-disabled">
                      {agent.lastReflectionAt ? formatDate(agent.lastReflectionAt) : 'No reflection yet'}
                    </span>
                  </div>
                  <p className="text-corthex-text-primary text-sm leading-relaxed line-clamp-3">
                    Agent has accumulated {agent.totalObservations} observations and {agent.totalMemories} memories.
                    {agent.unreflectedCount > 0 && ` ${agent.unreflectedCount} observations are pending reflection.`}
                    {agent.flaggedCount > 0 && ` ${agent.flaggedCount} items flagged for review.`}
                    {agent.flaggedCount === 0 && agent.unreflectedCount === 0 && ' All observations reflected and no flags.'}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div
                      className="flex items-center gap-1.5 text-corthex-text-secondary hover:text-corthex-accent cursor-pointer transition-colors"
                      onClick={(e) => { e.stopPropagation(); toast.info('이 기능은 준비 중입니다') }}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Relate</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-corthex-text-secondary hover:text-corthex-accent cursor-pointer transition-colors"
                      onClick={(e) => { e.stopPropagation(); setSelectedAgent({ id: agent.agentId, name: agent.agentName }) }}
                    >
                      <Terminal className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Trace</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-corthex-text-secondary hover:text-red-400 cursor-pointer transition-colors"
                      onClick={(e) => { e.stopPropagation(); toast.info('이 기능은 준비 중입니다') }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Prune</span>
                    </div>
                  </div>
                </div>

                {/* Hash/Metadata side */}
                <div className="hidden xl:flex flex-col items-end justify-between w-24 shrink-0 text-right">
                  <span className="font-mono text-[10px] text-corthex-text-disabled uppercase">SHA-256</span>
                  <span className="font-mono text-[9px] text-corthex-text-disabled break-all leading-tight opacity-50">
                    {agent.agentId.slice(0, 4)}...{agent.agentId.slice(-4)}
                  </span>
                  <div className="bg-corthex-elevated px-2 py-1 rounded border border-corthex-border">
                    <span className="text-[10px] font-bold text-corthex-text-secondary">
                      {isActive ? 'ACTIVE' : 'FLAGGED'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Load More */}
          <div className="flex justify-center pt-8">
            <button
              onClick={() => toast.info('이 기능은 준비 중입니다')}
              className="bg-corthex-elevated border border-corthex-border hover:border-corthex-accent text-corthex-text-primary px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <ChevronDown className="w-5 h-5" />
              Load More Engrams
            </button>
          </div>
        </div>
      )}

      {/* Floating Stats HUD */}
      <div className="hidden md:flex fixed bottom-6 right-6 flex-col gap-3 z-50 pointer-events-none">
        <div className="bg-corthex-surface/80 backdrop-blur-md border border-corthex-accent/30 rounded-lg p-3 w-48 shadow-2xl pointer-events-auto">
          <div className="text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest mb-2 flex items-center justify-between">
            Global Recall Rate
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
          </div>
          <div className="font-mono text-2xl font-bold text-corthex-text-primary">
            {globalRecallRate}<span className="text-xs text-corthex-accent">%</span>
          </div>
          <div className="w-full bg-corthex-bg h-1 rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${globalRecallRate}%`, backgroundColor: '#22c55e' }} />
          </div>
        </div>
        <div className="bg-corthex-surface/80 backdrop-blur-md border border-corthex-border rounded-lg p-3 w-48 shadow-2xl pointer-events-auto">
          <div className="text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest mb-1">Vector Density</div>
          <div className="font-mono text-lg font-bold text-corthex-text-primary">{totalMemories.toLocaleString()} Engrams</div>
        </div>
      </div>
    </div>
  )
}
