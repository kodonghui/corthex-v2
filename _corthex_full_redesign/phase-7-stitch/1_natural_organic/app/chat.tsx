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
import { SessionPanel } from '../components/chat/session-panel'
import { AgentListModal } from '../components/chat/agent-list-modal'
import { ChatArea } from '../components/chat/chat-area'
import { toast } from '@corthex/ui'
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
    <div data-testid="chat-page" className="h-screen overflow-hidden flex flex-col" style={{ fontFamily: "'Pretendard', sans-serif", backgroundColor: '#faf8f5', color: '#2d2d2d' }}>
      {/* BEGIN: Global Header */}
      <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#5a7247' }}>C</div>
          <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif" }}>CORTHEX <span className="font-light" style={{ color: '#5a7247' }}>v2</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2 hidden md:block">
            <p className="text-xs font-semibold">Workspace Alpha</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: '#6b6b6b' }}>Active Session</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#f5f0eb' }}>
            <span className="text-sm font-bold" style={{ color: '#5a7247' }}>U</span>
          </div>
        </div>
      </header>
      {/* END: Global Header */}

      <main className="flex-1 flex overflow-hidden">
        {/* BEGIN: Left Sidebar (Session List) */}
        <aside className={`w-72 border-r border-gray-200 flex flex-col overflow-hidden ${showChat ? 'hidden md:flex' : 'flex'}`} style={{ backgroundColor: '#f5f0eb' }}>
          <div className="p-4">
            <button
              onClick={() => setShowAgentModal(true)}
              className="w-full bg-white border border-gray-200 py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 font-medium"
              style={{ color: '#5a7247' }}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              New Chat Session
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-6">
            <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6b6b6b' }}>Recent Chats</p>
            {sessions.map((session) => {
              const isActive = session.id === selectedSessionId
              return (
                <div
                  key={session.id}
                  onClick={() => handleSessionSelect(session.id)}
                  className={`p-3 rounded-2xl cursor-pointer ${
                    isActive
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-white/50 transition-colors'
                  }`}
                  style={isActive ? { borderLeft: '4px solid #5a7247' } : {}}
                >
                  <h3 className={`text-sm truncate ${isActive ? 'font-bold' : 'font-medium text-gray-700'}`}>
                    {session.title || 'Untitled Chat'}
                  </h3>
                  <p className="text-xs mt-1 truncate" style={{ color: '#6b6b6b' }}>
                    {isActive ? <span className="italic">Active session...</span> : 'Previous conversation'}
                  </p>
                  <span className="text-[10px] mt-2 block" style={{ color: '#6b6b6b' }}>
                    {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )
            })}
          </div>
        </aside>
        {/* END: Left Sidebar */}

        {/* BEGIN: Middle Pane (Active Chat Area) */}
        <section className={`flex-1 flex flex-col relative ${!showChat ? 'hidden md:flex' : 'flex'}`} style={{ backgroundColor: '#faf8f5' }}>
          <ChatArea
            agent={selectedAgent}
            sessionId={selectedSessionId}
            onBack={() => {
              setShowChat(false)
              setSearchParams({}, { replace: true })
            }}
          />
        </section>
        {/* END: Middle Pane */}

        {/* BEGIN: Right Sidebar (Agent Info) */}
        {selectedAgent && (
          <aside className="w-80 border-l border-gray-200 bg-white flex-col hidden lg:flex">
            <div className="p-8 text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative overflow-hidden" style={{ backgroundColor: '#f5f0eb' }}>
                  <svg className="h-12 w-12 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#5a7247' }}>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>{selectedAgent.name}</h2>
                <p className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: '#5a7247' }}>{selectedAgent.role || 'Agent'}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-10">
              {/* Soul Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2" style={{ color: '#6b6b6b' }}>Agent 'Soul'</h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {selectedAgent.soul || 'No soul description configured for this agent.'}
                </p>
              </div>
              {/* Capability Tags */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-100 pb-2" style={{ color: '#6b6b6b' }}>Active Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedAgent.allowedTools && selectedAgent.allowedTools.length > 0
                    ? selectedAgent.allowedTools
                    : ['Web Search', 'Data Analysis']
                  ).map((tool) => (
                    <span key={tool} className="px-3 py-1 text-[11px] font-semibold rounded-full" style={{ backgroundColor: '#f5f0eb', color: '#5a7247' }}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              {/* Context Summary */}
              <div className="p-4 rounded-2xl border border-gray-100" style={{ backgroundColor: '#f5f0eb' }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: '#5a7247' }}>
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <h4 className="text-xs font-bold">Session Context</h4>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#6b6b6b' }}>
                  Model: {selectedAgent.modelName || 'Unknown'}. Session active.
                </p>
              </div>
            </div>
            {/* Action Footer */}
            {selectedSessionId && (
              <div className="p-6 border-t border-gray-100" style={{ backgroundColor: 'rgba(245,240,235,0.2)' }}>
                <button
                  onClick={() => selectedSessionId && handleDelete(selectedSessionId)}
                  className="w-full text-xs font-bold text-red-500 hover:bg-red-50 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  Delete This Session
                </button>
              </div>
            )}
          </aside>
        )}
        {/* END: Right Sidebar */}
      </main>

      {/* Agent Selection Modal */}
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
