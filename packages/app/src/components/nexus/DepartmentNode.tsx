import { Handle, Position, type NodeProps } from '@xyflow/react'
import { FolderTree } from 'lucide-react'

type DepartmentData = { label: string; description: string | null; agentCount: number }

export function DepartmentNode({ data, selected }: NodeProps) {
  const d = data as unknown as DepartmentData
  return (
    <div
      className={`px-5 py-3.5 rounded-xl bg-corthex-surface shadow-[0_4px_20px_rgba(40,54,24,0.08)] border min-w-[180px] transition-all ${
        selected
          ? 'border-corthex-accent ring-2 ring-corthex-accent/20'
          : 'border-corthex-border'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-corthex-accent !w-2 !h-2 !border-2 !border-white" />
      <div className="flex items-center gap-2 mb-1.5">
        <FolderTree className="w-3.5 h-3.5 text-corthex-text-secondary" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-corthex-text-secondary">DEPARTMENT</span>
      </div>
      <div className="text-sm font-bold text-corthex-accent-deep">{d.label}</div>
      {d.description && (
        <div className="text-xs text-corthex-text-secondary mt-1 truncate max-w-[160px]">{d.description}</div>
      )}
      <div className="text-[10px] text-corthex-accent-hover mt-2 flex items-center gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-corthex-accent" />
        {d.agentCount} agents
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-corthex-accent !w-2 !h-2 !border-2 !border-white" />
    </div>
  )
}
