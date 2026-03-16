import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bot, AlertTriangle, AlertCircle, ArrowLeftRight } from 'lucide-react'
import { api } from '../lib/api'
import { useWsStore } from '../stores/ws-store'
import { Skeleton } from '@corthex/ui'
import { NotificationSettings } from '../components/notification-settings'

type Notification = {
  id: string
  type: string
  title: string
  body: string | null
  actionUrl: string | null
  isRead: boolean
  createdAt: string
}

const TYPE_ICON: Record<string, string> = {
  chat_complete: '🔔',
  delegation_complete: '🤖',
  tool_error: '⚠️',
  job_complete: '✅',
  job_error: '❌',
  system: '⚙️',
}

const TYPE_ICON_COLOR: Record<string, { bg: string; text: string; LucideIcon?: typeof Bot }> = {
  chat_complete: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', LucideIcon: Bot },
  delegation_complete: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', LucideIcon: Bot },
  tool_error: { bg: 'bg-amber-500/10', text: 'text-amber-500', LucideIcon: AlertTriangle },
  job_complete: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', LucideIcon: Bot },
  job_error: { bg: 'bg-red-500/10', text: 'text-red-500', LucideIcon: AlertCircle },
  system: { bg: 'bg-violet-500/10', text: 'text-violet-500', LucideIcon: ArrowLeftRight },
}

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  chat_complete: { label: 'Agent', color: 'text-cyan-400' },
  delegation_complete: { label: 'Agent', color: 'text-cyan-400' },
  tool_error: { label: 'System Alert', color: 'text-amber-500' },
  job_complete: { label: 'Agent', color: 'text-cyan-400' },
  job_error: { label: 'Network', color: 'text-red-500' },
  system: { label: 'System', color: 'text-violet-500' },
}

const TYPE_CATEGORY: Record<string, string> = {
  chat_complete: '작업',
  delegation_complete: '작업',
  tool_error: '시스템',
  job_complete: '작업',
  job_error: '시스템',
  system: '시스템',
}

function getDateGroup(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const logDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (logDate.getTime() === today.getTime()) return '오늘'
  if (logDate.getTime() === yesterday.getTime()) return '어제'
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function formatTimeShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function NotificationsPage() {
  const [activeTab, setTab] = useState<'all' | 'system' | 'agent'>('all')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [showSettings, setShowSettings] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () =>
      api.get<{ data: Notification[] }>(
        `/workspace/notifications?limit=100${filter === 'unread' ? '&filter=unread' : ''}`,
      ),
  })

  const { data: countData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get<{ data: { unread: number } }>('/workspace/notifications/count'),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch<{ data: { success: boolean } }>(`/workspace/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
    },
  })

  const markAllRead = useMutation({
    mutationFn: () => api.post<{ data: { success: boolean } }>('/workspace/notifications/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] })
    },
  })

  // WS real-time notifications
  useEffect(() => {
    if (!isConnected) return
    subscribe('notifications', {})

    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    }

    let userId: string | null = null
    try {
      const raw = localStorage.getItem('corthex_user')
      if (raw) userId = JSON.parse(raw).id
    } catch { /* corrupted localStorage */ }
    if (!userId) return

    const channelKey = `notifications::${userId}`
    addListener(channelKey, handler)
    return () => removeListener(channelKey, handler)
  }, [isConnected, subscribe, addListener, removeListener, queryClient])

  const notifications = data?.data ?? []
  const unreadCount = countData?.data?.unread ?? 0

  // Category filtering
  const filteredNotifications = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => {
        const cat = TYPE_CATEGORY[n.type] || '알림'
        if (activeTab === 'system') return cat === '시스템'
        if (activeTab === 'agent') return cat === '작업'
        return true
      })

  // Date grouping
  const grouped = filteredNotifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.createdAt)
    ;(acc[group] ??= []).push(n)
    return acc
  }, {})

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id)
    if (n.actionUrl) navigate(n.actionUrl)
  }

  if (showSettings) {
    return (
      <div className="max-w-[800px] mx-auto w-full px-4 py-6" data-testid="notifications-page">
        <div className="flex items-center justify-between mb-6 px-4">
          <h1 className="text-slate-50 tracking-tight text-[32px] font-bold leading-tight">알림 설정</h1>
          <button
            onClick={() => setShowSettings(false)}
            className="flex items-center justify-center rounded-lg h-9 px-4 bg-slate-800 text-slate-400 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            목록으로
          </button>
        </div>
        <NotificationSettings />
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto w-full flex flex-col flex-1 px-4 py-5" data-testid="notifications-page">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 mb-4">
        <h1 className="text-slate-50 tracking-tight text-[32px] font-bold leading-tight">알림</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-cyan-400 text-slate-950 text-sm font-semibold leading-normal tracking-[0.015em] hover:bg-cyan-400/90 transition-colors"
              data-testid="mark-all-read"
            >
              <span className="truncate">모두 읽음</span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center rounded-lg h-9 px-3 text-slate-400 hover:text-slate-50 transition-colors"
          >
            설정
          </button>
        </div>
      </div>

      {/* Tabs: matching Stitch design */}
      <div className="pb-3">
        <div className="flex border-b border-slate-800 px-4 gap-8">
          {([
            { key: 'all' as const, label: '전체' },
            { key: 'system' as const, label: '시스템' },
            { key: 'agent' as const, label: '에이전트' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                activeTab === t.key
                  ? 'border-b-cyan-400 text-slate-50'
                  : 'border-b-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <p className={`text-sm leading-normal tracking-[0.015em] ${activeTab === t.key ? 'font-semibold' : 'font-medium'}`}>{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Read/Unread filter */}
      <div className="flex gap-1.5 px-4 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-cyan-400/20 text-cyan-400'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
          }`}
          data-testid="filter-all"
        >
          전체
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-cyan-400/20 text-cyan-400'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
          }`}
          data-testid="filter-unread"
        >
          미확인
        </button>
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3 px-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl">
            <div className="p-8 text-center text-sm text-slate-500">
              {filter === 'unread' ? '미확인 알림이 없습니다' : '알림이 없습니다'}
            </div>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <h3 className="text-slate-50 text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">{group}</h3>
            <div className="flex flex-col gap-2 px-4 pb-6">
              {items.map((n) => {
                const iconStyle = TYPE_ICON_COLOR[n.type] || { bg: 'bg-cyan-500/10', text: 'text-cyan-400' }
                const labelStyle = TYPE_LABEL[n.type] || { label: 'Alert', color: 'text-cyan-400' }
                const IconComponent = iconStyle.LucideIcon || Bot
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`relative flex gap-4 rounded-xl p-4 transition-colors text-left w-full focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-0 ${
                      n.isRead
                        ? 'bg-slate-900 border border-slate-800 hover:bg-slate-800/50'
                        : 'bg-cyan-400/[0.05] border border-cyan-400/20 hover:bg-slate-800/50'
                    }`}
                    data-testid={`notification-${n.id}`}
                  >
                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                    <div className="flex items-start gap-4 w-full ml-2">
                      {/* Icon */}
                      <div className={`flex items-center justify-center rounded-full shrink-0 size-10 ${iconStyle.bg}`}>
                        <IconComponent className={`w-5 h-5 ${iconStyle.text}`} />
                      </div>
                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-base leading-normal truncate pr-2 ${n.isRead ? 'text-slate-300 font-medium' : 'text-slate-50 font-semibold'}`}>
                            {n.title}
                          </p>
                          <p className="text-slate-400 text-xs font-mono font-medium leading-normal shrink-0 ml-4 mt-1">{formatTimeShort(n.createdAt)}</p>
                        </div>
                        <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${labelStyle.color}`}>{labelStyle.label}</p>
                        {n.body && (
                          <p className={`text-sm font-normal leading-relaxed line-clamp-2 ${n.isRead ? 'text-slate-500' : 'text-slate-300'}`}>{n.body}</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
