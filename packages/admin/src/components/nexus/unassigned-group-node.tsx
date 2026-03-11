import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

type UnassignedGroupNodeData = {
  name: string
  agentCount: number
  isDropTarget?: boolean
}

export const UnassignedGroupNode = memo(function UnassignedGroupNode({ data, selected }: { data: UnassignedGroupNodeData; selected?: boolean }) {
  const isDropTarget = data.isDropTarget === true

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-orange-950/30 border-2 border-dashed shadow-md min-w-[240px] transition-all duration-150 ${
        isDropTarget
          ? 'border-blue-400 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-105'
          : selected
            ? 'border-blue-400 ring-2 ring-blue-400/50'
            : 'border-orange-500'
      }`}
      data-testid="nexus-unassigned-group-node"
    >
      <Handle type="target" position={Position.Top} className="!bg-orange-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-orange-300">{data.name}</span>
        <span className="text-[10px] text-orange-500">부서를 지정하세요</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-800 text-orange-300 ml-auto">
          {data.agentCount}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-400 !w-2 !h-2" />
    </div>
  )
})
