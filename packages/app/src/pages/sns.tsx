/**
 * SNS Page - Sovereign Sage Theme (Phase 7-1 Rebuild)
 *
 * API Endpoints:
 *   GET  /workspace/sns-accounts       - Fetch linked SNS accounts
 *   GET  /workspace/agents             - Fetch AI agents list
 *   GET  /workspace/sns/stats?days=N   - Fetch SNS statistics
 *   (Tab components use additional endpoints)
 */
import { useCallback, useState } from 'react'
import { toast } from '@corthex/ui'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Bot, Heart, Share2, BarChart2, SlidersHorizontal, Pencil, Trash2, Globe,
} from 'lucide-react'
import { api } from '../lib/api'
import { ContentTab } from '../components/sns/content-tab'
import { QueueTab } from '../components/sns/queue-tab'
import { CardNewsTab } from '../components/sns/card-news-tab'
import { StatsTab } from '../components/sns/stats-tab'
import { AccountsTab } from '../components/sns/accounts-tab'
import type { SnsAccount, Agent } from '../components/sns/sns-types'

const TAB_ITEMS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'drafts', label: 'Drafts' },
]

const FILTER_CHIPS = ['전체 All', '공지 Notice', '업데이트 Update', '토론 Discussion', '성과 Achievement']

// Stats summary for mobile bottom card
function MobileStatsSummary() {
  const { data: statsData } = useQuery({
    queryKey: ['sns-stats', 7],
    queryFn: () => api.get<{ data: { total: number; byStatus: Array<{ status: string; count: number }>; byPlatform: Array<{ platform: string; total: number; published: number }> } }>('/workspace/sns/stats?days=7'),
  })

  const stats = statsData?.data
  if (!stats || stats.total === 0) return null

  const publishedCount = stats.byStatus.find((s) => s.status === 'published')?.count ?? 0

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-corthex-elevated via-corthex-elevated to-transparent pt-12 z-10 pointer-events-none">
      <div className="bg-corthex-surface rounded-xl shadow-lg border border-corthex-border p-4 pointer-events-auto">
        <h3 className="text-xs font-semibold text-corthex-text-secondary uppercase tracking-wider mb-3">This Week</h3>
        <div className="flex justify-between items-center divide-x divide-corthex-border">
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-corthex-text-primary font-mono tabular-nums">{publishedCount}</span>
            <span className="text-[10px] text-corthex-text-secondary mt-1">Published</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold font-mono tabular-nums text-corthex-accent">{stats.total}</span>
            <span className="text-[10px] text-corthex-text-secondary mt-1">Total Content</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-corthex-text-primary font-mono tabular-nums">{stats.byPlatform.length}</span>
            <span className="text-[10px] text-corthex-text-secondary mt-1">Platforms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo post data matching Stitch design
const DEMO_POSTS = [
  {
    id: 'p1',
    author: 'Suho Kim',
    badge: 'Strategy Team',
    badgeBg: 'var(--color-corthex-accent-deep)',
    badgeText: 'white',
    timeAgo: '2023-11-24 14:00:00',
    content: 'Q1 시장 분석 보고서가 완성되었습니다. 경쟁사 대비 성장률 12% 달성! 자세한 내용은 리포트를 확인해주세요. #Q1Analysis #Growth',
    reactions: [
      { emoji: '\u{1F44D}', count: 1200 },
      { emoji: '\u{2764}\u{FE0F}', count: 428 },
      { emoji: '\u{1F44F}', count: 8500 },
    ],
    isSystem: false,
    status: 'READY',
  },
  {
    id: 'p2',
    author: 'System Bot',
    badge: '공지',
    badgeBg: '#2563eb',
    badgeText: 'white',
    timeAgo: '2023-11-25 09:15:00',
    content: 'Join the community town hall this Friday. We\'re discussing the future of neural-link integrations and the upcoming SDK 5.0 release.',
    tags: ['#DevLog', '#Corthex'],
    reactions: [
      { emoji: '\u{1F44D}', count: 24 },
      { emoji: '\u{1F525}', count: 8 },
    ],
    isSystem: true,
    status: 'QUEUEING',
  },
  {
    id: 'p3',
    author: 'Da-eun Lee',
    badge: 'Analysis Team',
    badgeBg: 'var(--color-corthex-accent)',
    badgeText: 'white',
    timeAgo: '2023-11-20 18:30:00',
    content: '새로운 데이터 파이프라인 구축 완료! 처리 속도가 기존 대비 40% 향상되었습니다. 팀원들의 노력에 감사드립니다. #Hiring #ProtocolEngineering',
    reactions: [
      { emoji: '\u{1F44F}', count: 3400 },
      { emoji: '\u{1F525}', count: 1100 },
      { emoji: '\u{2764}\u{FE0F}', count: 14200 },
    ],
    isSystem: false,
    status: 'PUBLISHED',
  },
]

export function SnsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'scheduled'
  const [activeFilter, setActiveFilter] = useState(FILTER_CHIPS[0])

  const setTab = useCallback((t: string) => {
    setSearchParams({ tab: t }, { replace: true })
  }, [setSearchParams])

  const { data: accountsData } = useQuery({
    queryKey: ['sns-accounts'],
    queryFn: () => api.get<{ data: SnsAccount[] }>('/workspace/sns-accounts'),
  })

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const { data: statsData } = useQuery({
    queryKey: ['sns-stats', 7],
    queryFn: () => api.get<{ data: { total: number; byStatus: Array<{ status: string; count: number }>; byPlatform: Array<{ platform: string; total: number; published: number }> } }>('/workspace/sns/stats?days=7'),
  })

  const accounts = accountsData?.data || []
  const agents = agentsData?.data || []
  const stats = statsData?.data
  const queueCount = stats?.byStatus.find((s) => s.status === 'scheduled')?.count ?? DEMO_POSTS.length
  const publishedCount = stats?.byStatus.find((s) => s.status === 'published')?.count ?? 0

  return (
    <div data-testid="sns-page" className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-corthex-surface border border-corthex-border p-3 md:p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-corthex-text-disabled font-bold">Total Reach</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-corthex-text-primary">{stats ? `${stats.total}` : '—'}</span>
            <span className="text-xs font-mono" style={{ color: '#22c55e' }}>+12.4%</span>
          </div>
        </div>
        <div className="bg-corthex-surface border border-corthex-border p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-corthex-text-disabled font-bold">Engagement Rate</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-corthex-text-primary">4.82%</span>
            <span className="text-xs text-corthex-accent flex items-center font-mono">STABLE</span>
          </div>
        </div>
        <div className="bg-corthex-surface border border-corthex-border p-4 rounded-xl flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-corthex-text-disabled font-bold">Queue Size</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-corthex-text-primary">{queueCount}</span>
            <span className="text-xs text-corthex-text-disabled font-mono">{stats?.byPlatform.length ?? 0} PLATFORMS</span>
          </div>
        </div>
        <div className="bg-corthex-surface border border-corthex-border p-4 rounded-xl flex flex-col gap-3 relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-widest text-corthex-text-disabled font-bold">Peak Engagement</span>
          <div className="flex gap-1 h-8 items-end">
            {[20, 40, 100, 60, 30].map((h, i) => (
              <div
                key={i}
                className={`w-full rounded-t-sm transition-all ${i === 2 ? 'bg-corthex-accent' : 'bg-corthex-border'}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-corthex-text-secondary text-center font-mono">EST: 19:45:00 UTC</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-corthex-surface/20 p-2 rounded-lg border border-corthex-border/40">
        <div className="flex p-1 bg-corthex-bg rounded-md border border-corthex-border">
          {TAB_ITEMS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-4 py-2 md:py-1.5 text-xs font-bold rounded transition-colors min-h-[44px] ${
                tab === t.value
                  ? 'bg-corthex-surface text-corthex-accent shadow-sm'
                  : 'text-corthex-text-disabled hover:text-corthex-text-secondary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-corthex-text-disabled">SORT_BY: TIME_DESC</span>
          <button className="p-1.5 rounded border border-corthex-border hover:bg-corthex-surface text-corthex-text-secondary transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {DEMO_POSTS.map((post) => {
          const isReady = post.status === 'READY'
          const isPublished = post.status === 'PUBLISHED'
          return (
            <div
              key={post.id}
              className="group relative bg-corthex-bg border border-corthex-border rounded-xl overflow-hidden hover:border-corthex-accent/50 transition-all duration-300 flex flex-col lg:flex-row"
            >
              {/* Left accent bar */}
              <div
                className={`lg:w-1 lg:h-auto h-1 group-hover:shadow-lg transition-shadow ${
                  isReady ? 'bg-corthex-accent' : 'bg-corthex-border'
                }`}
              />

              {/* Content area */}
              <div className="flex-1 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-corthex-surface border-2 border-corthex-bg flex items-center justify-center text-corthex-text-secondary">
                        {post.isSystem ? <Bot className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-corthex-text-disabled uppercase tracking-tighter">
                      ID: CTX-{post.id.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-corthex-text-disabled uppercase font-bold tracking-widest">
                      {isPublished ? 'Published Time' : 'Execute Time'}
                    </div>
                    <div className={`font-mono text-sm tracking-tight ${isReady ? 'text-corthex-accent' : 'text-corthex-text-secondary'}`}>
                      {post.timeAgo}
                    </div>
                  </div>
                </div>

                <p className="text-corthex-text-primary leading-relaxed text-sm max-w-3xl">{post.content}</p>

                {post.tags && (
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-corthex-surface text-corthex-text-disabled px-2 py-0.5 rounded border border-corthex-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 md:gap-6 pt-2 border-t border-corthex-surface">
                  <div className="flex items-center gap-2 min-h-[44px]">
                    <Heart className="w-4 h-4 text-corthex-text-disabled" />
                    <span className="font-mono text-xs text-corthex-text-secondary">
                      {isPublished ? post.reactions[0].count.toLocaleString() : '--'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-corthex-text-disabled" />
                    <span className="font-mono text-xs text-corthex-text-secondary">
                      {isPublished ? post.reactions[1]?.count.toLocaleString() ?? '--' : '--'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-corthex-text-disabled" />
                    <span className="font-mono text-xs text-corthex-text-secondary">
                      {isPublished ? post.reactions[2]?.count.toLocaleString() ?? '--' : '--'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status sidebar */}
              <div className="lg:w-48 bg-corthex-surface/30 border-t lg:border-t-0 lg:border-l border-corthex-border p-4 flex lg:flex-col justify-between items-center">
                <div className="flex flex-col items-center lg:items-end w-full">
                  <span className="text-[10px] text-corthex-text-disabled font-bold uppercase tracking-widest mb-1">Status</span>
                  <span
                    className="text-xs font-mono flex items-center gap-1"
                    style={{ color: isReady ? '#22c55e' : isPublished ? 'var(--color-corthex-text-secondary)' : 'var(--color-corthex-text-disabled)' }}
                  >
                    {isReady && (
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
                    )}
                    {post.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast.info('이 기능은 준비 중입니다')}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded bg-corthex-surface hover:bg-corthex-elevated text-corthex-text-secondary border border-corthex-border transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {!isPublished && (
                    <button
                      onClick={() => toast.info('이 기능은 준비 중입니다')}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded bg-corthex-surface hover:bg-corthex-elevated text-corthex-text-secondary border border-corthex-border transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile Stats Summary */}
      <MobileStatsSummary />
    </div>
  )
}
