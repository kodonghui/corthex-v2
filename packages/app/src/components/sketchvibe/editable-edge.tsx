import { useState, useCallback, useRef, useEffect } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'

export function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const [editing, setEditing] = useState(false)
  const [text, setText] = useState((data as { label?: string })?.label || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const label = (data as { label?: string })?.label || ''
  const onLabelChange = (data as { onEdgeLabelChange?: (id: string, label: string) => void })
    ?.onEdgeLabelChange

  useEffect(() => {
    setText(label)
  }, [label])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    setEditing(false)
    const trimmed = text.trim()
    if (trimmed !== label) {
      onLabelChange?.(id, trimmed)
    }
  }, [text, label, id, onLabelChange])

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#6366f1' : '#64748b',
          strokeWidth: selected ? 2 : 1.5,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onDoubleClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') {
                  setText(label)
                  setEditing(false)
                }
              }}
              className="bg-stone-100 border border-stone-300 rounded px-2 py-0.5 text-xs text-corthex-text-disabled outline-none min-w-[60px] text-center"
              onClick={(e) => e.stopPropagation()}
            />
          ) : label ? (
            <span
              className="bg-corthex-surface/90 border border-stone-200 rounded px-2 py-0.5 text-[10px] text-stone-600 cursor-text select-none"
              title="더블클릭으로 편집"
            >
              {label}
            </span>
          ) : selected ? (
            <span
              className="bg-corthex-surface/70 border border-dashed border-stone-300 rounded px-2 py-0.5 text-[10px] text-stone-400 cursor-text"
              title="더블클릭으로 라벨 추가"
            >
              라벨 추가
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const sketchVibeEdgeTypes = {
  editable: EditableEdge,
}
