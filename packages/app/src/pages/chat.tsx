import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SessionPanel } from '../components/chat/session-panel'
import { AgentListModal } from '../components/chat/agent-list-modal'
import { ChatArea } from '../components/chat/chat-area'
import { toast } from '@corthex/ui'
import type { Agent, Session } from '../components/chat/types'

export function ChatPage() {
  const queryClient = useQueryClient()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [showChat, setShowChat] = useState(false) // 모바일 전환

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
      setSelectedSessionId(res.data.id)
      setShowChat(true)
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
      }
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('대화가 삭제되었습니다')
    },
    onError: () => toast.error('삭제에 실패했습니다'),
  })

  const agents = agentsData?.data || []
  const sessions = sessionsData?.data || []

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
      // 기존 세션 찾기
      const existing = sessions.find((s) => s.agentId === agent.id)
      if (existing) {
        setSelectedSessionId(existing.id)
        setShowChat(true)
      } else {
        createSession.mutate(agent.id)
      }
    },
    [sessions, createSession],
  )

  const handleSessionSelect = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId)
    setShowChat(true)
  }, [])

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
    <div className="flex h-full">
      {/* 세션 패널 — 모바일에서는 showChat일 때 숨김 */}
      <div className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-72 shrink-0`}>
        <SessionPanel
          sessions={sessions}
          agents={agents}
          selectedSessionId={selectedSessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={() => setShowAgentModal(true)}
          onRenameSession={handleRename}
          onDeleteSession={handleDelete}
        />
      </div>

      {/* 채팅 영역 — 모바일에서는 showChat일 때만 표시 */}
      <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 min-w-0`}>
        <ChatArea
          agent={selectedAgent}
          sessionId={selectedSessionId}
          onBack={() => setShowChat(false)}
        />
      </div>

      {/* 에이전트 선택 모달 */}
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
