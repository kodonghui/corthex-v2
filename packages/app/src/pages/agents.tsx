import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import {
  Modal,
  Button,
  Input,
  Textarea,
  Skeleton,
  EmptyState,
  Badge,
  toast,
  Select,
  Toggle,
  Tabs,
} from '@corthex/ui'

// ── Types ──

type Agent = {
  id: string
  companyId: string
  userId: string
  departmentId: string | null
  name: string
  nameEn: string | null
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  reportTo: string | null
  soul: string | null
  adminSoul: string | null
  status: 'online' | 'working' | 'error' | 'offline'
  ownerUserId: string | null
  isSecretary: boolean
  isSystem: boolean
  allowedTools: string[]
  autoLearn: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Department = {
  id: string
  name: string
  isActive: boolean
}

type User = {
  id: string
  name: string
  role: string
}

type AgentFormData = {
  userId: string
  name: string
  nameEn: string
  departmentId: string
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  role: string
  isSecretary: boolean
  ownerUserId: string
  soul: string
}

type SoulPreviewResponse = {
  rendered: string
  variables: Record<string, string>
}

// ── Tier/Status Badge helpers ──

const tierLabels: Record<string, string> = {
  manager: '매니저',
  specialist: '전문가',
  worker: '실행자',
}

const tierColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  manager: 'warning',
  specialist: 'default',
  worker: 'success',
}

const statusLabels: Record<string, string> = {
  online: '온라인',
  working: '작업중',
  error: '오류',
  offline: '오프라인',
}

const statusDotColors: Record<string, string> = {
  online: 'bg-green-500',
  working: 'bg-blue-500',
  error: 'bg-red-500',
  offline: 'bg-zinc-400',
}

// ── Agent Form (shared between create & edit) ──

function AgentForm({
  initialData,
  departments,
  users,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: {
  initialData?: Partial<AgentFormData>
  departments: Department[]
  users: User[]
  onSubmit: (data: AgentFormData) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '')
  const [departmentId, setDepartmentId] = useState(initialData?.departmentId ?? '')
  const [tier, setTier] = useState<'manager' | 'specialist' | 'worker'>(initialData?.tier ?? 'specialist')
  const [modelName, setModelName] = useState(initialData?.modelName ?? 'claude-haiku-4-5')
  const [role, setRole] = useState(initialData?.role ?? '')
  const [isSecretary, setIsSecretary] = useState(initialData?.isSecretary ?? false)
  const [ownerUserId, setOwnerUserId] = useState(initialData?.ownerUserId ?? '')
  const [nameError, setNameError] = useState('')

  // For create mode, pick the first user as default userId (admin creating agents)
  const userId = initialData?.userId ?? users[0]?.id ?? ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('에이전트 이름을 입력하세요')
      return
    }
    if (trimmedName.length > 100) {
      setNameError('이름은 100자 이내로 입력하세요')
      return
    }
    setNameError('')
    onSubmit({
      userId,
      name: trimmedName,
      nameEn: nameEn.trim() || '',
      departmentId: departmentId || '',
      tier,
      modelName: modelName.trim() || 'claude-haiku-4-5',
      role: role.trim() || '',
      isSecretary,
      ownerUserId: ownerUserId || '',
      soul: '',
    })
  }

  const activeDepts = departments.filter((d) => d.isActive)
  const deptOptions = [
    { value: '', label: '미배속' },
    ...activeDepts.map((d) => ({ value: d.id, label: d.name })),
  ]

  const tierOptions = [
    { value: 'manager', label: '매니저' },
    { value: 'specialist', label: '전문가' },
    { value: 'worker', label: '실행자' },
  ]

  const userOptions = [
    { value: '', label: '없음' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          에이전트 이름 <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError('') }}
          placeholder="예: 마케팅분석관"
          maxLength={100}
          autoFocus
        />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">영문 이름</label>
        <Input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="예: Marketing Analyst"
          maxLength={100}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">소속 부서</label>
          <Select options={deptOptions} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">등급</label>
          <Select options={tierOptions} value={tier} onChange={(e) => setTier(e.target.value as 'manager' | 'specialist' | 'worker')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">모델명</label>
          <Input
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="claude-haiku-4-5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">역할/전문분야</label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="예: 시장 분석"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">CLI 소유 인간직원</label>
        <Select options={userOptions} value={ownerUserId} onChange={(e) => setOwnerUserId(e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <Toggle checked={isSecretary} onChange={setIsSecretary} label="비서 에이전트" />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

// ── Soul Editor (edit modal, second tab) ──

function SoulEditor({
  agentId,
  initialSoul,
  onSave,
  isSaving,
}: {
  agentId: string
  initialSoul: string
  onSave: (soul: string) => void
  isSaving: boolean
}) {
  const [soul, setSoul] = useState(initialSoul)
  const [preview, setPreview] = useState<SoulPreviewResponse | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const handlePreview = useCallback(async () => {
    setIsPreviewing(true)
    try {
      const res = await api.post<{ success: boolean; data: SoulPreviewResponse }>(
        `/admin/agents/${agentId}/soul-preview`,
        { soul },
      )
      setPreview(res.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '프리뷰 실패')
    } finally {
      setIsPreviewing(false)
    }
  }, [agentId, soul])

  const availableVars = [
    '{{agent_list}}',
    '{{subordinate_list}}',
    '{{tool_list}}',
    '{{department_name}}',
    '{{owner_name}}',
    '{{specialty}}',
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Soul Editor (left) */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Soul (마크다운)
          </label>
          <textarea
            value={soul}
            onChange={(e) => setSoul(e.target.value)}
            className="w-full h-64 p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-mono text-zinc-900 dark:text-zinc-100 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="에이전트의 Soul을 작성하세요..."
          />
          <div className="mt-2">
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">사용 가능한 변수:</p>
            <div className="flex flex-wrap gap-1">
              {availableVars.map((v) => (
                <span
                  key={v}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900"
                  onClick={() => setSoul((prev) => prev + v)}
                  title="클릭하여 삽입"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preview (right) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              프리뷰
            </label>
            <Button size="sm" variant="outline" onClick={handlePreview} disabled={isPreviewing}>
              {isPreviewing ? '로딩...' : '프리뷰 새로고침'}
            </Button>
          </div>
          <div className="w-full h-64 p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 overflow-y-auto whitespace-pre-wrap">
            {preview ? preview.rendered || '(빈 결과)' : '프리뷰 버튼을 클릭하세요'}
          </div>
          {preview?.variables && Object.keys(preview.variables).length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">치환된 변수:</p>
              {Object.entries(preview.variables).map(([key, val]) => (
                <div key={key} className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 truncate">
                  <span className="text-indigo-600 dark:text-indigo-400">{`{{${key}}}`}</span>
                  {' = '}
                  <span>{val || '(빈 값)'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button size="sm" onClick={() => onSave(soul)} disabled={isSaving}>
          {isSaving ? '저장 중...' : 'Soul 저장'}
        </Button>
      </div>
    </div>
  )
}

// ── Main Page ──

export function AgentsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editAgent, setEditAgent] = useState<Agent | null>(null)
  const [editTab, setEditTab] = useState('info')
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null)
  const [filterDept, setFilterDept] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')

  // Fetch agents
  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (filterDept) params.set('departmentId', filterDept)
    if (filterActive === 'active') params.set('isActive', 'true')
    else if (filterActive === 'inactive') params.set('isActive', 'false')
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-agents', filterDept, filterActive],
    queryFn: () => api.get<{ success: boolean; data: Agent[] }>(`/admin/agents${buildQueryString()}`),
  })

  // Fetch departments for filter & form
  const { data: deptData } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => api.get<{ success: boolean; data: Department[] }>('/admin/departments'),
  })

  // Fetch users for owner selection
  const { data: userData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get<{ success: boolean; data: User[] }>('/admin/users'),
  })

  const departmentsList = deptData?.data ?? []
  const usersList = userData?.data ?? []

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/admin/agents', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] })
      setCreateOpen(false)
      toast.success('에이전트가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/admin/agents/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] })
      setEditAgent(null)
      setEditTab('info')
      toast.success('에이전트가 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] })
      setDeleteAgent(null)
      toast.success('에이전트가 비활성화되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const agents = data?.data ?? []

  // Department name lookup
  const deptMap = new Map(departmentsList.map((d) => [d.id, d.name]))

  const handleCreate = (formData: AgentFormData) => {
    const body: Record<string, unknown> = {
      userId: formData.userId,
      name: formData.name,
      tier: formData.tier,
      modelName: formData.modelName,
      isSecretary: formData.isSecretary,
    }
    if (formData.nameEn) body.nameEn = formData.nameEn
    if (formData.departmentId) body.departmentId = formData.departmentId
    if (formData.role) body.role = formData.role
    if (formData.ownerUserId) body.ownerUserId = formData.ownerUserId
    createMutation.mutate(body)
  }

  const handleEdit = (formData: AgentFormData) => {
    if (!editAgent) return
    const body: Record<string, unknown> = {
      name: formData.name,
      tier: formData.tier,
      modelName: formData.modelName,
      isSecretary: formData.isSecretary,
      departmentId: formData.departmentId || null,
      ownerUserId: formData.ownerUserId || null,
    }
    if (formData.nameEn) body.nameEn = formData.nameEn
    else body.nameEn = null
    if (formData.role) body.role = formData.role
    else body.role = null
    updateMutation.mutate({ id: editAgent.id, body })
  }

  const handleSoulSave = (soul: string) => {
    if (!editAgent) return
    updateMutation.mutate({ id: editAgent.id, body: { soul } })
  }

  // Filter department options
  const filterDeptOptions = [
    { value: '', label: '전체 부서' },
    { value: 'unassigned', label: '미배속' },
    ...departmentsList.filter((d) => d.isActive).map((d) => ({ value: d.id, label: d.name })),
  ]

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="agents-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div data-testid="agents-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">에이전트 목록을 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-red-500 hover:text-red-400 underline mt-2">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="agents-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">에이전트 관리</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {agents.length}개 에이전트
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          + 에이전트 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select options={filterDeptOptions} value={filterDept} onChange={(e) => setFilterDept(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(['active', 'all', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterActive === f
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {f === 'active' ? '활성' : f === 'inactive' ? '비활성' : '전체'}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {agents.length === 0 && (
        <EmptyState
          title="에이전트가 없습니다"
          description="첫 에이전트를 생성하여 AI 조직을 구성하세요"
        />
      )}

      {/* Agent list */}
      {agents.length > 0 && (
        <div className="space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              data-testid={`agent-row-${agent.id}`}
              className={`flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors ${
                !agent.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {/* Status dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColors[agent.status] || statusDotColors.offline}`} title={statusLabels[agent.status]} />
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{agent.name}</h3>
                  {agent.nameEn && <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">({agent.nameEn})</span>}
                  <Badge variant={tierColors[agent.tier]}>{tierLabels[agent.tier]}</Badge>
                  {agent.isSecretary && <Badge variant="error">비서</Badge>}
                  {agent.isSystem && <Badge variant="default">시스템</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {agent.departmentId ? deptMap.get(agent.departmentId) || '부서' : '미배속'}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{agent.modelName}</span>
                  {agent.role && <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{agent.role}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4 shrink-0">
                <button
                  onClick={() => { setEditAgent(agent); setEditTab('info') }}
                  className="px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label={`${agent.name} 편집`}
                >
                  편집
                </button>
                <button
                  onClick={() => { setEditAgent(agent); setEditTab('soul') }}
                  className="px-2.5 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  aria-label={`${agent.name} Soul 편집`}
                >
                  Soul
                </button>
                <button
                  onClick={() => setDeleteAgent(agent)}
                  className="px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label={`${agent.name} 삭제`}
                  disabled={agent.isSystem || agent.isSecretary}
                  title={agent.isSystem ? '시스템 에이전트는 삭제할 수 없습니다' : agent.isSecretary ? '비서 에이전트는 삭제할 수 없습니다' : ''}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="에이전트 생성">
        <AgentForm
          departments={departmentsList}
          users={usersList}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          isSubmitting={createMutation.isPending}
          submitLabel="생성"
        />
      </Modal>

      {/* Edit Modal (Tabs: info + soul) */}
      <Modal
        isOpen={!!editAgent}
        onClose={() => { setEditAgent(null); setEditTab('info') }}
        title={`"${editAgent?.name}" 에이전트 편집`}
      >
        {editAgent && (
          <div className="space-y-4">
            <Tabs
              items={[
                { value: 'info', label: '기본 정보' },
                { value: 'soul', label: 'Soul 편집' },
              ]}
              value={editTab}
              onChange={setEditTab}
            />
            {editTab === 'info' && (
              <AgentForm
                initialData={{
                  userId: editAgent.userId,
                  name: editAgent.name,
                  nameEn: editAgent.nameEn ?? '',
                  departmentId: editAgent.departmentId ?? '',
                  tier: editAgent.tier,
                  modelName: editAgent.modelName,
                  role: editAgent.role ?? '',
                  isSecretary: editAgent.isSecretary,
                  ownerUserId: editAgent.ownerUserId ?? '',
                  soul: editAgent.soul ?? '',
                }}
                departments={departmentsList}
                users={usersList}
                onSubmit={handleEdit}
                onCancel={() => { setEditAgent(null); setEditTab('info') }}
                isSubmitting={updateMutation.isPending}
                submitLabel="저장"
              />
            )}
            {editTab === 'soul' && (
              <SoulEditor
                agentId={editAgent.id}
                initialSoul={editAgent.soul ?? ''}
                onSave={handleSoulSave}
                isSaving={updateMutation.isPending}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteAgent}
        onClose={() => setDeleteAgent(null)}
        title={`"${deleteAgent?.name}" 에이전트 삭제`}
      >
        {deleteAgent && (
          <div className="space-y-4">
            {deleteAgent.isSecretary && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  비서 에이전트는 삭제할 수 없습니다.
                </p>
              </div>
            )}
            {deleteAgent.isSystem && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  시스템 에이전트는 삭제할 수 없습니다.
                </p>
              </div>
            )}
            {!deleteAgent.isSecretary && !deleteAgent.isSystem && (
              <>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  이 에이전트를 비활성화하시겠습니까? 에이전트가 부서에서 해제되고 비활성화됩니다.
                </p>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => setDeleteAgent(null)} disabled={deleteMutation.isPending}>
                    취소
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(deleteAgent.id)} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? '삭제 중...' : '삭제 확인'}
                  </Button>
                </div>
              </>
            )}
            {(deleteAgent.isSecretary || deleteAgent.isSystem) && (
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeleteAgent(null)}>
                  닫기
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
