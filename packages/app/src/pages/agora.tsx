import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { DebateListPanel } from '../components/agora/debate-list-panel'
import { DebateTimeline } from '../components/agora/debate-timeline'
import { DebateInfoPanel } from '../components/agora/debate-info-panel'
import { CreateDebateModal } from '../components/agora/create-debate-modal'
import type { Debate, DebateTimelineEntry } from '@corthex/shared'

export function AgoraPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')

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
    <div data-testid="agora-page" className="flex h-full bg-slate-900">
      {/* Left panel: debate list (hidden on mobile when viewing detail) */}
      <div className={`w-full md:w-72 md:shrink-0 border-r border-slate-700 ${mobileView === 'detail' ? 'hidden md:block' : ''}`}>
        <DebateListPanel
          selectedId={selectedDebate?.id ?? null}
          onSelect={handleSelectDebate}
          onCreateNew={() => setShowCreateModal(true)}
        />
      </div>

      {/* Center panel: timeline */}
      <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {debate ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden shrink-0 px-4 py-2 border-b border-slate-700">
              <button
                data-testid="debate-back-to-list-btn"
                onClick={handleBackToList}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                ← 목록으로
              </button>
            </div>

            {/* Topic header */}
            <div data-testid="debate-topic-header" className="shrink-0 px-4 py-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 truncate flex-1 min-w-0">{debate.topic}</h2>
                {debate.status === 'in-progress' && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    진행중
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center rounded-md bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20">
                  {debate.debateType === 'deep-debate' ? '심층토론' : '토론'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {debate.participants.length}명 · Round {debate.rounds.length}/{debate.maxRounds}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <DebateTimeline debate={debate} timeline={timeline} />

            {/* Back to chat button (when debate completed and came from chat) */}
            {fromChat && debate.status === 'completed' && (
              <div className="shrink-0 px-4 py-3 border-t border-slate-700">
                <button
                  data-testid="back-to-chat-btn"
                  onClick={() => navigate('/chat')}
                  className="w-full py-2 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  ← 사령관실로 돌아가기
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center space-y-2">
              <p className="text-3xl opacity-30">🗣️</p>
              <p className="text-sm">토론을 선택하거나 새 토론을 시작하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: debate info (desktop only) */}
      {debate && (
        <div className="hidden lg:block w-72 shrink-0 border-l border-slate-700">
          <DebateInfoPanel debate={debate} />
        </div>
      )}

      {/* Create modal */}
      <CreateDebateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
