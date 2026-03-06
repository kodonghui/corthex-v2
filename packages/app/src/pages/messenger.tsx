import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'

type Channel = {
  id: string
  name: string
  description: string | null
  createdBy: string
  createdAt: string
  lastMessage: { content: string; userName: string; createdAt: string } | null
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

type ChannelMember = {
  id: string
  name: string
  role: string
  joinedAt: string
}

type ChannelDetail = {
  id: string
  name: string
  description: string | null
  createdBy: string
  createdAt: string
  memberCount: number
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' })
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function ChannelSettingsModal({
  channelId,
  userId,
  onClose,
}: {
  channelId: string
  userId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [memberSearch, setMemberSearch] = useState('')

  const { data: detailData } = useQuery({
    queryKey: ['messenger-channel-detail', channelId],
    queryFn: () => api.get<{ data: ChannelDetail }>(`/workspace/messenger/channels/${channelId}`),
  })

  const { data: membersData } = useQuery({
    queryKey: ['messenger-channel-members', channelId],
    queryFn: () => api.get<{ data: ChannelMember[] }>(`/workspace/messenger/channels/${channelId}/members`),
  })

  const { data: usersData } = useQuery({
    queryKey: ['messenger-users'],
    queryFn: () => api.get<{ data: CompanyUser[] }>('/workspace/messenger/users'),
  })

  const detail = detailData?.data
  const members = membersData?.data || []
  const allUsers = usersData?.data || []
  const memberIds = useMemo(() => new Set(members.map((m) => m.id)), [members])
  const isCreator = detail?.createdBy === userId

  useEffect(() => {
    if (detail) {
      setEditName(detail.name)
      setEditDesc(detail.description || '')
    }
  }, [detail])

  const updateChannel = useMutation({
    mutationFn: (data: { name?: string; description?: string }) =>
      api.put(`/workspace/messenger/channels/${channelId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger-channels'] })
      queryClient.invalidateQueries({ queryKey: ['messenger-channel-detail', channelId] })
    },
  })

  const deleteChannel = useMutation({
    mutationFn: () => api.delete(`/workspace/messenger/channels/${channelId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger-channels'] })
      onClose()
    },
  })

  const leaveChannel = useMutation({
    mutationFn: () => api.delete(`/workspace/messenger/channels/${channelId}/members/me`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger-channels'] })
      onClose()
    },
  })

  const addMember = useMutation({
    mutationFn: (uid: string) =>
      api.post(`/workspace/messenger/channels/${channelId}/members`, { userId: uid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger-channel-members', channelId] })
      queryClient.invalidateQueries({ queryKey: ['messenger-channel-detail', channelId] })
    },
  })

  const removeMember = useMutation({
    mutationFn: (uid: string) =>
      api.delete(`/workspace/messenger/channels/${channelId}/members/${uid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger-channel-members', channelId] })
      queryClient.invalidateQueries({ queryKey: ['messenger-channel-detail', channelId] })
    },
  })

  const filteredUsers = allUsers.filter(
    (u) => !memberIds.has(u.id) && u.name.toLowerCase().includes(memberSearch.toLowerCase()),
  )

  const handleSave = () => {
    const changes: { name?: string; description?: string } = {}
    if (editName !== detail?.name) changes.name = editName
    if (editDesc !== (detail?.description || '')) changes.description = editDesc
    if (Object.keys(changes).length > 0) updateChannel.mutate(changes)
  }

  const handleDelete = () => {
    if (window.confirm('채널을 삭제하면 모든 메시지가 삭제됩니다. 정말 삭제하시겠습니까?')) {
      deleteChannel.mutate()
    }
  }

  const handleLeave = () => {
    if (window.confirm('채널에서 나가시겠습니까?')) {
      leaveChannel.mutate()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <h3 className="font-semibold">채널 설정</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 채널 정보 수정 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">채널 이름</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">설명</label>
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="채널 설명 (선택)"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={updateChannel.isPending || (editName === detail?.name && editDesc === (detail?.description || ''))}
            className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {updateChannel.isPending ? '저장 중...' : '저장'}
          </button>

          {/* 멤버 관리 */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              멤버 ({members.length}명)
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <span className="text-sm">{m.name} <span className="text-xs text-zinc-500">({m.role})</span></span>
                  {m.id !== userId && (
                    <button
                      onClick={() => removeMember.mutate(m.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      제거
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 멤버 추가 */}
            <div className="mt-2">
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="유저 검색하여 추가..."
                className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
              />
              {memberSearch && filteredUsers.length > 0 && (
                <div className="mt-1 max-h-24 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-md">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { addMember.mutate(u.id); setMemberSearch('') }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      {u.name} <span className="text-xs text-zinc-500">({u.role})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 나가기 + 삭제 */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-2">
            <button
              onClick={handleLeave}
              disabled={leaveChannel.isPending}
              className="w-full px-3 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
            >
              채널 나가기
            </button>
            {isCreator && (
              <button
                onClick={handleDelete}
                disabled={deleteChannel.isPending}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                채널 삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MessengerPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
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

  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.post(`/workspace/messenger/channels/${selectedChannel}/messages`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messenger-messages', selectedChannel] })
      queryClient.invalidateQueries({ queryKey: ['messenger-channels'] })
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
  const selectedChannelData = channels.find((ch) => ch.id === selectedChannel)

  // 새 메시지 도착 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // 설정 모달에서 채널 삭제/나가기 시 선택 초기화
  const handleSettingsClose = () => {
    setShowSettings(false)
    if (selectedChannel && !channels.find((ch) => ch.id === selectedChannel)) {
      setSelectedChannel(null)
    }
  }

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
        <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
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
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{ch.name}</p>
                {ch.lastMessage && (
                  <span className="text-xs text-zinc-400 ml-1 shrink-0">{formatTime(ch.lastMessage.createdAt)}</span>
                )}
              </div>
              {ch.lastMessage ? (
                <p className="text-xs text-zinc-500 truncate mt-0.5">
                  {ch.lastMessage.userName}: {ch.lastMessage.content}
                </p>
              ) : ch.description ? (
                <p className="text-xs text-zinc-500 truncate mt-0.5">{ch.description}</p>
              ) : null}
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
              {/* 채널 헤더 */}
              <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="font-medium text-sm">{selectedChannelData?.name}</span>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg"
                  title="채널 설정"
                >
                  ⚙️
                </button>
              </div>

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

      {/* 채널 설정 모달 */}
      {showSettings && selectedChannel && user && (
        <ChannelSettingsModal
          channelId={selectedChannel}
          userId={user.id}
          onClose={handleSettingsClose}
        />
      )}
    </div>
  )
}
