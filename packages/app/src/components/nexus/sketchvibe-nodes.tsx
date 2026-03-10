import { useState, useCallback } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

// 공통: 더블클릭으로 이름 편집
function EditableLabel({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)

  const commit = useCallback(() => {
    setEditing(false)
    if (text.trim() && text !== value) onChange(text.trim())
  }, [text, value, onChange])

  if (editing) {
    return (
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setText(value)
            setEditing(false)
          }
        }}
        className={`bg-transparent border-b border-current outline-none text-center w-full ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <span
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
      className={`cursor-text select-none ${className}`}
      title="더블클릭으로 편집"
    >
      {value}
    </span>
  )
}

type SvNodeData = { label: string; onLabelChange?: (id: string, label: string) => void }

function useLabel(id: string, data: Record<string, unknown>) {
  const d = data as unknown as SvNodeData
  const onChange = useCallback(
    (label: string) => d.onLabelChange?.(id, label),
    [id, d.onLabelChange],
  )
  return { label: d.label || 'untitled', onChange }
}

// 1. Start (녹색 원형)
export function StartNode({ id, data, selected }: NodeProps) {
  const { label, onChange } = useLabel(id, data as Record<string, unknown>)
  return (
    <div
      className={`flex items-center justify-center w-28 h-14 rounded-full bg-emerald-500 text-white shadow-md border-2 ${
        selected ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-emerald-600'
      }`}
    >
      <EditableLabel value={label} onChange={onChange} className="text-sm font-semibold" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-300" />
      <Handle type="source" position={Position.Right} className="!bg-emerald-300" />
    </div>
  )
}

// 2. End (빨간 원형)
export function EndNode({ id, data, selected }: NodeProps) {
  const { label, onChange } = useLabel(id, data as Record<string, unknown>)
  return (
    <div
      className={`flex items-center justify-center w-28 h-14 rounded-full bg-red-500 text-white shadow-md border-2 ${
        selected ? 'border-red-300 ring-2 ring-red-200' : 'border-red-600'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-red-300" />
      <Handle type="target" position={Position.Left} className="!bg-red-300" />
      <EditableLabel value={label} onChange={onChange} className="text-sm font-semibold" />
    </div>
  )
}

// 3. Agent (파란색)
export function SvAgentNode({ id, data, selected }: NodeProps) {
  const { label, onChange } = useLabel(id, data as Record<string, unknown>)
  return (
    <div
      className={`px-4 py-3 rounded-lg bg-blue-900/40 shadow-md border-2 min-w-[140px] text-center ${
        selected ? 'border-blue-400 ring-2 ring-blue-200' : 'border-blue-700'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      <Handle type="target" position={Position.Left} className="!bg-blue-400" />
      <div className="text-[10px] text-blue-500 font-medium mb-1">AGENT</div>
      <EditableLabel value={label} onChange={onChange} className="text-sm font-bold text-blue-200" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
      <Handle type="source" position={Position.Right} className="!bg-blue-400" />
    </div>
  )
}

// 4. System (어두운 회색)
export function SystemNode({ id, data, selected }: NodeProps) {
  const { label, onChange } = useLabel(id, data as Record<string, unknown>)
  return (
    <div
      className={`px-4 py-3 rounded-md bg-slate-800 shadow-md border-2 min-w-[140px] text-center ${
        selected ? 'border-slate-400 ring-2 ring-slate-300' : 'border-slate-600'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <div className="text-[10px] text-slate-500 font-medium mb-1">SYSTEM</div>
      <EditableLabel value={label} onChange={onChange} className="text-sm font-bold text-slate-200" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />
    </div>
  )
}

// 5. API (주황색, 육각형 느낌)
export function ApiNode({ id, data, selected }: NodeProps) {
  const { label, onChange } = useLabel(id, data as Record<string, unknown>)
  return (
    <div
      className={`px-4 py-3 bg-orange-900/30 shadow-md border-2 min-w-[140px] text-center ${
        selected ? 'border-orange-400 ring-2 ring-orange-200' : 'border-orange-700'
      }`}
      style={{ clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-orange-400" />
      <Handle type="target" position={Position.Left} className="!bg-orange-400" />
      <div className="text-[10px] text-orange-600 font-medium mb-1">API</div>
      <EditableLabel value={label} onChange={onChange} className="text-sm font-bold text-orange-200" />
      <Handle type="source" position={Position.Bottom} className="!bg-orange-400" />
      <Handle type="source" position={Position.Right} className="!bg-orange-400" />
    </div>
  )
}

// 6. Decide (노란 다이아몬드)
export function DecideNode({ id, data, selected }: NodeProps) {
  const { label, onChange } = useLabel(id, data as Record<string, unknown>)
  return (
    <div
      className={`w-36 h-36 flex items-center justify-center bg-yellow-900/30 shadow-md border-2 text-center ${
        selected ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-yellow-700'
      }`}
      style={{ transform: 'rotate(45deg)' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-yellow-400" />
      <Handle type="target" position={Position.Left} className="!bg-yellow-400" />
      <div style={{ transform: 'rotate(-45deg)' }} className="px-2">
        <div className="text-[10px] text-yellow-600 font-medium mb-0.5">DECIDE</div>
        <EditableLabel value={label} onChange={onChange} className="text-xs font-bold text-yellow-200" />
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-yellow-400" />
      <Handle type="source" position={Position.Right} className="!bg-yellow-400" />
    </div>
  )
}

// 7. DB (보라색, 실린더 느낌)
export function DbNode({ id, data, selected }: NodeProps) {
  const { label, onChange } = useLabel(id, data as Record<string, unknown>)
  return (
    <div
      className={`px-4 py-3 rounded-lg bg-purple-900/30 shadow-md border-2 min-w-[140px] text-center relative ${
        selected ? 'border-purple-400 ring-2 ring-purple-200' : 'border-purple-700'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <Handle type="target" position={Position.Left} className="!bg-purple-400" />
      {/* 실린더 상단 타원 */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[80%] h-3 rounded-full bg-purple-700 border border-purple-600" />
      <div className="mt-1">
        <div className="text-[10px] text-purple-500 font-medium mb-1">DB</div>
        <EditableLabel value={label} onChange={onChange} className="text-sm font-bold text-purple-200" />
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400" />
      <Handle type="source" position={Position.Right} className="!bg-purple-400" />
    </div>
  )
}

// 8. Note (연노랑 스티키노트)
export function NoteNode({ id, data, selected }: NodeProps) {
  const { label, onChange } = useLabel(id, data as Record<string, unknown>)
  return (
    <div
      className={`px-4 py-3 bg-amber-900/20 shadow border min-w-[120px] max-w-[200px] ${
        selected ? 'border-amber-400 ring-2 ring-amber-200' : 'border-amber-700'
      }`}
      style={{ borderTopRightRadius: 0, clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400" />
      <Handle type="target" position={Position.Left} className="!bg-amber-400" />
      <EditableLabel value={label} onChange={onChange} className="text-xs text-amber-200 whitespace-pre-wrap" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
      <Handle type="source" position={Position.Right} className="!bg-amber-400" />
    </div>
  )
}

export const sketchVibeNodeTypes = {
  start: StartNode,
  end: EndNode,
  agent: SvAgentNode,
  system: SystemNode,
  api: ApiNode,
  decide: DecideNode,
  db: DbNode,
  note: NoteNode,
}

export type SvNodeType = keyof typeof sketchVibeNodeTypes

export const NODE_PALETTE: { type: SvNodeType; label: string; color: string; icon: string }[] = [
  { type: 'start', label: '시작', color: 'bg-emerald-500', icon: '▶' },
  { type: 'end', label: '종료', color: 'bg-red-500', icon: '■' },
  { type: 'agent', label: '에이전트', color: 'bg-blue-500', icon: '🤖' },
  { type: 'system', label: '시스템', color: 'bg-slate-500', icon: '⚙' },
  { type: 'api', label: 'API', color: 'bg-orange-500', icon: '🔗' },
  { type: 'decide', label: '결정분기', color: 'bg-yellow-500', icon: '◇' },
  { type: 'db', label: '데이터베이스', color: 'bg-purple-500', icon: '🗄' },
  { type: 'note', label: '메모', color: 'bg-amber-400', icon: '📝' },
]
