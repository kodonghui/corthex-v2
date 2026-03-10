import { useState, useEffect } from 'react'
import { cn } from '@corthex/ui'
import type { Debate } from '@corthex/shared'
import { DiffView } from './diff-view'

const STATUS_LABELS: Record<string, string> = {
  pending: '대기',
  'in-progress': '진행중',
  completed: '완료',
  failed: '실패',
}

const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400',
  'bg-red-500/20 text-red-400',
  'bg-purple-500/20 text-purple-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-pink-500/20 text-pink-400',
  'bg-orange-500/20 text-orange-400',
]

function getColor(id: string): string {
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
      <div className="shrink-0 flex border-b border-slate-700">
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
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300',
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
  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          토론 정보
        </h3>
        <p className="text-sm font-medium text-slate-100">{debate.topic}</p>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Meta */}
        <div className="space-y-2">
          <InfoRow label="유형" value={debate.debateType === 'deep-debate' ? '심층토론 (3라운드)' : '토론 (2라운드)'} />
          <InfoRow label="상태" value={STATUS_LABELS[debate.status] ?? debate.status} />
          <InfoRow label="최대 라운드" value={String(debate.maxRounds)} />
          <InfoRow label="진행 라운드" value={String(debate.rounds.length)} />
          <InfoRow label="시작" value={formatDate(debate.startedAt)} />
          <InfoRow label="완료" value={formatDate(debate.completedAt)} />
        </div>

        {/* Participants */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            참여자 ({debate.participants.length})
          </p>
          <div className="space-y-1.5">
            {debate.participants.map((p) => (
              <div key={p.agentId} data-testid={`debate-participant-${p.agentId}`} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                    getColor(p.agentId),
                  )}
                >
                  {p.agentName[0]}
                </div>
                <div>
                  <p className="text-xs text-slate-100">{p.agentName}</p>
                  <p className="text-[10px] text-slate-400">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {debate.error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2">
            <p className="text-[10px] font-semibold text-red-500 mb-1">오류</p>
            <p className="text-xs text-red-400">{debate.error}</p>
          </div>
        )}
      </div>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className="text-xs text-slate-300">{value}</span>
    </div>
  )
}
