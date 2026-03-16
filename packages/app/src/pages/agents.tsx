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

// ── Tier/Status Badge helpers ──

const tierLabels: Record<string, string> = {
  manager: '매니저',
  specialist: '전문가',
  worker: '실행자',
}

const tierShortLabels: Record<string, string> = {
  manager: 'T1',
  specialist: 'T2',
  worker: 'T3',
}

const tierGradients: Record<string, string> = {
  manager: 'from-cyan-400 to-cyan-600',
  specialist: 'from-violet-400 to-violet-600',
  worker: 'from-slate-400 to-slate-600',
}

const tierBadgeColors: Record<string, string> = {
  manager: 'bg-cyan-900/30 text-cyan-400 border-cyan-800/50',
  specialist: 'bg-violet-900/30 text-violet-400 border-violet-800/50',
  worker: 'bg-slate-800 text-slate-300 border-slate-700',
}

const statusLabels: Record<string, string> = {
  online: '온라인',
  working: '실행중',
  error: '오류',
  offline: '오프라인',
}

const statusDotColors: Record<string, string> = {
  online: 'bg-green-500',
  working: 'bg-green-500 animate-pulse',
  error: 'bg-red-500',
  offline: 'bg-slate-600',
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
        <label className="block text-xs font-medium text-slate-400 mb-1">
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
        <label className="block text-xs font-medium text-slate-400 mb-1">영문 이름</label>
        <Input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="예: Marketing Analyst"
          maxLength={100}
        />
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
          <Input
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="claude-haiku-4-5"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">역할/전문분야</label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="예: 시장 분석"
          />
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

// ── Soul Editor (inline detail panel, Soul tab) ──

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
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Soul (마크다운)
          </label>
          <textarea
            value={soul}
            onChange={(e) => setSoul(e.target.value)}
            className="w-full h-64 p-3 rounded-lg border border-slate-700 bg-slate-900 text-sm font-mono text-slate-50 resize-y focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="에이전트의 Soul을 작성하세요..."
          />
          <div className="mt-2">
            <p className="text-[10px] font-medium text-slate-500 mb-1">사용 가능한 변수:</p>
            <div className="flex flex-wrap gap-1">
              {availableVars.map((v) => (
                <span
                  key={v}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[rgba(34,211,238,0.10)] text-cyan-300 cursor-pointer hover:bg-[rgba(34,211,238,0.15)]"
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
            <label className="block text-xs font-medium text-slate-400">
              프리뷰
            </label>
            <Button size="sm" variant="outline" onClick={handlePreview} disabled={isPreviewing}>
              {isPreviewing ? '로딩...' : '프리뷰 새로고침'}
            </Button>
          </div>
          <div className="w-full h-64 p-3 rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-50 overflow-y-auto whitespace-pre-wrap">
            {preview ? preview.rendered || '(빈 결과)' : '프리뷰 버튼을 클릭하세요'}
          </div>
          {preview?.variables && Object.keys(preview.variables).length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-medium text-slate-500">치환된 변수:</p>
              {Object.entries(preview.variables).map(([key, val]) => (
                <div key={key} className="text-[10px] font-mono text-slate-500 truncate">
                  <span className="text-cyan-400">{`{{${key}}}`}</span>
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

// ── Detail Panel Tabs ──

type DetailTab = 'overview' | 'soul' | 'history' | 'settings'

const detailTabItems: { value: DetailTab; label: string }[] = [
  { value: 'overview', label: '개요' },
  { value: 'soul', label: 'Soul' },
  { value: 'history', label: '작업 이력' },
  { value: 'settings', label: '설정' },
]

// ── Inline Detail Panel (below cards) ──

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

  const gradient = tierGradients[agent.tier] || 'from-slate-400 to-slate-600'
  const badgeColor = tierBadgeColors[agent.tier] || 'bg-slate-800 text-slate-300 border-slate-700'
  const dotColor = statusDotColors[agent.status] || 'bg-slate-600'

  // Mock activity data (from Stitch design) - in production this would come from API
  const recentActivities = [
    {
      id: '1',
      icon: 'success' as const,
      title: '작업 완료',
      detail: `최근 처리 완료`,
      time: '방금 전',
    },
    {
      id: '2',
      icon: 'message' as const,
      title: '문의 응답',
      detail: `사용자 대화`,
      time: '15분 전',
    },
    {
      id: '3',
      icon: 'success' as const,
      title: '일정 조율 완료',
      detail: `자동 처리`,
      time: '1시간 전',
    },
  ]

  const activityIconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    message: <MessageSquare className="w-5 h-5" />,
  }

  const activityColorMap = {
    success: 'bg-green-900/30 text-green-400',
    message: 'bg-blue-900/30 text-blue-400',
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Agent Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-6">
          {/* Large Avatar */}
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg relative`}>
            <Bot className="w-10 h-10 text-white" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#101f22] rounded-full flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full ${dotColor}`} />
            </div>
          </div>
          {/* Name + Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-3xl font-bold tracking-tight">{agent.name}</h2>
              <span className={`px-2.5 py-1 rounded-md text-sm font-mono font-bold border ${badgeColor}`}>
                {tierShortLabels[agent.tier] || 'T2'}
              </span>
            </div>
            <p className="text-slate-400 text-base font-mono">
              {deptName} · ID: {agent.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-slate-300 text-sm max-w-lg mt-1">
              {agent.role || tierLabels[agent.tier] || '에이전트'} · {agent.modelName}
            </p>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center rounded-lg h-10 px-6 bg-slate-800 text-slate-300 text-sm font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <Pencil className="w-4 h-4 mr-2" />
            편집
          </button>
          <button
            onClick={onDelete}
            disabled={agent.isSystem || agent.isSecretary}
            className="flex items-center justify-center rounded-lg h-10 px-6 bg-red-500/10 text-red-400 text-sm font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </button>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="border-b border-slate-800 mt-6">
        <div className="flex gap-8">
          {detailTabItems.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDetailTab(tab.value)}
              className={`pb-4 border-b-2 text-sm transition-colors ${
                detailTab === tab.value
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-300 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {detailTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Activity List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">최근 활동</h3>
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 divide-y divide-slate-800">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${activityColorMap[act.icon]} flex items-center justify-center`}>
                      {activityIconMap[act.icon]}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{act.title}</p>
                      <p className="text-slate-400 text-xs font-mono mt-1">{act.detail}</p>
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">성능 지표</h3>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="flex flex-col gap-6 relative z-10">
                {/* Total Tasks */}
                <div>
                  <p className="text-slate-400 text-sm mb-1">총 처리 작업</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold tracking-tight text-white">--</span>
                    <span className="text-cyan-400 text-xs font-mono">데이터 로딩</span>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-700/50" />
                {/* Success Rate */}
                <div>
                  <p className="text-slate-400 text-sm mb-1">작업 성공률</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-bold tracking-tight text-white">--%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
                <div className="w-full h-px bg-slate-700/50" />
                {/* Cumulative API Cost */}
                <div>
                  <p className="text-slate-400 text-sm mb-1">누적 API 비용</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-300 font-mono text-lg">$</span>
                    <span className="text-2xl font-mono font-bold tracking-tight text-white">--</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailTab === 'soul' && (
        <div className="mt-6">
          <SoulEditor
            agentId={agent.id}
            initialSoul={agent.soul ?? ''}
            onSave={onSoulSave}
            isSaving={isUpdating}
          />
        </div>
      )}

      {detailTab === 'history' && (
        <div className="mt-6">
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-8 text-center">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">작업 이력이 없습니다</p>
            <p className="text-slate-500 text-xs mt-1">에이전트가 작업을 수행하면 여기에 기록됩니다</p>
          </div>
        </div>
      )}

      {detailTab === 'settings' && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
            <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              에이전트 설정
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 text-sm">모델</span>
                <span className="text-white text-sm font-mono">{agent.modelName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 text-sm">등급</span>
                <span className="text-white text-sm">{tierLabels[agent.tier] || agent.tier}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 text-sm">자동 학습</span>
                <span className={`text-sm font-mono ${agent.autoLearn ? 'text-green-400' : 'text-slate-500'}`}>
                  {agent.autoLearn ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400 text-sm">비서 에이전트</span>
                <span className={`text-sm font-mono ${agent.isSecretary ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {agent.isSecretary ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-400 text-sm">허용된 도구</span>
                <span className="text-white text-sm font-mono">
                  {agent.allowedTools.length > 0 ? `${agent.allowedTools.length}개` : '없음'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal (inline edit triggers modal) */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title={`"${agent.name}" 정보 편집`}
        >
          <AgentForm
            initialData={{
              userId: agent.userId,
              name: agent.name,
              nameEn: agent.nameEn ?? '',
              departmentId: agent.departmentId ?? '',
              tier: agent.tier,
              modelName: agent.modelName,
              role: agent.role ?? '',
              isSecretary: agent.isSecretary,
              ownerUserId: agent.ownerUserId ?? '',
              soul: agent.soul ?? '',
            }}
            departments={departments}
            users={users}
            onSubmit={(data) => {
              onEdit(data)
              setIsEditing(false)
            }}
            onCancel={() => setIsEditing(false)}
            isSubmitting={isUpdating}
            submitLabel="저장"
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
      setSelectedAgent(null)
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
    if (!selectedAgent) return
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
    updateMutation.mutate({ id: selectedAgent.id, body })
  }

  const handleSoulSave = (soul: string) => {
    if (!selectedAgent) return
    updateMutation.mutate({ id: selectedAgent.id, body: { soul } })
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
      <div data-testid="agents-page" className="w-full max-w-[960px] mx-auto px-4 md:px-10 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div data-testid="agents-page" className="w-full max-w-[960px] mx-auto px-4 md:px-10 py-8">
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
          <p className="text-sm text-red-400">에이전트 목록을 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-red-500 hover:text-red-400 underline mt-2">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="agents-page" className="w-full max-w-[960px] mx-auto px-4 md:px-10 py-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight">에이전트 디렉토리</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center rounded-lg h-10 px-5 bg-cyan-400 text-slate-900 text-sm font-bold shadow-sm hover:bg-cyan-400/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 에이전트 생성
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="pb-3 border-b border-slate-800 mb-6">
        <div className="flex gap-8">
          {(['active', 'all', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                filterActive === f
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <p className={`text-sm leading-normal ${filterActive === f ? 'font-bold' : 'font-medium'}`}>
                {f === 'active' ? '활성 에이전트' : f === 'inactive' ? '비활성' : '전체'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Department Filter */}
      <div className="mb-6 w-full sm:w-48">
        <Select options={filterDeptOptions} value={filterDept} onChange={(e) => setFilterDept(e.target.value)} />
      </div>

      {/* Empty state */}
      {agents.length === 0 && (
        <EmptyState
          title="에이전트가 없습니다"
          description="첫 에이전트를 생성하여 AI 조직을 구성하세요"
        />
      )}

      {/* Agent Card Grid */}
      {agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {agents.map((agent) => {
            const gradient = tierGradients[agent.tier] || 'from-slate-400 to-slate-600'
            const badgeColor = tierBadgeColors[agent.tier] || 'bg-slate-800 text-slate-300 border-slate-700'
            const dotColor = statusDotColors[agent.status] || 'bg-slate-600'
            const deptName = agent.departmentId ? deptMap.get(agent.departmentId) || '부서' : '미배속'
            const isSelected = selectedAgent?.id === agent.id

            return (
              <div
                key={agent.id}
                data-testid={`agent-row-${agent.id}`}
                className={`flex flex-col gap-4 p-5 rounded-xl bg-slate-900/50 border transition-colors cursor-pointer group ${
                  isSelected
                    ? 'border-cyan-400/50'
                    : 'border-slate-800 hover:border-cyan-400/50'
                } ${!agent.isActive ? 'opacity-50' : ''}`}
                onClick={() => setSelectedAgent(isSelected ? null : agent)}
              >
                {/* Top row: avatar + tier badge */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-inner`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-mono font-bold border ${badgeColor}`}>
                    {tierShortLabels[agent.tier] || 'T2'}
                  </span>
                </div>

                {/* Name + department */}
                <div>
                  <h3 className="text-white text-lg font-bold leading-tight group-hover:text-cyan-400 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">{deptName}</p>
                </div>

                {/* Footer: status + work count badge */}
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="text-slate-300 text-xs font-mono">{statusLabels[agent.status]}</span>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">
                    {agent.isSecretary ? '비서' : agent.isSystem ? 'SYS' : agent.role || ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Divider + Inline Detail Panel */}
      {selectedAgent && (
        <>
          <div className="w-full h-px bg-slate-800 my-8" />
          <AgentDetailPanel
            agent={selectedAgent}
            deptName={selectedAgent.departmentId ? deptMap.get(selectedAgent.departmentId) || '부서' : '미배속'}
            departments={departmentsList}
            users={usersList}
            onEdit={handleEdit}
            onDelete={() => setDeleteAgent(selectedAgent)}
            onSoulSave={handleSoulSave}
            isUpdating={updateMutation.isPending}
          />
        </>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteAgent}
        onClose={() => setDeleteAgent(null)}
        title={`"${deleteAgent?.name}" 에이전트 삭제`}
      >
        {deleteAgent && (
          <div className="space-y-4">
            {deleteAgent.isSecretary && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
                <p className="text-sm text-amber-300">
                  비서 에이전트는 삭제할 수 없습니다.
                </p>
              </div>
            )}
            {deleteAgent.isSystem && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
                <p className="text-sm text-amber-300">
                  시스템 에이전트는 삭제할 수 없습니다.
                </p>
              </div>
            )}
            {!deleteAgent.isSecretary && !deleteAgent.isSystem && (
              <>
                <p className="text-sm text-slate-500">
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
