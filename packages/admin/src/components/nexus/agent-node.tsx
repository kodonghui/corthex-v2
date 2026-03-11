import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const STATUS_DOT: Record<string, { color: string; pulse?: boolean; label: string }> = {
  online: { color: 'bg-emerald-500', label: '온라인' },
  working: { color: 'bg-blue-500', pulse: true, label: '작업 중' },
  error: { color: 'bg-red-500', label: '오류' },
  offline: { color: 'bg-slate-500', label: '오프라인' },
}

const TIER_BADGE: Record<string, { bg: string; label: string }> = {
  manager: { bg: 'bg-blue-900 text-blue-300', label: 'Manager' },
  specialist: { bg: 'bg-cyan-900 text-cyan-300', label: 'Specialist' },
  worker: { bg: 'bg-slate-700 text-slate-400', label: 'Worker' },
}

type AgentNodeData = {
  name: string
  tier: string
  status: string
  isSecretary: boolean
  isSystem: boolean
}

export const AgentNode = memo(function AgentNode({ data, selected }: { data: AgentNodeData; selected?: boolean }) {
  const status = STATUS_DOT[data.status] || STATUS_DOT.offline
  const tier = TIER_BADGE[data.tier] || TIER_BADGE.worker
  const isSecretary = data.isSecretary

  const bgColor = isSecretary ? 'bg-amber-950' : 'bg-emerald-950'
  const borderColor = selected
    ? 'border-blue-400 ring-2 ring-blue-400/50'
    : isSecretary ? 'border-amber-500' : 'border-emerald-600'

  return (
    <div
      className={`px-4 py-3 rounded-xl ${bgColor} border-2 ${borderColor} shadow-md min-w-[200px]`}
      data-testid="nexus-agent-node"
    >
      <Handle type="target" position={Position.Top} className={isSecretary ? '!bg-amber-400 !w-2 !h-2' : '!bg-emerald-400 !w-2 !h-2'} />
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
        <span className={`text-sm font-medium truncate ${isSecretary ? 'text-amber-100' : 'text-emerald-100'}`}>
          {data.name}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.bg}`}>{tier.label}</span>
        <span className={`text-[10px] ${isSecretary ? 'text-amber-400' : 'text-emerald-400'}`}>{status.label}</span>
        <div className="flex gap-1 ml-auto">
          {isSecretary && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-amber-800 text-amber-200">비서</span>
          )}
          {data.isSystem && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-slate-700 text-slate-300">시스템</span>
          )}
        </div>
      </div>
    </div>
  )
})
