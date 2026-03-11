import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export type UndoAction =
  | { type: 'move-agent'; agentId: string; agentName: string; fromDeptId: string | null; toDeptId: string | null; fromDeptName: string; toDeptName: string }
  | { type: 'batch-move'; agents: Array<{ agentId: string; agentName: string; fromDeptId: string | null }>; toDeptId: string | null; toDeptName: string }

const MAX_HISTORY = 20

export function useNexusUndo(onComplete: () => void) {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([])
  const [redoStack, setRedoStack] = useState<UndoAction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const pushAction = useCallback((action: UndoAction) => {
    setUndoStack((prev) => [...prev.slice(-(MAX_HISTORY - 1)), action])
    setRedoStack([]) // redo clears on new action
  }, [])

  const undo = useCallback(async () => {
    const action = undoStack[undoStack.length - 1]
    if (!action || isProcessing) return null

    setIsProcessing(true)
    try {
      if (action.type === 'move-agent') {
        await api.patch(`/admin/nexus/agent/${action.agentId}/department`, {
          departmentId: action.fromDeptId,
        })
      } else {
        // batch-move: restore each agent to its original department (parallel)
        await Promise.all(
          action.agents.map((a) =>
            api.patch(`/admin/nexus/agent/${a.agentId}/department`, {
              departmentId: a.fromDeptId,
            }),
          ),
        )
      }

      setUndoStack((prev) => prev.slice(0, -1))
      setRedoStack((prev) => [...prev, action])
      onComplete()
      return action
    } catch {
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [undoStack, isProcessing, onComplete])

  const redo = useCallback(async () => {
    const action = redoStack[redoStack.length - 1]
    if (!action || isProcessing) return null

    setIsProcessing(true)
    try {
      if (action.type === 'move-agent') {
        await api.patch(`/admin/nexus/agent/${action.agentId}/department`, {
          departmentId: action.toDeptId,
        })
      } else {
        await api.patch('/admin/nexus/agents/department', {
          agentIds: action.agents.map((a) => a.agentId),
          departmentId: action.toDeptId,
        })
      }

      setRedoStack((prev) => prev.slice(0, -1))
      setUndoStack((prev) => [...prev, action])
      onComplete()
      return action
    } catch {
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [redoStack, isProcessing, onComplete])

  const canUndo = undoStack.length > 0 && !isProcessing
  const canRedo = redoStack.length > 0 && !isProcessing

  const undoLabel = undoStack.length > 0
    ? undoStack[undoStack.length - 1].type === 'move-agent'
      ? `실행 취소: ${(undoStack[undoStack.length - 1] as { agentName: string }).agentName} 이동`
      : `실행 취소: 일괄 이동`
    : ''

  const redoLabel = redoStack.length > 0
    ? redoStack[redoStack.length - 1].type === 'move-agent'
      ? `다시 실행: ${(redoStack[redoStack.length - 1] as { agentName: string }).agentName} 이동`
      : `다시 실행: 일괄 이동`
    : ''

  return {
    pushAction,
    undo,
    redo,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    isProcessing,
  }
}
