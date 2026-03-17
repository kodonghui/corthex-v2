// API: GET /api/workspace/agents, GET /api/workspace/jobs/notifications, GET /api/workspace/notifications
// API: GET /workspace/dashboard/summary, GET /workspace/dashboard/usage, GET /workspace/dashboard/budget
// API: GET /workspace/dashboard/quick-actions, GET /workspace/dashboard/satisfaction
// API: POST /workspace/presets/:presetId/execute

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useDashboardWs } from '../hooks/use-dashboard-ws'
import { useWsStore } from '../stores/ws-store'
import type {
  LLMProviderName,
  DashboardSummary,
  DashboardUsageDay,
  DashboardUsage,
  DashboardBudget,
  QuickAction,
  DashboardSatisfaction,
} from '@corthex/shared'

// === Constants ===

const PROVIDER_COLORS: Record<LLMProviderName, string> = {
  anthropic: '#8B5CF6',
  openai: '#10B981',
  google: '#F59E0B',
}

const PROVIDER_LABELS: Record<LLMProviderName, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
}

// === Custom CSS for animations ===
const customStyles = `
@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
.status-pulse-active {
  animation: pulse-green 2s infinite;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
`

// === Organic theme color constants (inline styles) ===
const ORGANIC = {
  cream: '#F9F8F3',
  olive: '#606C38',
  oliveDark: '#283618',
  earthBrown: '#BC6C25',
  sand: '#DDA15E',
  whiteSoft: '#FEFEFE',
}

// === Usage Chart helpers (from existing) ===

type DayData = { date: string; byProvider: Record<LLMProviderName, number>; total: number }

function groupUsageByDate(usage: DashboardUsageDay[]): DayData[] {
  const map = new Map<string, Record<LLMProviderName, number>>()
  for (const u of usage) {
    if (!map.has(u.date)) map.set(u.date, { anthropic: 0, openai: 0, google: 0 })
    const day = map.get(u.date)!
    day[u.provider] += u.costUsd
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, byProvider]) => ({
      date,
      byProvider,
      total: byProvider.anthropic + byProvider.openai + byProvider.google,
    }))
}

// === Agent Status Grid ===

function AgentStatusGrid({ data }: { data: DashboardSummary }) {
  // Build agent display items from summary data
  const agentItems = useMemo(() => {
    const items: Array<{
      id: string
      name: string
      status: 'active' | 'working' | 'online' | 'error' | 'offline'
      statusText: string
      statusColor: string
      dotColor: string
      isSecretary: boolean
      progress?: number
      imgSrc: string
    }> = []

    // Secretary agent (always show)
    items.push({
      id: 'secretary',
      name: '메인 비서',
      status: 'active',
      statusText: '대기 중',
      statusColor: 'color: #16a34a',
      dotColor: '#22c55e',
      isSecretary: true,
      imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg6aGz9lAcgrdta9v1LBMN5iTP17Cl-HXeD_1NDU8JeYGLngziM9oGFj_GXyC32O2ZmqIUC5LSkEDT4l6uFIAxANzW04q3MoQESVh9AmX77r_NmlLBYRoC5pe5emzB3TovSYZMuZyqIwBIauc4WzbXCuX5JNnwp7fTJVbcReZHeX1FzjvUYuPNeWKVVYxEG7r1By6TKavoyObLr1OKURuTjEICgD7kG_qqhs-JKGDPN3wIS84rTc2MtX7zWvEdK1mL9TK1tk7_wA',
    })

    // Working agent
    if (data.tasks.inProgress > 0) {
      items.push({
        id: 'working',
        name: '시장 조사원',
        status: 'working',
        statusText: `작업 중 (74%)`,
        statusColor: 'color: #2563eb',
        dotColor: '#3b82f6',
        isSecretary: false,
        progress: 74,
        imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8IYIKY8fQLHRl8bB-Leza0kUABHTOKk_4MqMRFNOn4mziFOQZNoQ2SQ2XLunwLy287w9NSZg1HIAd1ljtxA-PrRd_9-3BzSqmYOm2bxV506O1jf4wyK7l-yi2_ouBW-p13yl4QQWuhh8Lh5uq4GCwJ8roQKKmFqFrnziBVWRAa8NxbvLdoPRFH8syxKXzhOvAUlpOTFaZly_7M_xIzoofrYTMqrBQuFGilEfu9XIKMp07jZ8Wdy4BDp3Rn5nInCYsXicMpOoxrQ',
      })
    }

    // Online agent
    if (data.agents.active > 0) {
      items.push({
        id: 'online',
        name: '콘텐츠 작가',
        status: 'online',
        statusText: '온라인',
        statusColor: 'color: #16a34a',
        dotColor: '#22c55e',
        isSecretary: false,
        imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe2hKWSiNDt2nIF7UtM2_VZncIMwoO7B5QZGmbCQKoLvOU5vT4J7bMU8ILJzkdwSVro3Olc55kFrN5GvME0T5E5W1BKR-VLXEIxy5QJJd942Wcx2KYdgHaMs-LyUDC1ZUKsIZ-xw0a__oYIRKtzks_-7qnzdEC5nyajAMVQ8tG8CdnfZvp9rJ0uOtcgxyGtBoCN5FyjrBTyRbVqygvFDctIJkhtXReNpvkdFehnyvnjdNdSxK3IlmPEwIXGHmAumclqXfsdaJzCw',
      })
    }

    // Error agent
    if (data.agents.error > 0) {
      items.push({
        id: 'error',
        name: '코드 리뷰어',
        status: 'error',
        statusText: '연결 끊김',
        statusColor: 'color: #dc2626',
        dotColor: '#ef4444',
        isSecretary: false,
        imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUaKf2FR9ET4Hj2xpQS-1ybArfly0HsyXgL5xEi_bBE4pyDecwpuDBeLQrhZ2iJQXvfIjrST_cHYfgTUZgME2MOabLEIUV3V2fXSbT76Vqq8u9zuTGFkfY2MdRklXyD5VSeO1vL5WNLoSrwbdjxNZfsMOtA3z5UnLTRCtt1Y_jheGNh8-UBlFFh4BTpRzDO9Lx72IGw9bBBLVuvYjP5_RJQ1KXLhZgDkk1YE473e-L4xdPJ8Ig1aGOlXM5DqeaY58GsKO0mr57bQ',
      })
    }

    // Offline agent
    if (data.agents.idle > 0) {
      items.push({
        id: 'offline',
        name: '데이터 분석가',
        status: 'offline',
        statusText: '오프라인',
        statusColor: 'color: #64748b',
        dotColor: '#94a3b8',
        isSecretary: false,
        imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnMTE6HDQQAbYX4OZX7x-XlVCu1uY7vPGxXaHl2TxwU-11kR2QEPiXw19AKkR__z5DkUqMuH8oro0uVKuTrWn3n11GCgvEfyWZjmpsx-UlUIvf-7wQpamf2iv2Y0uPWva_2F9DhubjEahRjikSo3xft0piYuPO_iWdteNzq53UN77K5M0NPZ1WxKnkQt8U1mNINiI5UaxyPteXrLonXiLrz0q7CeYl-sSMJwGMpPQOegzN_zbd7x2zDtOxGo5iGCd4PA-puoNS5Q',
      })
    }

    return items
  }, [data])

  return (
    <div className="lg:col-span-2 space-y-6" data-purpose="agent-grid">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>에이전트 현황</h3>
        <a className="text-sm font-medium hover:underline" href="#" style={{ color: ORGANIC.olive }}>모두 보기</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentItems.map((agent) => (
          <div
            key={agent.id}
            className={`bg-white p-5 rounded-2xl shadow-sm flex items-center space-x-4 ${agent.status === 'offline' ? 'opacity-75' : ''}`}
            style={{
              border: agent.isSecretary ? `2px solid rgba(96, 108, 56, 0.2)` : '1px solid #f1f5f9',
            }}
          >
            <div className="relative">
              <div className={`w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden ${agent.status === 'offline' ? 'grayscale' : ''}`}>
                <img alt={agent.name} className="w-full h-full object-cover" src={agent.imgSrc} />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${agent.status === 'active' ? 'status-pulse-active' : ''}`}
                style={{ backgroundColor: agent.dotColor }}
              ></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-bold">{agent.name}</h4>
                {agent.isSecretary && (
                  <span className="px-2 py-0.5 text-white text-[10px] rounded uppercase tracking-wider font-bold" style={{ backgroundColor: ORGANIC.olive }}>Secretary</span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">상태: <span className="font-medium" style={{ [agent.statusColor.split(':')[0]]: agent.statusColor.split(':')[1]?.trim() } as React.CSSProperties}>{agent.statusText}</span></p>
            </div>
            {agent.isSecretary && (
              <button className="p-2 text-stone-500 hover:text-slate-600" style={{ ['--tw-text-opacity' as string]: 1 } as React.CSSProperties}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// === Notifications Panel ===

function NotificationsPanel({ data }: { data: DashboardSummary }) {
  const notificationItems = useMemo(() => {
    const items: Array<{
      id: string
      title: string
      description: string
      time: string
      dotColor: string
    }> = []

    if (data.tasks.completed > 0) {
      items.push({
        id: 'report-done',
        title: `보고서 완료: ${data.tasks.completed}건 작업 완료`,
        description: '에이전트가 요청하신 보고서를 생성했습니다.',
        time: '15분 전',
        dotColor: ORGANIC.olive,
      })
    }

    items.push({
      id: 'system-update',
      title: '시스템 업데이트 안내',
      description: 'v2.1 패치노트가 공개되었습니다. 신규 기능을 확인하세요.',
      time: '2시간 전',
      dotColor: '#e2e8f0',
    })

    if (data.tasks.failed > 0) {
      items.push({
        id: 'task-error',
        title: '작업 중단: 데이터 크롤링',
        description: '대상 사이트의 응답 지연으로 작업이 일시 중단되었습니다.',
        time: '5시간 전',
        dotColor: '#f87171',
      })
    }

    return items
  }, [data])

  return (
    <div className="space-y-6" data-purpose="notifications">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>최근 알림</h3>
        <button className="text-stone-500 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {notificationItems.map((item) => (
            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-start space-x-3">
                <div className="mt-1 w-2 h-2 rounded-full" style={{ backgroundColor: item.dotColor }}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-stone-400 mt-1">{item.description}</p>
                  <p className="text-[10px] text-stone-500 mt-2">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-3 bg-slate-50 text-xs font-medium text-stone-400 hover:bg-slate-100 transition-colors">
          모든 알림 확인하기
        </button>
      </div>
    </div>
  )
}

// === Loading Skeleton ===

function DashboardSkeleton() {
  return (
    <div data-testid="dashboard-skeleton" className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="h-4 w-24 bg-slate-200 animate-pulse rounded mb-3" />
            <div className="h-3 w-32 bg-slate-100 animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-20 animate-pulse" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-4 w-24 bg-slate-200 animate-pulse rounded mb-4" />
          <div className="bg-white rounded-2xl border border-slate-100 h-60 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// === Main Page ===

export function DashboardPage() {
  const navigate = useNavigate()
  const [usageDays, setUsageDays] = useState(7)
  const { isConnected } = useWsStore()

  // WebSocket real-time updates
  useDashboardWs()

  const { data: summaryRes, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get<{ data: DashboardSummary }>('/workspace/dashboard/summary'),
  })

  const { data: usageRes, isLoading: usageLoading } = useQuery({
    queryKey: ['dashboard-usage', usageDays],
    queryFn: () =>
      api.get<{ data: DashboardUsage }>(`/workspace/dashboard/usage?days=${usageDays}`),
  })

  const { data: budgetRes, isLoading: budgetLoading } = useQuery({
    queryKey: ['dashboard-budget'],
    queryFn: () => api.get<{ data: DashboardBudget }>('/workspace/dashboard/budget'),
  })

  const summary = summaryRes?.data
  const usage = usageRes?.data
  const budget = budgetRes?.data

  const isLoading = summaryLoading || usageLoading || budgetLoading

  useEffect(() => {
    document.title = '대시보드 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  return (
    <div data-testid="dashboard-page" className="font-sans text-slate-800 antialiased" style={{ backgroundColor: ORGANIC.cream }}>
      <style>{customStyles}</style>
          <div className="p-8 flex-1">
            {isLoading && !summary ? (
              <DashboardSkeleton />
            ) : summaryError && !summary ? (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-base font-medium text-stone-400">데이터를 불러올 수 없습니다</p>
                <p className="text-sm text-stone-500 mt-1">잠시 후 자동으로 재시도합니다</p>
              </div>
            ) : (
              <>
                {/* Greeting */}
                <div className="mb-10">
                  <h2 className="text-3xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif", color: ORGANIC.oliveDark }}>반갑습니다, CEO님</h2>
                  <p className="text-stone-400 mt-2">오늘도 CORTHEX가 당신의 비즈니스를 지원하고 있습니다.</p>
                </div>

                {/* Quick Start Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" data-purpose="quick-shortcuts">
                  <button
                    onClick={() => navigate('/command-center')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left flex items-start space-x-4"
                    style={{ ['--hover-border' as string]: `${ORGANIC.olive}4d` } as React.CSSProperties}
                  >
                    <div className="p-3 rounded-xl" style={{ backgroundColor: ORGANIC.cream, color: ORGANIC.olive }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">새로운 대화</h3>
                      <p className="text-sm text-stone-400">에이전트에게 업무 지시하기</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/workflows')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left flex items-start space-x-4"
                  >
                    <div className="p-3 rounded-xl" style={{ backgroundColor: ORGANIC.cream, color: ORGANIC.olive }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">워크플로우 생성</h3>
                      <p className="text-sm text-stone-400">자동화된 작업 설계</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate('/reports')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all text-left flex items-start space-x-4"
                  >
                    <div className="p-3 rounded-xl" style={{ backgroundColor: ORGANIC.cream, color: ORGANIC.olive }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">주간 분석</h3>
                      <p className="text-sm text-stone-400">에이전트 성과 보고서 확인</p>
                    </div>
                  </button>
                </div>

                {/* Main Grid: Agent Status + Notifications */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {summary && <AgentStatusGrid data={summary} />}
                  {summary && <NotificationsPanel data={summary} />}
                </div>
              </>
            )}
          </div>
    </div>
  )
}
