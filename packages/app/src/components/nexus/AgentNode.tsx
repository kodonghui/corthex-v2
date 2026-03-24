import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Bot, Shield } from 'lucide-react'

const STATUS_COLORS: Record<string, { dot: string; label: string }> = {
  online: { dot: 'bg-emerald-500', label: 'Online' },
  working: { dot: 'bg-amber-500 animate-pulse', label: 'Working' },
  error: { dot: 'bg-red-500', label: 'Error' },
  offline: { dot: 'bg-[#a3b18a]', label: 'Offline' },
}

const TIER_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  manager: { bg: 'bg-[#283618]', text: 'text-[#faf8f5]', label: 'MGR' },
  specialist: { bg: 'bg-[#5a7247]', text: 'text-[#faf8f5]', label: 'SPE' },
  worker: { bg: 'bg-[#e5e1d3]', text: 'text-[#283618]', label: 'WRK' },
}

type AgentData = {
  label: string
  role: string
  status: string
  isSecretary: boolean
  tier?: string
  avatarUrl?: string
}

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as unknown as AgentData
  const statusInfo = STATUS_COLORS[d.status] || STATUS_COLORS.offline
  const tierInfo = d.tier ? TIER_BADGES[d.tier] : null

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-white shadow-[0_2px_12px_rgba(40,54,24,0.06)] border min-w-[170px] transition-all hover:shadow-[0_4px_20px_rgba(40,54,24,0.12)] ${
        selected
          ? 'border-[#5a7247] ring-2 ring-[#5a7247]/20'
          : 'border-[#e5e1d3]'
      } ${d.isSecretary ? 'ring-1 ring-amber-400/30 border-amber-300/50' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#5a7247] !w-2 !h-2 !border-2 !border-white" />

      <div className="flex items-center gap-2.5">
        {/* Agent Avatar */}
        <div className="w-8 h-8 rounded-lg bg-[#f5f0e8] flex items-center justify-center flex-shrink-0">
          {d.avatarUrl ? (
            <img src={d.avatarUrl} alt={d.label} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <Bot className="w-4 h-4 text-[#5a7247]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusInfo.dot}`} />
            <span className="text-sm font-semibold text-[#283618] truncate">{d.label}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {tierInfo && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${tierInfo.bg} ${tierInfo.text}`}>
                {tierInfo.label}
              </span>
            )}
            {d.isSecretary && (
              <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" />
                비서
              </span>
            )}
          </div>
        </div>
      </div>

      {d.role && <div className="text-[11px] text-[#6b705c] mt-1.5 truncate">{d.role}</div>}
    </div>
  )
}
