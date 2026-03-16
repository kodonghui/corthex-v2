// API Endpoints:
// GET   /workspace/notifications?limit=100&filter=unread
// GET   /workspace/notifications/count
// PATCH /workspace/notifications/:id/read
// POST  /workspace/notifications/read-all

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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

const TYPE_CATEGORY: Record<string, string> = {
  chat_complete: '작업',
  delegation_complete: '작업',
  tool_error: '시스템',
  job_complete: '작업',
  job_error: '시스템',
  system: '시스템',
}

const TYPE_ICON_STYLE: Record<string, { bg: string; dot: string; label: string }> = {
  chat_complete: { bg: 'rgba(90,114,71,0.08)', dot: '#e57373', label: 'Agent' },
  delegation_complete: { bg: 'rgba(90,114,71,0.08)', dot: '#e57373', label: 'Agent' },
  tool_error: { bg: 'rgba(245,158,11,0.08)', dot: '#f59e0b', label: 'System Alert' },
  job_complete: { bg: 'rgba(16,185,129,0.08)', dot: '#10b981', label: 'Agent' },
  job_error: { bg: 'rgba(239,68,68,0.08)', dot: '#ef4444', label: 'Error' },
  system: { bg: 'rgba(139,92,246,0.08)', dot: '#8b5cf6', label: 'System' },
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
      <div
        className="max-w-[800px] mx-auto w-full px-4 py-6 min-h-screen"
        style={{ backgroundColor: '#fcfbf9', fontFamily: "'Inter', sans-serif" }}
        data-testid="notifications-page"
      >
        <div className="flex items-center justify-between mb-6 px-4">
          <h1 className="text-[28px] font-bold leading-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>알림 설정</h1>
          <button
            onClick={() => setShowSettings(false)}
            className="flex items-center justify-center rounded-lg h-9 px-4 text-sm font-medium hover:opacity-70 transition-colors"
            style={{ backgroundColor: '#f2f0e9', color: '#6a5d43' }}
          >
            목록으로
          </button>
        </div>
        <NotificationSettings />
      </div>
    )
  }

  return (
    <div
      className="max-w-[800px] mx-auto w-full flex flex-col flex-1 px-4 py-5 min-h-screen"
      style={{ backgroundColor: '#fcfbf9', fontFamily: "'Inter', sans-serif" }}
      data-testid="notifications-page"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 mb-4">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>알림</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 text-sm font-semibold leading-normal tracking-[0.015em] hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#e57373', color: '#ffffff' }}
              data-testid="mark-all-read"
            >
              <span className="truncate">모두 읽음</span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center rounded-lg h-9 w-9 transition-colors hover:opacity-70"
            style={{ color: '#9c8d66' }}
            title="알림 설정"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="pb-3">
        <div className="flex border-b px-4 gap-8" style={{ borderColor: '#e8e4d9' }}>
          {([
            { key: 'all' as const, label: '전체' },
            { key: 'system' as const, label: '시스템' },
            { key: 'agent' as const, label: '에이전트' },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex flex-col items-center justify-center pb-[13px] pt-4 transition-colors"
              style={activeTab === t.key
                ? { borderBottom: '2px solid #e57373', color: '#463e30', fontWeight: 600 }
                : { borderBottom: '2px solid transparent', color: '#9c8d66', fontWeight: 500 }
              }
            >
              <p className="text-sm leading-normal tracking-[0.015em]">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Read/Unread filter */}
      <div className="flex gap-1.5 px-4 mb-4">
        <button
          onClick={() => setFilter('all')}
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          style={filter === 'all'
            ? { backgroundColor: 'rgba(90,114,71,0.15)', color: '#e57373' }
            : { backgroundColor: '#f2f0e9', color: '#9c8d66' }
          }
          data-testid="filter-all"
        >
          전체
        </button>
        <button
          onClick={() => setFilter('unread')}
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          style={filter === 'unread'
            ? { backgroundColor: 'rgba(90,114,71,0.15)', color: '#e57373' }
            : { backgroundColor: '#f2f0e9', color: '#9c8d66' }
          }
          data-testid="filter-unread"
        >
          미확인
        </button>
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3 px-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" style={{ backgroundColor: '#f2f0e9' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4">
          <div className="bg-white border rounded-2xl" style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}>
            <div className="p-8 text-center text-sm" style={{ color: '#9c8d66' }}>
              {filter === 'unread' ? '미확인 알림이 없습니다' : '알림이 없습니다'}
            </div>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([group, items], groupIdx) => (
          <div key={group}>
            <h3
              className="text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2"
              style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30', paddingTop: groupIdx === 0 ? '24px' : '8px' }}
            >
              {group}
            </h3>
            <div className="flex flex-col gap-2 px-4 pb-6">
              {items.map((n) => {
                const iconStyle = TYPE_ICON_STYLE[n.type] || { bg: 'rgba(90,114,71,0.08)', dot: '#e57373', label: 'Alert' }
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className="relative flex gap-4 rounded-2xl p-4 transition-all text-left w-full focus:outline-none"
                    style={{
                      backgroundColor: n.isRead ? '#ffffff' : 'rgba(90,114,71,0.03)',
                      border: n.isRead ? '1px solid #e8e4d9' : '1px solid rgba(90,114,71,0.2)',
                      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                    }}
                    data-testid={`notification-${n.id}`}
                  >
                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#e57373' }} />
                    )}
                    <div className="flex items-start gap-4 w-full ml-2">
                      {/* Icon */}
                      <div
                        className="flex items-center justify-center rounded-full shrink-0 w-10 h-10"
                        style={{ backgroundColor: iconStyle.bg }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: iconStyle.dot }} />
                      </div>
                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p
                            className="text-base leading-normal truncate pr-2"
                            style={{
                              color: n.isRead ? '#6a5d43' : '#463e30',
                              fontWeight: n.isRead ? 500 : 600,
                            }}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs font-mono font-medium leading-normal shrink-0 ml-4 mt-1" style={{ color: '#9c8d66' }}>{formatTimeShort(n.createdAt)}</p>
                        </div>
                        <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: iconStyle.dot }}>{iconStyle.label}</p>
                        {n.body && (
                          <p
                            className="text-sm font-normal leading-relaxed line-clamp-2"
                            style={{ color: n.isRead ? '#9c8d66' : '#6a5d43' }}
                          >
                            {n.body}
                          </p>
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
