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
      className={`px-4 py-3 rounded-xl bg-[#283618] border-2 shadow-md min-w-[240px] transition-all duration-150 ${
        isDropTarget
          ? 'border-[#8fae7a] border-dashed ring-2 ring-[#8fae7a] ring-offset-2 ring-offset-slate-900 scale-105'
          : selected
            ? 'border-[#8fae7a] ring-2 ring-[#8fae7a]/50'
            : 'border-[#5a7247]'
      }`}
      data-testid="nexus-department-node"
    >
      <Handle type="target" position={Position.Top} className="!bg-[#8fae7a] !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#d4e4c8]">{data.name}</span>
        <div className="flex gap-1 ml-auto">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3a5a1c] text-[#a3c48a]">
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
        <div className="text-[10px] text-[#8fae7a] mt-1 truncate">매니저: {data.managerName}</div>
      )}
      {data.description && !data.managerName && (
        <div className="text-[10px] text-[#8fae7a] mt-1 truncate max-w-[220px]">{data.description}</div>
      )}
      {data.description && data.managerName && (
        <div className="text-[10px] text-[#5a7247] truncate max-w-[220px]">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-[#8fae7a] !w-2 !h-2" />
    </div>
  )
})
