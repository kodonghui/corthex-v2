/**
 * API ENDPOINTS:
 * - GET    /api/admin/agents                    : List agents (with filters: departmentId, isActive)
 * - POST   /api/admin/agents                    : Create a new agent
 * - PATCH  /api/admin/agents/:id                : Update agent fields
 * - DELETE /api/admin/agents/:id                : Deactivate/delete agent
 * - POST   /api/admin/agents/:id/soul-preview   : Preview rendered soul template
 * - GET    /api/admin/departments               : List departments (for filter & form)
 * - GET    /api/admin/users                     : List users (for owner selection)
 */

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import {
  Modal,
  Button,
  Input,
  Skeleton,
  EmptyState,
  toast,
  Select,
  Toggle,
} from '@corthex/ui'
import {
  Plus,
  Pencil,
  Trash2,
  Bot,
  CheckCircle,
  MessageSquare,
  Clock,
  Settings,
} from 'lucide-react'

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

// ── Tier/Status helpers ──

const tierLabels: Record<string, string> = {
  manager: '매니저',
  specialist: '전문가',
  worker: '실행자',
}

const tierBadgeStyles: Record<string, { bg: string; text: string }> = {
  manager: { bg: 'bg-orange-50', text: 'text-orange-700' },
  specialist: { bg: 'bg-green-50', text: 'text-green-700' },
  worker: { bg: 'bg-slate-50', text: 'text-slate-600' },
}

const statusConfig: Record<string, { dotBg: string; labelBg: string; labelText: string; label: string }> = {
  online: { dotBg: 'bg-green-500', labelBg: 'bg-green-50', labelText: 'text-green-700', label: 'Online' },
  working: { dotBg: 'bg-blue-500', labelBg: 'bg-blue-50', labelText: 'text-blue-700', label: 'Working' },
  error: { dotBg: 'bg-red-500', labelBg: 'bg-red-50', labelText: 'text-red-700', label: 'Error' },
  offline: { dotBg: 'bg-slate-400', labelBg: 'bg-slate-50', labelText: 'text-slate-500', label: 'Offline' },
}

const agentIcons: string[] = [
  'support_agent', 'account_balance_wallet', 'campaign', 'gavel', 'settings_suggest', 'brush', 'database',
]

// ── Agent Form ──

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
        <label className="block text-xs font-medium text-slate-400 mb-1">
          에이전트 이름 <span className="text-red-500">*</span>
        </label>
        <Input value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} placeholder="예: 마케팅분석관" maxLength={100} autoFocus />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">영문 이름</label>
        <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="예: Marketing Analyst" maxLength={100} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">소속 부서</label>
          <Select options={deptOptions} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">등급</label>
          <Select options={tierOptions} value={tier} onChange={(e) => setTier(e.target.value as 'manager' | 'specialist' | 'worker')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">모델명</label>
          <Input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="claude-haiku-4-5" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">역할/전문분야</label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="예: 시장 분석" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">CLI 소유 인간직원</label>
        <Select options={userOptions} value={ownerUserId} onChange={(e) => setOwnerUserId(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Toggle checked={isSecretary} onChange={setIsSecretary} label="비서 에이전트" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>취소</Button>
        <Button size="sm" type="submit" disabled={isSubmitting}>{isSubmitting ? '처리 중...' : submitLabel}</Button>
      </div>
    </form>
  )
}

// ── Soul Editor ──

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

  const availableVars = ['{{agent_list}}', '{{subordinate_list}}', '{{tool_list}}', '{{department_name}}', '{{owner_name}}', '{{specialty}}']

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Soul (마크다운)</label>
          <textarea value={soul} onChange={(e) => setSoul(e.target.value)} className="w-full h-64 p-3 rounded-lg border border-slate-300 bg-white text-sm font-mono resize-y focus:outline-none focus:ring-2" style={{ outlineColor: '#5a7247' }} placeholder="에이전트의 Soul을 작성하세요..." />
          <div className="mt-2">
            <p className="text-[10px] font-medium text-slate-500 mb-1">사용 가능한 변수:</p>
            <div className="flex flex-wrap gap-1">
              {availableVars.map((v) => (
                <span key={v} className="px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer" style={{ backgroundColor: 'rgba(90,114,71,0.1)', color: '#5a7247' }} onClick={() => setSoul((prev) => prev + v)} title="클릭하여 삽입">{v}</span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-400">프리뷰</label>
            <Button size="sm" variant="outline" onClick={handlePreview} disabled={isPreviewing}>{isPreviewing ? '로딩...' : '프리뷰 새로고침'}</Button>
          </div>
          <div className="w-full h-64 p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm overflow-y-auto whitespace-pre-wrap">
            {preview ? preview.rendered || '(빈 결과)' : '프리뷰 버튼을 클릭하세요'}
          </div>
          {preview?.variables && Object.keys(preview.variables).length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-medium text-slate-500">치환된 변수:</p>
              {Object.entries(preview.variables).map(([key, val]) => (
                <div key={key} className="text-[10px] font-mono text-slate-500 truncate">
                  <span style={{ color: '#5a7247' }}>{`{{${key}}}`}</span>{' = '}<span>{val || '(빈 값)'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button size="sm" onClick={() => onSave(soul)} disabled={isSaving}>{isSaving ? '저장 중...' : 'Soul 저장'}</Button>
      </div>
    </div>
  )
}

// ── Detail Tabs ──

type DetailTab = 'overview' | 'soul' | 'history' | 'settings'

const detailTabItems: { value: DetailTab; label: string }[] = [
  { value: 'overview', label: '개요' },
  { value: 'soul', label: 'Soul' },
  { value: 'history', label: '작업 이력' },
  { value: 'settings', label: '설정' },
]

// ── Agent Detail Panel ──

function AgentDetailPanel({
  agent,
  deptName,
  departments,
  users,
  onEdit,
  onDelete,
  onSoulSave,
  isUpdating,
}: {
  agent: Agent
  deptName: string
  departments: Department[]
  users: User[]
  onEdit: (data: AgentFormData) => void
  onDelete: () => void
  onSoulSave: (soul: string) => void
  isUpdating: boolean
}) {
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [isEditing, setIsEditing] = useState(false)

  const tierBadge = tierBadgeStyles[agent.tier] || tierBadgeStyles.worker
  const status = statusConfig[agent.status] || statusConfig.offline

  const recentActivities = [
    { id: '1', icon: 'success' as const, title: '작업 완료', detail: '최근 처리 완료', time: '방금 전' },
    { id: '2', icon: 'message' as const, title: '문의 응답', detail: '사용자 대화', time: '15분 전' },
    { id: '3', icon: 'success' as const, title: '일정 조율 완료', detail: '자동 처리', time: '1시간 전' },
  ]

  const activityIconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    message: <MessageSquare className="w-5 h-5" />,
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Agent Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-inner relative" style={{ backgroundColor: '#f0f2ee' }}>
            <Bot className="w-10 h-10" style={{ color: '#4a5d40' }} />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full ${status.dotBg}`} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-slate-800 text-3xl font-bold tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif" }}>{agent.name}</h2>
              <span className={`px-2 py-1 ${tierBadge.bg} ${tierBadge.text} text-[10px] font-bold rounded-lg uppercase tracking-wider`}>
                {tierLabels[agent.tier] || agent.tier}
              </span>
            </div>
            <p className="text-slate-500 text-base">{deptName} &middot; {agent.role || 'Agent'}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button onClick={() => setIsEditing(true)} className="flex items-center justify-center rounded-xl h-10 px-6 bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:shadow-md transition-all">
            <Pencil className="w-4 h-4 mr-2" /> 편집
          </button>
          <button onClick={onDelete} disabled={agent.isSystem || agent.isSecretary} className="flex items-center justify-center rounded-xl h-10 px-6 bg-red-50 text-red-500 text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-30">
            <Trash2 className="w-4 h-4 mr-2" /> 삭제
          </button>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="border-b border-slate-200 mt-6">
        <div className="flex gap-8">
          {detailTabItems.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDetailTab(tab.value)}
              className={`pb-4 border-b-2 text-sm transition-colors ${
                detailTab === tab.value
                  ? 'font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-600 font-medium'
              }`}
              style={detailTab === tab.value ? { borderColor: '#5a7247', color: '#5a7247' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {detailTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-slate-800 font-bold text-lg mb-2">최근 활동</h3>
            <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-4 flex items-center justify-between hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: act.icon === 'success' ? 'rgba(90,114,71,0.1)' : 'rgba(59,130,246,0.1)', color: act.icon === 'success' ? '#5a7247' : '#3b82f6' }}>
                      {activityIconMap[act.icon]}
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium text-sm">{act.title}</p>
                      <p className="text-slate-400 text-xs mt-1">{act.detail}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-slate-800 font-bold text-lg mb-2">성능 지표</h3>
            <div className="rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden" style={{ backgroundColor: '#f0f2ee' }}>
              <div className="flex flex-col gap-6 relative z-10">
                <div>
                  <p className="text-slate-500 text-sm mb-1">총 처리 작업</p>
                  <span className="text-3xl font-bold tracking-tight text-slate-800">--</span>
                </div>
                <div className="w-full h-px bg-slate-200" />
                <div>
                  <p className="text-slate-500 text-sm mb-1">작업 성공률</p>
                  <span className="text-2xl font-bold tracking-tight text-slate-800">--%</span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '0%', backgroundColor: '#5a7247' }} />
                  </div>
                </div>
                <div className="w-full h-px bg-slate-200" />
                <div>
                  <p className="text-slate-500 text-sm mb-1">누적 API 비용</p>
                  <span className="text-2xl font-bold tracking-tight text-slate-800">$--</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailTab === 'soul' && (
        <div className="mt-6">
          <SoulEditor agentId={agent.id} initialSoul={agent.soul ?? ''} onSave={onSoulSave} isSaving={isUpdating} />
        </div>
      )}

      {detailTab === 'history' && (
        <div className="mt-6">
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-8 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">작업 이력이 없습니다</p>
            <p className="text-slate-400 text-xs mt-1">에이전트가 작업을 수행하면 여기에 기록됩니다</p>
          </div>
        </div>
      )}

      {detailTab === 'settings' && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-6">
            <h4 className="text-slate-800 font-bold text-sm mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" /> 에이전트 설정
            </h4>
            <div className="space-y-3">
              {[
                { label: '모델', value: agent.modelName },
                { label: '등급', value: tierLabels[agent.tier] || agent.tier },
                { label: '자동 학습', value: agent.autoLearn ? 'ON' : 'OFF' },
                { label: '비서 에이전트', value: agent.isSecretary ? 'YES' : 'NO' },
                { label: '허용된 도구', value: agent.allowedTools.length > 0 ? `${agent.allowedTools.length}개` : '없음' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                  <span className="text-slate-500 text-sm">{item.label}</span>
                  <span className="text-slate-800 text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title={`"${agent.name}" 정보 편집`}>
          <AgentForm
            initialData={{
              userId: agent.userId, name: agent.name, nameEn: agent.nameEn ?? '', departmentId: agent.departmentId ?? '',
              tier: agent.tier, modelName: agent.modelName, role: agent.role ?? '', isSecretary: agent.isSecretary,
              ownerUserId: agent.ownerUserId ?? '', soul: agent.soul ?? '',
            }}
            departments={departments} users={users}
            onSubmit={(data) => { onEdit(data); setIsEditing(false) }}
            onCancel={() => setIsEditing(false)} isSubmitting={isUpdating} submitLabel="저장"
          />
        </Modal>
      )}
    </div>
  )
}

// ── Main Page ──

export function AgentsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null)
  const [filterDept, setFilterDept] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')
  const [searchQuery, setSearchQuery] = useState('')

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

  const { data: deptData } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => api.get<{ success: boolean; data: Department[] }>('/admin/departments'),
  })

  const { data: userData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get<{ success: boolean; data: User[] }>('/admin/users'),
  })

  const departmentsList = deptData?.data ?? []
  const usersList = userData?.data ?? []

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/admin/agents', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] })
      setCreateOpen(false)
      toast.success('에이전트가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/admin/agents/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] })
      toast.success('에이전트가 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agents'] })
      setDeleteAgent(null)
      setSelectedAgent(null)
      toast.success('에이전트가 비활성화되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const agents = data?.data ?? []
  const deptMap = new Map(departmentsList.map((d) => [d.id, d.name]))

  const handleCreate = (formData: AgentFormData) => {
    const body: Record<string, unknown> = {
      userId: formData.userId, name: formData.name, tier: formData.tier,
      modelName: formData.modelName, isSecretary: formData.isSecretary,
    }
    if (formData.nameEn) body.nameEn = formData.nameEn
    if (formData.departmentId) body.departmentId = formData.departmentId
    if (formData.role) body.role = formData.role
    if (formData.ownerUserId) body.ownerUserId = formData.ownerUserId
    createMutation.mutate(body)
  }

  const handleEdit = (formData: AgentFormData) => {
    if (!selectedAgent) return
    const body: Record<string, unknown> = {
      name: formData.name, tier: formData.tier, modelName: formData.modelName,
      isSecretary: formData.isSecretary, departmentId: formData.departmentId || null,
      ownerUserId: formData.ownerUserId || null,
    }
    if (formData.nameEn) body.nameEn = formData.nameEn; else body.nameEn = null
    if (formData.role) body.role = formData.role; else body.role = null
    updateMutation.mutate({ id: selectedAgent.id, body })
  }

  const handleSoulSave = (soul: string) => {
    if (!selectedAgent) return
    updateMutation.mutate({ id: selectedAgent.id, body: { soul } })
  }

  const filterDeptOptions = [
    { value: '', label: '전체 부서' },
    { value: 'unassigned', label: '미배속' },
    ...departmentsList.filter((d) => d.isActive).map((d) => ({ value: d.id, label: d.name })),
  ]

  if (isLoading) {
    return (
      <div data-testid="agents-page" className="flex-1 ml-64 flex flex-col min-h-screen" style={{ backgroundColor: '#faf8f5' }}>
        <div className="px-8 py-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div data-testid="agents-page" className="flex-1 ml-64 flex flex-col min-h-screen" style={{ backgroundColor: '#faf8f5' }}>
        <div className="px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600">에이전트 목록을 불러올 수 없습니다</p>
            <button onClick={() => refetch()} className="text-xs text-red-500 hover:text-red-400 underline mt-2">다시 시도</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="agents-page" className="flex min-h-screen" style={{ backgroundColor: '#faf8f5', fontFamily: "'Public Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 text-white flex flex-col z-50" style={{ backgroundColor: '#4a5d40' }}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">CORTHEX v2</h1>
            <p className="text-xs text-white/70">Natural Organic System</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors" href="#">
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/20 shadow-sm" href="#">
            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            <span className="text-sm font-medium">Agents</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors" href="#">
            <span className="material-symbols-outlined text-[24px]">workspaces</span>
            <span className="text-sm font-medium">Workspaces</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors" href="#">
            <span className="material-symbols-outlined text-[24px]">bar_chart</span>
            <span className="text-sm font-medium">Analytics</span>
          </a>
          <div className="pt-4 mt-4 border-t border-white/10">
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors" href="#">
              <span className="material-symbols-outlined text-[24px]">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </a>
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/10 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Admin User</p>
              <p className="text-[10px] text-white/50 truncate">Pro Plan</p>
            </div>
            <span className="material-symbols-outlined text-sm">unfold_more</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Nav */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 border-none rounded-xl focus:ring-2 text-sm"
                style={{ backgroundColor: '#faf8f5', outlineColor: '#4a5d40' }}
                placeholder="Search agents by name, role, or department..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-700 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
              style={{ backgroundColor: '#4a5d40' }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Deploy Agent
            </button>
          </div>
        </header>

        {/* Page Header */}
        <div className="px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <nav className="flex text-xs text-slate-400 mb-2 gap-2">
                <span>Workspace</span>
                <span>/</span>
                <span className="font-medium" style={{ color: '#4a5d40' }}>Agents</span>
              </nav>
              <h2 className="text-4xl font-bold text-slate-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>Agents Directory</h2>
              <p className="text-slate-500 mt-1">Manage your specialized AI workforce and monitor real-time performance.</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white p-1 rounded-xl shadow-sm flex">
                {(['active', 'all', 'inactive'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterActive(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      filterActive === f ? 'text-white' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                    style={filterActive === f ? { backgroundColor: '#4a5d40' } : {}}
                  >
                    {f === 'active' ? 'All Agents' : f === 'all' ? 'All' : 'Favorites'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="group relative">
              <div className="w-48">
                <Select options={filterDeptOptions} value={filterDept} onChange={(e) => setFilterDept(e.target.value)} />
              </div>
            </div>
            <div className="h-6 w-px bg-slate-300 mx-2"></div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Filters:</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ backgroundColor: 'rgba(74,93,64,0.1)', color: '#4a5d40' }}>
              {filterActive === 'active' ? 'Active' : filterActive === 'inactive' ? 'Inactive' : 'All Status'}
            </span>
          </div>

          {/* Grid */}
          {agents.length === 0 && (
            <EmptyState title="에이전트가 없습니다" description="첫 에이전트를 생성하여 AI 조직을 구성하세요" />
          )}

          {agents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map((agent, idx) => {
                const deptName = agent.departmentId ? deptMap.get(agent.departmentId) || 'Department' : 'Unassigned'
                const status = statusConfig[agent.status] || statusConfig.offline
                const tierBadge = tierBadgeStyles[agent.tier] || tierBadgeStyles.worker
                const isSelected = selectedAgent?.id === agent.id
                const iconName = agentIcons[idx % agentIcons.length]

                return (
                  <div
                    key={agent.id}
                    data-testid={`agent-row-${agent.id}`}
                    onClick={() => setSelectedAgent(isSelected ? null : agent)}
                    className={`bg-white p-5 rounded-xl shadow-sm border flex flex-col hover:shadow-md transition-shadow cursor-pointer ${
                      isSelected ? 'border-2' : 'border-slate-100'
                    } ${!agent.isActive ? 'opacity-50' : ''}`}
                    style={isSelected ? { borderColor: '#4a5d40' } : {}}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f0f2ee', color: '#4a5d40' }}>
                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 ${status.labelBg} ${status.labelText} rounded-lg text-[10px] font-bold uppercase tracking-tight border`} style={{ borderColor: 'transparent' }}>
                        <span className={`w-2 h-2 rounded-full ${status.dotBg}`}></span>
                        {status.label}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Noto Serif KR', serif" }}>{agent.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">{agent.role || 'Agent'}</p>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Department</span>
                        <span className="font-medium text-slate-700">{deptName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 ${tierBadge.bg} ${tierBadge.text} text-[10px] font-bold rounded-lg uppercase tracking-wider`}>
                          {tierLabels[agent.tier] || agent.tier}
                        </span>
                        <button className="hover:underline text-xs font-semibold flex items-center gap-1" style={{ color: '#4a5d40' }}>
                          Configure <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Add Agent Placeholder */}
              <div
                onClick={() => setCreateOpen(true)}
                className="border-2 border-dashed border-slate-200 p-5 rounded-xl flex flex-col items-center justify-center text-center hover:border-opacity-50 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-white transition-all mb-3" style={{ ...(false ? { backgroundColor: '#4a5d40' } : {}) }}>
                  <span className="material-symbols-outlined text-[32px]">add</span>
                </div>
                <h3 className="font-bold text-slate-700">Deploy New Agent</h3>
                <p className="text-slate-400 text-xs mt-1">Scale your workspace capacity</p>
              </div>
            </div>
          )}

          {/* Detail Panel */}
          {selectedAgent && (
            <>
              <div className="w-full h-px bg-slate-200 my-8" />
              <AgentDetailPanel
                agent={selectedAgent}
                deptName={selectedAgent.departmentId ? deptMap.get(selectedAgent.departmentId) || 'Department' : 'Unassigned'}
                departments={departmentsList}
                users={usersList}
                onEdit={handleEdit}
                onDelete={() => setDeleteAgent(selectedAgent)}
                onSoulSave={handleSoulSave}
                isUpdating={updateMutation.isPending}
              />
            </>
          )}
        </div>

        {/* Footer Stats */}
        <footer className="mt-auto p-8 border-t border-slate-200 bg-white/50">
          <div className="flex flex-wrap gap-8 justify-between items-center">
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Agents</p>
                <p className="text-2xl font-bold text-slate-800">{agents.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Tasks</p>
                <p className="text-2xl font-bold text-slate-800">--</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">--%</p>
              </div>
            </div>
            <div className="text-slate-400 text-xs italic">
              All systems operational. Last sync: just now.
            </div>
          </div>
        </footer>
      </main>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="에이전트 생성">
        <AgentForm departments={departmentsList} users={usersList} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} isSubmitting={createMutation.isPending} submitLabel="생성" />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteAgent} onClose={() => setDeleteAgent(null)} title={`"${deleteAgent?.name}" 에이전트 삭제`}>
        {deleteAgent && (
          <div className="space-y-4">
            {deleteAgent.isSecretary && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-700">비서 에이전트는 삭제할 수 없습니다.</p>
              </div>
            )}
            {deleteAgent.isSystem && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-700">시스템 에이전트는 삭제할 수 없습니다.</p>
              </div>
            )}
            {!deleteAgent.isSecretary && !deleteAgent.isSystem && (
              <>
                <p className="text-sm text-slate-500">이 에이전트를 비활성화하시겠습니까? 에이전트가 부서에서 해제되고 비활성화됩니다.</p>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => setDeleteAgent(null)} disabled={deleteMutation.isPending}>취소</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(deleteAgent.id)} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? '삭제 중...' : '삭제 확인'}
                  </Button>
                </div>
              </>
            )}
            {(deleteAgent.isSecretary || deleteAgent.isSystem) && (
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeleteAgent(null)}>닫기</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
