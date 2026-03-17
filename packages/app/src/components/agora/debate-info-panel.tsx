import { useState, useEffect } from 'react'
import { cn } from '@corthex/ui'
import { StopCircle, Clock } from 'lucide-react'
import type { Debate } from '@corthex/shared'
import { DiffView } from './diff-view'

const STATUS_LABELS: Record<string, string> = {
  pending: '대기',
  'in-progress': '진행중',
  completed: '완료',
  failed: '실패',
}

const AVATAR_COLORS = [
  { bg: 'bg-[#5a7247]/20', text: 'text-[#5a7247]', border: 'border-[#5a7247]/30' },
  { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
]

function getColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const TAB_ITEMS = [
  { value: 'info', label: '정보', testId: 'debate-info-tab' },
  { value: 'diff', label: 'Diff', testId: 'debate-diff-tab' },
]

export function DebateInfoPanel({ debate }: { debate: Debate }) {
  const [activeTab, setActiveTab] = useState('info')
  const isDiffEnabled = debate.status === 'completed' && debate.rounds.length > 0

  // Auto-switch to diff tab when debate is completed
  useEffect(() => {
    if (debate.status === 'completed') {
      setActiveTab('diff')
    } else {
      setActiveTab('info')
    }
  }, [debate.id, debate.status])

  return (
    <div data-testid="debate-info-panel" className="h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="shrink-0 flex border-b border-[#5a7247]/10">
        {TAB_ITEMS.map((tab) => {
          const isDisabled = tab.value === 'diff' && !isDiffEnabled
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              data-testid={tab.testId}
              onClick={() => !isDisabled && setActiveTab(tab.value)}
              disabled={isDisabled}
              className={cn(
                'flex-1 py-2.5 text-xs font-medium transition-colors border-b-2',
                isActive
                  ? 'border-[#5a7247] text-[#5a7247]'
                  : 'border-transparent text-stone-500 hover:text-stone-600',
                isDisabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' ? (
          <InfoContent debate={debate} />
        ) : (
          <div className="px-4 py-3">
            <DiffView debate={debate} />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoContent({ debate }: { debate: Debate }) {
  const isActive = debate.status === 'in-progress'

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-[#5a7247]/10">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Debate Info</h3>
        {isActive && (
          <div className="flex items-center gap-2 text-emerald-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider">Active Debate</span>
          </div>
        )}
        {!isActive && (
          <div className="flex items-center gap-2 text-stone-500">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-xs font-medium uppercase tracking-wider">
              {STATUS_LABELS[debate.status] ?? debate.status}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col gap-6 flex-1">
        {/* Duration placeholder */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Duration</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400" />
            <div className="font-mono text-2xl text-[#5a7247] font-medium">
              {debate.rounds.length > 0 ? `R${debate.rounds.length}/${debate.maxRounds}` : '--:--'}
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
              Participants ({debate.participants.length})
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {debate.participants.map((p) => {
              const color = getColor(p.agentId)
              return (
                <div key={p.agentId} data-testid={`debate-participant-${p.agentId}`} className="flex items-center gap-3">
                  <div className={cn(
                    'rounded-full w-8 h-8 flex items-center justify-center text-[12px] font-bold border',
                    color.bg,
                    color.text,
                    color.border,
                  )}>
                    {p.agentName[0]}
                  </div>
                  <span className="text-sm text-stone-600">{p.agentName}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Details</span>
          <div className="space-y-2">
            <InfoRow label="유형" value={debate.debateType === 'deep-debate' ? '심층토론 (3R)' : '토론 (2R)'} />
            <InfoRow label="최대 라운드" value={String(debate.maxRounds)} />
            <InfoRow label="진행 라운드" value={String(debate.rounds.length)} />
            <InfoRow label="시작" value={formatDate(debate.startedAt)} />
            <InfoRow label="완료" value={formatDate(debate.completedAt)} />
          </div>
        </div>

        {/* Objective (topic as objective) */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Objective</span>
          <p className="text-sm text-stone-500 leading-relaxed bg-stone-100/50 p-3 rounded-lg border border-stone-200/50">
            {debate.topic}
          </p>
        </div>

        {/* Error */}
        {debate.error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2">
            <p className="text-[10px] font-semibold text-red-500 mb-1">오류</p>
            <p className="text-xs text-red-400">{debate.error}</p>
          </div>
        )}
      </div>

      {/* End debate button */}
      {isActive && (
        <div className="p-6 border-t border-[#5a7247]/10">
          <button className="w-full py-3 px-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 font-medium">
            <StopCircle className="w-5 h-5" />
            토론 종료 (End Debate)
          </button>
        </div>
      )}
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-stone-500">{label}</span>
      <span className="text-xs text-stone-600">{value}</span>
    </div>
  )
}
