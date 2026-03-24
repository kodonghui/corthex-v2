import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Agent } from '@corthex/shared'

// ── Query keys ──

export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters?: { departmentId?: string; status?: string }) =>
    [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  hierarchy: () => [...agentKeys.all, 'hierarchy'] as const,
}

// ── List agents ──

type AgentListResponse = { success: boolean; data: Agent[] }

export function useAgents(filters?: { departmentId?: string; status?: string }) {
  return useQuery({
    queryKey: agentKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters?.departmentId) params.set('departmentId', filters.departmentId)
      if (filters?.status) params.set('status', filters.status)
      const qs = params.toString()
      return api.get<AgentListResponse>(`/workspace/agents${qs ? `?${qs}` : ''}`)
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

// ── Get single agent ──

type AgentDetailResponse = { success: boolean; data: Agent }

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: agentKeys.detail(id!),
    queryFn: () => api.get<AgentDetailResponse>(`/workspace/agents/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
}

// ── Update agent ──

export function useUpdateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) =>
      api.put<AgentDetailResponse>(`/workspace/agents/${id}`, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}
