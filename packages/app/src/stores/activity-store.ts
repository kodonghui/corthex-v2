import { create } from 'zustand'
import type { ActivityLogType } from '@corthex/shared'

export type ActivityLog = {
  id: string
  type: ActivityLogType
  phase: 'start' | 'end' | 'error'
  action: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

type ActivityState = {
  logs: ActivityLog[]
  isStreaming: boolean
  addLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => void
  clearLogs: () => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  logs: [],
  isStreaming: false,

  addLog: (log) =>
    set((s) => ({
      logs: [
        { ...log, id: crypto.randomUUID(), createdAt: new Date() },
        ...s.logs,
      ].slice(0, 200),
    })),

  clearLogs: () => set({ logs: [] }),
}))
