import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

type DepartmentNodeData = {
  name: string
  description: string | null
  agentCount: number
  employeeCount: number
  managerName: string | null
  isDropTarget?: boolean
}

export const DepartmentNode = memo(function DepartmentNode({ data, selected }: { data: DepartmentNodeData; selected?: boolean }) {
  const isDropTarget = data.isDropTarget === true

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-corthex-accent-deep border-2 shadow-md min-w-[240px] transition-all duration-150 ${
        isDropTarget
          ? 'border-corthex-accent-hover border-dashed ring-2 ring-corthex-accent-hover ring-offset-2 ring-offset-slate-900 scale-105'
          : selected
            ? 'border-corthex-accent-hover ring-2 ring-corthex-accent-hover/50'
            : 'border-corthex-accent'
      }`}
      data-testid="nexus-department-node"
    >
      <Handle type="target" position={Position.Top} className="!bg-corthex-accent-hover !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-corthex-accent-muted">{data.name}</span>
        <div className="flex gap-1 ml-auto">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-corthex-accent-deep text-corthex-accent-hover">
            {data.agentCount}
          </span>
          {(data.employeeCount ?? 0) > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-800 text-purple-300">
              {data.employeeCount}
            </span>
          )}
        </div>
      </div>
      {data.managerName && (
        <div className="text-[10px] text-corthex-accent-hover mt-1 truncate">매니저: {data.managerName}</div>
      )}
      {data.description && !data.managerName && (
        <div className="text-[10px] text-corthex-accent-hover mt-1 truncate max-w-[220px]">{data.description}</div>
      )}
      {data.description && data.managerName && (
        <div className="text-[10px] text-corthex-accent truncate max-w-[220px]">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-corthex-accent-hover !w-2 !h-2" />
    </div>
  )
})
