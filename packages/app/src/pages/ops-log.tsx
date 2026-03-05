import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useWsStore } from '../stores/ws-store'
import { FilterChip, TimelineGroup, Input } from '@corthex/ui'
import type { TimelineItem } from '@corthex/ui'

type ActivityLog = {
  id: string
  eventId: string
  type: string
  phase: string
  actorType: string
  actorId: string | null
  actorName: string | null
  action: string
  detail: string | null
  metadata: unknown
  createdAt: string
}

type Summary = {
  today: { type: string; count: number }[]
  week: { type: string; count: number }[]
}

type LogPage = { data: ActivityLog[]; nextCursor: string | null }

const TYPE_LABELS: Record<string, string> = {
  chat: '채팅',
  delegation: '위임',
  tool_call: '도구호출',
  job: '야간작업',
  sns: 'SNS',
  error: '오류',
  system: '시스템',
  login: '로그인',
}

const TYPE_ICONS: Record<string, string> = {
  chat: '💬',
  delegation: '🔀',
  tool_call: '🔧',
  job: '📋',
  sns: '📢',
  error: '❌',
  system: '⚙️',
  login: '🔑',
}

const PHASE_DOT: Record<string, string> = {
  start: 'bg-yellow-400 animate-pulse',
  end: 'bg-green-400',
  error: 'bg-red-400',
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function OpsLogPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const { subscribe, addListener, removeListener, isConnected } = useWsStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [realtimeLogs, setRealtimeLogs] = useState<ActivityLog[]>([])
  const [newLogCount, setNewLogCount] = useState(0)
  const isAtTopRef = useRef(true)
  const subscribedRef = useRef(false)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // URL 기반 필터 (복수 선택)
  const activeFilters = useMemo(() => {
    const f = searchParams.get('filter')
    return f ? new Set(f.split(',')) : new Set<string>()
  }, [searchParams])

  const toggleFilter = useCallback((type: string) => {
    const next = new Set(activeFilters)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    if (next.size === 0) {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ filter: Array.from(next).join(',') }, { replace: true })
    }
  }, [activeFilters, setSearchParams])

  // Infinite query
  const {
    data: logsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['activity-log', debouncedSearch],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '50' })
      if (pageParam) params.set('cursor', pageParam)
      if (debouncedSearch) params.set('search', debouncedSearch)
      return api.get<LogPage>(`/workspace/activity-log?${params}`)
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  })

  const { data: summaryData } = useQuery({
    queryKey: ['activity-log-summary'],
    queryFn: () => api.get<{ data: Summary }>('/workspace/activity-log/summary'),
  })

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // WebSocket 실시간 구독
  useEffect(() => {
    if (!isConnected) {
      subscribedRef.current = false
      return
    }

    if (!subscribedRef.current) {
      subscribe('activity-log', {})
      subscribedRef.current = true
    }

    const handler = (data: unknown) => {
      const event = data as { type: string; log: ActivityLog }
      if (event.type === 'new-log' && event.log) {
        setRealtimeLogs((prev) => [event.log, ...prev].slice(0, 200))
        if (!isAtTopRef.current) {
          setNewLogCount((n) => n + 1)
        }
        queryClient.invalidateQueries({ queryKey: ['activity-log-summary'] })
      }
    }

    addListener('activity-log', handler)
    return () => removeListener('activity-log', handler)
  }, [isConnected, subscribe, addListener, removeListener, queryClient])

  // 스크롤 위치 추적
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    isAtTopRef.current = el.scrollTop < 50
    if (isAtTopRef.current && newLogCount > 0) {
      setNewLogCount(0)
    }
  }, [newLogCount])

  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setNewLogCount(0)
  }, [])

  // 로그 합치기: REST pages + 실시간 (중복 제거)
  const allLogs = useMemo(() => {
    const restLogs = logsData?.pages?.flatMap((p) => p?.data ?? []) ?? []
    const seenIds = new Set(restLogs.map((l) => l.id))
    const unique = [...realtimeLogs.filter((l) => !seenIds.has(l.id)), ...restLogs]
    return unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [logsData, realtimeLogs])

  // start/end 쌍 매칭
  const mergedLogs = useMemo(() => {
    const endByEvent = new Map<string, ActivityLog>()
    const merged = new Set<string>()

    for (const log of allLogs) {
      if ((log.phase === 'end' || log.phase === 'error') && log.eventId) {
        endByEvent.set(log.eventId, log)
      }
    }

    const result: (ActivityLog & { endLog?: ActivityLog; durationMs?: number })[] = []

    for (const log of allLogs) {
      if (merged.has(log.id)) continue

      if (log.phase === 'start' && log.eventId) {
        const endLog = endByEvent.get(log.eventId)
        if (endLog) {
          const diff = new Date(endLog.createdAt).getTime() - new Date(log.createdAt).getTime()
          if (diff < 3000) {
            merged.add(endLog.id)
            result.push({ ...log, endLog, durationMs: diff })
            continue
          }
        }
      }

      result.push(log)
    }

    return result
  }, [allLogs])

  // 필터 적용
  const filteredLogs = useMemo(() => {
    if (activeFilters.size === 0) return mergedLogs
    return mergedLogs.filter((l) => activeFilters.has(l.type))
  }, [mergedLogs, activeFilters])

  // 날짜 그룹
  const groupedLogs = useMemo(() => {
    const groups: { label: string; logs: typeof filteredLogs }[] = []
    let currentGroup = ''
    for (const log of filteredLogs) {
      const group = getDateGroup(log.createdAt)
      if (group !== currentGroup) {
        currentGroup = group
        groups.push({ label: group, logs: [] })
      }
      groups[groups.length - 1].logs.push(log)
    }
    return groups
  }, [filteredLogs])

  const summary = summaryData?.data

  // 바 차트용 최대값 계산
  const maxCount = useMemo(() => {
    if (!summary) return 1
    const all = [...(summary.today || []), ...(summary.week || [])]
    return Math.max(1, ...all.map((s) => Number(s.count)))
  }, [summary])

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-4 md:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">작전일지</h2>
          <span className={`text-xs flex items-center gap-1.5 ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            {isConnected ? '실시간 ON' : '재연결 중...'}
          </span>
        </div>
      </div>

      {/* 요약 바 차트 */}
      {summary && (
        <div className="px-4 md:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-8">
            <SummaryChart label="오늘" data={summary.today} maxCount={maxCount} />
            <SummaryChart label="이번주" data={summary.week} maxCount={maxCount} />
          </div>
        </div>
      )}

      {/* 검색 + 필터 칩 */}
      <div className="px-4 md:px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 space-y-2">
        <Input
          placeholder="로그 검색 (action, detail)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="text-xs h-8"
        />
        <div className="flex gap-2 flex-wrap overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <FilterChip
            label="전체"
            active={activeFilters.size === 0}
            onClick={() => setSearchParams({}, { replace: true })}
          />
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <FilterChip
              key={key}
              label={label}
              icon={TYPE_ICONS[key]}
              active={activeFilters.has(key)}
              onClick={() => toggleFilter(key)}
            />
          ))}
        </div>
      </div>

      {/* 새 로그 배너 */}
      {newLogCount > 0 && (
        <button
          onClick={scrollToTop}
          className="mx-4 md:mx-6 mt-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 text-center hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
        >
          ↑ 새로운 활동 {newLogCount}건 — 클릭하여 확인
        </button>
      )}

      {/* 타임라인 */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 [-webkit-overflow-scrolling:touch]"
      >
        {filteredLogs.length === 0 && (
          <p className="text-sm text-zinc-400 text-center mt-8">
            {debouncedSearch ? `"${debouncedSearch}" 검색 결과가 없습니다` : '활동 로그가 없습니다.'}
          </p>
        )}

        {groupedLogs.map((group) => (
          <TimelineGroup
            key={group.label}
            label={group.label}
            items={group.logs.map((log): TimelineItem => ({
              id: log.id,
              dotColor: log.endLog
                ? PHASE_DOT[log.endLog.phase] || PHASE_DOT.end
                : PHASE_DOT[log.phase] || 'bg-zinc-400',
              content: (
                <div
                  className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{TYPE_ICONS[log.type] || '📌'}</span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {log.action}
                    </span>
                    {log.endLog && log.durationMs != null && (
                      <span className="text-[10px] text-green-600 dark:text-green-400">
                        ✅ {log.durationMs < 1000 ? `${log.durationMs}ms` : `${(log.durationMs / 1000).toFixed(1)}초`}
                      </span>
                    )}
                    {!log.endLog && log.phase === 'start' && (
                      <span className="text-[10px] text-yellow-600 dark:text-yellow-400 animate-pulse">
                        ⏳ 진행 중...
                      </span>
                    )}
                    {log.phase === 'error' && !log.endLog && (
                      <span className="text-[10px] text-red-600 dark:text-red-400">
                        ❌ 실패
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>{log.actorName || (log.actorType === 'system' ? '시스템' : '')}</span>
                    {log.detail && (
                      <>
                        <span>·</span>
                        <span className="truncate">{log.detail}</span>
                      </>
                    )}
                  </div>

                  <div className="text-[10px] text-zinc-400 mt-1">
                    {formatTime(log.createdAt)}
                    {log.endLog && ` → ${formatTime(log.endLog.createdAt)}`}
                  </div>

                  {/* 확장 상세 */}
                  {expandedId === log.id && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      {log.detail && (
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-1 whitespace-pre-wrap">{log.detail}</p>
                      )}
                      {log.metadata != null && (
                        <pre className="text-[10px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 rounded p-2 overflow-x-auto max-h-40">
                          {JSON.stringify(log.metadata as Record<string, unknown>, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        ))}

        {/* 무한스크롤 센티널 */}
        <div ref={sentinelRef} className="h-4" />
        {isFetchingNextPage && (
          <p className="text-xs text-zinc-400 text-center py-4">더 불러오는 중...</p>
        )}
      </div>
    </div>
  )
}

/** 간단한 바 차트 — CSS 기반 */
function SummaryChart({ label, data, maxCount }: { label: string; data: { type: string; count: number }[]; maxCount: number }) {
  if (data.length === 0) {
    return (
      <div>
        <span className="text-xs text-zinc-500 block mb-1">{label}</span>
        <span className="text-xs text-zinc-400">-</span>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0">
      <span className="text-xs text-zinc-500 block mb-1.5">{label}</span>
      <div className="space-y-1">
        {data.map((s) => (
          <div key={s.type} className="flex items-center gap-2">
            <span className="text-[10px] w-5 shrink-0">{TYPE_ICONS[s.type]}</span>
            <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.max(4, (Number(s.count) / maxCount) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 w-6 text-right">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
