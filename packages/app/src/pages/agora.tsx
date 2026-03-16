import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { DebateListPanel } from '../components/agora/debate-list-panel'
import { DebateTimeline } from '../components/agora/debate-timeline'
import { DebateInfoPanel } from '../components/agora/debate-info-panel'
import { CreateDebateModal } from '../components/agora/create-debate-modal'
import { MessageSquare } from 'lucide-react'
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
    <div data-testid="agora-page" className="flex h-full bg-[#0b1416]">
      {/* Left panel: debate list (hidden on mobile when viewing detail) */}
      <div className={`w-full md:w-[280px] md:shrink-0 border-r border-cyan-400/20 bg-slate-950 ${mobileView === 'detail' ? 'hidden md:block' : ''}`}>
        <DebateListPanel
          selectedId={selectedDebate?.id ?? null}
          onSelect={handleSelectDebate}
          onCreateNew={() => setShowCreateModal(true)}
        />
      </div>

      {/* Center panel: timeline */}
      <div className={`flex-1 flex flex-col min-w-0 relative bg-[#0b1416] ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {debate ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden shrink-0 px-4 py-2 border-b border-cyan-400/10">
              <button
                data-testid="debate-back-to-list-btn"
                onClick={handleBackToList}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                ← 목록으로
              </button>
            </div>

            {/* Topic header - sticky glass */}
            <div data-testid="debate-topic-header" className="shrink-0 h-14 border-b border-cyan-400/10 flex items-center px-6 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-100 truncate">{debate.topic}</h2>
                {debate.status === 'in-progress' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <DebateTimeline debate={debate} timeline={timeline} />

            {/* Back to chat button (when debate completed and came from chat) */}
            {fromChat && debate.status === 'completed' && (
              <div className="shrink-0 px-4 py-3 border-t border-cyan-400/10 bg-slate-950">
                <button
                  data-testid="back-to-chat-btn"
                  onClick={() => navigate('/chat')}
                  className="w-full py-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-lg transition-colors"
                >
                  ← 사령관실로 돌아가기
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center mx-auto">
                <MessageSquare className="w-7 h-7 text-cyan-400/50" />
              </div>
              <p className="text-sm text-slate-400">토론을 선택하거나 새 토론을 시작하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: debate info (desktop only) */}
      {debate && (
        <div className="hidden lg:block w-[320px] shrink-0 border-l border-cyan-400/20 bg-slate-950">
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
