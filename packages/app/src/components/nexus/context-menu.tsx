import { useEffect, useRef } from 'react'
import type { SvNodeType } from './sketchvibe-nodes'
import { NODE_PALETTE } from './sketchvibe-nodes'

type ContextMenuAction =
  | { type: 'edit-label'; nodeId: string }
  | { type: 'duplicate'; nodeId: string }
  | { type: 'delete'; nodeId: string }
  | { type: 'add-node'; nodeType: SvNodeType; position: { x: number; y: number } }

interface ContextMenuProps {
  x: number
  y: number
  target: 'node' | 'pane'
  nodeId?: string
  onAction: (action: ContextMenuAction) => void
  onClose: () => void
}

export function ContextMenu({ x, y, target, nodeId, onAction, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 z-[100] min-w-[160px]"
      style={{ left: x, top: y }}
    >
      {target === 'node' && nodeId && (
        <>
          <MenuItem
            label="편집"
            shortcut="더블클릭"
            onClick={() => onAction({ type: 'edit-label', nodeId })}
          />
          <MenuItem
            label="복제"
            onClick={() => onAction({ type: 'duplicate', nodeId })}
          />
          <div className="border-t border-zinc-800 my-1" />
          <MenuItem
            label="삭제"
            shortcut="Del"
            danger
            onClick={() => onAction({ type: 'delete', nodeId })}
          />
        </>
      )}

      {target === 'pane' && (
        <>
          <div className="px-3 py-1 text-[10px] text-zinc-500 font-medium">노드 추가</div>
          {NODE_PALETTE.map((item) => (
            <MenuItem
              key={item.type}
              label={`${item.icon} ${item.label}`}
              onClick={() =>
                onAction({
                  type: 'add-node',
                  nodeType: item.type,
                  position: { x, y },
                })
              }
            />
          ))}
        </>
      )}
    </div>
  )
}

function MenuItem({
  label,
  shortcut,
  danger,
  onClick,
}: {
  label: string
  shortcut?: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-zinc-800 transition-colors ${
        danger ? 'text-red-400 hover:text-red-300' : 'text-zinc-200'
      }`}
    >
      <span>{label}</span>
      {shortcut && <span className="text-[10px] text-zinc-500 ml-4">{shortcut}</span>}
    </button>
  )
}
