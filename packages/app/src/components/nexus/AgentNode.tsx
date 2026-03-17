import { Handle, Position, type NodeProps } from '@xyflow/react'

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-emerald-400',
  working: 'bg-amber-400',
  error: 'bg-red-400',
  offline: 'bg-slate-500',
}

type AgentData = { label: string; role: string; status: string; isSecretary: boolean }

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as unknown as AgentData
  return (
    <div
      className={`px-4 py-3 rounded-lg bg-white shadow border min-w-[160px] ${
        selected
          ? 'border-[#5a7247] ring-2 ring-[#5a7247]/20'
          : 'border-stone-200'
      } ${d.isSecretary ? 'ring-1 ring-amber-400/30' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-2 !border-2 !border-slate-900" />
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[d.status] || 'bg-slate-500'}`} />
        <span className="text-sm font-medium text-slate-100">{d.label}</span>
        {d.isSecretary && (
          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
            비서
          </span>
        )}
      </div>
      {d.role && <div className="text-xs text-stone-500">{d.role}</div>}
    </div>
  )
}
