import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { AgentPickerPanel } from '../../components/hub/agent-picker-panel'
import { ChatArea } from '../../components/chat/chat-area'
import { SecretaryHubLayout } from './secretary-hub-layout'
import type { Agent, Session } from '../../components/chat/types'

/**
 * Hub page — entry point with hasSecretary branching.
 *
 * - hasSecretary === true: Secretary hub layout (Story 6.1)
 * - hasSecretary === false: Agent picker (left) + Chat (right) (Story 6.2)
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
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    searchParams.get('session'),
  )
  const [showChat, setShowChat] = useState(!!searchParams.get('session'))
  const [autoSelectDone, setAutoSelectDone] = useState(false)

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
    () => allAgents.find((a) => a.isSecretary && (a.isActive !== false)) ?? null,
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

  // Auto-select most recent session on first load (no-secretary mode only)
  useEffect(() => {
    if (secretary || autoSelectDone || sessions.length === 0) return
    setAutoSelectDone(true)
    if (!selectedSessionId && sessions.length > 0) {
      selectSession(sessions[0].id)
    }
  }, [sessions, selectedSessionId, autoSelectDone, selectSession, secretary])

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

  // Loading state
  if (orgLoading) {
    return (
      <div data-testid="hub-page" className="flex items-center justify-center h-full bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-600 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">허브 로딩 중...</p>
        </div>
      </div>
    )
  }

  // Secretary exists → Story 6.1 secretary hub layout
  if (secretary) {
    return <SecretaryHubLayout secretary={secretary} />
  }

  // No secretary — Story 6.2: agent picker + chat layout
  return (
    <div data-testid="hub-page" className="flex h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Left: Agent picker panel — hidden on mobile when chat is shown */}
      <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 shrink-0`}>
        <AgentPickerPanel
          agents={allAgents}
          departments={allDepts}
          sessions={sessions}
          selectedAgentId={selectedAgentId}
          onAgentSelect={handleAgentSelect}
        />
      </div>

      {/* Right: Chat area — hidden on mobile when picker is shown */}
      <div
        data-testid="hub-chat-area"
        className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 min-w-0`}
      >
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
