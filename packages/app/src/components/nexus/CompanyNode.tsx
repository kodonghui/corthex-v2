import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Hexagon } from 'lucide-react'

type CompanyData = { label: string; slug: string }

export function CompanyNode({ data }: NodeProps) {
  const d = data as unknown as CompanyData
  return (
    <div className="px-6 py-4 rounded-xl bg-slate-900 border-2 border-cyan-400/30 shadow-lg shadow-cyan-400/10 min-w-[200px] text-center relative">
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-cyan-400/20 flex items-center justify-center">
        <Hexagon className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70 mb-1">COMPANY</div>
      <div className="text-lg font-bold text-white">{d.label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{d.slug}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-2.5 !h-2.5 !border-2 !border-slate-900" />
    </div>
  )
}
