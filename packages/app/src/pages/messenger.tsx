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
import { Search, MoreVertical, ArrowUp, Paperclip, ArrowLeft, Plus, Video, Phone, Send, Smile, FileText, Download } from 'lucide-react'
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
  { id: '1', initials: 'ST', name: '전략팀 Strategy Team', preview: '시장 분석 결과를 공유합니다', time: '14:32', unread: 3, color: '#283618', active: true },
  { id: '2', initials: 'SK', name: '김수호 Suho Kim', preview: '보고서 검토 완료했습니다', time: '14:15', unread: 1, color: '#606C38' },
  { id: '3', initials: 'ST', name: '보안팀 Security Team', preview: '보안 감사 일정 확인', time: '13:45', unread: 0, color: '#6b705c' },
  { id: '4', initials: 'DL', name: '이다은 Da-eun Lee', preview: '데이터 분석 진행상황...', time: '13:20', unread: 0, color: '#283618' },
  { id: '5', initials: 'OP', name: '운영팀 Operations', preview: '시스템 점검 안내', time: '12:00', unread: 0, color: '#606C38' },
  { id: '6', initials: 'YH', name: '한예진 Ye-jin Han', preview: '보안 패치 적용 완료', time: '11:30', unread: 0, color: '#908a78' },
  { id: '7', initials: 'TT', name: '트레이딩팀 Trading', preview: '오늘 포지션 리뷰', time: '10:45', unread: 0, color: '#283618' },
  { id: '8', initials: 'JP', name: '박지훈 Ji-hun Park', preview: '트레이딩 전략 논의', time: '09:30', unread: 0, color: '#606C38' },
  { id: '9', initials: 'RT', name: '리서치팀 Research', preview: 'Q1 보고서 초안', time: '어제', unread: 0, color: '#908a78' },
]

const DEMO_MESSAGES = [
  { id: 'm1', sender: '김수호', initials: 'SK', color: '#606C38', time: '14:10', content: '3월 시장 분석 리포트를 첨부합니다. 주요 포인트는 아래와 같습니다.', own: false },
  { id: 'm2', sender: '김수호', initials: 'SK', color: '#606C38', time: '14:11', content: null, own: false, file: { name: '시장분석_2026Q1.pdf', size: '2.4 MB', type: 'PDF Document' } },
  { id: 'm3', sender: '이다은', initials: 'DL', color: '#283618', time: '14:20', content: '분석 결과가 흥미롭네요. 경쟁사 대비 성장률이 12% 높습니다.', own: false },
  { id: 'm4', sender: '최서연', initials: 'SY', color: '#6b705c', time: '14:25', content: '리서치팀에서 추가 데이터를 보완할 수 있을 것 같습니다.', own: false },
  { id: 'm5', sender: '정민우', initials: 'MW', color: '#908a78', time: '14:28', content: '다음 미팅에서 세부 전략을 논의합시다. 화요일 2시 가능한가요?', own: false },
  { id: 'm6', sender: '나 (김수호)', initials: 'SK', color: '#283618', time: '14:32', content: '좋습니다. 미팅 일정 확정하겠습니다. 참석자 명단 공유 부탁드립니다.', own: true },
]

export function MessengerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'conversations' ? 'conversations' : 'channels'

  const handleTabChange = (tab: 'channels' | 'conversations') => {
    setSearchParams(tab === 'channels' ? {} : { tab: 'conversations' })
  }

  return (
    <div className="min-h-screen flex" data-testid="messenger-page" style={{ backgroundColor: '#faf8f5' }}>
      <div className="p-8 max-w-[1440px] mx-auto flex-1 flex gap-6">
        {/* LEFT PANEL: Conversation List */}
        <aside className="w-[380px] flex flex-col bg-corthex-elevated rounded-2xl overflow-hidden shadow-sm border border-corthex-border">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold tracking-tight text-corthex-text-primary">
                메신저 <span className="text-corthex-text-secondary font-medium">Messenger</span>
              </h1>
              <button
                onClick={() => toast.info('이 기능은 준비 중입니다')}
                className="bg-corthex-accent text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-corthex-accent-deep transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>새 대화 New Chat</span>
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-corthex-text-secondary" />
              <input
                className="w-full bg-corthex-elevated border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-corthex-accent/20 transition-all placeholder:text-corthex-text-secondary"
                placeholder="검색 Search..."
                type="text"
              />
            </div>
          </div>
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-3 pb-6">
            {DEMO_CONVERSATIONS.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center gap-4 p-4 mb-1 rounded-xl cursor-pointer transition-all ${
                  conv.active ? 'bg-corthex-elevated' : 'hover:bg-corthex-elevated/50'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg shrink-0"
                  style={{ backgroundColor: conv.color }}
                >
                  {conv.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-sm truncate ${conv.active ? 'font-bold' : 'font-medium'}`}>{conv.name}</h3>
                    <span className="font-mono text-[10px] text-corthex-text-secondary">{conv.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-corthex-text-secondary truncate pr-4">{conv.preview}</p>
                    {conv.unread > 0 && (
                      <span className="bg-corthex-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT PANEL: Message Thread */}
        <main className="flex-1 flex flex-col bg-corthex-surface rounded-2xl shadow-sm overflow-hidden border border-corthex-border">
          {/* Thread Header */}
          <header className="h-20 flex items-center justify-between px-8 bg-corthex-elevated/50 backdrop-blur-md sticky top-0 z-10 border-b border-corthex-border">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-corthex-accent-deep text-white flex items-center justify-center font-bold shadow-lg shadow-corthex-accent-deep/10">
                ST
              </div>
              <div>
                <h2 className="text-lg font-bold text-corthex-text-primary">전략팀 Strategy Team</h2>
                <p className="text-xs text-corthex-text-secondary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-corthex-accent" />
                  5명 참여중
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-full text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-full text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-corthex-border mx-1" />
              <button className="p-2.5 rounded-full text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Message Thread Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-corthex-surface">
            {DEMO_MESSAGES.map((msg) => {
              if (msg.own) {
                return (
                  <div key={msg.id} className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="w-9 h-9 rounded-lg bg-corthex-accent-deep text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                      {msg.initials}
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="flex items-baseline justify-end gap-2">
                        <span className="font-mono text-[10px] text-corthex-text-secondary">{msg.time}</span>
                        <span className="text-xs font-bold text-corthex-accent">{msg.sender}</span>
                      </div>
                      <div className="bg-corthex-accent text-white p-4 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl text-sm leading-relaxed shadow-lg shadow-corthex-accent/10">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              }

              if (msg.file) {
                return (
                  <div key={msg.id} className="flex gap-4 max-w-[80%]">
                    <div className="w-9 h-9 opacity-0 shrink-0" />
                    <div className="space-y-1 w-full">
                      <div className="bg-corthex-elevated p-4 rounded-2xl border border-corthex-border flex items-center gap-4 hover:border-corthex-accent/30 transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-corthex-surface flex items-center justify-center text-corthex-accent group-hover:bg-corthex-accent group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold truncate">{msg.file.name}</p>
                          <p className="font-mono text-[10px] text-corthex-text-secondary">{msg.file.size} - {msg.file.type}</p>
                        </div>
                        <Download className="w-5 h-5 text-corthex-text-secondary group-hover:text-corthex-accent transition-colors" />
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="font-mono text-[10px] text-corthex-text-secondary">{msg.time}</span>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={msg.id} className="flex gap-4 max-w-[80%]">
                  <div
                    className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-sm shrink-0 mt-1"
                    style={{ backgroundColor: msg.color }}
                  >
                    {msg.initials}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold">{msg.sender}</span>
                      <span className="font-mono text-[10px] text-corthex-text-secondary">{msg.time}</span>
                    </div>
                    <div className="bg-corthex-elevated p-4 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl text-sm leading-relaxed text-corthex-text-primary">
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Message Input Area */}
          <footer className="p-6 bg-corthex-elevated/30 border-t border-corthex-border">
            <div className="max-w-4xl mx-auto flex items-end gap-3 bg-corthex-surface border border-corthex-border p-2 rounded-2xl focus-within:ring-2 focus-within:ring-corthex-accent/10 transition-all">
              <button className="p-2 rounded-xl text-corthex-text-secondary hover:text-corthex-accent hover:bg-corthex-elevated transition-all">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl text-corthex-text-secondary hover:text-corthex-accent hover:bg-corthex-elevated transition-all">
                <Smile className="w-5 h-5" />
              </button>
              <textarea
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2.5 resize-none"
                placeholder="메시지를 입력하세요... Enter message"
                rows={1}
              />
              <button className="bg-corthex-accent-deep text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-corthex-accent-deep/90 transition-all active:scale-90 shadow-md">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex justify-center">
              <p className="text-[10px] text-corthex-text-secondary font-mono uppercase tracking-widest">Sovereign Sage v3.0 // Secured Protocol Active</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
