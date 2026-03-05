import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useState, useEffect } from 'react'
import type { Node } from '@xyflow/react'
import { Select } from '@corthex/ui'

type Props = {
  selectedNode: Node | null
  onClose: () => void
}

type DeptOption = { id: string; name: string }

export function NodeDetailPanel({ selectedNode, onClose }: Props) {
  const queryClient = useQueryClient()
  const [deptId, setDeptId] = useState<string>('')

  const { data: deptsData } = useQuery({
    queryKey: ['nexus-departments'],
    queryFn: () => api.get<{ data: { departments: DeptOption[] } }>('/workspace/nexus/org-data'),
    enabled: selectedNode?.type === 'agent',
  })

  const reassign = useMutation({
    mutationFn: ({ agentId, departmentId }: { agentId: string; departmentId: string | null }) =>
      api.patch(`/workspace/nexus/agent/${agentId}/department`, { departmentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nexus-org-data'] })
    },
  })

  const nodeId = selectedNode?.id || ''
  const nodeType = selectedNode?.type || ''
  const nodeData = (selectedNode?.data || {}) as Record<string, unknown>

  // agent 선택 시 현재 부서 세팅
  useEffect(() => {
    if (nodeType === 'agent' && nodeId) {
      // nodeId format: "agent-{uuid}"
      // 현재 부서 정보는 edge에서 유추하거나 기본값 사용
      setDeptId('')
    }
  }, [nodeId, nodeType])

  if (!selectedNode) return null

  const departments = deptsData?.data?.departments || []

  const handleReassign = () => {
    const agentUuid = nodeId.replace('agent-', '')
    reassign.mutate({ agentId: agentUuid, departmentId: deptId || null })
  }

  return (
    <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">노드 상세</h3>
        <button onClick={onClose} className="text-xs text-zinc-400 hover:text-zinc-600">
          닫기
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-xs text-zinc-500">타입</span>
          <p className="font-medium capitalize">{nodeType}</p>
        </div>
        <div>
          <span className="text-xs text-zinc-500">이름</span>
          <p className="font-medium">{nodeData.label as string}</p>
        </div>

        {nodeType === 'agent' && (
          <>
            {nodeData.role && (
              <div>
                <span className="text-xs text-zinc-500">역할</span>
                <p>{nodeData.role as string}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-zinc-500">상태</span>
              <p>{nodeData.status as string}</p>
            </div>
            {(nodeData.isSecretary as boolean) && (
              <p className="text-xs text-amber-600 font-medium">비서실장 에이전트</p>
            )}

            <hr className="border-zinc-200 dark:border-zinc-700" />

            <div>
              <label className="block text-xs text-zinc-500 mb-1">부서 이동</label>
              <Select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                options={[{ value: '', label: '미배정' }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
              />
              <button
                onClick={handleReassign}
                disabled={reassign.isPending}
                className="mt-2 w-full py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {reassign.isPending ? '이동 중...' : '부서 이동'}
              </button>
              {reassign.isSuccess && (
                <p className="text-xs text-green-600 mt-1">이동 완료!</p>
              )}
            </div>
          </>
        )}

        {nodeType === 'department' && typeof nodeData.description === 'string' && (
          <div>
            <span className="text-xs text-zinc-500">설명</span>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {nodeData.description}
            </p>
          </div>
        )}

        {nodeType === 'company' && typeof nodeData.slug === 'string' && (
          <div>
            <span className="text-xs text-zinc-500">슬러그</span>
            <p>{nodeData.slug}</p>
          </div>
        )}
      </div>
    </div>
  )
}
