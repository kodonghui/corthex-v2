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
import {
  CheckCircle, AlertTriangle, XCircle, Info, ArrowLeftRight,
  Search, CheckCheck, Settings, Clock, ArrowLeft, History,
} from 'lucide-react'

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

const TYPE_ICON_STYLE: Record<string, { bg: string; dot: string; label: string; icon: 'success' | 'warning' | 'error' | 'info' | 'handoff' | 'system' }> = {
  chat_complete: { bg: 'rgba(96,108,56,0.10)', dot: 'var(--color-corthex-accent)', label: 'Agent', icon: 'success' },
  delegation_complete: { bg: 'rgba(124,58,237,0.10)', dot: '#7c3aed', label: 'Handoff', icon: 'handoff' },
  tool_error: { bg: 'rgba(180,83,9,0.10)', dot: '#b45309', label: 'System Alert', icon: 'warning' },
  job_complete: { bg: 'rgba(96,108,56,0.10)', dot: 'var(--color-corthex-accent)', label: 'Agent', icon: 'success' },
  job_error: { bg: 'rgba(220,38,38,0.10)', dot: '#dc2626', label: 'Error', icon: 'error' },
  system: { bg: 'rgba(37,99,235,0.10)', dot: '#2563eb', label: 'System', icon: 'info' },
}

const FILTER_CHIPS = [
  { key: 'all' as const, label: 'All' },
  { key: 'unread' as const, label: 'Unread' },
]

const TAB_CHIPS = [
  { key: 'all' as const, label: 'All' },
  { key: 'agent' as const, label: 'Tasks' },
  { key: 'system' as const, label: 'System' },
]

function getDateGroup(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const logDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (logDate.getTime() === today.getTime()) return 'Today'
  if (logDate.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function formatTimeShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ko', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function NotificationIcon({ type }: { type: string }) {
  const style = TYPE_ICON_STYLE[type]
  const iconType = style?.icon ?? 'info'
  const cls = 'w-5 h-5'
  switch (iconType) {
    case 'success': return <CheckCircle className={cls} />
    case 'warning': return <AlertTriangle className={cls} />
    case 'error': return <XCircle className={cls} />
    case 'handoff': return <ArrowLeftRight className={cls} />
    case 'system': return <Info className={cls} />
    default: return <Info className={cls} />
  }
}

export function NotificationsPage() {
  const [activeTab, setTab] = useState<'all' | 'system' | 'agent'>('all')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [showSettings, setShowSettings] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
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
  const categoryFiltered = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => {
        const cat = TYPE_CATEGORY[n.type] || '알림'
        if (activeTab === 'system') return cat === '시스템'
        if (activeTab === 'agent') return cat === '작업'
        return true
      })

  // Search filtering
  const filteredNotifications = searchQuery.trim()
    ? categoryFiltered.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.body && n.body.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categoryFiltered

  const selectedNotification = selectedId
    ? notifications.find(n => n.id === selectedId) ?? null
    : null

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead.mutate(n.id)
    setSelectedId(n.id)
  }

  const handleNavigate = (n: Notification) => {
    if (n.actionUrl) navigate(n.actionUrl)
  }

  // Settings view
  if (showSettings) {
    return (
      <div
        className="bg-corthex-bg min-h-screen font-sans text-corthex-text-primary antialiased"
        data-testid="notifications-page"
      >
        <div className="p-8 max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-extrabold tracking-tighter text-corthex-accent-deep uppercase">Notification Settings</h1>
            <button
              onClick={() => setShowSettings(false)}
              className="flex items-center gap-2 px-4 py-2 text-corthex-accent-deep font-mono text-xs uppercase tracking-widest hover:bg-corthex-elevated transition-colors rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to list
            </button>
          </div>
          <NotificationSettings />
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-corthex-bg min-h-screen font-sans text-corthex-text-primary antialiased"
      data-testid="notifications-page"
    >
      <div className="p-8 max-w-[1440px] mx-auto min-h-screen flex flex-col">
        {/* HEADER SECTION */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-corthex-accent-deep uppercase">Notification Center</h1>
            <p className="text-corthex-text-secondary mt-2 font-medium">CORTHEX System Alerts &amp; Updates</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-2 px-4 py-2 text-corthex-accent-deep font-mono text-xs uppercase tracking-widest hover:bg-corthex-elevated transition-colors rounded-lg"
                data-testid="mark-all-read"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 text-corthex-text-secondary font-mono text-xs uppercase tracking-widest hover:bg-corthex-elevated transition-colors rounded-lg"
              title="Notification settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* FILTER BAR */}
        <nav className="mb-8 flex flex-wrap items-center justify-between gap-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {TAB_CHIPS.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setTab(chip.key)}
                className={`rounded-full px-5 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  activeTab === chip.key
                    ? 'bg-corthex-accent text-white shadow-sm'
                    : 'bg-corthex-elevated text-corthex-text-secondary hover:bg-corthex-border'
                }`}
              >
                {chip.label}
              </button>
            ))}
            <div className="w-px h-5 bg-corthex-border mx-1" />
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`rounded-full px-5 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  filter === chip.key
                    ? 'bg-corthex-accent text-white shadow-sm'
                    : 'bg-corthex-elevated text-corthex-text-secondary hover:bg-corthex-border'
                }`}
                data-testid={`filter-${chip.key}`}
              >
                {chip.label}
                {chip.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px]">({unreadCount})</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-corthex-text-secondary px-3 py-1 bg-corthex-bg rounded-lg border border-corthex-border/30">
            <Search className="w-4 h-4 text-corthex-text-secondary/60" />
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs font-mono w-48 p-0 placeholder:text-corthex-text-secondary/40 text-corthex-text-primary"
              placeholder="Filter alerts..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </nav>

        {/* MASTER-DETAIL LAYOUT */}
        <main className="flex-1 flex flex-col lg:flex-row gap-0 bg-corthex-bg rounded-2xl overflow-hidden shadow-2xl shadow-corthex-accent-deep/5 ring-1 ring-corthex-border/30">
          {/* LIST PANEL (LEFT) */}
          <section className="lg:w-[60%] flex flex-col border-r border-corthex-border/30">
            <div className="p-4 bg-corthex-elevated text-[10px] font-mono uppercase tracking-[0.2em] text-corthex-text-secondary/60 flex justify-between">
              <span>Active Stream</span>
              <span>{filteredNotifications.length} Records Found</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[700px]">
              {isLoading ? (
                <div className="space-y-0">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-5 border-b border-corthex-border/10">
                      <Skeleton className="h-16 rounded-xl" style={{ backgroundColor: 'var(--color-corthex-elevated)' }} />
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm text-corthex-text-secondary">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const iconStyle = TYPE_ICON_STYLE[n.type] || { bg: 'rgba(96,108,56,0.10)', dot: 'var(--color-corthex-accent)', label: 'Alert', icon: 'info' as const }
                  const isSelected = selectedId === n.id
                  const borderColor = iconStyle.icon === 'error' ? '#dc2626'
                    : iconStyle.icon === 'handoff' ? '#7c3aed'
                    : iconStyle.icon === 'warning' ? '#b45309'
                    : 'transparent'

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`group relative flex items-start gap-4 p-5 transition-all cursor-pointer border-b border-corthex-border/10 ${
                        isSelected
                          ? 'bg-corthex-border/60'
                          : n.isRead
                            ? 'hover:bg-corthex-elevated/60'
                            : 'bg-corthex-surface/40 hover:bg-corthex-elevated'
                      }`}
                      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
                      data-testid={`notification-${n.id}`}
                    >
                      {/* Icon bubble */}
                      <div
                        className="flex-shrink-0 mt-1 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: iconStyle.bg, color: iconStyle.dot }}
                      >
                        <NotificationIcon type={n.type} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`text-sm text-corthex-text-primary ${n.isRead ? 'font-medium' : 'font-bold'}`}>
                            {n.title}
                          </h3>
                          <span className="font-mono text-[10px] text-corthex-text-secondary/50 shrink-0 ml-2">
                            {formatTimeShort(n.createdAt)}
                          </span>
                        </div>
                        {n.body && (
                          <p className="text-xs text-corthex-text-secondary/70 line-clamp-1 mb-2">{n.body}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <span
                            className="font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                            style={{ backgroundColor: iconStyle.bg, color: iconStyle.dot }}
                          >
                            {iconStyle.label}
                          </span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: iconStyle.dot }} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* DETAIL PANEL (RIGHT) */}
          <section className="lg:w-[40%] flex flex-col bg-corthex-bg/30">
            <div className="p-4 bg-corthex-elevated text-[10px] font-mono uppercase tracking-[0.2em] text-corthex-text-secondary/60">
              Inspection Detail
            </div>
            {selectedNotification ? (
              <>
                <div className="p-8 flex-1 overflow-y-auto">
                  {/* Detail Header */}
                  <div className="mb-8">
                    {(() => {
                      const style = TYPE_ICON_STYLE[selectedNotification.type] || { bg: 'rgba(96,108,56,0.10)', dot: 'var(--color-corthex-accent)', label: 'Alert', icon: 'info' as const }
                      return (
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                          style={{ backgroundColor: style.bg, color: style.dot }}
                        >
                          <NotificationIcon type={selectedNotification.type} />
                          <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                            {style.label} // {selectedNotification.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      )
                    })()}
                    <h2 className="text-2xl font-bold tracking-tight text-corthex-text-primary mb-2">
                      {selectedNotification.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-mono text-corthex-text-secondary/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeShort(selectedNotification.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        {selectedNotification.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>

                  {/* Detail Content */}
                  <div className="space-y-8">
                    {selectedNotification.body && (
                      <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary/50 mb-3">
                          Message Content
                        </h4>
                        <div
                          className="p-4 bg-corthex-elevated rounded-xl border-l-2"
                          style={{ borderLeftColor: (TYPE_ICON_STYLE[selectedNotification.type] || { dot: 'var(--color-corthex-accent)' }).dot }}
                        >
                          <p className="text-sm leading-relaxed text-corthex-text-primary/80">
                            {selectedNotification.body}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-corthex-elevated rounded-xl">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary/50 mb-2">Type</h4>
                        <p className="text-sm font-bold text-corthex-text-primary">{selectedNotification.type.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] font-mono text-corthex-text-secondary/60">{TYPE_CATEGORY[selectedNotification.type] || 'Alert'}</p>
                      </div>
                      <div className="p-4 bg-corthex-elevated rounded-xl">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary/50 mb-2">Created</h4>
                        <p className="text-sm font-bold text-corthex-text-primary">{getDateGroup(selectedNotification.createdAt)}</p>
                        <p className="text-[10px] font-mono text-corthex-text-secondary/60">{formatTimeShort(selectedNotification.createdAt)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6">
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary/50 mb-4">
                        Available Actions
                      </h4>
                      <div className="flex flex-col gap-3">
                        {selectedNotification.actionUrl && (
                          <button
                            onClick={() => handleNavigate(selectedNotification)}
                            className="w-full py-4 bg-corthex-accent text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-corthex-accent-deep transition-all active:scale-[0.98]"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Open Related Page
                          </button>
                        )}
                        {!selectedNotification.isRead && (
                          <button
                            onClick={() => markRead.mutate(selectedNotification.id)}
                            className="w-full py-4 bg-corthex-border text-corthex-text-primary font-bold rounded-xl border border-corthex-border flex items-center justify-center gap-2 hover:bg-corthex-elevated transition-all active:scale-[0.98]"
                          >
                            <CheckCheck className="w-5 h-5" />
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Detail Footer */}
                <div className="p-6 bg-corthex-elevated/50 border-t border-corthex-border/20">
                  <button className="flex items-center gap-2 text-xs font-mono text-corthex-text-secondary/50 hover:text-corthex-text-primary transition-colors">
                    <History className="w-4 h-4" />
                    View Event History Logs
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-corthex-elevated flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-corthex-text-secondary/30" />
                  </div>
                  <p className="text-sm text-corthex-text-secondary/60 font-medium">Select a notification to view details</p>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* FOOTER STATUS */}
        <footer className="mt-8 flex justify-between items-center px-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-corthex-accent" />
              <span className="font-mono text-[10px] text-corthex-text-secondary/50 uppercase tracking-widest">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-corthex-text-secondary/50 uppercase tracking-widest">
                {unreadCount} unread
              </span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-corthex-text-secondary/30">
            CORTHEX NOTIFICATION ENGINE // ASYNC_QUEUE_ACTIVE
          </div>
        </footer>
      </div>
    </div>
  )
}
