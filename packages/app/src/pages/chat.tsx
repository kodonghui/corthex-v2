/**
 * API ENDPOINTS:
 * - GET  /api/workspace/chat/sessions              : Fetch list of previous chat sessions
 * - POST /api/workspace/chat/sessions              : Create a new chat session
 * - GET  /api/workspace/chat/sessions/:id/messages : Retrieve message history for a session
 * - POST /api/workspace/chat/sessions/:id/messages : Send a new message to the agent
 * - PATCH /api/workspace/chat/sessions/:id         : Rename a session
 * - DELETE /api/workspace/chat/sessions/:id        : Delete a session
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { AgentListModal } from '../components/chat/agent-list-modal'
import { ChatArea } from '../components/chat/chat-area'
import { toast } from '@corthex/ui'
import { Bot, Plus, Trash2 } from 'lucide-react'
import type { Agent, Session } from '../components/chat/types'

export function ChatPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    searchParams.get('session'),
  )
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [showChat, setShowChat] = useState(!!searchParams.get('session'))
  const [autoSelectDone, setAutoSelectDone] = useState(false)

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: sessionsData } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get<{ data: Session[] }>('/workspace/chat/sessions'),
  })

  const createSession = useMutation({
    mutationFn: (agentId: string) =>
      api.post<{ data: Session }>('/workspace/chat/sessions', { agentId }),
    onSuccess: (res) => {
      selectSession(res.data.id)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const renameSession = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.patch<{ data: Session }>(`/workspace/chat/sessions/${id}`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('대화 이름이 변경되었습니다')
    },
    onError: () => toast.error('이름 변경에 실패했습니다'),
  })

  const deleteSession = useMutation({
    mutationFn: (id: string) =>
      api.delete<{ data: { deleted: boolean } }>(`/workspace/chat/sessions/${id}`),
    onSuccess: (_, deletedId) => {
      if (selectedSessionId === deletedId) {
        setSelectedSessionId(null)
        setShowChat(false)
        setSearchParams({}, { replace: true })
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('대화가 삭제되었습니다')
    },
    onError: () => toast.error('삭제에 실패했습니다'),
  })

  const agents = agentsData?.data || []
  const sessions = sessionsData?.data || []

  const selectSession = useCallback(
    (id: string) => {
      setSelectedSessionId(id)
      setShowChat(true)
      setSearchParams({ session: id }, { replace: true })
    },
    [setSearchParams],
  )

  useEffect(() => {
    if (autoSelectDone || sessions.length === 0) return
    setAutoSelectDone(true)
    if (!selectedSessionId && sessions.length > 0) {
      selectSession(sessions[0].id)
    }
  }, [sessions, selectedSessionId, autoSelectDone, selectSession])

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) || null,
    [sessions, selectedSessionId],
  )

  const selectedAgent = useMemo(() => {
    if (!selectedSession) return null
    return agents.find((a) => a.id === selectedSession.agentId) || null
  }, [agents, selectedSession])

  const handleAgentSelect = useCallback(
    (agent: Agent) => {
      setShowAgentModal(false)
      const existing = sessions.find((s) => s.agentId === agent.id)
      if (existing) {
        selectSession(existing.id)
      } else {
        createSession.mutate(agent.id)
      }
    },
    [sessions, createSession, selectSession],
  )

  const handleSessionSelect = useCallback(
    (sessionId: string) => {
      selectSession(sessionId)
    },
    [selectSession],
  )

  const handleRename = useCallback(
    (sessionId: string, title: string) => {
      renameSession.mutate({ id: sessionId, title })
    },
    [renameSession],
  )

  const handleDelete = useCallback(
    (sessionId: string) => {
      deleteSession.mutate(sessionId)
    },
    [deleteSession],
  )

  return (
    <div data-testid="chat-page" className="h-screen overflow-hidden flex bg-corthex-bg text-corthex-text-primary">
      {/* LEFT: Session List */}
      <aside className={`w-full md:w-72 border-r border-corthex-border flex flex-col bg-corthex-surface shrink-0 ${showChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="h-14 flex items-center justify-between px-4 md:px-5 border-b border-corthex-border shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">Sessions</p>
            <p className="text-xs font-mono text-corthex-text-primary">{sessions.length} conversations</p>
          </div>
          <button
            onClick={() => setShowAgentModal(true)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent rounded-lg transition-colors"
            title="New Chat Session"
          >
            <Plus className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled">Recent Chats</p>
          {sessions.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-xs text-corthex-text-secondary">No sessions yet</p>
              <p className="text-[10px] text-corthex-text-disabled mt-1">Start a new chat above</p>
            </div>
          )}
          {sessions.map((session) => {
            const isActive = session.id === selectedSessionId
            return (
              <div
                key={session.id}
                onClick={() => handleSessionSelect(session.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-corthex-accent/10 border border-corthex-accent/30'
                    : 'hover:bg-corthex-elevated border border-transparent'
                }`}
              >
                <h3 className={`text-sm truncate ${isActive ? 'font-bold text-corthex-text-primary' : 'font-medium text-corthex-text-secondary'}`}>
                  {session.title || 'Untitled Chat'}
                </h3>
                <span className="text-[10px] mt-1 block font-mono text-corthex-text-disabled">
                  {new Date(session.lastMessageAt || session.createdAt).toLocaleDateString()}
                </span>
              </div>
            )
          })}
        </div>
      </aside>

      {/* MIDDLE: Chat Area */}
      <section className={`flex-1 flex flex-col relative min-w-0 ${!showChat ? 'hidden md:flex' : 'flex'}`}>
        <ChatArea
          agent={selectedAgent}
          sessionId={selectedSessionId}
          onBack={() => {
            setShowChat(false)
            setSearchParams({}, { replace: true })
          }}
        />
      </section>

      {/* RIGHT: Agent Info */}
      {selectedAgent && (
        <aside className="hidden xl:flex w-[320px] bg-corthex-surface border-l border-corthex-border flex-col shrink-0">
          <div className="p-6 border-b border-corthex-border flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-corthex-accent to-corthex-accent-deep p-0.5">
                <div className="w-full h-full rounded-2xl bg-corthex-surface flex items-center justify-center">
                  <Bot className="w-10 h-10 text-corthex-accent" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-corthex-success border-4 border-corthex-surface" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">Active Session</p>
            <h2 className="text-sm font-bold text-corthex-text-primary uppercase tracking-widest mt-1">{selectedAgent.name}</h2>
            <p className="text-[10px] font-bold tracking-widest text-corthex-accent uppercase mt-1">{selectedAgent.role || 'Agent'}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled mb-2">Agent Soul</h3>
              <p className="text-xs leading-relaxed text-corthex-text-secondary">
                {selectedAgent.soul || 'No soul description configured for this agent.'}
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-disabled mb-3">Active Capabilities</h3>
              <div className="flex flex-wrap gap-1.5">
                {(selectedAgent.allowedTools && selectedAgent.allowedTools.length > 0
                  ? selectedAgent.allowedTools
                  : ['Web Search', 'Data Analysis']
                ).map((tool) => (
                  <span key={tool} className="px-2 py-0.5 text-[10px] font-bold rounded bg-corthex-accent/10 text-corthex-accent uppercase tracking-wider">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-corthex-bg rounded-lg border border-corthex-border">
              <p className="text-[10px] font-mono text-corthex-text-disabled uppercase mb-1">Model</p>
              <p className="text-xs font-bold text-corthex-text-primary font-mono">{selectedAgent.modelName || 'Unknown'}</p>
            </div>
          </div>
          {selectedSessionId && (
            <div className="p-5 border-t border-corthex-border">
              <button
                onClick={() => selectedSessionId && handleDelete(selectedSessionId)}
                className="w-full text-xs font-bold text-red-500 hover:bg-red-500/10 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete Session
              </button>
            </div>
          )}
        </aside>
      )}

      {showAgentModal && (
        <AgentListModal
          agents={agents}
          onSelect={handleAgentSelect}
          onClose={() => setShowAgentModal(false)}
        />
      )}
    </div>
  )
}
