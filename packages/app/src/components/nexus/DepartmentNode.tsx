import { Handle, Position, type NodeProps } from '@xyflow/react'

type DepartmentData = { label: string; description: string | null; agentCount: number }

export function DepartmentNode({ data, selected }: NodeProps) {
  const d = data as unknown as DepartmentData
  return (
    <div
      className={`px-5 py-3 rounded-lg bg-white shadow-md border-2 min-w-[180px] ${
        selected
          ? 'border-[#5a7247] ring-2 ring-[#5a7247]/20'
          : 'border-stone-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-500 !w-2 !h-2 !border-2 !border-slate-900" />
      <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">DEPARTMENT</div>
      <div className="text-sm font-bold text-slate-100">{d.label}</div>
      {d.description && (
        <div className="text-xs text-stone-500 mt-1 truncate max-w-[160px]">{d.description}</div>
      )}
      <div className="text-[10px] text-stone-400 mt-1.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        {d.agentCount}명 에이전트
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !w-2 !h-2 !border-2 !border-slate-900" />
    </div>
  )
}
