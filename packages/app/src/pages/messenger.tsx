import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { useWsStore } from '../stores/ws-store'
import { toast } from '@corthex/ui'
import { ConversationsView } from '../components/messenger/conversations-view'

type Channel = {
  id: string
  name: string
  description: string | null
  createdBy: string
  createdAt: string
  lastMessage: { content: string; userName: string; createdAt: string } | null
}

type ReactionGroup = {
  emoji: string
  count: number
  userIds: string[]
}

type FileAttachment = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
}

type Message = {
  id: string
  userId: string
  userName: string
  content: string
  parentMessageId?: string | null
  createdAt: string
  replyCount?: number
  reactions?: ReactionGroup[]
  attachments?: FileAttachment[]
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

type AgentInfo = {
  id: string
  name: string
  role: string | null
}

type SearchResult = {
  id: string
  channelId: string
  channelName: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '👏', '🔥']

const MAX_UPLOAD_SIZE = 52_428_800 // 50MB
const FILE_ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

function getFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return { icon: '📄', color: 'text-red-400' }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return { icon: '📊', color: 'text-green-500' }
  if (mimeType.includes('word') || mimeType === 'application/msword') return { icon: '📝', color: 'text-blue-500' }
  if (mimeType === 'application/zip') return { icon: '📦', color: 'text-slate-500' }
  return { icon: '📎', color: 'text-slate-400' }
}

function AttachmentRenderer({ attachments }: { attachments: FileAttachment[] }) {
  if (!attachments || attachments.length === 0) return null
  return (
    <div className="mt-1.5 space-y-1.5">
      {attachments.map((file) => {
        const isImage = file.mimeType.startsWith('image/')
        if (isImage) {
          return (
            <a key={file.id} href={`/api/workspace/files/${file.id}/download`} target="_blank" rel="noopener noreferrer">
              <img
                src={`/api/workspace/files/${file.id}/download`}
                alt={file.filename}
                className="max-w-64 rounded-lg cursor-pointer hover:opacity-90"
                loading="lazy"
              />
            </a>
          )
        }
        const { icon, color } = getFileIcon(file.mimeType)
        return (
          <a
            key={file.id}
            href={`/api/workspace/files/${file.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 border border-slate-700 rounded-lg p-3 hover:bg-slate-800 max-w-64"
          >
            <span className={`text-xl ${color}`}>{icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{file.filename}</p>
              <p className="text-xs text-slate-400">{formatFileSize(file.sizeBytes)}</p>
            </div>
            <span className="text-slate-400 text-sm shrink-0">↓</span>
          </a>
        )
      })}
    </div>
  )
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
  onlineUserIds,
  onClose,
}: {
  channelId: string
  userId: string
  onlineUserIds: Set<string>
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
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] md:max-h-[80vh] h-full md:h-auto overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold">채널 설정</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">채널 이름</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">설명</label>
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="채널 설명 (선택)"
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-sm"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={updateChannel.isPending || (editName === detail?.name && editDesc === (detail?.description || ''))}
            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500 disabled:opacity-50"
          >
            {updateChannel.isPending ? '저장 중...' : '저장'}
          </button>

          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">
              멤버 ({members.length}명)
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-700">
                  <span className="text-sm">
                    <span className={onlineUserIds.has(m.id) ? 'text-emerald-400' : 'text-slate-400'}>{onlineUserIds.has(m.id) ? '●' : '○'}</span>
                    {' '}{m.name} <span className="text-xs text-slate-500">({m.role})</span>
                  </span>
                  {m.id !== userId && (
                    <button
                      onClick={() => removeMember.mutate(m.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      제거
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2">
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="유저 검색하여 추가..."
                className="w-full px-3 py-1.5 border border-slate-600 rounded-lg bg-slate-800 text-sm"
              />
              {memberSearch && filteredUsers.length > 0 && (
                <div className="mt-1 max-h-24 overflow-y-auto border border-slate-700 rounded-md">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { addMember.mutate(u.id); setMemberSearch('') }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-700"
                    >
                      {u.name} <span className="text-xs text-slate-500">({u.role})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-2">
            <button
              onClick={handleLeave}
              disabled={leaveChannel.isPending}
              className="w-full px-3 py-2 border border-amber-500/50 text-amber-400 text-sm rounded-lg hover:bg-amber-500/10 disabled:opacity-50"
            >
              채널 나가기
            </button>
            {isCreator && (
              <button
                onClick={handleDelete}
                disabled={deleteChannel.isPending}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50"
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

function ThreadPanel({
  channelId,
  parentMessage,
  userId,
  onClose,
}: {
  channelId: string
  parentMessage: Message
  userId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [replyText, setReplyText] = useState('')
  const [threadPendingFiles, setThreadPendingFiles] = useState<FileAttachment[]>([])
  const [threadUploading, setThreadUploading] = useState(false)
  const threadFileInputRef = useRef<HTMLInputElement>(null)
  const repliesEndRef = useRef<HTMLDivElement>(null)
  const { addListener, removeListener, isConnected } = useWsStore()

  const { data: threadData } = useQuery({
    queryKey: ['messenger-thread', channelId, parentMessage.id],
    queryFn: () => api.get<{ data: Message[] }>(`/workspace/messenger/channels/${channelId}/messages/${parentMessage.id}/thread`),
    refetchInterval: isConnected ? false : 30000,
  })

  const replies = threadData?.data || []

  // WebSocket으로 스레드 답글 실시간 수신
  useEffect(() => {
    if (!isConnected) return

    const handler = (data: unknown) => {
      const event = data as { type: string; message?: Message; messageId?: string; reactions?: ReactionGroup[] }
      if (event.type === 'new-message' && event.message?.parentMessageId === parentMessage.id) {
        queryClient.setQueryData(
          ['messenger-thread', channelId, parentMessage.id],
          (old: { data: Message[] } | undefined) => {
            const existing = old?.data || []
            if (existing.some((m) => m.id === event.message!.id)) return old
            return { data: [...existing, { ...event.message!, reactions: [] }] }
          },
        )
        // 메인 채널의 replyCount도 갱신
        queryClient.invalidateQueries({ queryKey: ['messenger-messages', channelId] })
      }
      if (event.type === 'reaction-update' && event.messageId) {
        queryClient.setQueryData(
          ['messenger-thread', channelId, parentMessage.id],
          (old: { data: Message[] } | undefined) => {
            if (!old) return old
            return {
              data: old.data.map((m) =>
                m.id === event.messageId ? { ...m, reactions: event.reactions || [] } : m,
              ),
            }
          },
        )
      }
    }

    const channelKey = `messenger::${channelId}`
    addListener(channelKey, handler)
    return () => removeListener(channelKey, handler)
  }, [isConnected, channelId, parentMessage.id, addListener, removeListener, queryClient])

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [replies.length])

  const sendReply = useMutation({
    mutationFn: ({ content, attachmentIds }: { content: string; attachmentIds?: string[] }) =>
      api.post(`/workspace/messenger/channels/${channelId}/messages`, {
        content,
        parentMessageId: parentMessage.id,
        ...(attachmentIds?.length ? { attachmentIds } : {}),
      }),
    onSuccess: () => {
      setReplyText('')
      setThreadPendingFiles([])
    },
  })

  const handleThreadFileSelect = async (fileList: FileList | null) => {
    if (!fileList) return
    const remaining = 5 - threadPendingFiles.length
    const filesToUpload = Array.from(fileList).slice(0, remaining)
    setThreadUploading(true)
    try {
      for (const file of filesToUpload) {
        if (file.size > MAX_UPLOAD_SIZE) {
          toast.error('파일 크기 초과 (최대 50MB)')
          continue
        }
        try {
          const formData = new FormData()
          formData.append('file', file)
          const res = await api.upload<{ data: FileAttachment }>('/workspace/files', formData)
          setThreadPendingFiles((prev) => [...prev, res.data])
        } catch {
          toast.error('파일 업로드 실패')
        }
      }
    } finally {
      setThreadUploading(false)
    }
  }

  const handleThreadSend = () => {
    if (!replyText.trim() && threadPendingFiles.length === 0) return
    const content = replyText.trim() || '(파일 첨부)'
    const attachmentIds = threadPendingFiles.map((f) => f.id)
    sendReply.mutate({ content, attachmentIds: attachmentIds.length ? attachmentIds : undefined })
  }

  const addReaction = useMutation({
    mutationFn: ({ msgId, emoji }: { msgId: string; emoji: string }) =>
      api.post(`/workspace/messenger/channels/${channelId}/messages/${msgId}/reactions`, { emoji }),
  })

  const removeReaction = useMutation({
    mutationFn: ({ msgId, emoji }: { msgId: string; emoji: string }) =>
      api.delete(`/workspace/messenger/channels/${channelId}/messages/${msgId}/reactions/${encodeURIComponent(emoji)}`),
  })

  const toggleReaction = (msgId: string, emoji: string, myReaction: boolean) => {
    if (myReaction) removeReaction.mutate({ msgId, emoji })
    else addReaction.mutate({ msgId, emoji })
  }

  return (
    <div className="fixed inset-0 md:static md:w-80 border-l border-slate-700 flex flex-col bg-slate-900 z-40" data-testid="thread-panel">
      <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
        <span className="text-sm font-medium">스레드</span>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 text-sm">✕</button>
      </div>

      {/* 원본 메시지 */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <p className="text-xs text-slate-500 mb-0.5">{parentMessage.userName}</p>
        <p className="text-sm">{parentMessage.content}</p>
        {parentMessage.attachments && <AttachmentRenderer attachments={parentMessage.attachments} />}
        <p className="text-xs text-slate-400 mt-0.5">{formatTime(parentMessage.createdAt)}</p>
      </div>

      {/* 답글 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {replies.length === 0 && (
          <p className="text-xs text-slate-400 text-center mt-4">아직 답글이 없습니다.</p>
        )}
        {replies.map((reply) => {
          const isMe = reply.userId === userId
          return (
            <div key={reply.id} className="group">
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%]">
                  {!isMe && <p className="text-xs text-slate-500 mb-0.5">{reply.userName}</p>}
                  <div className={`px-2.5 py-1.5 rounded-lg text-sm ${
                    isMe ? 'bg-blue-600 text-white' : 'bg-slate-800'
                  }`}>
                    {reply.content}
                    {reply.attachments && <AttachmentRenderer attachments={reply.attachments} />}
                  </div>
                  {/* 리액션 배지 */}
                  {reply.reactions && reply.reactions.length > 0 && (
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {reply.reactions.map((r) => (
                        <button
                          key={r.emoji}
                          onClick={() => toggleReaction(reply.id, r.emoji, r.userIds.includes(userId))}
                          className={`text-xs px-1.5 py-0.5 rounded-full border ${
                            r.userIds.includes(userId)
                              ? 'border-blue-500/50 bg-blue-600/10'
                              : 'border-slate-700'
                          }`}
                        >
                          {r.emoji} {r.count}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">{formatTime(reply.createdAt)}</p>
                </div>
              </div>
              {/* 호버 시 이모지 추가 */}
              <div className="hidden group-hover:flex gap-0.5 mt-0.5">
                {EMOJI_LIST.map((e) => (
                  <button
                    key={e}
                    onClick={() => toggleReaction(reply.id, e, reply.reactions?.some((r) => r.emoji === e && r.userIds.includes(userId)) || false)}
                    className="text-xs hover:bg-slate-700 rounded px-0.5"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        <div ref={repliesEndRef} />
      </div>

      {/* 답글 입력 */}
      <div className="px-3 py-2 border-t border-slate-700">
        {threadPendingFiles.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {threadPendingFiles.map((f) => (
              <div key={f.id} className="flex items-center gap-1 bg-slate-800 rounded px-2 py-0.5 text-xs">
                <span className="truncate max-w-[100px]">{f.filename}</span>
                <span className="text-slate-400">{formatFileSize(f.sizeBytes)}</span>
                <button onClick={() => setThreadPendingFiles((prev) => prev.filter((p) => p.id !== f.id))} className="text-slate-400 hover:text-red-400">✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <input type="file" ref={threadFileInputRef} hidden multiple accept={FILE_ACCEPT} onChange={(e) => handleThreadFileSelect(e.target.files)} />
          <button
            onClick={() => threadFileInputRef.current?.click()}
            disabled={threadUploading || threadPendingFiles.length >= 5}
            className="px-2 py-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-50"
            title="파일 첨부"
          >
            📎
          </button>
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && (replyText.trim() || threadPendingFiles.length > 0)) {
                handleThreadSend()
              }
            }}
            placeholder="답글..."
            className="flex-1 px-2.5 py-1.5 border border-slate-600 rounded-lg bg-slate-800 text-sm"
          />
          <button
            onClick={handleThreadSend}
            disabled={(!replyText.trim() && threadPendingFiles.length === 0) || sendReply.isPending || threadUploading}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-500 disabled:opacity-50"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}

export function MessengerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'conversations' ? 'conversations' : 'channels'

  const handleTabChange = (tab: 'channels' | 'conversations') => {
    setSearchParams(tab === 'channels' ? {} : { tab: 'conversations' })
  }

  return (
    <div className="h-full flex flex-col bg-slate-900" data-testid="messenger-page">
      {/* Header: mobile-optimized with search */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-50 tracking-tight">메신저</h2>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => handleTabChange('channels')}
              data-testid="messenger-tab-channels"
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'channels'
                  ? 'bg-slate-700 text-slate-100 shadow-sm font-medium'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              채널
            </button>
            <button
              onClick={() => handleTabChange('conversations')}
              data-testid="messenger-tab-conversations"
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'conversations'
                  ? 'bg-slate-700 text-slate-100 shadow-sm font-medium'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              대화
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'conversations' ? (
        <ConversationsView />
      ) : (
        <ChannelsView />
      )}
    </div>
  )
}

function ChannelsView() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const [searchParams] = useSearchParams()
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [typingAgent, setTypingAgent] = useState<string | null>(null)
  const [showMention, setShowMention] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [threadMessage, setThreadMessage] = useState<Message | null>(null)
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [mentionToast, setMentionToast] = useState<{ title: string; actionUrl: string } | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL에서 channelId 파라미터 (알림 클릭 시)
  useEffect(() => {
    const chId = searchParams.get('channelId')
    if (chId) setSelectedChannel(chId)
  }, [searchParams])

  // 검색 디바운스
  useEffect(() => {
    if (searchQuery.length < 2) { setDebouncedSearch(''); return }
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 검색 외부 클릭 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // 채널 목록
  const { data: channelsData } = useQuery({
    queryKey: ['messenger-channels'],
    queryFn: () => api.get<{ data: Channel[] }>('/workspace/messenger/channels'),
  })

  // 메시지 검색
  const { data: searchData } = useQuery({
    queryKey: ['messenger-search', debouncedSearch],
    queryFn: () => api.get<{ data: SearchResult[] }>(`/workspace/messenger/search?q=${encodeURIComponent(debouncedSearch)}`),
    enabled: debouncedSearch.length >= 2,
  })
  const searchResults = searchData?.data || []

  // 채널별 미읽음 카운트
  const { data: unreadData } = useQuery({
    queryKey: ['messenger-unread'],
    queryFn: () => api.get<{ data: Record<string, number> }>('/workspace/messenger/channels/unread'),
    refetchInterval: 60000,
  })

  // 서버 unread를 로컬 상태에 동기화
  useEffect(() => {
    if (unreadData?.data) {
      setUnreadCounts((prev) => {
        const merged = { ...prev }
        for (const [chId, count] of Object.entries(unreadData.data)) {
          if (merged[chId] === undefined || merged[chId] < count) {
            merged[chId] = count
          }
        }
        return merged
      })
    }
  }, [unreadData])

  // 채널 읽음 처리
  const markRead = useMutation({
    mutationFn: (channelId: string) =>
      api.post(`/workspace/messenger/channels/${channelId}/read`, {}),
  })

  // 채널 선택 핸들러
  const handleSelectChannel = useCallback((channelId: string) => {
    setSelectedChannel(channelId)
    setThreadMessage(null)
    setShowChat(true)
    setUnreadCounts((prev) => ({ ...prev, [channelId]: 0 }))
    markRead.mutate(channelId)
  }, [markRead])

  // 메시지 (선택된 채널, WebSocket 미연결 시 30초 폴링 fallback)
  const { data: messagesData } = useQuery({
    queryKey: ['messenger-messages', selectedChannel],
    queryFn: () => api.get<{ data: Message[] }>(`/workspace/messenger/channels/${selectedChannel}/messages`),
    enabled: !!selectedChannel,
    refetchInterval: isConnected ? false : 30000,
  })

  // 채널 상세 (멤버 수 표시용)
  const { data: channelDetailData } = useQuery({
    queryKey: ['messenger-channel-detail', selectedChannel],
    queryFn: () => api.get<{ data: ChannelDetail }>(`/workspace/messenger/channels/${selectedChannel}`),
    enabled: !!selectedChannel,
  })
  const channelDetail = channelDetailData?.data

  // WebSocket 실시간 메시지 수신
  useEffect(() => {
    if (!selectedChannel || !isConnected) return

    subscribe('messenger', { id: selectedChannel })

    const handler = (data: unknown) => {
      const event = data as { type: string; message?: Message; agentName?: string; messageId?: string; reactions?: ReactionGroup[] }
      if (event.type === 'new-message' && event.message) {
        // 스레드 답글은 메인 목록에 추가하지 않음 (ThreadPanel에서 처리)
        if (!event.message.parentMessageId) {
          queryClient.setQueryData(
            ['messenger-messages', selectedChannel],
            (old: { data: Message[] } | undefined) => {
              const existing = old?.data || []
              if (existing.some((m) => m.id === event.message!.id)) return old
              return { data: [...existing, { ...event.message!, replyCount: 0, reactions: [] }] }
            },
          )
        } else {
          // 스레드 답글이면 메인 메시지의 replyCount 갱신
          queryClient.setQueryData(
            ['messenger-messages', selectedChannel],
            (old: { data: Message[] } | undefined) => {
              if (!old) return old
              return {
                data: old.data.map((m) =>
                  m.id === event.message!.parentMessageId
                    ? { ...m, replyCount: (m.replyCount || 0) + 1 }
                    : m,
                ),
              }
            },
          )
        }
        queryClient.invalidateQueries({ queryKey: ['messenger-channels'] })
      }
      if (event.type === 'typing' && event.agentName) {
        setTypingAgent(event.agentName)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTypingAgent(null), 3000)
      }
      if (event.type === 'reaction-update' && event.messageId) {
        queryClient.setQueryData(
          ['messenger-messages', selectedChannel],
          (old: { data: Message[] } | undefined) => {
            if (!old) return old
            return {
              data: old.data.map((m) =>
                m.id === event.messageId ? { ...m, reactions: event.reactions || [] } : m,
              ),
            }
          },
        )
      }
    }

    const channelKey = `messenger::${selectedChannel}`
    addListener(channelKey, handler)
    return () => {
      removeListener(channelKey, handler)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [selectedChannel, isConnected, subscribe, addListener, removeListener, queryClient])

  // 알림 WS: messenger_mention 토스트
  useEffect(() => {
    if (!isConnected || !user) return
    const notifKey = `notifications::${user.id}`
    const handler = (data: unknown) => {
      const event = data as { type: string; notification?: { type: string; title: string; actionUrl?: string } }
      if (event.type === 'new-notification' && event.notification?.type === 'messenger_mention') {
        setMentionToast({ title: event.notification.title, actionUrl: event.notification.actionUrl || '/messenger' })
        setTimeout(() => setMentionToast(null), 5000)
      }
    }
    addListener(notifKey, handler)
    return () => removeListener(notifKey, handler)
  }, [isConnected, user, addListener, removeListener])

  // 모든 내 채널의 WS 구독 → unread 추적
  useEffect(() => {
    if (!isConnected || !channelsData?.data) return
    const channelIds = channelsData.data.map((ch) => ch.id)
    for (const chId of channelIds) {
      if (chId !== selectedChannel) {
        subscribe('messenger', { id: chId })
      }
    }

    const handlers: { key: string; fn: (data: unknown) => void }[] = []
    for (const chId of channelIds) {
      if (chId === selectedChannel) continue
      const channelKey = `messenger::${chId}`
      const fn = (data: unknown) => {
        const event = data as { type: string; message?: Message }
        if (event.type === 'new-message' && event.message && !event.message.parentMessageId) {
          setUnreadCounts((prev) => ({ ...prev, [chId]: (prev[chId] || 0) + 1 }))
          queryClient.invalidateQueries({ queryKey: ['messenger-channels'] })
        }
      }
      addListener(channelKey, fn)
      handlers.push({ key: channelKey, fn })
    }
    return () => {
      for (const h of handlers) removeListener(h.key, h.fn)
    }
  }, [isConnected, channelsData?.data, selectedChannel, subscribe, addListener, removeListener, queryClient])

  const sendMessage = useMutation({
    mutationFn: ({ content, attachmentIds }: { content: string; attachmentIds?: string[] }) =>
      api.post(`/workspace/messenger/channels/${selectedChannel}/messages`, {
        content,
        ...(attachmentIds?.length ? { attachmentIds } : {}),
      }),
    onSuccess: () => {
      setNewMessage('')
      setPendingFiles([])
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

  const addReaction = useMutation({
    mutationFn: ({ msgId, emoji }: { msgId: string; emoji: string }) =>
      api.post(`/workspace/messenger/channels/${selectedChannel}/messages/${msgId}/reactions`, { emoji }),
  })

  const removeReaction = useMutation({
    mutationFn: ({ msgId, emoji }: { msgId: string; emoji: string }) =>
      api.delete(`/workspace/messenger/channels/${selectedChannel}/messages/${msgId}/reactions/${encodeURIComponent(emoji)}`),
  })

  // 에이전트 목록 (멘션 자동완성용)
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: AgentInfo[] }>('/workspace/agents'),
  })

  // 온라인 상태 (30초 폴링)
  const { data: onlineData } = useQuery({
    queryKey: ['messenger-online-status'],
    queryFn: () => api.get<{ data: string[] }>('/workspace/messenger/online-status'),
    refetchInterval: 30000,
  })
  const onlineUserIds = useMemo(() => new Set(onlineData?.data || []), [onlineData])
  const allAgents = agentsData?.data || []
  const filteredAgents = showMention
    ? allAgents.filter((a) => a.name.toLowerCase().includes(mentionSearch.toLowerCase()))
    : []

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

  const handleFileSelect = async (fileList: FileList | null) => {
    if (!fileList) return
    const remaining = 5 - pendingFiles.length
    const filesToUpload = Array.from(fileList).slice(0, remaining)
    setUploading(true)
    try {
      for (const file of filesToUpload) {
        if (file.size > MAX_UPLOAD_SIZE) {
          toast.error('파일 크기 초과 (최대 50MB)')
          continue
        }
        try {
          const formData = new FormData()
          formData.append('file', file)
          const res = await api.upload<{ data: FileAttachment }>('/workspace/files', formData)
          setPendingFiles((prev) => [...prev, res.data])
        } catch {
          toast.error('파일 업로드 실패')
        }
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleSend = () => {
    if (!newMessage.trim() && pendingFiles.length === 0) return
    const content = newMessage.trim() || '(파일 첨부)'
    const attachmentIds = pendingFiles.map((f) => f.id)
    sendMessage.mutate({ content, attachmentIds: attachmentIds.length ? attachmentIds : undefined })
    setShowMention(false)
  }

  const handleInputChange = (value: string) => {
    setNewMessage(value)
    const atIdx = value.lastIndexOf('@')
    if (atIdx !== -1 && (atIdx === 0 || value[atIdx - 1] === ' ')) {
      const query = value.slice(atIdx + 1)
      if (!query.includes(' ')) {
        setShowMention(true)
        setMentionSearch(query)
        return
      }
    }
    setShowMention(false)
  }

  const handleMentionSelect = (agentName: string) => {
    const atIdx = newMessage.lastIndexOf('@')
    const before = newMessage.slice(0, atIdx)
    setNewMessage(`${before}@${agentName} `)
    setShowMention(false)
    inputRef.current?.focus()
  }

  const toggleReaction = (msgId: string, emoji: string, myReaction: boolean) => {
    if (myReaction) removeReaction.mutate({ msgId, emoji })
    else addReaction.mutate({ msgId, emoji })
    setShowEmojiPicker(null)
  }

  return (
    <>
      <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between" data-testid="channels-header">
        <span className="text-xs text-slate-500">채널 기반 메신저</span>
        <button onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg"
          data-testid="create-channel-btn">
          + 채널
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* 채널 목록 (좌) — 모바일: showChat false일 때만 표시 */}
        <div className={`w-full md:w-72 border-r border-slate-700 overflow-y-auto [-webkit-overflow-scrolling:touch] ${showChat ? 'hidden md:block' : ''}`} data-testid="channel-sidebar">
          {/* 검색 */}
          <div ref={searchRef} className="relative p-2 border-b border-slate-700">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-800 rounded-md">
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true) }}
                onFocus={() => debouncedSearch.length >= 2 && setShowSearchResults(true)}
                onKeyDown={(e) => e.key === 'Escape' && setShowSearchResults(false)}
                placeholder="메시지 검색..."
                className="flex-1 bg-transparent text-sm outline-none placeholder-slate-500"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setShowSearchResults(false) }}
                  className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
              )}
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-2 right-2 top-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-64 overflow-y-auto z-30">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { handleSelectChannel(r.channelId); setShowSearchResults(false); setSearchQuery('') }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 border-b border-slate-700 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-400">#{r.channelName}</span>
                      <span className="text-[10px] text-slate-400">{formatTime(r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{r.userName}</p>
                    <p className="text-sm truncate mt-0.5">
                      {r.content.length > 80 ? r.content.slice(0, 80) + '...' : r.content}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {showSearchResults && debouncedSearch.length >= 2 && searchResults.length === 0 && (
              <div className="absolute left-2 right-2 top-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg p-3 z-30">
                <p className="text-xs text-slate-400 text-center">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
          {showCreate && (
            <div className="p-3 border-b border-slate-700 space-y-2">
              <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="채널명" className="w-full px-2 py-1 border border-slate-600 rounded text-sm bg-slate-800" />
              <button onClick={() => createChannel.mutate(createForm)}
                disabled={!createForm.name || createChannel.isPending}
                className="w-full px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 disabled:opacity-50">
                생성
              </button>
            </div>
          )}
          {channels.length === 0 && !showCreate && (
            <p className="p-3 text-xs text-slate-500">채널이 없습니다. 새 채널을 만드세요.</p>
          )}
          {channels.map((ch) => {
            const unread = unreadCounts[ch.id] || 0
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChannel(ch.id)}
                className={`w-full text-left flex items-center gap-3 px-3 sm:px-3 py-3 text-sm border-b border-slate-700/50 transition-colors ${
                  selectedChannel === ch.id
                    ? 'bg-cyan-400/5 border-l-2 border-l-cyan-400'
                    : 'hover:bg-slate-800/30'
                }`}
              >
                {/* Channel avatar with online dot */}
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 flex items-center justify-center border border-cyan-400/20">
                    <span className="text-cyan-400 text-sm font-bold">#</span>
                  </div>
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 md:hidden" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-slate-50' : 'font-medium text-slate-300'}`}>{ch.name}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {ch.lastMessage && (
                        <span className={`text-xs ${unread > 0 ? 'font-medium text-cyan-400' : 'text-slate-500'}`}>{formatTime(ch.lastMessage.createdAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ch.lastMessage ? (
                      <p className={`text-xs truncate flex-1 ${unread > 0 ? 'font-medium text-slate-200' : 'text-slate-500'}`}>
                        {ch.lastMessage.userName}: {ch.lastMessage.content}
                      </p>
                    ) : ch.description ? (
                      <p className="text-xs text-slate-500 truncate flex-1">{ch.description}</p>
                    ) : null}
                    {unread > 0 && (
                      <div className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 메시지 영역 (우) — 모바일: showChat true일 때만 표시 */}
        <div className={`flex-1 flex min-w-0 ${showChat ? '' : 'hidden md:flex'}`}>
          <div className="flex-1 flex flex-col min-w-0">
            {!selectedChannel ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                채널을 선택하세요
              </div>
            ) : (
              <>
                {/* 채널 헤더 */}
                <div className="px-4 py-2.5 border-b border-slate-700 flex items-center justify-between shrink-0" data-testid="channel-header">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => setShowChat(false)}
                      className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-700 text-sm text-slate-400 shrink-0"
                    >
                      ←
                    </button>
                    <span className="font-medium text-sm text-slate-100 truncate">{selectedChannelData?.name}</span>
                    {channelDetail?.memberCount && (
                      <span className="text-xs text-slate-500 shrink-0">{channelDetail.memberCount}명</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-slate-400 hover:text-slate-200 text-lg"
                    title="채널 설정"
                    data-testid="channel-settings-btn"
                  >
                    ⚙️
                  </button>
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 [-webkit-overflow-scrolling:touch]">
                  {messages.length === 0 && (
                    <p className="text-sm text-slate-400 text-center mt-8">아직 메시지가 없습니다.</p>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.userId === user?.id
                    const isHovered = hoveredMsgId === msg.id
                    return (
                      <div
                        key={msg.id}
                        className="group relative"
                        onMouseEnter={() => setHoveredMsgId(msg.id)}
                        onMouseLeave={() => { setHoveredMsgId(null); if (showEmojiPicker === msg.id) setShowEmojiPicker(null) }}
                      >
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                            {!isMe && <p className="text-xs font-medium text-slate-400 mb-0.5">{msg.userName}</p>}
                            <div className="relative">
                              <div className={`px-3 py-2 rounded-lg text-sm max-w-[75%] ${
                                isMe
                                  ? 'bg-blue-600 text-white rounded-br-sm'
                                  : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                              }`}>
                                {msg.content}
                                {msg.attachments && <AttachmentRenderer attachments={msg.attachments} />}
                              </div>
                              {/* 호버 시 액션 바 */}
                              {isHovered && (
                                <div className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} flex gap-0.5 bg-slate-800 border border-slate-700 rounded-md shadow-sm px-1 py-0.5 z-10`}>
                                  <button
                                    onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                    className="text-xs hover:bg-slate-700 rounded px-1 py-0.5"
                                    title="리액션"
                                  >
                                    😀
                                  </button>
                                  <button
                                    onClick={() => setThreadMessage(msg)}
                                    className="text-xs hover:bg-slate-700 rounded px-1 py-0.5"
                                    title="답글"
                                  >
                                    💬
                                  </button>
                                </div>
                              )}
                              {/* 이모지 피커 */}
                              {showEmojiPicker === msg.id && (
                                <div className={`absolute -top-14 ${isMe ? 'right-0' : 'left-0'} flex gap-0.5 bg-slate-800 border border-slate-700 rounded-md shadow-lg px-1.5 py-1 z-20`}>
                                  {EMOJI_LIST.map((e) => (
                                    <button
                                      key={e}
                                      onClick={() => toggleReaction(msg.id, e, msg.reactions?.some((r) => r.emoji === e && r.userIds.includes(user?.id || '')) || false)}
                                      className="text-sm hover:bg-slate-700 rounded px-1 py-0.5"
                                    >
                                      {e}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* 리액션 배지 */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                {msg.reactions.map((r) => (
                                  <button
                                    key={r.emoji}
                                    onClick={() => toggleReaction(msg.id, r.emoji, r.userIds.includes(user?.id || ''))}
                                    className={`text-xs px-1.5 py-0.5 rounded-full border ${
                                      r.userIds.includes(user?.id || '')
                                        ? 'border-blue-500/50 bg-blue-600/10'
                                        : 'border-slate-700 hover:border-slate-600'
                                    }`}
                                  >
                                    {r.emoji} {r.count}
                                  </button>
                                ))}
                              </div>
                            )}
                            {/* 답글 카운트 */}
                            {(msg.replyCount || 0) > 0 && (
                              <button
                                onClick={() => setThreadMessage(msg)}
                                className="text-xs text-blue-400 hover:text-blue-400 mt-0.5"
                              >
                                {msg.replyCount}개 답글
                              </button>
                            )}
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(msg.createdAt).toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {typingAgent && (
                    <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-500">
                      <span className="animate-pulse">🤖 {typingAgent}이(가) 입력 중...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력 */}
                <div
                  className={`px-4 py-3 border-t border-slate-700 relative ${dragOver ? 'bg-blue-600/10 border-blue-500/50' : ''}`}
                  style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {showMention && filteredAgents.length > 0 && (
                    <div className="absolute bottom-full left-4 right-4 mb-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto w-64 z-10" data-testid="mention-popup">
                      {filteredAgents.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => handleMentionSelect(a.name)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 flex items-center gap-2"
                        >
                          <span className="text-blue-400">@{a.name}</span>
                          {a.role && <span className="text-xs text-slate-500">({a.role})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {pendingFiles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {pendingFiles.map((f) => (
                        <div key={f.id} className="flex items-center gap-1.5 bg-slate-800 rounded-md px-2.5 py-1 text-xs">
                          <span className="truncate max-w-[120px]">{f.filename}</span>
                          <span className="text-slate-400">{formatFileSize(f.sizeBytes)}</span>
                          <button onClick={() => setPendingFiles((prev) => prev.filter((p) => p.id !== f.id))} className="text-slate-400 hover:text-red-400 ml-0.5">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} hidden multiple accept={FILE_ACCEPT} onChange={(e) => { handleFileSelect(e.target.files); e.target.value = '' }} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || pendingFiles.length >= 5}
                      className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700 disabled:opacity-50"
                      title="파일 첨부 (최대 5개)"
                    >
                      📎
                    </button>
                    <input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !showMention) handleSend()
                        if (e.key === 'Escape') setShowMention(false)
                      }}
                      placeholder="메시지를 입력하세요... (@로 에이전트 호출)"
                      className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm"
                      data-testid="channel-message-input"
                    />
                    <button
                      onClick={handleSend}
                      disabled={(!newMessage.trim() && pendingFiles.length === 0) || sendMessage.isPending || uploading}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                      data-testid="channel-send-btn"
                    >
                      전송
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 스레드 패널 */}
          {threadMessage && selectedChannel && user && (
            <ThreadPanel
              channelId={selectedChannel}
              parentMessage={threadMessage}
              userId={user.id}
              onClose={() => setThreadMessage(null)}
            />
          )}
        </div>
      </div>

      {/* 채널 설정 모달 */}
      {showSettings && selectedChannel && user && (
        <ChannelSettingsModal
          channelId={selectedChannel}
          userId={user.id}
          onlineUserIds={onlineUserIds}
          onClose={handleSettingsClose}
        />
      )}

      {/* 멘션 알림 토스트 */}
      {mentionToast && (
        <div
          className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer z-50 max-w-xs animate-in fade-in slide-in-from-bottom-2"
          onClick={() => {
            const chMatch = mentionToast.actionUrl.match(/channelId=([^&]+)/)
            if (chMatch) handleSelectChannel(chMatch[1])
            setMentionToast(null)
          }}
        >
          <p className="text-sm font-medium">@멘션 알림</p>
          <p className="text-xs opacity-90 mt-0.5">{mentionToast.title}</p>
        </div>
      )}
    </>
  )
}
