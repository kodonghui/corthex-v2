import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { WorkflowBuilder } from '../components/workspace/workflows/workflow-builder'
import { WorkflowMonitor } from '../components/workspace/workflows/workflow-monitor'
import type { Workflow } from '@corthex/shared'
import { toast } from 'sonner'
import { Skeleton } from '@corthex/ui'

export function WorkflowsPage() {
  const queryClient = useQueryClient()
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [monitoringWorkflow, setMonitoringWorkflow] = useState<Workflow | null>(null)

  const { data: workflowsRes, isLoading } = useQuery({
    queryKey: ['workspace-workflows'],
    queryFn: () => api.get<{ data: Workflow[] }>('/workspace/workflows')
  })
  
  const workflows = workflowsRes?.data || []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/workflows/${id}`),
    onSuccess: () => {
      toast.success('워크플로우가 삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['workspace-workflows'] })
    },
    onError: () => toast.error('삭제에 실패했습니다.')
  })

  const runMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/workflows/${id}/execute`, { initialContext: {} }),
    onSuccess: () => toast.success('워크플로우 실행이 시작되었습니다.'),
    onError: () => toast.error('실행 요청에 실패했습니다.')
  })

  if (monitoringWorkflow) {
    return (
      <WorkflowMonitor
        workflowId={monitoringWorkflow.id}
        workflowName={monitoringWorkflow.name}
        steps={monitoringWorkflow.steps}
        onClose={() => setMonitoringWorkflow(null)}
      />
    )
  }

  if (editingWorkflowId || isCreating) {
    return (
      <div className="h-full flex flex-col relative w-full overflow-hidden">
        <WorkflowBuilder 
          workflowId={editingWorkflowId} 
          onClose={() => {
            setEditingWorkflowId(null)
            setIsCreating(false)
          }} 
        />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">자동화 워크플로우</h1>
          <p className="text-sm text-zinc-500 mt-1">
            워크플로우(DAG)를 설계하고, 여러 에이전트와 도구를 연결하여 작업을 자동화하세요.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
        >
          새 워크플로우 생성
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-20 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500 mb-4">등록된 워크플로우가 없습니다.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-md transition-colors"
          >
            첫 워크플로우 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <div key={wf.id} className="relative group p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{wf.name}</h3>
                  <div className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full ${wf.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                    {wf.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-4 h-10">
                  {wf.description || '설명이 없습니다.'}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
                <button
                  onClick={() => setEditingWorkflowId(wf.id)}
                  className="flex-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded transition-colors"
                >
                  편집
                </button>
                <button
                  onClick={() => setMonitoringWorkflow(wf)}
                  className="flex-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded transition-colors"
                >
                  모니터
                </button>
                <button
                  onClick={() => runMutation.mutate(wf.id)}
                  disabled={!wf.isActive || runMutation.isPending}
                  className="flex-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-medium rounded transition-colors disabled:opacity-50"
                >
                  실행
                </button>
                <button
                  onClick={() => {
                    if (confirm(`'${wf.name}' 워크플로우를 삭제하시겠습니까?`)) {
                      deleteMutation.mutate(wf.id)
                    }
                  }}
                  className="px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
