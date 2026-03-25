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
      className={`px-5 py-3 rounded-xl bg-corthex-elevated text-corthex-text-primary border-2 shadow-lg min-w-[280px] ${
        selected ? 'border-corthex-accent-hover ring-2 ring-corthex-accent-hover/50' : 'border-corthex-border'
      }`}
      data-testid="nexus-company-node"
    >
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg bg-corthex-accent text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {data.name.charAt(0)}
        </span>
        <div>
          <div className="text-sm font-bold">{data.name}</div>
          <div className="text-[11px] text-corthex-text-secondary">
            {data.deptCount}개 부서 · {data.agentCount}명 에이전트
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  )
})
