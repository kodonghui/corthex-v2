import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Agent, ArgosStatus, PerformanceSummary } from '@corthex/shared'

// === 1. Agent detail — HIGH priority ===

export function useAgentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['agent-detail', id],
    queryFn: () => api.get<{ success: boolean; data: Agent }>(`/workspace/agents/${id}`),
    enabled: !!id,
  })
}

// === 2. Agent hierarchy — tree view ===

type AgentHierarchyNode = {
  id: string
  name: string
  role: string
  tier: string
  departmentId: string | null
  reportTo: string | null
  status: string
  children: AgentHierarchyNode[]
}

export function useAgentHierarchy() {
  return useQuery({
    queryKey: ['agent-hierarchy'],
    queryFn: () => api.get<{ success: boolean; data: AgentHierarchyNode[] }>('/workspace/agents/hierarchy'),
  })
}

// === 3. Delegation rules ===

type DelegationRule = {
  id: string
  fromAgentId: string
  toAgentId: string
  condition: string | null
  createdAt: string
}

export function useDelegationRules() {
  return useQuery({
    queryKey: ['delegation-rules'],
    queryFn: () => api.get<{ success: boolean; data: DelegationRule[] }>('/workspace/agents/delegation-rules'),
  })
}

// === 4. Delegation rule mutations (create + delete) ===

export function useDelegationRuleMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (data: { fromAgentId: string; toAgentId: string; condition?: string }) =>
      api.post<{ success: boolean; data: DelegationRule }>('/workspace/agents/delegation-rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegation-rules'] })
    },
  })

  const remove = useMutation({
    mutationFn: (ruleId: string) =>
      api.delete<{ success: boolean; data: { deleted: boolean } }>(`/workspace/agents/delegation-rules/${ruleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegation-rules'] })
    },
  })

  return { create, remove }
}

// === 5. Department detail — HIGH priority ===

type Department = {
  id: string
  companyId: string
  name: string
  parentId: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export function useDepartmentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['department-detail', id],
    queryFn: () => api.get<{ success: boolean; data: Department }>(`/admin/departments/${id}`),
    enabled: !!id,
  })
}

// === 6. Department tree ===

type DepartmentTreeNode = Department & {
  children: DepartmentTreeNode[]
}

export function useDepartmentTree() {
  return useQuery({
    queryKey: ['department-tree'],
    queryFn: () => api.get<{ success: boolean; data: DepartmentTreeNode[] }>('/admin/departments/tree'),
  })
}

// === 7. ARGOS status ===

export function useArgosStatus() {
  return useQuery({
    queryKey: ['argos-status'],
    queryFn: () => api.get<{ success: boolean; data: ArgosStatus }>('/workspace/argos/status'),
    staleTime: 30_000,
  })
}

// === 8. Dashboard stats ===

type DashboardStats = {
  totalAgents: number
  activeAgents: number
  totalCommands: number
  totalCostUsd: number
  avgResponseTimeMs: number
  successRate: number
}

export function useDashboardStats(days = 7) {
  return useQuery({
    queryKey: ['dashboard-stats', days],
    queryFn: () => api.get<{ success: boolean; data: DashboardStats }>(`/workspace/dashboard/stats?days=${days}`),
    staleTime: 60_000,
  })
}

// === 9. Costs by agent ===

type CostItem = {
  id: string
  name: string
  costUsd: number
  callCount: number
}

export function useCostsByAgent(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['costs-by-agent', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      return api.get<{ success: boolean; data: { items: CostItem[] } }>(`/workspace/dashboard/costs/by-agent?${params}`)
    },
  })
}

// === 10. Costs by tier ===

export function useCostsByTier(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['costs-by-tier', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      return api.get<{ success: boolean; data: { items: CostItem[] } }>(`/workspace/dashboard/costs/by-tier?${params}`)
    },
  })
}

// === 11. Handoff depth settings ===

export function useHandoffDepth() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['handoff-depth'],
    queryFn: () => api.get<{ success: boolean; data: { maxHandoffDepth: number } }>('/admin/company-settings/handoff-depth'),
  })

  const update = useMutation({
    mutationFn: (maxHandoffDepth: number) =>
      api.put<{ success: boolean; data: { maxHandoffDepth: number } }>('/admin/company-settings/handoff-depth', { maxHandoffDepth }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handoff-depth'] })
    },
  })

  return { ...query, update }
}

// === 12. Dashboard activity feed ===

type ActivityFeedItem = {
  id: string
  type: string
  agentName: string | null
  summary: string
  createdAt: string
}

export function useDashboardActivityFeed(limit = 20) {
  return useQuery({
    queryKey: ['dashboard-activity-feed', limit],
    queryFn: () => api.get<{ success: boolean; data: ActivityFeedItem[] }>(`/workspace/activity-log?limit=${limit}`),
    staleTime: 30_000,
  })
}

// === 13. Performance summary ===

export function usePerformanceSummary() {
  return useQuery({
    queryKey: ['performance-summary'],
    queryFn: () => api.get<{ success: boolean; data: PerformanceSummary }>('/workspace/performance/summary'),
    staleTime: 60_000,
  })
}
