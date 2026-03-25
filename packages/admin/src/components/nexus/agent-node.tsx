import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const STATUS_DOT: Record<string, { color: string; pulse?: boolean; label: string }> = {
  online: { color: 'bg-emerald-500', label: '온라인' },
  working: { color: 'bg-corthex-accent', pulse: true, label: '작업 중' },
  error: { color: 'bg-red-500', label: '오류' },
  offline: { color: 'bg-slate-500', label: '오프라인' },
}

const TIER_BADGE: Record<string, { bg: string; label: string }> = {
  manager: { bg: 'bg-corthex-accent-deep text-corthex-accent-hover', label: 'Manager' },
  specialist: { bg: 'bg-cyan-900 text-cyan-300', label: 'Specialist' },
  worker: { bg: 'bg-corthex-elevated text-corthex-text-disabled', label: 'Worker' },
}

type AgentNodeData = {
  name: string
  tier: string
  tierLevel: number | null
  status: string
  isSecretary: boolean
  isSystem: boolean
  subordinateCount: number
}

export const AgentNode = memo(function AgentNode({ data, selected }: { data: AgentNodeData; selected?: boolean }) {
  const status = STATUS_DOT[data.status] || STATUS_DOT.offline
  const tier = TIER_BADGE[data.tier] || TIER_BADGE.worker
  const isSecretary = data.isSecretary
  const tierLevelStr = data.tierLevel != null ? ` T${data.tierLevel}` : ''

  const bgColor = isSecretary ? 'bg-amber-950' : 'bg-emerald-950'
  const borderColor = selected
    ? 'border-corthex-accent-hover ring-2 ring-corthex-accent-hover/50'
    : isSecretary ? 'border-amber-500' : 'border-emerald-600'

  // Secretary uses octagonal clip-path for visual distinction
  const secretaryClipStyle = isSecretary
    ? { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }
    : undefined

  // Secretary needs a wrapper for the octagon shape with border effect
  if (isSecretary) {
    return (
      <div className="relative" data-testid="nexus-agent-node" data-secretary="true">
        <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-2 !h-2" />
        {/* Octagon outer border */}
        <div
          className={`${selected ? 'bg-corthex-accent-hover' : 'bg-amber-500'} min-w-[220px]`}
          style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', padding: '2px' }}
        >
          {/* Octagon inner content */}
          <div
            className={`px-5 py-4 ${bgColor} min-w-[216px]`}
            style={secretaryClipStyle}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium truncate text-amber-100">{data.name}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.bg}`}>{tier.label}{tierLevelStr}</span>
              <span className="text-[10px] text-amber-400">{status.label}</span>
              <div className="flex gap-1 ml-auto">
                <span className="text-[10px] px-1 py-0.5 rounded bg-amber-800 text-amber-200">비서</span>
                {data.subordinateCount > 0 && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-corthex-elevated text-corthex-text-disabled">↓{data.subordinateCount}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`px-4 py-3 rounded-xl ${bgColor} border-2 ${borderColor} shadow-md min-w-[200px]`}
      data-testid="nexus-agent-node"
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium truncate text-emerald-100">{data.name}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.bg}`}>{tier.label}{tierLevelStr}</span>
        <span className="text-[10px] text-emerald-400">{status.label}</span>
        <div className="flex gap-1 ml-auto">
          {data.isSystem && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-corthex-elevated text-corthex-text-disabled">시스템</span>
          )}
          {data.subordinateCount > 0 && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-corthex-elevated text-corthex-text-disabled">↓{data.subordinateCount}</span>
          )}
        </div>
      </div>
    </div>
  )
})
