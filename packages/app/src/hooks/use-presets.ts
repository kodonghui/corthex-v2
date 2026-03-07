import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export type Preset = {
  id: string
  companyId: string
  userId: string
  name: string
  description: string | null
  command: string
  category: string | null
  isGlobal: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type CreatePresetInput = {
  name: string
  command: string
  description?: string | null
  category?: string | null
}

type UpdatePresetInput = {
  name?: string
  command?: string
  description?: string | null
  category?: string | null
  sortOrder?: number
  isActive?: boolean
}

export function usePresets() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['presets'],
    queryFn: () => api.get<{ success: boolean; data: Preset[] }>('/workspace/presets'),
  })

  const createMutation = useMutation({
    mutationFn: (input: CreatePresetInput) =>
      api.post<{ success: boolean; data: Preset }>('/workspace/presets', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...input }: UpdatePresetInput & { id: string }) =>
      api.patch<{ success: boolean; data: Preset }>(`/workspace/presets/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete<{ success: boolean; data: { deleted: boolean } }>(`/workspace/presets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] })
    },
  })

  const executeMutation = useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean; data: { id: string; type: string; status: string; presetId: string; presetName: string; createdAt: string } }>(
        `/workspace/presets/${id}/execute`,
        {},
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] })
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })

  return {
    presets: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createPreset: createMutation.mutateAsync,
    updatePreset: updateMutation.mutateAsync,
    deletePreset: deleteMutation.mutateAsync,
    executePreset: executeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isExecuting: executeMutation.isPending,
  }
}
