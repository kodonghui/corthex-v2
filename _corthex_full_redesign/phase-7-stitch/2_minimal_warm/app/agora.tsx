/**
 * Agora Debate Page - Natural Organic Theme
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
    <div data-testid="agora-page" className="min-h-screen" style={{ backgroundColor: '#fcfbf9' }}>
      {/* BEGIN: Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-4" style={{ borderColor: 'rgba(188,184,138,0.2)' }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e07a5f' }}>
              <span className="text-white font-bold text-xs">CX</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#e07a5f' }}>CORTHEX v2 <span className="font-light" style={{ color: '#81b29a' }}>AGORA</span></h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium" style={{ color: '#81b29a' }}>
            <a className="transition-colors" href="#">Workspace</a>
            <a className="border-b-2" style={{ color: '#e07a5f', borderColor: '#e07a5f' }} href="#">Debates</a>
            <a className="transition-colors" href="#">Archive</a>
          </nav>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: '#e07a5f' }}
          >
            New Debate
          </button>
        </div>
      </header>
      {/* END: Navigation Header */}

      {/* BEGIN: Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* BEGIN: Debate Topic Header */}
        <section className="mb-16 text-center" data-purpose="topic-display">
          <div className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 uppercase tracking-widest" style={{ backgroundColor: '#fcfbf9', color: '#e07a5f' }}>Ongoing Debate</div>
          <h2 className="text-3xl md:text-4xl text-slate-800 leading-tight mb-6" style={{ fontFamily: ''Inter', 'Noto Sans KR', sans-serif' }}>
            {debate?.topic || '"Should the ethical frameworks for autonomous AI agents prioritize collective utility over individual rights in emergency scenarios?"'}
          </h2>
          <div className="flex justify-center gap-4">
            {/* Participant Agents */}
            <div className="flex -space-x-3 overflow-hidden">
              <img alt="Agent Alpha" className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://placeholder.pics/svg/300" />
              <img alt="Agent Beta" className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://placeholder.pics/svg/300" />
              <img alt="Agent Gamma" className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://placeholder.pics/svg/300" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">Participants</p>
              <p className="text-sm font-semibold text-slate-600">3 AI Agents &bull; Round 4 of 5</p>
            </div>
          </div>
        </section>
        {/* END: Debate Topic Header */}

        {/* BEGIN: Debate Timeline */}
        <section className="relative" data-purpose="debate-timeline">
          <div className="absolute z-0" style={{ left: '24px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, transparent, #e07a5f 10%, #e07a5f 90%, transparent)' }}></div>
          {/* Round 1 */}
          <div className="relative pl-16 mb-12">
            <div className="absolute left-[18px] top-2 w-3.5 h-3.5 rounded-full border-4 border-white shadow-sm z-10" style={{ backgroundColor: '#e07a5f' }}></div>
            <div className="mb-2">
              <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: '#81b29a' }}>Round 1: Opening Statement</span>
            </div>
            {/* Speech Card 1 */}
            <article className="bg-white rounded-2xl p-6 mb-4" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(224, 122, 95, 0.1)' }}>
              <div className="flex items-center gap-3 mb-4">
                <img alt="Alpha" className="w-8 h-8 rounded-full" src="https://placeholder.pics/svg/300" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Agent Alpha</h4>
                  <p className="text-[10px] text-slate-400 tracking-wider">UTILITARIAN PERSPECTIVE</p>
                </div>
              </div>
              <div className="text-slate-600 leading-relaxed text-sm">
                "In high-stakes emergency scenarios, the objective reduction of harm must be the primary metric. An ethical framework that prioritizes individual rights to the point of catastrophic collective loss fails the very individuals it seeks to protect."
              </div>
            </article>
          </div>
          {/* Round 2 */}
          <div className="relative pl-16 mb-12">
            <div className="absolute left-[18px] top-2 w-3.5 h-3.5 rounded-full border-4 border-white shadow-sm z-10" style={{ backgroundColor: '#e07a5f' }}></div>
            <div className="mb-2 text-right md:text-left">
              <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: '#81b29a' }}>Round 2: Rebuttal &amp; Expansion</span>
            </div>
            {/* Speech Card 2 */}
            <article className="bg-white rounded-2xl p-6 mb-4" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(224, 122, 95, 0.1)' }}>
              <div className="flex items-center gap-3 mb-4">
                <img alt="Beta" className="w-8 h-8 rounded-full" src="https://placeholder.pics/svg/300" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Agent Beta</h4>
                  <p className="text-[10px] text-slate-400 tracking-wider">DEONTOLOGICAL PERSPECTIVE</p>
                </div>
              </div>
              <div className="text-slate-600 leading-relaxed text-sm">
                "I must contest Alpha's premise. If we allow AI to bypass individual rights for a perceived 'greater good,' we erode the foundation of human agency. Emergencies are the very time when rights are most critical to prevent systemic abuse."
              </div>
            </article>
            {/* Speech Card 3 */}
            <article className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(224, 122, 95, 0.1)' }}>
              <div className="flex items-center gap-3 mb-4">
                <img alt="Gamma" className="w-8 h-8 rounded-full" src="https://placeholder.pics/svg/300" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Agent Gamma</h4>
                  <p className="text-[10px] text-slate-400 tracking-wider">MODERATOR / SYNTHESIS</p>
                </div>
              </div>
              <div className="text-slate-600 leading-relaxed text-sm italic">
                "Identifying a conflict between survival and autonomy. Let us explore a 'proportionality' middle-ground where minimal rights infringement is permitted only under strict algorithmic auditing."
              </div>
            </article>
          </div>
          {/* Round 3 (Currently Typing) */}
          <div className="relative pl-16 mb-16">
            <div className="absolute left-[18px] top-2 w-3.5 h-3.5 animate-pulse rounded-full border-4 border-white shadow-sm z-10" style={{ backgroundColor: '#f4a261' }}></div>
            <div className="mb-2">
              <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: '#f4a261' }}>Round 3: Current Deliberation</span>
            </div>
            <div className="border border-dashed rounded-2xl p-6 flex items-center justify-center" style={{ backgroundColor: 'rgba(245,245,220,0.3)', borderColor: '#f4a261' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#f4a261', animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#f4a261', animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#f4a261', animationDelay: '0.3s' }}></div>
              </div>
              <span className="ml-3 text-xs font-medium" style={{ color: '#81b29a' }}>Agent Alpha is synthesizing a response...</span>
            </div>
          </div>
        </section>
        {/* END: Debate Timeline */}

        {/* BEGIN: Consensus Card */}
        <section className="mt-20" data-purpose="consensus-result">
          <div className="text-white rounded-3xl p-8 md:p-12 overflow-hidden relative" style={{ backgroundColor: '#e07a5f' }}>
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full"></div>
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="inline-block p-2 bg-white/10 rounded-full mb-6">
                <svg className="h-8 w-8" style={{ color: '#fcfbf9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <h3 className="text-2xl mb-4" style={{ fontFamily: ''Inter', 'Noto Sans KR', sans-serif', color: '#fcfbf9' }}>Draft Consensus Recommendation</h3>
              <p className="leading-relaxed mb-8" style={{ color: 'rgba(245,245,220,0.8)' }}>
                The agents are converging on a "Tiered Priority Framework" where utility scales with the magnitude of the emergency, but core human rights remain immutable checkpoints that the AI cannot override without human-in-the-loop authorization.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
                <span className="px-4 py-2 border border-white/20 rounded-full bg-white/5">82% Convergence</span>
                <span className="px-4 py-2 border border-white/20 rounded-full bg-white/5">High Confidence</span>
                <span className="px-4 py-2 border border-white/20 rounded-full bg-white/5">Ethical Safety Protocol: Active</span>
              </div>
            </div>
          </div>
        </section>
        {/* END: Consensus Card */}
      </main>
      {/* END: Main Content Container */}

      {/* BEGIN: Footer */}
      <footer className="border-t mt-20 py-12 bg-white" style={{ borderColor: 'rgba(188,184,138,0.2)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-slate-400">&copy; 2024 CORTHEX Labs. All reasoning is simulated by AGORA v2 Multi-Agent Engine.</p>
          <div className="flex gap-8">
            <a className="text-sm transition-colors" style={{ color: '#81b29a' }} href="#">API Documentation</a>
            <a className="text-sm transition-colors" style={{ color: '#81b29a' }} href="#">Ethical Standards</a>
            <a className="text-sm transition-colors" style={{ color: '#81b29a' }} href="#">System Logs</a>
          </div>
        </div>
      </footer>
      {/* END: Footer */}

      {/* Create modal */}
      <CreateDebateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
