import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, MoreVertical, ArrowUp, Paperclip, ArrowLeft } from 'lucide-react'
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
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[80vh] md:max-h-[80vh] h-full md:h-auto overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-50">채널 설정</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">채널 이름</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">설명</label>
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="채널 설명 (선택)"
              className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-200 placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={updateChannel.isPending || (editName === detail?.name && editDesc === (detail?.description || ''))}
            className="w-full px-3 py-2 bg-cyan-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-cyan-400/90 disabled:opacity-50 transition-colors"
          >
            {updateChannel.isPending ? '저장 중...' : '저장'}
          </button>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">
              멤버 ({members.length}명)
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-800">
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
                className="w-full px-3 py-1.5 border border-slate-700 rounded-lg bg-slate-800/50 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-200 placeholder:text-slate-500"
              />
              {memberSearch && filteredUsers.length > 0 && (
                <div className="mt-1 max-h-24 overflow-y-auto border border-slate-700 rounded-md">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { addMember.mutate(u.id); setMemberSearch('') }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-800"
                    >
                      {u.name} <span className="text-xs text-slate-500">({u.role})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <button
              onClick={handleLeave}
              disabled={leaveChannel.isPending}
              className="w-full px-3 py-2 border border-amber-500/50 text-amber-400 text-sm rounded-lg hover:bg-amber-500/10 disabled:opacity-50 transition-colors"
            >
              채널 나가기
            </button>
            {isCreator && (
              <button
                onClick={handleDelete}
                disabled={deleteChannel.isPending}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
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

  // WebSocket thread replies
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
    <div className="fixed inset-0 md:static md:w-80 border-l border-slate-800 flex flex-col bg-slate-950 z-40" data-testid="thread-panel">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-50">스레드</span>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 text-sm transition-colors">✕</button>
      </div>

      {/* Original message */}
      <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/30">
        <p className="text-xs text-slate-500 mb-0.5">{parentMessage.userName}</p>
        <p className="text-sm text-slate-200">{parentMessage.content}</p>
        {parentMessage.attachments && <AttachmentRenderer attachments={parentMessage.attachments} />}
        <p className="text-xs text-slate-400 mt-0.5">{formatTime(parentMessage.createdAt)}</p>
      </div>

      {/* Replies */}
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
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    isMe ? 'bg-cyan-400/10 border border-cyan-400/20 text-slate-100 rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'
                  }`}>
                    {reply.content}
                    {reply.attachments && <AttachmentRenderer attachments={reply.attachments} />}
                  </div>
                  {/* Reaction badges */}
                  {reply.reactions && reply.reactions.length > 0 && (
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {reply.reactions.map((r) => (
                        <button
                          key={r.emoji}
                          onClick={() => toggleReaction(reply.id, r.emoji, r.userIds.includes(userId))}
                          className={`text-xs px-1.5 py-0.5 rounded-full border ${
                            r.userIds.includes(userId)
                              ? 'border-cyan-400/50 bg-cyan-400/10'
                              : 'border-slate-700'
                          }`}
                        >
                          {r.emoji} {r.count}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">{formatTime(reply.createdAt)}</p>
                </div>
              </div>
              {/* Hover emoji add */}
              <div className="hidden group-hover:flex gap-0.5 mt-0.5">
                {EMOJI_LIST.map((e) => (
                  <button
                    key={e}
                    onClick={() => toggleReaction(reply.id, e, reply.reactions?.some((r) => r.emoji === e && r.userIds.includes(userId)) || false)}
                    className="text-xs hover:bg-slate-800 rounded px-0.5"
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

      {/* Reply input */}
      <div className="px-3 py-2 border-t border-slate-800">
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
            className="p-2 text-slate-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
            title="파일 첨부"
          >
            <Paperclip className="w-4 h-4" />
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
            className="flex-1 px-3 py-1.5 border border-slate-700 rounded-full bg-slate-800/50 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-200 placeholder:text-slate-500"
          />
          <button
            onClick={handleThreadSend}
            disabled={(!replyText.trim() && threadPendingFiles.length === 0) || sendReply.isPending || threadUploading}
            className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-950 h-8 w-8 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
          >
            <ArrowUp className="w-4 h-4 font-bold" />
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
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden" data-testid="messenger-page">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-50 tracking-tight">메신저</h2>
          <div className="flex gap-1 bg-slate-900 rounded-lg p-0.5">
            <button
              onClick={() => handleTabChange('channels')}
              data-testid="messenger-tab-channels"
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'channels'
                  ? 'bg-slate-800 text-slate-100 shadow-sm font-medium'
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
                  ? 'bg-slate-800 text-slate-100 shadow-sm font-medium'
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

  // URL channelId param (from notification click)
  useEffect(() => {
    const chId = searchParams.get('channelId')
    if (chId) setSelectedChannel(chId)
  }, [searchParams])

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) { setDebouncedSearch(''); return }
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Channel list
  const { data: channelsData } = useQuery({
    queryKey: ['messenger-channels'],
    queryFn: () => api.get<{ data: Channel[] }>('/workspace/messenger/channels'),
  })

  // Message search
  const { data: searchData } = useQuery({
    queryKey: ['messenger-search', debouncedSearch],
    queryFn: () => api.get<{ data: SearchResult[] }>(`/workspace/messenger/search?q=${encodeURIComponent(debouncedSearch)}`),
    enabled: debouncedSearch.length >= 2,
  })
  const searchResults = searchData?.data || []

  // Unread counts
  const { data: unreadData } = useQuery({
    queryKey: ['messenger-unread'],
    queryFn: () => api.get<{ data: Record<string, number> }>('/workspace/messenger/channels/unread'),
    refetchInterval: 60000,
  })

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

  const markRead = useMutation({
    mutationFn: (channelId: string) =>
      api.post(`/workspace/messenger/channels/${channelId}/read`, {}),
  })

  const handleSelectChannel = useCallback((channelId: string) => {
    setSelectedChannel(channelId)
    setThreadMessage(null)
    setShowChat(true)
    setUnreadCounts((prev) => ({ ...prev, [channelId]: 0 }))
    markRead.mutate(channelId)
  }, [markRead])

  const { data: messagesData } = useQuery({
    queryKey: ['messenger-messages', selectedChannel],
    queryFn: () => api.get<{ data: Message[] }>(`/workspace/messenger/channels/${selectedChannel}/messages`),
    enabled: !!selectedChannel,
    refetchInterval: isConnected ? false : 30000,
  })

  const { data: channelDetailData } = useQuery({
    queryKey: ['messenger-channel-detail', selectedChannel],
    queryFn: () => api.get<{ data: ChannelDetail }>(`/workspace/messenger/channels/${selectedChannel}`),
    enabled: !!selectedChannel,
  })
  const channelDetail = channelDetailData?.data

  // WebSocket real-time messages
  useEffect(() => {
    if (!selectedChannel || !isConnected) return

    subscribe('messenger', { id: selectedChannel })

    const handler = (data: unknown) => {
      const event = data as { type: string; message?: Message; agentName?: string; messageId?: string; reactions?: ReactionGroup[] }
      if (event.type === 'new-message' && event.message) {
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

  // Mention toast WS
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

  // Subscribe all channels for unread tracking
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

  // Agent list (mention autocomplete)
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: AgentInfo[] }>('/workspace/agents'),
  })

  // Online status (30s polling)
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

  // Scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

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
      {/* Stitch-style 2-panel layout */}
      <div className="flex flex-1 overflow-hidden" data-testid="channels-header">
        {/* Left Panel: Conversation List — Stitch: 320px sidebar */}
        <aside className={`w-full md:w-[320px] shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`} data-testid="channel-sidebar">
          {/* Search */}
          <div ref={searchRef} className="p-4 border-b border-slate-800 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true) }}
                onFocus={() => debouncedSearch.length >= 2 && setShowSearchResults(true)}
                onKeyDown={(e) => e.key === 'Escape' && setShowSearchResults(false)}
                className="w-full bg-slate-800/50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-cyan-400 outline-none placeholder:text-slate-500 text-slate-200"
                placeholder="검색..."
                type="text"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setShowSearchResults(false) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs">✕</button>
              )}
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-4 right-4 top-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-lg max-h-64 overflow-y-auto z-30">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { handleSelectChannel(r.channelId); setShowSearchResults(false); setSearchQuery('') }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 border-b border-slate-800 last:border-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-cyan-400">#{r.channelName}</span>
                      <span className="text-[10px] text-slate-400">{formatTime(r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{r.userName}</p>
                    <p className="text-sm truncate mt-0.5 text-slate-300">
                      {r.content.length > 80 ? r.content.slice(0, 80) + '...' : r.content}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {showSearchResults && debouncedSearch.length >= 2 && searchResults.length === 0 && (
              <div className="absolute left-4 right-4 top-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-lg p-3 z-30">
                <p className="text-xs text-slate-400 text-center">검색 결과가 없습니다</p>
              </div>
            )}
          </div>

          {/* Create channel + channel list */}
          <div className="flex-1 overflow-y-auto">
            {/* Create button bar */}
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-end">
              <button onClick={() => setShowCreate(!showCreate)}
                className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-400/90 text-slate-950 text-sm font-semibold rounded-lg transition-colors"
                data-testid="create-channel-btn">
                + 채널
              </button>
            </div>

            {showCreate && (
              <div className="p-4 border-b border-slate-800 space-y-2">
                <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="채널명" className="w-full px-3 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-200 placeholder:text-slate-500" />
                <button onClick={() => createChannel.mutate(createForm)}
                  disabled={!createForm.name || createChannel.isPending}
                  className="w-full px-3 py-2 bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg hover:bg-cyan-400/90 disabled:opacity-50 transition-colors">
                  생성
                </button>
              </div>
            )}
            {channels.length === 0 && !showCreate && (
              <p className="p-4 text-xs text-slate-500">채널이 없습니다. 새 채널을 만드세요.</p>
            )}
            {channels.map((ch) => {
              const unread = unreadCounts[ch.id] || 0
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch.id)}
                  className={`w-full text-left flex items-center gap-3 p-4 transition-colors border-l-2 ${
                    selectedChannel === ch.id
                      ? 'bg-cyan-400/10 border-l-cyan-400'
                      : 'hover:bg-slate-800/30 border-l-transparent'
                  }`}
                >
                  {/* Channel avatar with online indicator */}
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 flex items-center justify-center border border-cyan-400/20">
                      <span className="text-cyan-400 text-sm font-bold">#</span>
                    </div>
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={`text-sm truncate ${unread > 0 ? 'font-semibold text-slate-50' : 'font-medium text-slate-300'}`}>{ch.name}</h3>
                      {ch.lastMessage && (
                        <span className={`text-xs shrink-0 ${unread > 0 ? 'font-medium text-cyan-400' : 'text-slate-500'}`}>{formatTime(ch.lastMessage.createdAt)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {ch.lastMessage ? (
                        <p className={`text-sm truncate flex-1 ${unread > 0 ? 'text-slate-400 font-medium' : 'text-slate-500'}`}>
                          {ch.lastMessage.userName}: {ch.lastMessage.content}
                        </p>
                      ) : ch.description ? (
                        <p className="text-sm text-slate-500 truncate flex-1">{ch.description}</p>
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
        </aside>

        {/* Right Panel: Chat Area */}
        <main className={`flex-1 flex min-w-0 ${showChat ? '' : 'hidden md:flex'}`}>
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
            {!selectedChannel ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                채널을 선택하세요
              </div>
            ) : (
              <>
                {/* Chat Header — Stitch style */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0" data-testid="channel-header">
                  <div className="flex items-center gap-4 min-w-0">
                    <button
                      onClick={() => setShowChat(false)}
                      className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 shrink-0 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 flex items-center justify-center border border-cyan-400/20 shrink-0">
                      <span className="text-cyan-400 font-bold">#</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold tracking-tight text-slate-50 truncate">{selectedChannelData?.name}</h2>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {channelDetail?.memberCount ? `${channelDetail.memberCount}명 참여` : '온라인'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors">
                      <Search className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                      title="채널 설정"
                      data-testid="channel-settings-btn"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Area — Stitch style with rounded bubbles */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 [-webkit-overflow-scrolling:touch]">
                  {messages.length === 0 && (
                    <div className="flex justify-center my-2">
                      <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">아직 메시지가 없습니다</span>
                    </div>
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
                        {isMe ? (
                          /* My message — right aligned, Stitch style */
                          <div className="flex justify-end gap-3 max-w-[80%] ml-auto">
                            <div className="flex flex-col items-end gap-1">
                              <div className="relative">
                                <div className="bg-cyan-400/10 text-slate-100 p-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed border border-cyan-400/20">
                                  {msg.content}
                                  {msg.attachments && <AttachmentRenderer attachments={msg.attachments} />}
                                </div>
                                {/* Hover action bar */}
                                {isHovered && (
                                  <div className="absolute -top-7 right-0 flex gap-0.5 bg-slate-900 border border-slate-800 rounded-md shadow-sm px-1 py-0.5 z-10">
                                    <button
                                      onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                      className="text-xs hover:bg-slate-800 rounded px-1 py-0.5"
                                      title="리액션"
                                    >
                                      😀
                                    </button>
                                    <button
                                      onClick={() => setThreadMessage(msg)}
                                      className="text-xs hover:bg-slate-800 rounded px-1 py-0.5"
                                      title="답글"
                                    >
                                      💬
                                    </button>
                                  </div>
                                )}
                                {/* Emoji picker */}
                                {showEmojiPicker === msg.id && (
                                  <div className="absolute -top-14 right-0 flex gap-0.5 bg-slate-900 border border-slate-800 rounded-md shadow-lg px-1.5 py-1 z-20">
                                    {EMOJI_LIST.map((e) => (
                                      <button
                                        key={e}
                                        onClick={() => toggleReaction(msg.id, e, msg.reactions?.some((r) => r.emoji === e && r.userIds.includes(user?.id || '')) || false)}
                                        className="text-sm hover:bg-slate-800 rounded px-1 py-0.5"
                                      >
                                        {e}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Reaction badges */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {msg.reactions.map((r) => (
                                    <button
                                      key={r.emoji}
                                      onClick={() => toggleReaction(msg.id, r.emoji, r.userIds.includes(user?.id || ''))}
                                      className={`text-xs px-1.5 py-0.5 rounded-full border ${
                                        r.userIds.includes(user?.id || '')
                                          ? 'border-cyan-400/50 bg-cyan-400/10'
                                          : 'border-slate-700 hover:border-slate-600'
                                      }`}
                                    >
                                      {r.emoji} {r.count}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {/* Reply count */}
                              {(msg.replyCount || 0) > 0 && (
                                <button
                                  onClick={() => setThreadMessage(msg)}
                                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                  {msg.replyCount}개 답글
                                </button>
                              )}
                              <span className="text-xs text-slate-500">{formatTime(msg.createdAt)}</span>
                            </div>
                          </div>
                        ) : (
                          /* Other's message — left aligned with avatar, Stitch style */
                          <div className="flex justify-start gap-3 max-w-[80%]">
                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1 text-slate-400 text-xs font-bold">
                              {msg.userName.charAt(0)}
                            </div>
                            <div className="flex flex-col items-start gap-1">
                              <p className="text-xs font-medium text-slate-400 mb-0.5">{msg.userName}</p>
                              <div className="relative">
                                <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed border border-slate-800 shadow-sm">
                                  {msg.content}
                                  {msg.attachments && <AttachmentRenderer attachments={msg.attachments} />}
                                </div>
                                {/* Hover action bar */}
                                {isHovered && (
                                  <div className="absolute -top-7 left-0 flex gap-0.5 bg-slate-900 border border-slate-800 rounded-md shadow-sm px-1 py-0.5 z-10">
                                    <button
                                      onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                                      className="text-xs hover:bg-slate-800 rounded px-1 py-0.5"
                                      title="리액션"
                                    >
                                      😀
                                    </button>
                                    <button
                                      onClick={() => setThreadMessage(msg)}
                                      className="text-xs hover:bg-slate-800 rounded px-1 py-0.5"
                                      title="답글"
                                    >
                                      💬
                                    </button>
                                  </div>
                                )}
                                {/* Emoji picker */}
                                {showEmojiPicker === msg.id && (
                                  <div className="absolute -top-14 left-0 flex gap-0.5 bg-slate-900 border border-slate-800 rounded-md shadow-lg px-1.5 py-1 z-20">
                                    {EMOJI_LIST.map((e) => (
                                      <button
                                        key={e}
                                        onClick={() => toggleReaction(msg.id, e, msg.reactions?.some((r) => r.emoji === e && r.userIds.includes(user?.id || '')) || false)}
                                        className="text-sm hover:bg-slate-800 rounded px-1 py-0.5"
                                      >
                                        {e}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {/* Reaction badges */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {msg.reactions.map((r) => (
                                    <button
                                      key={r.emoji}
                                      onClick={() => toggleReaction(msg.id, r.emoji, r.userIds.includes(user?.id || ''))}
                                      className={`text-xs px-1.5 py-0.5 rounded-full border ${
                                        r.userIds.includes(user?.id || '')
                                          ? 'border-cyan-400/50 bg-cyan-400/10'
                                          : 'border-slate-700 hover:border-slate-600'
                                      }`}
                                    >
                                      {r.emoji} {r.count}
                                    </button>
                                  ))}
                                </div>
                              )}
                              {/* Reply count */}
                              {(msg.replyCount || 0) > 0 && (
                                <button
                                  onClick={() => setThreadMessage(msg)}
                                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                  {msg.replyCount}개 답글
                                </button>
                              )}
                              <span className="text-xs text-slate-500">{formatTime(msg.createdAt)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {typingAgent && (
                    <div className="flex items-center gap-2 px-2 py-1 text-xs text-slate-500">
                      <span className="animate-pulse">{typingAgent}이(가) 입력 중...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area — Stitch style: rounded full, attach + send */}
                <div
                  className={`p-4 shrink-0 ${dragOver ? 'bg-cyan-400/5 border-t border-cyan-400/30' : 'border-t border-slate-800'}`}
                  style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {showMention && filteredAgents.length > 0 && (
                    <div className="absolute bottom-full left-4 right-4 mb-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto w-64 z-10" data-testid="mention-popup">
                      {filteredAgents.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => handleMentionSelect(a.name)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-800 flex items-center gap-2 transition-colors"
                        >
                          <span className="text-cyan-400">@{a.name}</span>
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
                  <div className="max-w-4xl mx-auto relative flex items-center bg-slate-900 border border-slate-800 rounded-full shadow-sm pr-2 pl-4 py-2 focus-within:ring-1 focus-within:ring-cyan-400 focus-within:border-cyan-400 transition-all">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || pendingFiles.length >= 5}
                      className="text-slate-400 hover:text-cyan-400 transition-colors p-1 disabled:opacity-50"
                      title="파일 첨부 (최대 5개)"
                    >
                      <Paperclip className="w-5 h-5" />
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
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 text-slate-200 placeholder:text-slate-500 h-9"
                      data-testid="channel-message-input"
                    />
                    <button
                      onClick={handleSend}
                      disabled={(!newMessage.trim() && pendingFiles.length === 0) || sendMessage.isPending || uploading}
                      className="bg-cyan-400 hover:bg-cyan-400/90 text-slate-950 h-8 w-8 rounded-full flex items-center justify-center transition-colors ml-2 shrink-0 disabled:opacity-50"
                      data-testid="channel-send-btn"
                    >
                      <ArrowUp className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-[11px] text-slate-500">AI 에이전트가 생성한 정보는 부정확할 수 있습니다.</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Thread panel */}
          {threadMessage && selectedChannel && user && (
            <ThreadPanel
              channelId={selectedChannel}
              parentMessage={threadMessage}
              userId={user.id}
              onClose={() => setThreadMessage(null)}
            />
          )}
        </main>
      </div>

      {/* Channel settings modal */}
      {showSettings && selectedChannel && user && (
        <ChannelSettingsModal
          channelId={selectedChannel}
          userId={user.id}
          onlineUserIds={onlineUserIds}
          onClose={handleSettingsClose}
        />
      )}

      {/* Mention notification toast */}
      {mentionToast && (
        <div
          className="fixed bottom-4 right-4 bg-cyan-400 text-slate-950 px-4 py-3 rounded-lg shadow-lg cursor-pointer z-50 max-w-xs animate-in fade-in slide-in-from-bottom-2"
          onClick={() => {
            const chMatch = mentionToast.actionUrl.match(/channelId=([^&]+)/)
            if (chMatch) handleSelectChannel(chMatch[1])
            setMentionToast(null)
          }}
        >
          <p className="text-sm font-semibold">@멘션 알림</p>
          <p className="text-xs opacity-90 mt-0.5">{mentionToast.title}</p>
        </div>
      )}
    </>
  )
}
