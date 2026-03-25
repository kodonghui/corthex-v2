import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Building2 } from 'lucide-react'

type CompanyData = { label: string; slug: string }

export function CompanyNode({ data }: NodeProps) {
  const d = data as unknown as CompanyData
  return (
    <div className="px-6 py-4 rounded-2xl bg-corthex-accent-deep border border-corthex-accent/40 shadow-[0_8px_30px_rgba(40,54,24,0.25)] min-w-[220px] text-center relative">
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-corthex-accent flex items-center justify-center shadow-md">
        <Building2 className="w-5 h-5 text-corthex-bg" />
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-corthex-accent-hover mb-1">COMPANY</div>
      <div className="text-lg font-bold text-corthex-bg">{d.label}</div>
      <div className="text-xs text-corthex-accent-hover mt-0.5 font-mono">{d.slug}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-corthex-accent !w-2.5 !h-2.5 !border-2 !border-corthex-accent-deep" />
    </div>
  )
}
