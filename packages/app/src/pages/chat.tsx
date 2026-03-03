import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

type Agent = {
  id: string
  name: string
  role: string
  status: 'online' | 'working' | 'error' | 'offline'
}

type Session = {
  id: string
  agentId: string
  title: string
  lastMessageAt: string | null
  createdAt: string
}

type Message = {
  id: string
  sender: 'user' | 'agent'
  content: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  online: 'bg-green-400',
  working: 'bg-yellow-400 animate-pulse',
  error: 'bg-red-400',
  offline: 'bg-zinc-400',
}

export function ChatPage() {
  const queryClient = useQueryClient()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 에이전트 목록
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  // 세션 목록
  const { data: sessionsData } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get<{ data: Session[] }>('/workspace/chat/sessions'),
  })

  // 메시지 목록
  const { data: messagesData } = useQuery({
    queryKey: ['messages', selectedSession],
    queryFn: () =>
      api.get<{ data: Message[] }>(`/workspace/chat/sessions/${selectedSession}/messages`),
    enabled: !!selectedSession,
  })

  // 세션 생성
  const createSession = useMutation({
    mutationFn: (agentId: string) =>
      api.post<{ data: Session }>('/workspace/chat/sessions', { agentId }),
    onSuccess: (res) => {
      setSelectedSession(res.data.id)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // 메시지 전송
  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.post<{ data: { userMessage: Message; agentMessage: Message } }>(
        `/workspace/chat/sessions/${selectedSession}/messages`,
        { content },
      ),
    onMutate: () => setIsTyping(true),
    onSettled: () => {
      setIsTyping(false)
      queryClient.invalidateQueries({ queryKey: ['messages', selectedSession] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  // 에이전트 선택 시 세션 찾기 또는 생성
  const handleAgentSelect = async (agent: Agent) => {
    setSelectedAgent(agent)
    const existingSession = sessionsData?.data?.find((s) => s.agentId === agent.id)
    if (existingSession) {
      setSelectedSession(existingSession.id)
    } else {
      createSession.mutate(agent.id)
    }
  }

  // 메시지 전송
  const handleSend = () => {
    if (!input.trim() || !selectedSession || sendMessage.isPending) return
    sendMessage.mutate(input.trim())
    setInput('')
  }

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesData?.data, isTyping])

  const agents = agentsData?.data || []
  const messages = messagesData?.data || []

  return (
    <div className="flex h-full">
      {/* 에이전트 사이드바 */}
      <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-500">내 에이전트</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {agents.length === 0 ? (
            <p className="text-xs text-zinc-400 p-2">에이전트가 없습니다</p>
          ) : (
            agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                  <span className="font-medium">{agent.name}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 ml-4">{agent.role}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {!selectedAgent ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <p className="text-lg mb-1">에이전트를 선택하세요</p>
              <p className="text-sm">좌측에서 에이전트를 선택하면 채팅이 시작됩니다</p>
            </div>
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${statusColors[selectedAgent.status]}`} />
              <div>
                <h3 className="font-medium text-sm">{selectedAgent.name}</h3>
                <p className="text-xs text-zinc-400">{selectedAgent.role}</p>
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 && !isTyping && (
                <div className="text-center text-zinc-400 text-sm mt-8">
                  <p>{selectedAgent.name}에게 메시지를 보내보세요</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender === 'user' ? 'text-indigo-200' : 'text-zinc-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={`${selectedAgent.name}에게 메시지...`}
                  disabled={sendMessage.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendMessage.isPending}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  전송
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
