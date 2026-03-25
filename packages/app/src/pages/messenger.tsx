/**
 * Messenger Page - Sovereign Sage Theme (Phase 7-1 Rebuild)
 *
 * API Endpoints:
 *   GET    /workspace/messenger/channels                              - List channels
 *   POST   /workspace/messenger/channels                              - Create channel
 *   GET    /workspace/messenger/channels/:id                          - Channel detail
 *   PUT    /workspace/messenger/channels/:id                          - Update channel
 *   DELETE /workspace/messenger/channels/:id                          - Delete channel
 *   GET    /workspace/messenger/channels/:id/messages                 - List messages
 *   POST   /workspace/messenger/channels/:id/messages                 - Send message
 *   GET    /workspace/messenger/channels/:id/messages/:mid/thread     - Thread replies
 *   POST   /workspace/messenger/channels/:id/messages/:mid/reactions  - Add reaction
 *   DELETE /workspace/messenger/channels/:id/messages/:mid/reactions/:emoji - Remove reaction
 *   GET    /workspace/messenger/channels/:id/members                  - List members
 *   POST   /workspace/messenger/channels/:id/members                  - Add member
 *   DELETE /workspace/messenger/channels/:id/members/me               - Leave channel
 *   DELETE /workspace/messenger/channels/:id/members/:uid             - Remove member
 *   POST   /workspace/messenger/channels/:id/read                     - Mark read
 *   GET    /workspace/messenger/channels/unread                       - Unread counts
 *   GET    /workspace/messenger/search?q=                             - Search messages
 *   GET    /workspace/messenger/users                                 - List users
 *   GET    /workspace/messenger/online                                - Online user IDs
 *   GET    /workspace/agents                                          - AI agents
 *   POST   /workspace/files                                           - Upload file
 *   GET    /workspace/files/:id/download                              - Download file
 *   WS     messenger::{channelId}                                     - Real-time messages
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, MoreVertical, Plus, Video, Phone, Send, Smile, Paperclip, FileText, Download, Filter } from 'lucide-react'
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

const EMOJI_LIST = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F602}', '\u{1F62E}', '\u{1F44F}', '\u{1F525}']
const MAX_UPLOAD_SIZE = 52_428_800
const FILE_ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit' })
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// Demo conversation data matching Stitch design
const DEMO_CONVERSATIONS = [
  { id: '1', initials: 'ST', name: '전략팀 Strategy Team', preview: '시장 분석 결과를 공유합니다', time: '14:32', unread: 3, color: 'var(--color-corthex-accent-deep)', active: true },
  { id: '2', initials: 'SK', name: '김수호 Suho Kim', preview: '보고서 검토 완료했습니다', time: '14:15', unread: 1, color: 'var(--color-corthex-accent)' },
  { id: '3', initials: 'ST', name: '보안팀 Security Team', preview: '보안 감사 일정 확인', time: '13:45', unread: 0, color: 'var(--color-corthex-text-secondary)' },
  { id: '4', initials: 'DL', name: '이다은 Da-eun Lee', preview: '데이터 분석 진행상황...', time: '13:20', unread: 0, color: 'var(--color-corthex-accent-deep)' },
  { id: '5', initials: 'OP', name: '운영팀 Operations', preview: '시스템 점검 안내', time: '12:00', unread: 0, color: 'var(--color-corthex-accent)' },
  { id: '6', initials: 'YH', name: '한예진 Ye-jin Han', preview: '보안 패치 적용 완료', time: '11:30', unread: 0, color: '#908a78' },
  { id: '7', initials: 'TT', name: '트레이딩팀 Trading', preview: '오늘 포지션 리뷰', time: '10:45', unread: 0, color: 'var(--color-corthex-accent-deep)' },
]

const DEMO_MESSAGES = [
  { id: 'm1', sender: '김수호', initials: 'SK', color: 'var(--color-corthex-accent)', time: '14:02', content: '3월 시장 분석 리포트를 첨부합니다. 주요 포인트는 아래와 같습니다.', own: false },
  { id: 'm2', sender: '김수호', initials: 'SK', color: 'var(--color-corthex-accent)', time: '14:11', content: null, own: false, file: { name: '시장분석_2026Q1.pdf', size: '2.4 MB', type: 'PDF Document' } },
  { id: 'm3', sender: '이다은', initials: 'DL', color: 'var(--color-corthex-accent-deep)', time: '14:20', content: '분석 결과가 흥미롭네요. 경쟁사 대비 성장률이 12% 높습니다.', own: false },
  { id: 'm5', sender: '정민우', initials: 'MW', color: '#908a78', time: '14:28', content: '다음 미팅에서 세부 전략을 논의합시다. 화요일 2시 가능한가요?', own: false },
  { id: 'm6', sender: '나 (김수호)', initials: 'SK', color: 'var(--color-corthex-accent-deep)', time: '14:32', content: '좋습니다. 미팅 일정 확정하겠습니다. 참석자 명단 공유 부탁드립니다.', own: true },
]

export function MessengerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'conversations' ? 'conversations' : 'channels'

  const handleTabChange = (tab: 'channels' | 'conversations') => {
    setSearchParams(tab === 'channels' ? {} : { tab: 'conversations' })
  }

  const [activeConvId, setActiveConvId] = useState('1')
  const [mobileShowChat, setMobileShowChat] = useState(false)

  return (
    <div
      data-testid="messenger-page"
      className="flex h-[calc(100vh-64px)] overflow-hidden"
    >
      {/* Panel 1: Contact List (Active Nodes) */}
      <section className={`w-full md:w-80 border-r border-corthex-border flex-col bg-corthex-bg/30 shrink-0 ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 flex items-center justify-between border-b border-corthex-border/50">
          <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Active Nodes</h2>
          <Filter className="w-4 h-4 text-corthex-text-secondary" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {DEMO_CONVERSATIONS.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { setActiveConvId(conv.id); setMobileShowChat(true) }}
              className={`p-3 sm:p-4 flex gap-3 cursor-pointer group transition-colors min-h-[64px] ${
                activeConvId === conv.id
                  ? 'bg-corthex-surface/40 border-l-2 border-corthex-accent'
                  : 'hover:bg-corthex-surface/30 border-l-2 border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                  style={{ backgroundColor: conv.color }}
                >
                  {conv.initials}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-3 h-3 border-2 border-corthex-bg rounded-full"
                  style={{ backgroundColor: conv.unread > 0 ? '#22c55e' : '#57534e' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm truncate ${activeConvId === conv.id ? 'font-semibold text-corthex-text-primary' : 'font-medium text-corthex-text-secondary'}`}>
                    {conv.name}
                  </h3>
                  <span className="text-[10px] text-corthex-text-disabled ml-2 shrink-0">{conv.time}</span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <p className={`text-xs truncate ${activeConvId === conv.id ? 'text-corthex-accent/80' : 'text-corthex-text-disabled'}`}>
                    {conv.preview}
                  </p>
                  {conv.unread > 0 && (
                    <span className="ml-2 bg-corthex-accent text-corthex-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Panel 2: Conversation View */}
      <section className={`flex-1 flex-col bg-corthex-bg relative overflow-hidden ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--color-corthex-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-corthex-accent) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Chat Header */}
        <div className="h-16 border-b border-corthex-border/60 flex items-center justify-between px-4 md:px-6 bg-corthex-bg/50 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileShowChat(false)}
              className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-corthex-text-secondary hover:text-corthex-text-primary transition-colors -ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <div>
              <h2 className="text-sm font-bold tracking-wider text-corthex-text-primary uppercase">
                {DEMO_CONVERSATIONS.find((c) => c.id === activeConvId)?.name ?? 'NODE_ALPHA'}
              </h2>
              <p className="text-[10px] text-corthex-text-disabled uppercase tracking-tighter">Connection Stable • Ping: 14ms</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-corthex-border rounded-lg text-xs font-medium text-corthex-text-secondary hover:bg-corthex-surface transition-colors">
              <Video className="w-4 h-4" />
              <span>Secure Feed</span>
            </button>
            <button className="text-corthex-text-secondary hover:text-corthex-text-primary transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 relative z-10">
          <div className="flex justify-center">
            <span className="bg-corthex-surface/50 text-[10px] text-corthex-text-disabled px-3 py-1 rounded-full uppercase tracking-widest border border-corthex-border">
              Protocol Initiated - 14:00
            </span>
          </div>

          {DEMO_MESSAGES.map((msg) => {
            if (msg.own) {
              return (
                <div key={msg.id} className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
                  <div className="space-y-1 text-right">
                    <div className="flex items-baseline gap-2 justify-end">
                      <span className="text-[10px] text-corthex-text-disabled">{msg.time}</span>
                      <span className="text-xs font-bold text-corthex-text-secondary">ADMIN</span>
                    </div>
                    <div className="bg-corthex-accent/10 border border-corthex-accent/30 p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl">
                      <p className="text-sm text-corthex-accent leading-relaxed">{msg.content}</p>
                    </div>
                    <div className="flex justify-end gap-1 mt-1">
                      <span className="text-[10px] text-corthex-text-disabled uppercase">Delivered</span>
                    </div>
                  </div>
                </div>
              )
            }

            if (msg.file) {
              return (
                <div key={msg.id} className="flex gap-4 max-w-2xl">
                  <div
                    className="w-8 h-8 rounded border border-corthex-border mt-1 shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: msg.color }}
                  >
                    {msg.initials}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-corthex-accent">{msg.sender}</span>
                      <span className="text-[10px] text-corthex-text-disabled">{msg.time}</span>
                    </div>
                    <div className="mt-2 bg-corthex-surface/40 border border-corthex-border rounded-lg p-2 flex items-center gap-3 w-full sm:w-64 hover:bg-corthex-surface/60 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 bg-corthex-accent/20 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-corthex-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-corthex-text-primary truncate">{msg.file.name}</p>
                        <p className="text-[10px] text-corthex-text-disabled">{msg.file.size} • Encrypted</p>
                      </div>
                      <Download className="w-4 h-4 text-corthex-text-disabled group-hover:text-corthex-accent transition-colors" />
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div key={msg.id} className="flex gap-4 max-w-2xl">
                <div
                  className="w-8 h-8 rounded border border-corthex-border mt-1 shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: msg.color }}
                >
                  {msg.initials}
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-corthex-accent">{msg.sender}</span>
                    <span className="text-[10px] text-corthex-text-disabled">{msg.time}</span>
                  </div>
                  <div className="bg-corthex-surface/80 border border-corthex-border p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                    <p className="text-sm text-corthex-text-secondary leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator */}
          <div className="flex gap-4 items-center animate-pulse">
            <div className="text-[10px] text-corthex-accent font-mono">NODE IS COMPUTING...</div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-6 bg-corthex-bg relative z-10">
          <div className="bg-corthex-surface border border-corthex-border rounded-xl p-2 flex items-center gap-2 md:gap-3 focus-within:border-corthex-accent/50 transition-all">
            <button
              onClick={() => toast.info('이 기능은 준비 중입니다')}
              className="p-2 text-corthex-text-secondary hover:text-corthex-text-primary transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            <input
              className="flex-1 bg-transparent border-none text-base sm:text-sm text-corthex-text-primary focus:ring-0 placeholder:text-corthex-text-disabled min-h-[44px]"
              placeholder="Type command or message..."
              type="text"
            />
            <div className="flex items-center gap-1">
              <button className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-corthex-text-secondary hover:text-corthex-text-primary transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-corthex-text-secondary hover:text-corthex-text-primary transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-corthex-border mx-1" />
              <button
                onClick={() => toast.info('이 기능은 준비 중입니다')}
                className="p-2 min-h-[44px] min-w-[44px] bg-corthex-accent hover:bg-corthex-accent-deep text-corthex-bg rounded-lg transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-between items-center mt-3 px-1">
            <div className="flex gap-3">
              <span className="text-[10px] text-corthex-text-disabled uppercase font-mono tracking-tight">Terminal: Active</span>
              <span className="text-[10px] text-corthex-text-disabled uppercase font-mono tracking-tight">Level: 4 Clearance</span>
            </div>
            <span className="text-[10px] text-corthex-text-disabled font-mono">Ctrl + Enter to dispatch</span>
          </div>
        </div>
      </section>
    </div>
  )
}
