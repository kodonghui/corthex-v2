import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

type CompanyNodeData = {
  name: string
  deptCount: number
  agentCount: number
}

export const CompanyNode = memo(function CompanyNode({ data, selected }: { data: CompanyNodeData; selected?: boolean }) {
  return (
    <div
      className={`px-5 py-3 rounded-xl bg-slate-100 text-slate-900 border-2 shadow-lg min-w-[280px] ${
        selected ? 'border-[#8fae7a] ring-2 ring-[#8fae7a]/50' : 'border-slate-300'
      }`}
      data-testid="nexus-company-node"
    >
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg bg-[#5a7247] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {data.name.charAt(0)}
        </span>
        <div>
          <div className="text-sm font-bold">{data.name}</div>
          <div className="text-[11px] text-slate-500">
            {data.deptCount}개 부서 · {data.agentCount}명 에이전트
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  )
})
