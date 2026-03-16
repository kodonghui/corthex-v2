import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useWsStore } from '../stores/ws-store'
import { Tabs, Skeleton } from '@corthex/ui'
import type { TabItem } from '@corthex/ui'
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

const TYPE_ICON_COLOR: Record<string, { bg: string; text: string }> = {
  chat_complete: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  delegation_complete: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  tool_error: { bg: 'bg-amber-500/20', text: 'text-amber-500' },
  job_complete: { bg: 'bg-emerald-500/20', text: 'text-emerald-500' },
  job_error: { bg: 'bg-rose-500/20', text: 'text-rose-500' },
  system: { bg: 'bg-indigo-500/20', text: 'text-indigo-500' },
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  return `${day}일 전`
}

export function NotificationsPage() {
  const [activeTab, setTab] = useState('list')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [category, setCategory] = useState<'all' | 'task' | 'system' | 'alert'>('all')
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

  // WS 실시간 알림 수신
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

  // 카테고리 필터링
  const filteredNotifications = category === 'all'
    ? notifications
    : notifications.filter((n) => {
        const cat = TYPE_CATEGORY[n.type] || '알림'
        if (category === 'task') return cat === '작업'
        if (category === 'system') return cat === '시스템'
        return cat === '알림'
      })

  // 날짜 그룹핑
  const grouped = filteredNotifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.createdAt)
    ;(acc[group] ??= []).push(n)
    return acc
  }, {})

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id)
    if (n.actionUrl) navigate(n.actionUrl)
  }

  const tabsWithCount: TabItem[] = [
    { value: 'list', label: unreadCount > 0 ? `알림 목록 (${unreadCount})` : '알림 목록' },
    { value: 'settings', label: '알림 설정' },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-2xl mx-auto space-y-4" data-testid="notifications-page">
      {/* Header: mobile-optimized with "모두 읽음" right-aligned */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-50">알림</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-sm text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            data-testid="mark-all-read"
          >
            모두 읽음
          </button>
        )}
      </div>

      <Tabs items={tabsWithCount} value={activeTab} onChange={setTab} />

      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Category filter chips (mobile-scrollable) + read/unread filter */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {([
                { key: 'all' as const, label: '전체' },
                { key: 'task' as const, label: '작업' },
                { key: 'system' as const, label: '시스템' },
                { key: 'alert' as const, label: '알림' },
              ]).map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`shrink-0 h-8 px-4 rounded-full text-sm font-medium transition-colors ${
                    category === c.key
                      ? 'bg-cyan-400 text-slate-900'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 shrink-0">
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
          </div>

          {/* 알림 목록 */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg bg-slate-800" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
              <div className="p-8 text-center text-sm text-slate-500">
                {filter === 'unread' ? '미확인 알림이 없습니다' : '알림이 없습니다'}
              </div>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="text-xs font-semibold text-slate-500 mb-2">{group}</p>
                <div className="space-y-0">
                  {items.map((n) => {
                    const iconStyle = TYPE_ICON_COLOR[n.type] || { bg: 'bg-cyan-500/20', text: 'text-cyan-400' }
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleClick(n)}
                        className={`relative w-full text-left flex items-start gap-3 px-4 py-4 border-b border-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-0 ${
                          n.isRead
                            ? 'opacity-80 hover:bg-slate-800/50'
                            : 'bg-cyan-500/5 hover:bg-cyan-500/10'
                        }`}
                        data-testid={`notification-${n.id}`}
                      >
                        {/* Unread left border indicator */}
                        {!n.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r" />
                        )}
                        {/* Icon box */}
                        <div className={`flex items-center justify-center rounded-lg shrink-0 size-10 ${iconStyle.bg}`}>
                          <span className={`text-base leading-none ${iconStyle.text}`}>
                            {TYPE_ICON[n.type] || '🔔'}
                          </span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className={`text-sm truncate pr-2 flex items-center gap-2 ${
                              n.isRead
                                ? 'text-slate-300 font-semibold'
                                : 'text-slate-50 font-bold'
                            }`}>
                              {n.title}
                              {!n.isRead && <span className="size-2 rounded-full bg-cyan-400 inline-block shrink-0" />}
                            </p>
                            <span className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                              n.isRead ? 'text-slate-500' : 'text-cyan-400'
                            }`}>
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                          {n.body && (
                            <p className={`text-sm font-normal leading-snug line-clamp-2 ${
                              n.isRead ? 'text-slate-500' : 'text-slate-400'
                            }`}>{n.body}</p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'settings' && <NotificationSettings />}
    </div>
  )
}
