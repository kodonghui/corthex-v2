import { Handle, Position, type NodeProps } from '@xyflow/react'

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-400',
  working: 'bg-yellow-400',
  error: 'bg-red-400',
  offline: 'bg-zinc-300',
}

type AgentData = { label: string; role: string; status: string; isSecretary: boolean }

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as unknown as AgentData
  return (
    <div
      className={`px-4 py-3 rounded-lg bg-white dark:bg-zinc-800 shadow border min-w-[160px] ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-200'
          : 'border-zinc-200 dark:border-zinc-700'
      } ${d.isSecretary ? 'ring-1 ring-amber-300' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-400" />
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[d.status] || 'bg-zinc-300'}`} />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{d.label}</span>
        {d.isSecretary && (
          <span className="text-[9px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1 rounded">
            비서
          </span>
        )}
      </div>
      {d.role && <div className="text-xs text-zinc-500">{d.role}</div>}
    </div>
  )
}
