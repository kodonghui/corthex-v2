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
import { Plus, MessageSquare, Eye, Clock, ChevronLeft, ChevronRight, Pin } from 'lucide-react'
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

  return (
    <div data-testid="agora-page" className="min-h-screen" style={{ backgroundColor: 'var(--color-corthex-bg)' }}>
      <div className="p-8 max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-corthex-text-primary mb-3">
              아고라 Agora
            </h1>
            <p className="text-corthex-text-secondary text-lg">
              팀 토론과 아이디어를 공유하는 공간입니다
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-corthex-accent hover:bg-corthex-accent-deep text-white px-6 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-corthex-accent/10"
          >
            <Plus className="w-5 h-5" />
            새 토론 시작 New Thread
          </button>
        </header>

        {/* Category Filter Chips */}
        <nav className="flex flex-wrap items-center gap-3 mb-10">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
                activeCategory === cat
                  ? 'bg-corthex-accent text-white'
                  : 'bg-corthex-elevated text-corthex-text-secondary border border-corthex-border hover:bg-corthex-elevated'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Thread List */}
        <div className="flex flex-col space-y-5">
          {DEMO_THREADS.map((thread) => {
            const catColor = CATEGORY_COLORS[thread.category] || CATEGORY_COLORS['전략']
            return (
              <article
                key={thread.id}
                className={`group rounded-xl p-6 transition-all hover:bg-corthex-elevated cursor-pointer ${
                  thread.pinned
                    ? 'bg-corthex-elevated border-l-4 border-amber-700'
                    : 'bg-corthex-elevated border border-corthex-border'
                }`}
              >
                {/* Pinned badge */}
                {thread.pinned && (
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="w-3.5 h-3.5 text-amber-700" />
                    <span className="bg-[#fef3c7] text-amber-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                      고정 Pinned
                    </span>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-corthex-text-primary mb-2 group-hover:text-corthex-accent transition-colors">
                      {thread.title}
                    </h2>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-medium text-corthex-text-primary">{thread.author}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{ backgroundColor: `${catColor.bg}10`, color: catColor.text }}
                      >
                        {thread.category}
                      </span>
                    </div>
                    <p className="text-corthex-text-secondary line-clamp-2 mb-4 leading-relaxed">
                      {thread.preview}
                    </p>
                    <div className="flex flex-wrap items-center gap-6 text-corthex-text-secondary text-xs">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        <span>답글 {thread.replies}개</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>조회 {thread.views}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-4 h-4" />
                        <span>{thread.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* Pagination */}
        <footer className="flex justify-center items-center mt-12 gap-2 pb-10">
          <button className="w-10 h-10 flex items-center justify-center text-corthex-text-secondary hover:bg-corthex-elevated rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-corthex-accent text-white rounded-lg font-bold shadow-md shadow-corthex-accent/20">
            1
          </button>
          {[2, 3].map((n) => (
            <button key={n} className="w-10 h-10 flex items-center justify-center text-corthex-text-secondary hover:bg-corthex-elevated rounded-lg font-semibold transition-colors">
              {n}
            </button>
          ))}
          <span className="w-10 h-10 flex items-center justify-center text-corthex-text-secondary">...</span>
          <button className="w-10 h-10 flex items-center justify-center text-corthex-text-secondary hover:bg-corthex-elevated rounded-lg font-semibold transition-colors">
            12
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-corthex-text-secondary hover:bg-corthex-elevated rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </footer>
      </div>

      {/* Create modal */}
      <CreateDebateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
