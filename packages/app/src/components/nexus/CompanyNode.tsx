import { Handle, Position, type NodeProps } from '@xyflow/react'

type CompanyData = { label: string; slug: string }

export function CompanyNode({ data }: NodeProps) {
  const d = data as unknown as CompanyData
  return (
    <div className="px-6 py-4 rounded-xl bg-indigo-600 text-white shadow-lg border-2 border-indigo-400 min-w-[200px] text-center">
      <div className="text-[10px] font-medium opacity-70 mb-1">COMPANY</div>
      <div className="text-lg font-bold">{d.label}</div>
      <div className="text-xs opacity-50">{d.slug}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-300" />
    </div>
  )
}
