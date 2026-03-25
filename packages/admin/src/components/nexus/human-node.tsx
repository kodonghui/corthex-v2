import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const ROLE_BADGE: Record<string, { bg: string; label: string }> = {
  ceo: { bg: 'bg-yellow-800 text-yellow-200', label: 'CEO' },
  admin: { bg: 'bg-purple-800 text-purple-200', label: 'Admin' },
  user: { bg: 'bg-corthex-elevated text-corthex-text-disabled', label: 'Staff' },
}

type HumanNodeData = {
  name: string
  username: string
  role: string
  hasCliToken: boolean
  agentCount: number
}

export const HumanNode = memo(function HumanNode({ data, selected }: { data: HumanNodeData; selected?: boolean }) {
  const role = ROLE_BADGE[data.role] || ROLE_BADGE.user

  return (
    <div
      className={`px-4 py-3 rounded-lg bg-purple-950 border-2 shadow-md min-w-[200px] ${
        selected ? 'border-corthex-accent-hover ring-2 ring-corthex-accent-hover/50' : 'border-purple-500'
      }`}
      data-testid="nexus-human-node"
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${data.hasCliToken ? 'bg-emerald-500' : 'bg-slate-500'}`}
          title={data.hasCliToken ? 'CLI 토큰 등록됨' : 'CLI 토큰 미등록'}
        />
        <span className="text-sm font-medium text-purple-100 truncate">{data.name}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${role.bg}`}>{role.label}</span>
        <span className="text-[10px] text-purple-400">@{data.username}</span>
        {data.agentCount > 0 && (
          <span className="text-[10px] px-1 py-0.5 rounded bg-purple-800 text-purple-300 ml-auto">
            AI {data.agentCount}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400 !w-2 !h-2" />
    </div>
  )
})
