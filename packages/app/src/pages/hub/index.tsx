import { useState, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare,
  Briefcase,
  Network,
  BarChart2,
  ChevronRight,
  History,
  RefreshCw,
  Bot,
} from 'lucide-react'
import { api } from '../../lib/api'
import { AgentPickerPanel } from '../../components/hub/agent-picker-panel'
import { ChatArea } from '../../components/chat/chat-area'
import { SecretaryHubLayout } from './secretary-hub-layout'
import type { Agent, Session } from '../../components/chat/types'

/**
 * Hub page — entry point with hasSecretary branching.
 *
 * - hasSecretary === true: Secretary hub layout (Story 6.1)
 * - hasSecretary === false: Stitch dashboard → chat layout (Story 6.2)
 */

type OrgAgent = {
  id: string
  name: string
  nameEn: string | null
  role: string
  tier: string
  status: string
  isSecretary: boolean
  isActive: boolean
  departmentId: string | null
}

type OrgDept = {
  id: string
  name: string
  description: string | null
  agents: OrgAgent[]
}

type OrgChartResponse = {
  company: { id: string; name: string }
  departments: OrgDept[]
  unassignedAgents: OrgAgent[]
}

export function HubPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    searchParams.get('session'),
  )
  const [showChat, setShowChat] = useState(!!searchParams.get('session'))

  // Fetch org chart (includes agents + departments + secretary detection)
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => api.get<{ data: OrgChartResponse }>('/workspace/org-chart'),
  })

  // Fetch sessions for lastUsedAt tracking
  const { data: sessionsData } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get<{ data: Session[] }>('/workspace/chat/sessions'),
  })

  // Create session mutation
  const createSession = useMutation({
    mutationFn: (agentId: string) =>
      api.post<{ data: Session }>('/workspace/chat/sessions', { agentId }),
    onSuccess: (res) => {
      selectSession(res.data.id)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const sessions = sessionsData?.data || []

  // Derive all agents from org data
  const allAgents = useMemo(() => {
    if (!orgData?.data) return []
    const fromDepts = orgData.data.departments.flatMap((d) => d.agents)
    const unassigned = orgData.data.unassignedAgents || []
    return [...fromDepts, ...unassigned]
  }, [orgData])

  const allDepts = useMemo(() => {
    if (!orgData?.data) return []
    return orgData.data.departments.map((d) => ({ id: d.id, name: d.name }))
  }, [orgData])

  // Detect secretary
  const secretary = useMemo(
    () => allAgents.find((a) => a.isSecretary && a.isActive !== false) ?? null,
    [allAgents],
  )

  // Session selection helper (URL sync)
  const selectSession = useCallback(
    (id: string) => {
      setSelectedSessionId(id)
      setShowChat(true)
      setSearchParams({ session: id }, { replace: true })
    },
    [setSearchParams],
  )

  // Derive selected agent from session
  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || null,
    [sessions, selectedSessionId],
  )

  const selectedAgent = useMemo((): Agent | null => {
    if (!selectedSession) return null
    const found = allAgents.find((a) => a.id === selectedSession.agentId)
    if (!found) return null
    return {
      id: found.id,
      name: found.name,
      role: found.role,
      status: found.status as Agent['status'],
      isSecretary: found.isSecretary,
    }
  }, [allAgents, selectedSession])

  const selectedAgentId = selectedAgent?.id ?? null

  // Handle agent selection from picker
  const handleAgentSelect = useCallback(
    (agent: { id: string; name: string; role: string }) => {
      const existing = sessions.find((s) => s.agentId === agent.id)
      if (existing) {
        selectSession(existing.id)
      } else {
        createSession.mutate(agent.id)
      }
    },
    [sessions, createSession, selectSession],
  )

  // ── Loading state ──────────────────────────────────────────
  if (orgLoading) {
    return (
      <div
        data-testid="hub-page"
        className="flex items-center justify-center h-full"
        style={{ backgroundColor: 'var(--color-corthex-bg)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{
              borderColor: 'var(--color-corthex-border)',
              borderTopColor: 'var(--color-corthex-accent)',
            }}
          />
          <p className="text-sm" style={{ color: 'var(--color-corthex-text-secondary)' }}>
            허브 로딩 중...
          </p>
        </div>
      </div>
    )
  }

  // ── Secretary branch → Story 6.1 layout ───────────────────
  if (secretary) {
    return <SecretaryHubLayout secretary={secretary} />
  }

  // ── Chat view ──────────────────────────────────────────────
  if (showChat) {
    return (
      <div
        data-testid="hub-page"
        className="flex h-full"
        style={{ backgroundColor: 'var(--color-corthex-bg)' }}
      >
        {/* Agent picker — hidden on mobile in chat view */}
        <div className="hidden md:flex w-72 shrink-0">
          <AgentPickerPanel
            agents={allAgents}
            departments={allDepts}
            sessions={sessions}
            selectedAgentId={selectedAgentId}
            onAgentSelect={handleAgentSelect}
          />
        </div>

        {/* Chat area */}
        <div data-testid="hub-chat-area" className="flex flex-1 min-w-0">
          <ChatArea
            agent={selectedAgent}
            sessionId={selectedSessionId}
            onBack={() => {
              setShowChat(false)
              setSearchParams({}, { replace: true })
            }}
          />
        </div>
      </div>
    )
  }

  // ── Dashboard view (Stitch card pattern) ──────────────────
  const activeAgents = allAgents.filter((a) => a.isActive !== false)
  const displayAgents = allAgents.slice(0, 4)
  const companyName = orgData?.data?.company?.name ?? 'CORTHEX'

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Start Chat',
      desc: 'Initiate a secure session with available AI agents.',
      action: () => setShowChat(true),
    },
    {
      icon: Briefcase,
      title: 'New Job',
      desc: 'Deploy a new automated workflow to the processing cluster.',
      action: () => navigate('/jobs'),
    },
    {
      icon: Network,
      title: 'View NEXUS',
      desc: 'Map and visualize inter-agent communication pathways.',
      action: () => navigate('/nexus'),
    },
    {
      icon: BarChart2,
      title: 'Reports',
      desc: 'Analyze operational metrics and performance data.',
      action: () => navigate('/costs'),
    },
  ]

  return (
    <div
      data-testid="hub-page"
      className="overflow-y-auto h-full"
      style={{ backgroundColor: 'var(--color-corthex-bg)' }}
    >
      <div className="p-6 lg:p-8 space-y-8 max-w-[1440px] mx-auto w-full">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {/* Status badge */}
            <div
              className="inline-flex items-center gap-2 px-2 py-1 rounded mb-2 border"
              style={{
                backgroundColor: 'var(--color-corthex-accent-muted)',
                borderColor: 'var(--color-corthex-border)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--color-corthex-success)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: 'var(--color-corthex-success)' }}
                />
              </span>
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: 'var(--color-corthex-accent)' }}
              >
                System: Online
              </span>
            </div>

            <h2
              className="text-4xl font-bold tracking-tight"
              style={{ color: 'var(--color-corthex-text-primary)' }}
            >
              Welcome, Commander
            </h2>
            <p className="mt-1" style={{ color: 'var(--color-corthex-text-secondary)' }}>
              {companyName} · {activeAgents.length}/{allAgents.length} agents operational
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowChat(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 border transition-all"
              style={{
                backgroundColor: 'var(--color-corthex-elevated)',
                borderColor: 'var(--color-corthex-border)',
                color: 'var(--color-corthex-text-primary)',
              }}
            >
              <History className="w-4 h-4" />
              Session Logs
            </button>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['org-chart'] })
                queryClient.invalidateQueries({ queryKey: ['sessions'] })
              }}
              className="px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all"
              style={{
                backgroundColor: 'var(--color-corthex-accent)',
                color: 'var(--color-corthex-text-on-accent)',
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Force Sync
            </button>
          </div>
        </div>

        {/* ── Dashboard 3-col grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Action Cards 2×2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map(({ icon: Icon, title, desc, action }) => (
                <button
                  key={title}
                  onClick={action}
                  className="group p-6 rounded-xl text-left transition-all border relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-corthex-surface)',
                    borderColor: 'var(--color-corthex-border)',
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: 'var(--color-corthex-accent-muted)',
                        color: 'var(--color-corthex-accent)',
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <ChevronRight
                      className="w-5 h-5 transition-colors"
                      style={{ color: 'var(--color-corthex-text-disabled)' }}
                    />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-corthex-text-primary)' }}>
                    {title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-corthex-text-secondary)' }}>
                    {desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Live System Events Feed */}
            <div
              className="rounded-xl overflow-hidden flex flex-col border"
              style={{
                backgroundColor: 'var(--color-corthex-surface)',
                borderColor: 'var(--color-corthex-border)',
                height: '400px',
              }}
            >
              {/* Terminal header */}
              <div
                className="px-6 py-4 border-b flex justify-between items-center"
                style={{
                  backgroundColor: 'var(--color-corthex-surface)',
                  borderColor: 'var(--color-corthex-border)',
                }}
              >
                <h3
                  className="text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: 'var(--color-corthex-text-secondary)' }}
                >
                  Live System Events
                </h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-corthex-error)' }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-corthex-warning)' }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-corthex-success)' }} />
                </div>
              </div>

              {/* Terminal log */}
              <div className="p-4 overflow-y-auto flex-1 font-mono text-xs leading-relaxed">
                {/* Init event */}
                <div className="flex gap-3 mb-2">
                  <span style={{ color: 'var(--color-corthex-text-disabled)' }}>[system]</span>
                  <span style={{ color: 'var(--color-corthex-info)' }}>INFO:</span>
                  <span style={{ color: 'var(--color-corthex-text-primary)' }}>
                    Hub initialized — {allAgents.length} agents loaded from {companyName}.
                  </span>
                </div>

                {/* Session events (most recent first) */}
                {sessions
                  .slice()
                  .reverse()
                  .map((s) => {
                    const time = s.lastMessageAt
                      ? new Date(s.lastMessageAt).toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : '--:--:--'
                    const agentName =
                      allAgents.find((a) => a.id === s.agentId)?.name ?? s.agentId.slice(0, 8)
                    return (
                      <div key={s.id} className="flex gap-3 mb-2">
                        <span style={{ color: 'var(--color-corthex-text-disabled)' }}>
                          [{time}]
                        </span>
                        <span style={{ color: 'var(--color-corthex-success)' }}>SESSION:</span>
                        <span style={{ color: 'var(--color-corthex-text-primary)' }}>
                          {s.title || 'Untitled'} · agent:{agentName}
                        </span>
                      </div>
                    )
                  })}

                {sessions.length === 0 && (
                  <div className="flex gap-3 mb-2">
                    <span style={{ color: 'var(--color-corthex-text-disabled)' }}>[system]</span>
                    <span style={{ color: 'var(--color-corthex-text-secondary)' }}>SYS:</span>
                    <span style={{ color: 'var(--color-corthex-text-primary)' }}>
                      No sessions yet. Start a chat to begin.
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right 1/3 — Agent Status */}
          <div className="space-y-6">
            <div
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: 'var(--color-corthex-surface)',
                borderColor: 'var(--color-corthex-border)',
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3
                  className="text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: 'var(--color-corthex-text-secondary)' }}
                >
                  Agent Status
                </h3>
                <span
                  className="text-[10px] font-mono font-bold"
                  style={{ color: 'var(--color-corthex-success)' }}
                >
                  {activeAgents.length}/{allAgents.length} ONLINE
                </span>
              </div>

              {allAgents.length === 0 ? (
                <p
                  className="text-xs text-center py-4"
                  style={{ color: 'var(--color-corthex-text-secondary)' }}
                >
                  No agents configured.
                </p>
              ) : (
                <div className="space-y-6">
                  {displayAgents.map((agent) => {
                    const isActive = agent.isActive !== false
                    const pct = isActive ? 100 : 0
                    return (
                      <div key={agent.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center border"
                              style={{
                                backgroundColor: 'var(--color-corthex-elevated)',
                                borderColor: 'var(--color-corthex-border)',
                                color: 'var(--color-corthex-accent)',
                              }}
                            >
                              <Bot className="w-5 h-5" />
                            </div>
                            <div>
                              <p
                                className="text-sm font-bold"
                                style={{ color: 'var(--color-corthex-text-primary)' }}
                              >
                                {agent.nameEn || agent.name}
                              </p>
                              <p
                                className="text-[10px] font-mono tracking-tight uppercase"
                                style={{ color: 'var(--color-corthex-text-secondary)' }}
                              >
                                {isActive ? 'ACTIVE' : 'OFFLINE'}
                              </p>
                            </div>
                          </div>
                          <p
                            className="text-xs font-mono"
                            style={{ color: 'var(--color-corthex-text-primary)' }}
                          >
                            {pct}%
                          </p>
                        </div>
                        <div
                          className="w-full h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: 'var(--color-corthex-elevated)' }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: 'var(--color-corthex-accent)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                onClick={() => navigate('/agents')}
                className="w-full mt-8 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all"
                style={{
                  borderColor: 'var(--color-corthex-accent)',
                  color: 'var(--color-corthex-accent)',
                }}
              >
                Manage All Agents
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
