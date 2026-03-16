/**
 * API ENDPOINTS:
 * - GET    /api/admin/departments                       : List all departments
 * - POST   /api/admin/departments                       : Create a new department
 * - PATCH  /api/admin/departments/:id                   : Update department
 * - DELETE /api/admin/departments/:id?mode=force        : Delete department (force cascade)
 * - GET    /api/admin/departments/:id/cascade-analysis  : Analyze deletion impact
 * - GET    /api/admin/agents?departmentId=:id           : List agents in a department
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Modal, Button, Input, Textarea, Skeleton, EmptyState, Badge, toast } from '@corthex/ui'
import { Plus, Pencil, Trash2, Bot, Building2, ChevronRight, Users, MoreVertical, Cpu, Leaf, LayoutDashboard, Network, Settings, Search, Bell, HelpCircle, Filter, TrendingUp, Zap, RefreshCw, UserPlus } from 'lucide-react'

// ── Types ──

type Department = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  companyId: string
  createdAt: string
  updatedAt: string
}

type CascadeAgentBreakdown = {
  id: string
  name: string
  tier: string
  isSystem: boolean
  activeTaskCount: number
  totalCostUsdMicro: number
}

type CascadeAnalysis = {
  departmentId: string
  departmentName: string
  agentCount: number
  activeTaskCount: number
  totalCostUsdMicro: number
  knowledgeCount: number
  agentBreakdown: CascadeAgentBreakdown[]
}

type DeptFormData = {
  name: string
  description: string
}

type DeptAgent = {
  id: string
  name: string
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  status: 'online' | 'working' | 'error' | 'offline'
  isActive: boolean
}

// ── Department Form ──

function DepartmentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: {
  initialData?: DeptFormData
  onSubmit: (data: DeptFormData) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [nameError, setNameError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('부서명을 입력하세요')
      return
    }
    if (trimmedName.length > 100) {
      setNameError('부서명은 100자 이내로 입력하세요')
      return
    }
    setNameError('')
    onSubmit({ name: trimmedName, description: description.trim() || '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          부서명 <span className="text-red-500">*</span>
        </label>
        <Input value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} placeholder="예: 마케팅부" maxLength={100} autoFocus />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">설명</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="부서 설명 (선택)" rows={3} />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>취소</Button>
        <Button size="sm" type="submit" disabled={isSubmitting}>{isSubmitting ? '처리 중...' : submitLabel}</Button>
      </div>
    </form>
  )
}

// ── Cascade Analysis Panel ──

function CascadePanel({
  analysis,
  isLoading,
  onForceDelete,
  onCancel,
  isDeleting,
}: {
  analysis: CascadeAnalysis | null
  isLoading: boolean
  onForceDelete: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }
  if (!analysis) return null

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm font-medium text-amber-700 mb-2">삭제 영향 분석</p>
        <div className="space-y-1 text-xs text-amber-600">
          <p>소속 에이전트: <strong>{analysis.agentCount}명</strong> (미할당으로 전환됨)</p>
          <p>진행 중 작업: <strong>{analysis.activeTaskCount}건</strong></p>
          <p>부서 지식: <strong>{analysis.knowledgeCount}건</strong></p>
        </div>
      </div>
      {analysis.agentBreakdown.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          <p className="text-xs font-medium text-slate-500 mb-1">영향 받는 에이전트</p>
          <div className="space-y-1">
            {analysis.agentBreakdown.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between text-xs px-2 py-1 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-600">{agent.name}</span>
                <Badge variant="default">{agent.tier}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>취소</Button>
        <Button variant="destructive" size="sm" onClick={onForceDelete} disabled={isDeleting}>
          {isDeleting ? '삭제 중...' : '삭제 확인'}
        </Button>
      </div>
    </div>
  )
}

// ── Agent status helpers ──

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  online: { bg: 'bg-green-50', text: 'text-green-700', label: '활성' },
  working: { bg: 'bg-blue-50', text: 'text-blue-700', label: '작업 중' },
  error: { bg: 'bg-red-50', text: 'text-red-700', label: '오류' },
  offline: { bg: 'bg-slate-50', text: 'text-slate-500', label: '오프라인' },
}

const TIER_COLORS: Record<string, string> = {
  manager: 'bg-orange-50 text-orange-700',
  specialist: 'bg-green-50 text-green-700',
  worker: 'bg-slate-50 text-slate-600',
}

// ── Detail Section ──

function DepartmentDetailSection({
  dept,
  onEdit,
  onDelete,
  onClose,
}: {
  dept: Department
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['admin-agents', dept.id],
    queryFn: () => api.get<{ success: boolean; data: DeptAgent[] }>(`/admin/agents?departmentId=${dept.id}`),
    enabled: !!dept.id,
  })

  const agents = agentsData?.data ?? []

  return (
    <div className="flex flex-col gap-6 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      {/* Detail Header */}
      <div className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-400">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button onClick={onClose} className="hover:underline transition-colors" style={{ color: '#4a6741' }}>부서 목록</button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="text-slate-700 font-medium">{dept.name}</span>
              </div>
            </li>
          </ol>
        </nav>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{dept.name} 상세</h2>
            <p className="text-slate-500 mt-1 max-w-2xl">{dept.description || '설명 없음'}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onEdit} className="flex items-center justify-center gap-2 rounded-xl h-9 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:shadow-md transition-all">
              <Pencil className="w-[18px] h-[18px]" /> 편집
            </button>
            <button onClick={onDelete} className="flex items-center justify-center gap-2 rounded-xl h-9 px-4 bg-red-50 border border-red-100 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors">
              <Trash2 className="w-[18px] h-[18px]" /> 삭제
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Agents List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: '#4a6741' }} />
          할당된 에이전트 ({agentsLoading ? '...' : agents.length})
        </h3>

        {agentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center">
            <Bot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">이 부서에 할당된 에이전트가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const statusInfo = STATUS_COLORS[agent.status] ?? STATUS_COLORS.offline
              const tierColor = TIER_COLORS[agent.tier] ?? TIER_COLORS.worker
              return (
                <div key={agent.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`rounded-lg p-3 ${tierColor}`}>
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-semibold text-slate-800 truncate">{agent.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3 truncate">{agent.role || '역할 미지정'}</p>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{agent.modelName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="capitalize">{agent.tier}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──

export function DepartmentsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editDept, setEditDept] = useState<Department | null>(null)
  const [deleteDept, setDeleteDept] = useState<Department | null>(null)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['workspace-departments'],
    queryFn: () => api.get<{ success: boolean; data: Department[] }>('/workspace/departments'),
  })

  const { data: cascadeData, isLoading: cascadeLoading } = useQuery({
    queryKey: ['cascade-analysis', deleteDept?.id],
    queryFn: () => api.get<{ success: boolean; data: CascadeAnalysis }>(`/admin/departments/${deleteDept!.id}/cascade-analysis`),
    enabled: !!deleteDept,
  })

  const createMutation = useMutation({
    mutationFn: (body: DeptFormData) => api.post('/workspace/departments', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-departments'] })
      setCreateOpen(false)
      toast.success('부서가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DeptFormData> }) => api.patch(`/admin/departments/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-departments'] })
      if (editDept && selectedDept && editDept.id === selectedDept.id) {
        setSelectedDept(null)
      }
      setEditDept(null)
      toast.success('부서가 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/departments/${id}?mode=force`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-departments'] })
      if (deleteDept && selectedDept && deleteDept.id === selectedDept.id) {
        setSelectedDept(null)
      }
      setDeleteDept(null)
      toast.success('부서가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const departments = data?.data ?? []
  const activeDepts = departments.filter((d) => d.isActive)
  const inactiveDepts = departments.filter((d) => !d.isActive)

  const resolvedSelected = selectedDept
    ? departments.find((d) => d.id === selectedDept.id) ?? null
    : null

  const handleCardClick = (dept: Department) => {
    if (selectedDept?.id === dept.id) {
      setSelectedDept(null)
    } else {
      setSelectedDept(dept)
    }
  }

  if (isLoading) {
    return (
      <div data-testid="departments-page" className="flex h-screen overflow-hidden" style={{ fontFamily: "'Public Sans', sans-serif" }}>
        <div className="flex-1 p-8 space-y-6" style={{ backgroundColor: '#fcfaf7' }}>
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-52 w-full rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div data-testid="departments-page" className="flex h-screen overflow-hidden" style={{ fontFamily: "'Public Sans', sans-serif" }}>
        <div className="flex-1 p-8" style={{ backgroundColor: '#fcfaf7' }}>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600">부서 목록을 불러올 수 없습니다</p>
            <button onClick={() => refetch()} className="text-xs text-red-500 hover:text-red-400 underline mt-2">다시 시도</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="departments-page" className="flex h-screen overflow-hidden" style={{ fontFamily: "'Public Sans', sans-serif", backgroundColor: '#fcfaf7', color: '#0f172a' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#4a6741' }}>
            <Leaf className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: '#4a6741' }}>CORTHEX v2</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Main Menu</div>
          <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" href="#">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium">대시보드</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-xl shadow-sm text-white transition-colors" href="#" style={{ backgroundColor: '#4a6741' }}>
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">부서 관리</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" href="#">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-medium">에이전트 설정</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" href="#">
            <Network className="w-5 h-5" />
            <span className="text-sm font-medium">워크스페이스</span>
          </a>
          <div className="pt-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">System</div>
            <a className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors" href="#">
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">시스템 설정</span>
            </a>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
              <span className="text-sm font-bold text-slate-500">K</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">김관리 관리자</p>
              <p className="text-xs text-slate-500 truncate">admin@corthex.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
          <div className="flex items-center flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 transition-all"
                placeholder="부서 또는 에이전트 검색..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: '#ec5b13' }}></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <nav aria-label="Breadcrumb" className="flex mb-2">
                <ol className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                  <li>Workspace</li>
                  <li><ChevronRight className="w-2.5 h-2.5 inline" /></li>
                  <li style={{ color: '#4a6741' }}>부서 관리</li>
                </ol>
              </nav>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">부서 관리</h1>
              <p className="text-slate-500 mt-1">워크스페이스 내 부서를 관리하고 에이전트 리소스를 최적화하세요.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all">
                <Filter className="w-5 h-5" />
                필터
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-semibold shadow-lg transition-all"
                style={{ backgroundColor: '#4a6741' }}
              >
                <Plus className="w-5 h-5" />
                새 부서 추가
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="border p-4 rounded-2xl flex items-center gap-4" style={{ backgroundColor: 'rgba(74,103,65,0.05)', borderColor: 'rgba(74,103,65,0.1)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(74,103,65,0.2)', color: '#4a6741' }}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: 'rgba(74,103,65,0.7)' }}>전체 부서</p>
                <p className="text-2xl font-bold">{activeDepts.length}</p>
              </div>
            </div>
            <div className="border p-4 rounded-2xl flex items-center gap-4" style={{ backgroundColor: 'rgba(236,91,19,0.05)', borderColor: 'rgba(236,91,19,0.1)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(236,91,19,0.2)', color: '#ec5b13' }}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: 'rgba(236,91,19,0.7)' }}>활성 에이전트</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-500/70 uppercase">평균 효율</p>
                <p className="text-2xl font-bold">--%</p>
              </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-500/70 uppercase">응답 속도</p>
                <p className="text-2xl font-bold">--s</p>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {activeDepts.length === 0 && inactiveDepts.length === 0 && (
            <EmptyState title="부서가 없습니다" description="첫 부서를 생성하여 조직을 구성하세요" />
          )}

          {/* Department Cards Grid */}
          {activeDepts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
              {activeDepts.map((dept) => {
                const isSelected = resolvedSelected?.id === dept.id
                const colors = ['rgba(74,103,65,0.1)', 'rgba(59,130,246,0.1)', 'rgba(236,91,19,0.1)', 'rgba(245,158,11,0.1)']
                const colorIdx = activeDepts.indexOf(dept) % colors.length

                return (
                  <div
                    key={dept.id}
                    data-testid={`dept-row-${dept.id}`}
                    onClick={() => handleCardClick(dept)}
                    className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-pointer ${
                      isSelected ? 'border-2' : 'border-slate-200'
                    }`}
                    style={isSelected ? { borderColor: '#4a6741' } : {}}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 overflow-hidden" style={{ backgroundColor: colors[colorIdx] }}>
                        <Building2 className="w-7 h-7" style={{ color: '#4a6741' }} />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditDept(dept) }}
                        className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{dept.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 flex-1">{dept.description || '설명 없음'}</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Bot className="w-5 h-5" /> 할당된 에이전트
                        </span>
                        <span className="font-bold" style={{ color: '#4a6741' }}>--명</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: '50%', backgroundColor: '#4a6741' }}></div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCardClick(dept) }}
                          className="flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                          style={{ backgroundColor: 'rgba(74,103,65,0.1)', color: '#4a6741' }}
                        >
                          상세보기
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditDept(dept) }}
                          className="px-3 py-2 border border-slate-200 hover:border-slate-400 text-slate-600 rounded-xl transition-all"
                        >
                          <Pencil className="w-5 h-5 align-middle inline" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Detail Section */}
          {resolvedSelected && (
            <>
              <div className="w-full h-px bg-slate-200 my-8" />
              <DepartmentDetailSection
                dept={resolvedSelected}
                onEdit={() => setEditDept(resolvedSelected)}
                onDelete={() => setDeleteDept(resolvedSelected)}
                onClose={() => setSelectedDept(null)}
              />
            </>
          )}

          {/* Inactive departments */}
          {inactiveDepts.length > 0 && (
            <>
              <div className="w-full h-px bg-slate-200 mb-8 mt-12" />
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-1 mb-3">비활성 부서</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4 gap-6">
                  {inactiveDepts.map((dept) => (
                    <div key={dept.id} className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden opacity-60 p-6">
                      <h3 className="text-lg font-bold text-slate-500 mb-2">{dept.name}</h3>
                      {dept.description && <p className="text-xs text-slate-400 line-clamp-2">{dept.description}</p>}
                      <div className="mt-auto pt-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-400">비활성</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Recent Activity Section */}
          <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">최근 변경 내역</h2>
              <a className="text-sm font-semibold hover:underline" href="#" style={{ color: '#4a6741' }}>모든 내역 보기</a>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center" style={{ color: '#4a6741' }}>
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <p className="text-sm font-medium">부서 에이전트가 <span className="font-bold" style={{ color: '#4a6741' }}>업데이트</span>되었습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">방금 전 &bull; 시스템</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center" style={{ color: '#ec5b13' }}>
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <p className="text-sm font-medium">새로운 <span className="font-bold" style={{ color: '#4a6741' }}>에이전트가 할당</span>되었습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">최근 &bull; 관리자</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-amber-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">부서 <span className="font-bold" style={{ color: '#4a6741' }}>설정이 수정</span>되었습니다.</p>
                  <p className="text-xs text-slate-400 mt-1">이전 &bull; 시스템</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="부서 생성">
        <DepartmentForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setCreateOpen(false)} isSubmitting={createMutation.isPending} submitLabel="생성" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editDept} onClose={() => setEditDept(null)} title="부서 편집">
        {editDept && (
          <DepartmentForm initialData={{ name: editDept.name, description: editDept.description ?? '' }} onSubmit={(data) => updateMutation.mutate({ id: editDept.id, body: data })} onCancel={() => setEditDept(null)} isSubmitting={updateMutation.isPending} submitLabel="저장" />
        )}
      </Modal>

      {/* Delete Modal with Cascade Analysis */}
      <Modal isOpen={!!deleteDept} onClose={() => setDeleteDept(null)} title={`"${deleteDept?.name}" 부서 삭제`}>
        {deleteDept && (
          <CascadePanel analysis={cascadeData?.data ?? null} isLoading={cascadeLoading} onForceDelete={() => deleteMutation.mutate(deleteDept.id)} onCancel={() => setDeleteDept(null)} isDeleting={deleteMutation.isPending} />
        )}
      </Modal>
    </div>
  )
}
