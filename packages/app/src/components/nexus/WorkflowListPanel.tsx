import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { toast, Badge } from '@corthex/ui'
import type { NexusWorkflow } from '@corthex/shared'

type Props = {
  onSelect: (id: string) => void
}

type ListFilter = 'mine' | 'templates'

export function WorkflowListPanel({ onSelect }: Props) {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [listFilter, setListFilter] = useState<ListFilter>('mine')

  const { data, isLoading } = useQuery({
    queryKey: ['nexus-workflows', listFilter],
    queryFn: () => api.get<{ data: NexusWorkflow[] }>(`/workspace/nexus/workflows?filter=${listFilter}`),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      api.post<{ data: NexusWorkflow }>('/workspace/nexus/workflows', { name }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['nexus-workflows'] })
      toast.success('워크플로우가 생성되었습니다')
      setShowCreate(false)
      setNewName('')
      onSelect(res.data.id)
    },
    onError: () => toast.error('워크플로우 생성에 실패했습니다'),
  })

  const cloneMutation = useMutation({
    mutationFn: (id: string) =>
      api.post<{ data: NexusWorkflow }>(`/workspace/nexus/workflows/${id}/clone`, {}),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['nexus-workflows'] })
      toast.success('워크플로우를 복제했습니다')
      onSelect(res.data.id)
    },
    onError: () => toast.error('복제에 실패했습니다'),
  })

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    createMutation.mutate(trimmed)
  }

  const handleClone = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    cloneMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const workflows = data?.data ?? []

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold">워크플로우</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setListFilter('mine')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                listFilter === 'mine'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              내 워크플로우
            </button>
            <button
              onClick={() => setListFilter('templates')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                listFilter === 'templates'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              템플릿
            </button>
          </div>
        </div>
        {listFilter === 'mine' && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            + 새 워크플로우
          </button>
        )}
      </div>

      {/* 생성 모달 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-[90vw] max-w-96">
            <h4 className="text-sm font-semibold mb-3">새 워크플로우</h4>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="워크플로우 이름"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
              maxLength={200}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowCreate(false); setNewName('') }}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-300"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || createMutation.isPending}
                className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
              >
                {createMutation.isPending ? '생성 중...' : '생성'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 워크플로우 목록 */}
      {workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
          <p className="text-sm">
            {listFilter === 'mine' ? '아직 워크플로우가 없습니다.' : '공유된 템플릿이 없습니다.'}
          </p>
          <p className="text-xs mt-1">
            {listFilter === 'mine' ? '새로 만들어보세요.' : '워크플로우를 만들고 템플릿으로 공유해보세요.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              onClick={() => onSelect(wf.id)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-zinc-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm truncate flex-1">{wf.name}</h4>
                <div className="flex items-center gap-1.5 ml-2">
                  {wf.isTemplate && (
                    <Badge variant="purple" className="text-xs">템플릿</Badge>
                  )}
                  <Badge variant={wf.isActive ? 'success' : 'default'} className="text-xs">
                    {wf.isActive ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>
              {wf.description && (
                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{wf.description}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  {new Date(wf.createdAt).toLocaleDateString('ko-KR')}
                </p>
                <button
                  onClick={(e) => handleClone(e, wf.id)}
                  disabled={cloneMutation.isPending}
                  className="px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors"
                >
                  복제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
