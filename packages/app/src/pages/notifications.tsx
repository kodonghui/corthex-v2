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

  // 날짜 그룹핑
  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
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
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4" data-testid="notifications-page">
      <h1 className="text-xl font-semibold tracking-tight text-slate-50">알림</h1>

      <Tabs items={tabsWithCount} value={activeTab} onChange={setTab} />

      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* 필터 + 모두 읽음 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                }`}
                data-testid="filter-unread"
              >
                미확인만
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                data-testid="mark-all-read"
              >
                모두 읽음 ✓
              </button>
            )}
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
                <div className="space-y-1">
                  {items.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-0 ${
                        n.isRead
                          ? 'hover:bg-slate-800/50'
                          : 'bg-blue-950/20 hover:bg-blue-950/30'
                      }`}
                      data-testid={`notification-${n.id}`}
                    >
                      {/* 미읽음 인디케이터 */}
                      <div className="pt-1.5">
                        {!n.isRead ? (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        ) : (
                          <div className="w-2 h-2" />
                        )}
                      </div>
                      {/* 아이콘 */}
                      <span className="text-base leading-none pt-0.5">
                        {TYPE_ICON[n.type] || '🔔'}
                      </span>
                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${n.isRead ? 'text-slate-400' : 'text-slate-50 font-medium'}`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{n.body}</p>
                        )}
                      </div>
                      {/* 시간 */}
                      <span className="text-[11px] text-slate-500 whitespace-nowrap pt-0.5">
                        {timeAgo(n.createdAt)}
                      </span>
                    </button>
                  ))}
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
