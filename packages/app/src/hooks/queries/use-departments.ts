import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

// ── Types ──

type Department = {
  id: string
  companyId: string
  name: string
  parentId: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

type DepartmentTreeNode = Department & {
  children: DepartmentTreeNode[]
}

// ── Query keys ──

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: () => [...departmentKeys.lists()] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
  tree: () => [...departmentKeys.all, 'tree'] as const,
}

// ── List departments ──

type DeptListResponse = { success: boolean; data: Department[] }

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.list(),
    queryFn: () => api.get<DeptListResponse>('/admin/departments'),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  })
}

// ── Get single department ──

type DeptDetailResponse = { success: boolean; data: Department }

export function useDepartment(id: string | undefined) {
  return useQuery({
    queryKey: departmentKeys.detail(id!),
    queryFn: () => api.get<DeptDetailResponse>(`/admin/departments/${id}`),
    enabled: !!id,
    staleTime: 60_000,
  })
}

// ── Department tree ──

type DeptTreeResponse = { success: boolean; data: DepartmentTreeNode[] }

export function useDepartmentTree() {
  return useQuery({
    queryKey: departmentKeys.tree(),
    queryFn: () => api.get<DeptTreeResponse>('/admin/departments/tree'),
    staleTime: 60_000,
  })
}

// ── Create department ──

export function useCreateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; parentId?: string; description?: string }) =>
      api.post<DeptDetailResponse>('/admin/departments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
  })
}

// ── Update department ──

export function useUpdateDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      api.put<DeptDetailResponse>(`/admin/departments/${id}`, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: departmentKeys.tree() })
    },
  })
}
