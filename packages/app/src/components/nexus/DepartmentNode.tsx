import { Handle, Position, type NodeProps } from '@xyflow/react'

type DepartmentData = { label: string; description: string | null; agentCount: number }

export function DepartmentNode({ data, selected }: NodeProps) {
  const d = data as unknown as DepartmentData
  return (
    <div
      className={`px-5 py-3 rounded-lg bg-white dark:bg-zinc-800 shadow-md border-2 min-w-[180px] ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-200'
          : 'border-zinc-300 dark:border-zinc-600'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-zinc-400" />
      <div className="text-[10px] font-medium text-zinc-400 mb-1">DEPARTMENT</div>
      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{d.label}</div>
      {d.description && (
        <div className="text-xs text-zinc-500 mt-1 truncate max-w-[160px]">{d.description}</div>
      )}
      <div className="text-[10px] text-zinc-400 mt-1">{d.agentCount}명 에이전트</div>
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-400" />
    </div>
  )
}
