import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'

type Channel = {
  id: string
  name: string
  description: string | null
  createdBy: string
  createdAt: string
}

type Message = {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

type CompanyUser = {
  id: string
  name: string
  role: string
}

export function MessengerPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 채널 목록
  const { data: channelsData } = useQuery({
    queryKey: ['messenger-channels'],
    queryFn: () => api.get<{ data: Channel[] }>('/workspace/messenger/channels'),
  })

  // 메시지 (선택된 채널, 5초 폴링)
  const { data: messagesData } = useQuery({
    queryKey: ['messenger-messages', selectedChannel],
    queryFn: () => api.get<{ data: Message[] }>(`/workspace/messenger/channels/${selectedChannel}/messages`),
    enabled: !!selectedChannel,
    refetchInterval: 5000,
  })

  // 회사 유저 목록 (채널 생성 시)
  const { data: usersData } = useQuery({
    queryKey: ['messenger-users'],
    queryFn: () => api.get<{ data: CompanyUser[] }>('/workspace/messenger/users'),
    enabled: showCreate,
  })

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.post(`/workspace/messenger/channels/${selectedChannel}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger-messages', selectedChannel] })
      setNewMessage('')
    },
  })

  const createChannel = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<{ data: Channel }>('/workspace/messenger/channels', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['messenger-channels'] })
      setSelectedChannel(res.data.id)
      setShowCreate(false)
      setCreateForm({ name: '', description: '' })
    },
  })

  const channels = channelsData?.data || []
  const messages = messagesData?.data || []
  const companyUsers = usersData?.data || []

  // 새 메시지 도착 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!newMessage.trim()) return
    sendMessage.mutate(newMessage.trim())
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold">메신저</h2>
        <button onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
          + 채널
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* 채널 목록 (좌) */}
        <div className="w-56 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          {showCreate && (
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-700 space-y-2">
              <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="채널명" className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-600 rounded text-sm bg-white dark:bg-zinc-800" />
              <button onClick={() => createChannel.mutate(createForm)}
                disabled={!createForm.name || createChannel.isPending}
                className="w-full px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50">
                생성
              </button>
            </div>
          )}
          {channels.length === 0 && !showCreate && (
            <p className="p-3 text-xs text-zinc-500">채널이 없습니다. 새 채널을 만드세요.</p>
          )}
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`w-full text-left px-3 py-2.5 text-sm border-b border-zinc-100 dark:border-zinc-800 transition-colors ${
                selectedChannel === ch.id
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <p className="font-medium">{ch.name}</p>
              {ch.description && <p className="text-xs text-zinc-500 truncate">{ch.description}</p>}
            </button>
          ))}
        </div>

        {/* 메시지 영역 (우) */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedChannel ? (
            <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">
              채널을 선택하세요
            </div>
          ) : (
            <>
              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <p className="text-sm text-zinc-400 text-center mt-8">아직 메시지가 없습니다.</p>
                )}
                {messages.map((msg) => {
                  const isMe = msg.userId === user?.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                        {!isMe && <p className="text-xs text-zinc-500 mb-0.5">{msg.userName}</p>}
                        <div className={`px-3 py-2 rounded-lg text-sm ${
                          isMe
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {new Date(msg.createdAt).toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 */}
              <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    전송
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
