import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input, Badge } from '@corthex/ui'
import { api } from '../../../lib/api'
import { useAdminStore } from '../../../stores/admin-store'
import { useToastStore } from '../../../stores/toast-store'
import type { OrgAgent, OrgDept, OrgEmployee } from '../../../lib/elk-layout'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function DepartmentPanel({
  department,
  onSelectNode,
}: {
  department: OrgDept & { employeeCount?: number; managerName?: string }
  onSelectNode?: (nodeId: string) => void
}) {
  const companyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const [name, setName] = useState(department.name)
  const [description, setDescription] = useState(department.description ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setName(department.name)
    setDescription(department.description ?? '')
    setSaveStatus('idle')
  }, [department.id, department.name, department.description])

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch(`/admin/departments/${department.id}`, data),
    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey: ['org-chart', companyId] })
      const prev = queryClient.getQueryData(['org-chart', companyId])
      queryClient.setQueryData(['org-chart', companyId], (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const o = old as { data: { departments: OrgDept[] } }
        if (!o.data) return old
        return {
          ...o,
          data: {
            ...o.data,
            departments: o.data.departments.map((d) =>
              d.id === department.id ? { ...d, ...update } : d,
            ),
          },
        }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['org-chart', companyId], ctx.prev)
      setSaveStatus('error')
      addToast({ type: 'error', message: '저장에 실패했습니다' })
    },
    onSuccess: () => {
      setSaveStatus('saved')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['org-chart', companyId] })
    },
  })

  const debounceSave = useCallback(
    (data: Record<string, unknown>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      setSaveStatus('saving')
      saveTimerRef.current = setTimeout(() => {
        mutation.mutate(data)
      }, 500)
    },
    [mutation],
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const handleNameChange = (val: string) => {
    setName(val)
    debounceSave({ name: val })
  }

  const handleDescriptionChange = (val: string) => {
    setDescription(val)
    debounceSave({ description: val })
  }

  const managerAgent = department.agents.find(
    (a) => a.tier === 'manager' || a.tierLevel === 1,
  )
  const agents = department.agents
  const employees = department.employees ?? []

  return (
    <div className="space-y-4" data-testid="department-panel">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded bg-blue-500 flex-shrink-0" />
        <h3 className="text-sm font-semibold text-slate-100 truncate flex-1">{department.name}</h3>
        <SaveIndicator status={saveStatus} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="default">에이전트 {agents.length}</Badge>
        <Badge variant="default">직원 {employees.length}</Badge>
        {managerAgent && <Badge variant="info">매니저: {managerAgent.name}</Badge>}
      </div>

      <div className="border-b border-slate-800" />

      {/* Name */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">부서명</label>
        <Input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="mt-1"
          data-testid="dept-name-input"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">설명</label>
        <textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="dept-description-input"
        />
      </div>

      {/* Manager selection */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">매니저</label>
        <select
          value={managerAgent?.id ?? ''}
          onChange={() => {
            // Manager assignment would need agent tier change API — mark as read-only hint for now
            addToast({ type: 'info', message: '매니저 변경은 에이전트 관리에서 설정하세요' })
          }}
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="dept-manager-select"
        >
          <option value="">없음</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="border-b border-slate-800" />

      {/* Agent list */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">소속 에이전트 ({agents.length})</label>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectNode?.(`agent-${a.id}`)}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800/50 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              <span className="text-xs text-slate-300 truncate">{a.name}</span>
              <span className="text-[10px] text-slate-600 ml-auto">{a.tier}</span>
            </button>
          ))}
          {agents.length === 0 && (
            <p className="text-xs text-slate-600 py-2">소속 에이전트 없음</p>
          )}
        </div>
      </div>

      {/* Employee list */}
      {employees.length > 0 && (
        <div>
          <label className="text-xs text-slate-500 uppercase tracking-wide">소속 직원 ({employees.length})</label>
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {employees.map((e: OrgEmployee) => (
              <button
                key={e.id}
                onClick={() => onSelectNode?.(`human-${e.id}`)}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800/50 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-xs text-slate-300 truncate">{e.name}</span>
                <span className="text-[10px] text-slate-600 ml-auto">{e.role}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') return <span className="text-[10px] text-slate-400">저장 중...</span>
  if (status === 'saved') return <span className="text-[10px] text-emerald-400">✓ 저장됨</span>
  if (status === 'error') return <span className="text-[10px] text-red-400">저장 실패</span>
  return null
}
