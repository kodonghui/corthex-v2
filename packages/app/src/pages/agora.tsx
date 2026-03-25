/**
 * Agora Debate Page - Sovereign Sage Theme (Phase 7-1 Rebuild)
 *
 * API Endpoints:
 *   GET  /workspace/debates            - List debates
 *   GET  /workspace/debates/:id        - Debate detail
 *   POST /workspace/debates            - Create debate
 *   GET  /workspace/debates/:id/timeline - Debate timeline entries
 *   (Child components: DebateListPanel, DebateTimeline, DebateInfoPanel, CreateDebateModal)
 */
import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { DebateListPanel } from '../components/agora/debate-list-panel'
import { DebateTimeline } from '../components/agora/debate-timeline'
import { DebateInfoPanel } from '../components/agora/debate-info-panel'
import { CreateDebateModal } from '../components/agora/create-debate-modal'
import { Plus, MessageSquare, Eye, Clock, ChevronLeft, ChevronRight, Pin, Zap, Users } from 'lucide-react'
import { toast } from '@corthex/ui'
import type { Debate, DebateTimelineEntry } from '@corthex/shared'

const CATEGORY_FILTERS = ['전체 All', '전략 Strategy', '기술 Tech', '운영 Ops', '자유 Free', 'Q&A']
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '전략': { bg: 'var(--color-corthex-accent)', text: 'var(--color-corthex-accent)' },
  '기술': { bg: '#2563eb', text: '#2563eb' },
  '운영': { bg: 'var(--color-corthex-accent-deep)', text: 'var(--color-corthex-accent-deep)' },
  '자유': { bg: '#7c3aed', text: '#7c3aed' },
  'Q&A': { bg: '#2563eb', text: '#2563eb' },
}

const DEMO_THREADS = [
  {
    id: 't1',
    title: 'v3.2 업데이트 관련 의견 수렴',
    author: '시스템 관리자 System Admin',
    category: '전략',
    preview: '다음 버전 업데이트에 대한 팀원들의 의견을 수렴합니다. 주요 변경 사항은 UI 개편 및 데이터 처리 엔진 고도화가 포함되어 있습니다. 팀원 여러분의 소중한 의견을 기다립니다.',
    replies: 24,
    views: 156,
    time: '14:30',
    pinned: true,
  },
  {
    id: 't2',
    title: '에이전트 비용 최적화 전략 토론',
    author: '김수호',
    category: '전략',
    preview: '에이전트 운영 비용을 줄이면서 성능을 유지할 수 있는 방법에 대해 논의합시다. 특히 API 호출 최적화와 캐싱 전략 도입을 고려 중입니다.',
    replies: 18,
    views: 98,
    time: '12:45',
  },
  {
    id: 't3',
    title: '새로운 데이터 파이프라인 아키텍처 제안',
    author: '이다은',
    category: '기술',
    preview: '현재 데이터 처리 속도를 개선하기 위한 새로운 아키텍처를 제안합니다. 실시간 스트리밍 처리 비중을 높여 지연 시간을 단축하는 것이 목표입니다.',
    replies: 12,
    views: 87,
    time: '11:20',
  },
  {
    id: 't4',
    title: '보안 감사 자동화 범위 확대 논의',
    author: '한예진',
    category: '운영',
    preview: '분기별 보안 감사 범위를 확대하여 자동화 커버리지를 높이자는 제안입니다. CI/CD 파이프라인에 통합된 정적 분석 도구 강화가 핵심입니다.',
    replies: 8,
    views: 65,
    time: '09:15',
  },
  {
    id: 't5',
    title: '점심 메뉴 추천 (3월)',
    author: '박지훈',
    category: '자유',
    preview: '이번 달 회사 근처 맛집 추천 받습니다! 특히 한식 추천 부탁드립니다. 지난 번 추천해주신 낙지볶음집은 정말 최고였어요.',
    replies: 32,
    views: 210,
    time: '어제',
  },
  {
    id: 't6',
    title: 'Claude API 모델 선택 가이드',
    author: '송현우',
    category: 'Q&A',
    preview: '용도별 최적의 Claude 모델 선택 기준이 궁금합니다. Opus vs Sonnet 중 가성비와 성능의 밸런스를 어떻게 맞춰야 할까요?',
    replies: 15,
    views: 124,
    time: '어제',
  },
]

export function AgoraPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')
  const [activeCategory, setActiveCategory] = useState('전체 All')

  // Track if user came from chat (for "back to chat" button)
  const fromChat = (location.state as { fromChat?: boolean } | null)?.fromChat ?? false

  // Auto-select debate from navigation state or URL params
  const stateDebateId = (location.state as { debateId?: string } | null)?.debateId
  const urlDebateId = new URLSearchParams(location.search).get('debateId')
  const autoDebateId = stateDebateId || urlDebateId

  // Fetch detailed debate when selected
  const { data: debateDetail } = useQuery({
    queryKey: ['debate', selectedDebate?.id],
    queryFn: () => api.get<{ data: Debate }>(`/workspace/debates/${selectedDebate!.id}`),
    enabled: !!selectedDebate?.id,
    refetchInterval: selectedDebate?.status === 'in-progress' ? 5000 : false,
  })

  // Fetch timeline for completed debates
  const { data: timelineData } = useQuery({
    queryKey: ['debate-timeline', selectedDebate?.id],
    queryFn: () => api.get<{ data: DebateTimelineEntry[] }>(`/workspace/debates/${selectedDebate!.id}/timeline`),
    enabled: !!selectedDebate?.id && selectedDebate?.status === 'completed',
  })

  const debate = debateDetail?.data ?? selectedDebate
  const timeline = timelineData?.data

  // Auto-select from navigation state
  useEffect(() => {
    if (autoDebateId && !selectedDebate) {
      api.get<{ data: Debate }>(`/workspace/debates/${autoDebateId}`).then((res) => {
        setSelectedDebate(res.data)
        setMobileView('detail')
      }).catch(() => {
        // Debate not found; ignore
      })
    }
  }, [autoDebateId, selectedDebate])

  const handleSelectDebate = useCallback((d: Debate) => {
    setSelectedDebate(d)
    setMobileView('detail')
  }, [])

  const handleCreated = useCallback((d: Debate) => {
    setSelectedDebate(d)
    setShowCreateModal(false)
    setMobileView('detail')
  }, [])

  const handleBackToList = useCallback(() => {
    setMobileView('list')
  }, [])

  const SIDEBAR_CATEGORIES = [
    { label: '전체 All', count: 142 },
    { label: '전략 Strategy', count: 42 },
    { label: '기술 Tech', count: 28 },
    { label: '운영 Ops', count: 35 },
    { label: '자유 Free', count: 19 },
    { label: 'Q&A', count: 18 },
  ]

  const [sortTab, setSortTab] = useState<'latest' | 'trending' | 'unresolved'>('latest')

  return (
    <div data-testid="agora-page" className="p-6 max-w-[1200px] mx-auto w-full">
      {/* Mobile create button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-corthex-accent text-corthex-bg font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-corthex-accent/10"
        >
          <Plus className="w-5 h-5" />
          CREATE THREAD
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-corthex-text-secondary mb-4">
              Categories
            </h3>
            <nav className="space-y-1">
              {SIDEBAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.label
                      ? 'bg-corthex-accent/10 text-corthex-accent border border-corthex-accent/20'
                      : 'text-corthex-text-secondary hover:bg-corthex-elevated hover:text-corthex-text-primary'
                  }`}
                >
                  <span className={activeCategory === cat.label ? 'font-medium' : ''}>{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      activeCategory === cat.label
                        ? 'bg-corthex-accent text-corthex-bg px-1.5 py-0.5 rounded'
                        : 'text-corthex-text-disabled'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Active Agents Widget */}
          <div className="p-4 rounded-xl border border-corthex-border bg-gradient-to-br from-corthex-surface to-transparent">
            <h4 className="text-xs font-bold text-corthex-text-primary mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-corthex-accent" />
              Active Agents
            </h4>
            <p className="text-[11px] text-corthex-text-secondary leading-relaxed mb-4">
              8 AI Agents currently contributing to discussions in AGORA.
            </p>
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((l) => (
                <div
                  key={l}
                  className="w-7 h-7 rounded-full border-2 border-corthex-surface bg-corthex-accent flex items-center justify-center text-[10px] font-bold text-corthex-bg"
                >
                  {l}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-corthex-surface bg-corthex-elevated flex items-center justify-center text-[10px] text-corthex-text-secondary font-bold">
                +5
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content */}
        <section className="col-span-12 lg:col-span-9">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-corthex-text-primary">Agora Terminal</h2>
              <p className="text-sm text-corthex-text-secondary">
                Centralized intelligence and internal department discourse.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="hidden lg:flex items-center gap-2 bg-corthex-accent hover:bg-corthex-accent-deep text-corthex-bg font-bold py-2 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-corthex-accent/10"
            >
              <Plus className="w-4 h-4" />
              CREATE THREAD
            </button>
          </div>

          {/* Sort Tabs */}
          <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-corthex-border/30">
            {(['latest', 'trending', 'unresolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSortTab(tab)}
                className={`text-xs font-bold uppercase tracking-widest pb-1 transition-colors ${
                  sortTab === tab
                    ? 'text-corthex-text-primary border-b-2 border-corthex-accent'
                    : 'text-corthex-text-secondary hover:text-corthex-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Thread Cards */}
          <div className="space-y-4">
            {DEMO_THREADS.map((thread) => {
              const isAccentCat = thread.category === '전략' || thread.category === '운영'
              const initials = thread.author.charAt(0)
              return (
                <article
                  key={thread.id}
                  className="group bg-corthex-surface border border-corthex-border hover:border-corthex-accent/50 rounded-xl p-5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isAccentCat
                          ? 'border-corthex-accent/40 bg-corthex-accent/10 text-corthex-accent'
                          : 'border-corthex-accent/20 bg-corthex-elevated text-corthex-text-secondary'
                      }`}
                    >
                      {thread.category.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-3 text-corthex-text-disabled">
                      {thread.pinned && <Pin className="w-4 h-4" />}
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-corthex-text-primary mb-4 group-hover:text-corthex-accent transition-colors">
                    {thread.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-corthex-accent flex items-center justify-center text-[10px] font-bold text-corthex-bg shrink-0">
                        {initials}
                      </div>
                      <span className="text-sm text-corthex-text-secondary">{thread.author}</span>
                      <span className="text-corthex-border">•</span>
                      <span className="font-mono text-xs text-corthex-text-disabled">{thread.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-corthex-text-secondary">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-mono text-sm">{thread.replies}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <button className="p-2 rounded-lg border border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-lg border border-corthex-accent text-corthex-accent bg-corthex-accent/10 font-mono text-sm">
              1
            </button>
            {[2, 3].map((n) => (
              <button
                key={n}
                className="w-10 h-10 rounded-lg border border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated transition-colors font-mono text-sm"
              >
                {n}
              </button>
            ))}
            <span className="text-corthex-text-disabled px-2">...</span>
            <button className="w-10 h-10 rounded-lg border border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated transition-colors font-mono text-sm">
              12
            </button>
            <button className="p-2 rounded-lg border border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>

      {/* Create Modal */}
      <CreateDebateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
