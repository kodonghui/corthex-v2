import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FolderTree } from 'lucide-react'

type DepartmentData = { label: string; description: string | null; agentCount: number }

export function DepartmentNode({ data, selected }: NodeProps) {
  const d = data as unknown as DepartmentData
  return (
    <div
      className={`px-5 py-3.5 rounded-xl bg-white shadow-[0_4px_20px_rgba(40,54,24,0.08)] border min-w-[180px] transition-all ${
        selected
          ? 'border-[#5a7247] ring-2 ring-[#5a7247]/20'
          : 'border-[#e5e1d3]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#5a7247] !w-2 !h-2 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1.5">
        <FolderTree className="w-3.5 h-3.5 text-[#6b705c]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b705c]">DEPARTMENT</span>
      </div>
      <div className="text-sm font-bold text-[#283618]">{d.label}</div>
      {d.description && (
        <div className="text-xs text-[#6b705c] mt-1 truncate max-w-[160px]">{d.description}</div>
      )}
      <div className="text-[10px] text-[#a3b18a] mt-2 flex items-center gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5a7247]" />
        {d.agentCount} agents
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#5a7247] !w-2 !h-2 !border-2 !border-white" />
    </div>
  )
}
