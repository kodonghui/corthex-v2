import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

type DepartmentNodeData = {
  name: string
  description: string | null
  agentCount: number
  employeeCount: number
  managerName: string | null
}

export const DepartmentNode = memo(function DepartmentNode({ data, selected }: { data: DepartmentNodeData; selected?: boolean }) {
  return (
    <div
      className={`px-4 py-3 rounded-xl bg-blue-950 border-2 shadow-md min-w-[240px] ${
        selected ? 'border-blue-400 ring-2 ring-blue-400/50' : 'border-blue-600'
      }`}
      data-testid="nexus-department-node"
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-blue-100">{data.name}</span>
        <div className="flex gap-1 ml-auto">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-800 text-blue-300">
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
        <div className="text-[10px] text-blue-400 mt-1 truncate">매니저: {data.managerName}</div>
      )}
      {data.description && !data.managerName && (
        <div className="text-[10px] text-blue-400 mt-1 truncate max-w-[220px]">{data.description}</div>
      )}
      {data.description && data.managerName && (
        <div className="text-[10px] text-blue-500 truncate max-w-[220px]">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400 !w-2 !h-2" />
    </div>
  )
})
