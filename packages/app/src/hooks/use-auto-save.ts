import { useEffect, useRef, useCallback } from 'react'
import { api } from '../lib/api'

interface AutoSaveOptions {
  sketchId: string | null
  dirty: boolean
  getGraphData: () => { nodes: unknown[]; edges: unknown[] }
  onSaved: () => void
  debounceMs?: number
}

export function useAutoSave({
  sketchId,
  dirty,
  getGraphData,
  onSaved,
  debounceMs = 30_000,
}: AutoSaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)

  const save = useCallback(async () => {
    if (!sketchId || savingRef.current) return
    savingRef.current = true
    try {
      await api.put(`/workspace/sketches/${sketchId}?autoSave=true`, {
        graphData: getGraphData(),
      })
      onSaved()
    } catch {
      // Silently ignore auto-save failures
    } finally {
      savingRef.current = false
    }
  }, [sketchId, getGraphData, onSaved])

  useEffect(() => {
    if (!sketchId || !dirty) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setTimeout(save, debounceMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [sketchId, dirty, save, debounceMs])
}
