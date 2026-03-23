/**
 * SNS Page - Sovereign Sage Theme (Phase 7-1 Rebuild)
 *
 * API Endpoints:
 *   GET  /workspace/sns-accounts       - Fetch linked SNS accounts
 *   GET  /workspace/agents             - Fetch AI agents list
 *   GET  /workspace/sns/stats?days=N   - Fetch SNS statistics
 *   (Tab components use additional endpoints)
 */
import { useCallback } from 'react'
import { toast } from '@corthex/ui'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Plus, Image, Paperclip, BarChart2, MoreHorizontal, ThumbsUp, Heart, MessageCircle, Download, Bot } from 'lucide-react'
import { api } from '../lib/api'
import { ContentTab } from '../components/sns/content-tab'
import { QueueTab } from '../components/sns/queue-tab'
import { CardNewsTab } from '../components/sns/card-news-tab'
import { StatsTab } from '../components/sns/stats-tab'
import { AccountsTab } from '../components/sns/accounts-tab'
import type { SnsAccount, Agent } from '../components/sns/sns-types'

const TAB_ITEMS = [
  { value: 'content', label: 'Content Library' },
  { value: 'queue', label: 'Publication Queue' },
  { value: 'cardnews', label: 'Card News' },
  { value: 'stats', label: 'Performance Stats' },
  { value: 'accounts', label: 'Linked Accounts' },
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
    <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#f5f0e8] via-[#f5f0e8] to-transparent pt-12 z-10 pointer-events-none">
      <div className="bg-white rounded-xl shadow-lg border border-[#e5e1d3] p-4 pointer-events-auto">
        <h3 className="text-xs font-semibold text-[#908a78] uppercase tracking-wider mb-3">This Week</h3>
        <div className="flex justify-between items-center divide-x divide-[#e5e1d3]">
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-[#1a1a1a] font-mono tabular-nums">{publishedCount}</span>
            <span className="text-[10px] text-[#908a78] mt-1">Published</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold font-mono tabular-nums text-[#606C38]">{stats.total}</span>
            <span className="text-[10px] text-[#908a78] mt-1">Total Content</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-semibold text-[#1a1a1a] font-mono tabular-nums">{stats.byPlatform.length}</span>
            <span className="text-[10px] text-[#908a78] mt-1">Platforms</span>
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
    badgeBg: '#283618',
    badgeText: 'white',
    timeAgo: '2시간 전 - Public',
    content: 'Q1 시장 분석 보고서가 완성되었습니다. 경쟁사 대비 성장률 12% 달성! 자세한 내용은 리포트를 확인해주세요.',
    file: { name: 'Q1_시장분석.pdf', size: '2.4 MB', type: 'Document' },
    reactions: [
      { emoji: '\u{1F44D}', count: 12 },
      { emoji: '\u{2764}\u{FE0F}', count: 5 },
      { emoji: '\u{1F44F}', count: 8 },
    ],
    isSystem: false,
  },
  {
    id: 'p2',
    author: 'System Bot',
    badge: '공지',
    badgeBg: '#2563eb',
    badgeText: 'white',
    timeAgo: '4시간 전 - Auto-generated',
    content: '시스템 업데이트 v3.2가 적용되었습니다. 주요 변경사항: 에이전트 성능 최적화, 비용 절감 알고리즘 개선, 보안 패치 적용',
    tags: ['#시스템업데이트', '#v3.2'],
    reactions: [{ emoji: '\u{1F44D}', count: 24 }],
    isSystem: true,
  },
  {
    id: 'p3',
    author: 'Da-eun Lee',
    badge: 'Analysis Team',
    badgeBg: '#606C38',
    badgeText: 'white',
    timeAgo: '6시간 전',
    content: '새로운 데이터 파이프라인 구축 완료! 처리 속도가 기존 대비 40% 향상되었습니다. 팀원들의 노력에 감사드립니다.',
    reactions: [
      { emoji: '\u{1F44F}', count: 15 },
      { emoji: '\u{1F525}', count: 8 },
      { emoji: '\u{2764}\u{FE0F}', count: 6 },
    ],
    isSystem: false,
  },
  {
    id: 'p4',
    author: 'Han Ye-jin',
    badge: 'Security Team',
    badgeBg: '#283618',
    badgeText: 'white',
    timeAgo: '어제',
    content: '보안 감사 결과: 전체 시스템 보안 등급 A+ 달성. 취약점 0건. 다음 분기 감사 일정은 추후 공지하겠습니다.',
    securityBanner: { title: '보안 등급 A+ 획득', sub: 'Security Audit Result' },
    reactions: [
      { emoji: '\u{1F44D}', count: 18 },
      { emoji: '\u{1F6E1}\u{FE0F}', count: 7 },
    ],
    isSystem: false,
  },
  {
    id: 'p5',
    author: 'Song Hyun-woo',
    badge: 'Finance Team',
    badgeBg: '#606C38',
    badgeText: 'white',
    timeAgo: '2일 전',
    content: '3월 비용 보고서 요약: 총 비용 $4,287.50 (전월 대비 -12.3%). 예산 절감 목표 초과 달성했습니다!',
    stats: [
      { label: 'Monthly Cost', value: '$4,287.50', color: '#283618' },
      { label: 'MoM Growth', value: '-12.3%', color: '#4d7c0f' },
    ],
    reactions: [
      { emoji: '\u{1F44D}', count: 20 },
      { emoji: '\u{1F4CA}', count: 5 },
    ],
    isSystem: false,
  },
]

export function SnsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'content'
  const [activeFilter, setActiveFilter] = [FILTER_CHIPS[0], (_v: string) => {}] // Static for demo

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

  const accounts = accountsData?.data || []
  const agents = agentsData?.data || []

  return (
    <div data-testid="sns-page" className="min-h-screen" style={{ backgroundColor: '#faf8f5' }}>
      <div className="p-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a] mb-2">
              소셜 피드 <span className="text-[#6b705c] font-medium">Social Feed</span>
            </h1>
            <p className="text-[#6b705c] text-lg">팀 소식과 업데이트를 공유합니다</p>
          </div>
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {FILTER_CHIPS.map((chip, i) => (
              <button
                key={chip}
                className={`rounded-full px-5 py-2.5 font-semibold transition-all text-sm ${
                  i === 0
                    ? 'bg-[#606C38] text-white shadow-sm'
                    : 'border border-[#e5e1d3] text-[#6b705c] bg-white hover:bg-[#f5f0e8]'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8 space-y-8">
              <div className="bg-[#f5f0e8] p-8 rounded-xl border border-[#e5e1d3]/50">
                <h3 className="text-sm font-mono uppercase tracking-widest text-[#756e5a] mb-4">Current Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#4d7c0f]" />
                    <span className="text-sm text-[#6b705c]">System Operational</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#756e5a]">LATENCY:</span>
                    <span className="text-xs font-mono text-[#606C38]">24ms</span>
                  </div>
                </div>
              </div>
              <div className="px-4">
                <h4 className="text-xs font-bold uppercase text-[#756e5a] mb-4">Trending Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {['#Q1Growth', '#SecurityPlus', '#Efficiency'].map((tag) => (
                    <span key={tag} className="text-sm text-[#606C38] hover:underline cursor-pointer">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-9 xl:col-span-8">
            {/* Post Composer */}
            <div className="bg-[#f5f0e8] rounded-xl p-6 mb-12 shadow-sm border border-[#e5e1d3] transition-all focus-within:ring-2 ring-[#606C38]/20">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#283618] text-white flex items-center justify-center font-bold shrink-0">You</div>
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-[#1a1a1a] placeholder-[#756e5a] resize-none pt-2 text-lg"
                  placeholder="새 소식을 공유하세요... Share an update"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#e5e1d3]">
                <div className="flex gap-2">
                  <button className="p-2 text-[#6b705c] hover:bg-[#f0ebe0] rounded-lg transition-colors flex items-center gap-1">
                    <Image className="w-5 h-5" />
                    <span className="text-xs font-semibold">Image</span>
                  </button>
                  <button className="p-2 text-[#6b705c] hover:bg-[#f0ebe0] rounded-lg transition-colors flex items-center gap-1">
                    <Paperclip className="w-5 h-5" />
                    <span className="text-xs font-semibold">File</span>
                  </button>
                  <button className="p-2 text-[#6b705c] hover:bg-[#f0ebe0] rounded-lg transition-colors flex items-center gap-1">
                    <BarChart2 className="w-5 h-5" />
                    <span className="text-xs font-semibold">Poll</span>
                  </button>
                </div>
                <button
                  onClick={() => toast.info('이 기능은 준비 중입니다')}
                  className="bg-[#4d7c0f] hover:opacity-90 text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition-all active:scale-95"
                >
                  게시 Post
                </button>
              </div>
            </div>

            {/* Feed Posts */}
            <div className="space-y-8">
              {DEMO_POSTS.map((post) => (
                <article
                  key={post.id}
                  className={`rounded-xl p-8 shadow-sm border transition-shadow hover:shadow-md ${
                    post.isSystem
                      ? 'bg-[#f0ebe0] border-l-4 border-l-[#2563eb] border-y border-r border-[#e5e1d3]'
                      : 'bg-[#f5f0e8] border-[#e5e1d3]'
                  }`}
                >
                  {/* Author Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      {post.isSystem ? (
                        <div className="w-12 h-12 rounded-full bg-[#283618] flex items-center justify-center">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#606C38] text-white flex items-center justify-center font-bold text-lg">
                          {post.author.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#1a1a1a]">{post.author}</h3>
                          <span
                            className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full font-bold"
                            style={{ backgroundColor: post.badgeBg, color: post.badgeText }}
                          >
                            {post.badge}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#756e5a] mt-0.5">{post.timeAgo}</p>
                      </div>
                    </div>
                    {!post.isSystem && (
                      <button className="text-[#756e5a] hover:bg-[#f0ebe0] rounded-full p-1">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    {post.securityBanner && (
                      <div className="bg-[#283618] text-white p-4 rounded-lg mb-4 flex items-center gap-4">
                        <div className="text-3xl">{'\u{1F6E1}\u{FE0F}'}</div>
                        <div>
                          <p className="font-bold">{post.securityBanner.title}</p>
                          <p className="text-xs opacity-80">{post.securityBanner.sub}</p>
                        </div>
                      </div>
                    )}
                    <p className={`text-[#6b705c] leading-relaxed ${post.isSystem ? 'font-semibold' : 'text-lg'}`}>
                      {post.content}
                    </p>
                    {post.tags && (
                      <div className="flex gap-2 mt-4">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs font-mono py-1 px-2 bg-white/40 rounded border border-[#e5e1d3] text-[#2563eb]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {post.file && (
                      <div className="flex items-center gap-4 p-4 bg-white/50 border border-[#e5e1d3] rounded-lg cursor-pointer hover:bg-white transition-colors mt-4">
                        <div className="bg-[#dc2626]/10 p-3 rounded-lg">
                          <span className="text-[#dc2626] text-xl">{'\u{1F4C4}'}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#1a1a1a]">{post.file.name}</p>
                          <p className="text-xs text-[#756e5a] font-mono">{post.file.size} - {post.file.type}</p>
                        </div>
                        <Download className="w-5 h-5 text-[#756e5a]" />
                      </div>
                    )}
                    {post.stats && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {post.stats.map((stat) => (
                          <div key={stat.label} className="bg-white/60 p-5 rounded-xl border border-[#e5e1d3]">
                            <p className="text-[10px] uppercase tracking-tighter text-[#756e5a] font-bold mb-1">{stat.label}</p>
                            <p className="text-2xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-[#e5e1d3]/60">
                    {post.reactions.map((r, i) => (
                      <button key={i} className="flex items-center gap-2 text-sm text-[#6b705c] hover:text-[#606C38] transition-colors">
                        <span className="text-base">{r.emoji}</span>
                        <span className="font-mono">{r.count}</span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stats Summary */}
      {tab === 'content' && <MobileStatsSummary />}
    </div>
  )
}
