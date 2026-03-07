import { create } from 'zustand'

export type DelegationStep = {
  id: string
  commandId: string
  event: string
  agentId?: string
  agentName?: string
  phase: string
  elapsed: number
  data?: Record<string, unknown>
  timestamp: string
  children: DelegationStep[]
}

export type CommandMessage = {
  id: string
  role: 'user' | 'agent' | 'system'
  text: string
  agentName?: string
  commandId?: string
  status?: string
  result?: string
  quality?: { passed: boolean; score?: number }
  createdAt: string
}

type CommandStoreState = {
  messages: CommandMessage[]
  activeCommandId: string | null
  delegationSteps: DelegationStep[]
  selectedReportId: string | null
  viewMode: 'chat' | 'report'

  addMessage: (msg: CommandMessage) => void
  setMessages: (msgs: CommandMessage[]) => void
  setActiveCommand: (id: string | null) => void
  addDelegationStep: (step: Omit<DelegationStep, 'children'>) => void
  clearDelegation: () => void
  setSelectedReport: (id: string | null) => void
  setViewMode: (mode: 'chat' | 'report') => void
  updateMessageResult: (commandId: string, result: string, quality?: { passed: boolean; score?: number }) => void
}

export const useCommandStore = create<CommandStoreState>((set) => ({
  messages: [],
  activeCommandId: null,
  delegationSteps: [],
  selectedReportId: null,
  viewMode: 'chat',

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setMessages: (msgs) => set({ messages: msgs }),

  setActiveCommand: (id) => set({ activeCommandId: id }),

  addDelegationStep: (step) =>
    set((s) => ({ delegationSteps: [...s.delegationSteps, { ...step, children: [] }] })),

  clearDelegation: () => set({ delegationSteps: [], activeCommandId: null }),

  setSelectedReport: (id) => set({ selectedReportId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  updateMessageResult: (commandId, result, quality) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.commandId === commandId
          ? { ...m, result, status: 'completed', quality }
          : m,
      ),
    })),
}))
