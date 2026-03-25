/**
 * API ENDPOINTS:
 * - GET    /api/admin/agents                    : List agents (with filters: departmentId, isActive)
 * - POST   /api/admin/agents                    : Create a new agent
 * - PATCH  /api/admin/agents/:id                : Update agent fields
 * - DELETE /api/admin/agents/:id                : Deactivate/delete agent
 * - POST   /api/workspace/agents/:id/soul-preview : Preview rendered soul template
 * - GET    /api/admin/departments               : List departments (for filter & form)
 * - GET    /api/admin/users                     : List users (for owner selection)
 */

import { useState, useCallback, lazy, Suspense } from 'react'
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
  ArrowRight,
  Headphones,
  Wallet,
  Megaphone,
  Gavel,
  SlidersHorizontal,
  Paintbrush,
  Database,
} from 'lucide-react'
import { BigFiveSliderGroup } from '../components/agents/big-five-slider-group'
import type { PersonalityTraits } from '@corthex/shared'
import { PERSONALITY_PRESETS } from '@corthex/shared'
import { SOUL_VARIABLES } from '../lib/codemirror-soul-extensions'

const CodeMirrorEditor = lazy(() => import('../components/codemirror-editor'))

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
  personalityTraits: Record<string, number> | null
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
  personalityTraits: Record<string, number> | null
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
  manager: { bg: 'bg-corthex-elevated', text: 'text-corthex-accent-deep' },
  specialist: { bg: 'bg-corthex-elevated', text: 'text-corthex-accent' },
  worker: { bg: 'bg-corthex-elevated', text: 'text-corthex-text-secondary' },
}

const statusConfig: Record<string, { dot: string; label: string; labelKo: string }> = {
  online: { dot: 'bg-corthex-accent', label: 'Online', labelKo: '활성' },
  working: { dot: 'bg-corthex-info', label: 'Working', labelKo: '작업중' },
  error: { dot: 'bg-red-600', label: 'Error', labelKo: '오류' },
  offline: { dot: 'bg-corthex-text-secondary', label: 'Offline', labelKo: '오프라인' },
}

const agentIconComponents = [
  Headphones, Wallet, Megaphone, Gavel, SlidersHorizontal, Paintbrush, Database,
]

function getInitials(name: string, nameEn: string | null): string {
  if (nameEn) {
    const parts = nameEn.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return nameEn.slice(0, 2).toUpperCase()
  }
  return name.slice(0, 2)
}

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
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTraits | null>(
    initialData?.personalityTraits as PersonalityTraits | null ?? null,
  )
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
      personalityTraits,
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
        <label className="block text-xs font-medium text-corthex-text-secondary mb-1">
          에이전트 이름 <span className="text-red-500">*</span>
        </label>
        <Input value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} placeholder="예: 마케팅분석관" maxLength={100} autoFocus />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-corthex-text-secondary mb-1">영문 이름</label>
        <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="예: Marketing Analyst" maxLength={100} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-corthex-text-secondary mb-1">소속 부서</label>
          <Select options={deptOptions} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-corthex-text-secondary mb-1">등급</label>
          <Select options={tierOptions} value={tier} onChange={(e) => setTier(e.target.value as 'manager' | 'specialist' | 'worker')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-corthex-text-secondary mb-1">모델명</label>
          <Input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="claude-haiku-4-5" />
        </div>
        <div>
          <label className="block text-xs font-medium text-corthex-text-secondary mb-1">역할/전문분야</label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="예: 시장 분석" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-corthex-text-secondary mb-1">CLI 소유 인간직원</label>
        <Select options={userOptions} value={ownerUserId} onChange={(e) => setOwnerUserId(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Toggle checked={isSecretary} onChange={setIsSecretary} label="비서 에이전트" />
      </div>
      {/* Story 24.5: Big Five Personality Sliders */}
      <div className="border-t border-corthex-border pt-4">
        <BigFiveSliderGroup value={personalityTraits} onChange={setPersonalityTraits} disabled={isSubmitting} />
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
  const [previewA, setPreviewA] = useState<SoulPreviewResponse | null>(null)
  const [previewB, setPreviewB] = useState<SoulPreviewResponse | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [presetA, setPresetA] = useState('') // empty = agent's current personality
  const [presetB, setPresetB] = useState('creative')
  const [abMode, setAbMode] = useState(false)

  const getPresetTraits = (presetId: string): PersonalityTraits | undefined => {
    const preset = PERSONALITY_PRESETS.find(p => p.id === presetId)
    return preset?.traits as PersonalityTraits | undefined
  }

  const handlePreview = useCallback(async () => {
    setIsPreviewing(true)
    try {
      const reqA = api.post<{ success: boolean; data: SoulPreviewResponse }>(
        `/workspace/agents/${agentId}/soul-preview`,
        { soul, personalityTraits: getPresetTraits(presetA) },
      )
      if (abMode) {
        const [resA, resB] = await Promise.all([
          reqA,
          api.post<{ success: boolean; data: SoulPreviewResponse }>(
            `/workspace/agents/${agentId}/soul-preview`,
            { soul, personalityTraits: getPresetTraits(presetB) },
          ),
        ])
        setPreviewA(resA.data)
        setPreviewB(resB.data)
      } else {
        const resA = await reqA
        setPreviewA(resA.data)
        setPreviewB(null)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '프리뷰 실패')
    } finally {
      setIsPreviewing(false)
    }
  }, [agentId, soul, presetA, presetB, abMode])

  return (
    <div className="space-y-4">
      {/* Editor + Variable chips */}
      <div>
        <label className="block text-xs font-medium text-corthex-text-secondary mb-1">Soul (마크다운) — <code className="text-[10px]">{'{{'}</code> 입력 시 자동완성</label>
        <Suspense fallback={<div className="border border-corthex-border rounded-md p-3 min-h-[288px] animate-pulse bg-corthex-bg" />}>
          <CodeMirrorEditor value={soul} onChange={setSoul} soulMode placeholder="에이전트의 Soul을 작성하세요... {{로 변수 삽입" />
        </Suspense>
        <div className="mt-2">
          <p className="text-[10px] font-medium text-corthex-text-secondary mb-1">사용 가능한 변수 ({SOUL_VARIABLES.length}개):</p>
          <div className="flex flex-wrap gap-1">
            {SOUL_VARIABLES.map((v) => (
              <span key={v.name} className="px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer" style={{ backgroundColor: v.category === 'personality' ? 'rgba(37,99,235,0.1)' : v.category === 'memory' ? 'rgba(124,58,237,0.1)' : 'rgba(90,114,71,0.1)', color: v.category === 'personality' ? '#2563eb' : v.category === 'memory' ? '#7c3aed' : '#5a7247' }} onClick={() => setSoul((prev) => prev + `{{${v.name}}}`)} title={`${v.label}: ${v.description}`}>
                {`{{${v.name}}}`}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button size="sm" variant="outline" onClick={handlePreview} disabled={isPreviewing}>
          {isPreviewing ? '로딩...' : '프리뷰'}
        </Button>
        <label className="flex items-center gap-1.5 text-xs text-corthex-text-secondary cursor-pointer">
          <input type="checkbox" checked={abMode} onChange={(e) => setAbMode(e.target.checked)} className="rounded border-corthex-border" />
          A/B 성격 비교
        </label>
        {abMode && (
          <>
            <select value={presetA} onChange={(e) => setPresetA(e.target.value)} className="text-xs border border-corthex-border rounded px-2 py-1 bg-white">
              <option value="">A: 현재 성격</option>
              {PERSONALITY_PRESETS.map(p => <option key={p.id} value={p.id}>A: {p.nameKo}</option>)}
            </select>
            <select value={presetB} onChange={(e) => setPresetB(e.target.value)} className="text-xs border border-corthex-border rounded px-2 py-1 bg-white">
              <option value="">B: 현재 성격</option>
              {PERSONALITY_PRESETS.map(p => <option key={p.id} value={p.id}>B: {p.nameKo}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Preview Panes */}
      <div className={`grid gap-4 ${abMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div>
          {abMode && <p className="text-[10px] font-bold text-corthex-text-secondary mb-1 uppercase tracking-widest">A: {presetA ? PERSONALITY_PRESETS.find(p => p.id === presetA)?.nameKo : '현재 성격'}</p>}
          <div className="w-full h-64 p-3 rounded-lg border border-corthex-border bg-corthex-bg text-sm overflow-y-auto whitespace-pre-wrap">
            {previewA ? previewA.rendered || '(빈 결과)' : '프리뷰 버튼을 클릭하세요'}
          </div>
          {previewA?.variables && Object.keys(previewA.variables).length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-medium text-corthex-text-secondary">치환된 변수:</p>
              {Object.entries(previewA.variables).map(([key, val]) => (
                <div key={key} className="text-[10px] font-mono text-corthex-text-secondary truncate">
                  <span style={{ color: '#5a7247' }}>{`{{${key}}}`}</span>{' = '}<span>{val || '(빈 값)'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {abMode && previewB && (
          <div>
            <p className="text-[10px] font-bold text-corthex-text-secondary mb-1 uppercase tracking-widest">B: {presetB ? PERSONALITY_PRESETS.find(p => p.id === presetB)?.nameKo : '현재 성격'}</p>
            <div className="w-full h-64 p-3 rounded-lg border border-corthex-border bg-corthex-bg text-sm overflow-y-auto whitespace-pre-wrap">
              {previewB.rendered || '(빈 결과)'}
            </div>
            {previewB.variables && Object.keys(previewB.variables).length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-[10px] font-medium text-corthex-text-secondary">치환된 변수:</p>
                {Object.entries(previewB.variables).map(([key, val]) => (
                  <div key={key} className="text-[10px] font-mono text-corthex-text-secondary truncate">
                    <span style={{ color: '#5a7247' }}>{`{{${key}}}`}</span>{' = '}<span>{val || '(빈 값)'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
    <div className="flex flex-col gap-10">
      {/* Profile Header */}
      <section className="flex justify-between items-start">
        <div className="flex gap-6 items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-corthex-accent-deep flex items-center justify-center text-3xl font-bold text-white shadow-xl">
              {getInitials(agent.name, agent.nameEn)}
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-corthex-elevated border-4 border-corthex-elevated flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full ${status.dot}`} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-corthex-text-primary">
                {agent.name}
                {agent.nameEn && <span className="text-corthex-text-secondary font-medium text-xl ml-2">{agent.nameEn}</span>}
              </h2>
              <span className={`${tierBadge.bg} ${tierBadge.text} px-3 py-1 rounded-full text-xs font-bold tracking-wider`}>
                {tierLabels[agent.tier] || agent.tier}
              </span>
            </div>
            <p className="text-corthex-text-secondary font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" />
              {agent.role || 'Agent'} — {deptName}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest" style={{ color: status.dot === 'bg-corthex-accent' ? '#4d7c0f' : status.dot === 'bg-red-600' ? '#dc2626' : '#6b705c' }}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.dot === 'bg-corthex-accent' ? 'animate-pulse' : ''}`} />
                {status.labelKo} {status.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-corthex-border hover:bg-corthex-elevated transition-colors font-medium text-sm text-corthex-text-primary">
            <Pencil className="w-4 h-4" /> 수정
          </button>
          <button onClick={onDelete} disabled={agent.isSystem || agent.isSecretary} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-[#b91c1c] transition-colors font-medium text-sm shadow-sm disabled:opacity-30">
            <Trash2 className="w-4 h-4" /> 비활성화
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-corthex-border/30">
          <p className="text-xs font-bold text-corthex-text-secondary uppercase tracking-widest mb-1">총 작업</p>
          <p className="text-3xl font-bold font-mono text-corthex-accent-deep">--</p>
          <p className="text-[10px] text-corthex-accent mt-2 font-medium">실적 집계 중</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-corthex-border/30">
          <p className="text-xs font-bold text-corthex-text-secondary uppercase tracking-widest mb-1">성공률</p>
          <p className="text-3xl font-bold font-mono text-corthex-accent-deep">--%</p>
          <div className="w-full bg-corthex-border h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-corthex-accent h-full" style={{ width: '0%' }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-corthex-border/30">
          <p className="text-xs font-bold text-corthex-text-secondary uppercase tracking-widest mb-1">평균 응답</p>
          <p className="text-3xl font-bold font-mono text-corthex-accent-deep">--s</p>
          <p className="text-[10px] text-corthex-text-secondary mt-2 font-medium">데이터 수집 중</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-corthex-border/30">
          <p className="text-xs font-bold text-corthex-text-secondary uppercase tracking-widest mb-1">월간 비용</p>
          <p className="text-3xl font-bold font-mono text-corthex-accent-deep">$--</p>
          <p className="text-[10px] text-corthex-text-secondary mt-2 font-medium">예산 집계 중</p>
        </div>
      </section>

      {/* Detail Tabs */}
      <div className="border-b border-corthex-border mt-2">
        <div className="flex gap-8">
          {detailTabItems.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDetailTab(tab.value)}
              className={`pb-4 border-b-2 text-sm transition-colors ${
                detailTab === tab.value
                  ? 'font-bold text-corthex-accent border-corthex-accent'
                  : 'border-transparent text-corthex-text-secondary hover:text-corthex-accent-deep font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {detailTab === 'overview' && (
        <div className="grid grid-cols-12 gap-8">
          {/* Recent Tasks */}
          <section className="col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight text-corthex-text-primary">
                최근 활동 <span className="text-corthex-text-secondary font-normal text-sm ml-2">Recent Activity</span>
              </h3>
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-corthex-border/30">
              <div className="divide-y divide-corthex-border/30">
                {recentActivities.map((act) => (
                  <div key={act.id} className="px-6 py-4 flex items-center justify-between hover:bg-corthex-bg/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${act.icon === 'success' ? 'bg-corthex-accent/10 text-corthex-accent' : 'bg-corthex-accent-deep/10 text-corthex-accent-deep'}`}>
                        {activityIconMap[act.icon]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-corthex-text-primary">{act.title}</p>
                        <p className="text-xs text-corthex-text-secondary mt-0.5">{act.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs text-corthex-text-secondary">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* Performance */}
          <section className="col-span-4 space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-corthex-text-primary">
              성능 지표 <span className="text-corthex-text-secondary font-normal text-sm block">Performance</span>
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-corthex-border/30 space-y-6">
              <div>
                <p className="text-xs font-bold text-corthex-text-secondary uppercase tracking-widest mb-1">모델</p>
                <p className="text-sm font-mono font-medium text-corthex-accent-deep">{agent.modelName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-corthex-text-secondary uppercase tracking-widest mb-1">등급</p>
                <p className="text-sm font-medium text-corthex-accent-deep">{tierLabels[agent.tier] || agent.tier}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-corthex-text-secondary uppercase tracking-widest mb-1">자동 학습</p>
                <p className="text-sm font-medium text-corthex-accent-deep">{agent.autoLearn ? 'ON' : 'OFF'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-corthex-text-secondary uppercase tracking-widest mb-1">허용 도구</p>
                <p className="text-sm font-medium text-corthex-accent-deep">{agent.allowedTools.length > 0 ? `${agent.allowedTools.length}개` : '제한 없음'}</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {detailTab === 'soul' && (
        <div className="mt-2">
          <SoulEditor agentId={agent.id} initialSoul={agent.soul ?? ''} onSave={onSoulSave} isSaving={isUpdating} />
        </div>
      )}

      {detailTab === 'history' && (
        <div className="mt-2">
          <div className="bg-corthex-elevated rounded-xl border border-corthex-border p-8 text-center">
            <Clock className="w-10 h-10 text-corthex-text-secondary mx-auto mb-3" />
            <p className="text-corthex-text-secondary text-sm">작업 이력이 없습니다</p>
            <p className="text-corthex-text-secondary text-xs mt-1">에이전트가 작업을 수행하면 여기에 기록됩니다</p>
          </div>
        </div>
      )}

      {detailTab === 'settings' && (
        <div className="mt-2 space-y-4">
          <div className="bg-corthex-elevated rounded-xl border border-corthex-border p-6">
            <h4 className="text-corthex-text-primary font-bold text-sm mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-corthex-text-secondary" /> 에이전트 설정
            </h4>
            <div className="space-y-3">
              {[
                { label: '모델', value: agent.modelName },
                { label: '등급', value: tierLabels[agent.tier] || agent.tier },
                { label: '자동 학습', value: agent.autoLearn ? 'ON' : 'OFF' },
                { label: '비서 에이전트', value: agent.isSecretary ? 'YES' : 'NO' },
                { label: '허용된 도구', value: agent.allowedTools.length > 0 ? `${agent.allowedTools.length}개` : '없음' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-corthex-border last:border-b-0">
                  <span className="text-corthex-text-secondary text-sm">{item.label}</span>
                  <span className="text-corthex-text-primary text-sm font-medium">{item.value}</span>
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
              personalityTraits: agent.personalityTraits,
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
    queryKey: ['workspace-agents', filterDept, filterActive],
    queryFn: () => api.get<{ success: boolean; data: Agent[] }>(`/workspace/agents${buildQueryString()}`),
  })

  const { data: deptData } = useQuery({
    queryKey: ['workspace-departments'],
    queryFn: () => api.get<{ success: boolean; data: Department[] }>('/workspace/departments'),
  })

  const { data: userData } = useQuery({
    queryKey: ['workspace-employees'],
    queryFn: () => api.get<{ success: boolean; data: User[] }>('/workspace/employees'),
  })

  const departmentsList = deptData?.data ?? []
  const usersList = userData?.data ?? []

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/workspace/agents', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-agents'] })
      setCreateOpen(false)
      toast.success('에이전트가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.patch(`/workspace/agents/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-agents'] })
      toast.success('에이전트가 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/agents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-agents'] })
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

  // Filter agents by search
  const filteredAgents = agents.filter((a) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return a.name.toLowerCase().includes(q) || (a.nameEn?.toLowerCase().includes(q)) || (a.role?.toLowerCase().includes(q))
  })

  if (isLoading) {
    return (
      <div data-testid="agents-page" className="flex-1 p-8 space-y-6 bg-corthex-bg">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-8">
          <div className="w-[380px] space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
          <Skeleton className="flex-1 h-96 rounded-[2rem]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div data-testid="agents-page" className="flex-1 p-8 bg-corthex-bg">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600">에이전트 목록을 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-red-600 hover:opacity-70 underline mt-2">다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="agents-page" className="flex-1 bg-corthex-bg overflow-hidden">
      <div className="p-8 max-w-[1440px] mx-auto h-full">
        <div className="flex gap-8 h-[calc(100vh-64px)]">
          {/* LEFT PANEL: Agent List */}
          <aside className="w-[380px] flex flex-col gap-6 flex-shrink-0">
            <header className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold tracking-tight text-corthex-text-primary">
                  에이전트 관리 <span className="text-corthex-text-secondary font-normal ml-1">Agents</span>
                </h1>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-corthex-accent hover:bg-corthex-accent-deep text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>새 에이전트 생성</span>
              </button>
              <div className="relative">
                <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-corthex-text-secondary" />
                <input
                  className="w-full bg-corthex-elevated border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-corthex-accent placeholder:text-corthex-text-secondary text-corthex-text-primary"
                  placeholder="에이전트 검색..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['active', 'all', 'inactive'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterActive(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      filterActive === f
                        ? 'bg-corthex-accent text-white'
                        : 'bg-corthex-border text-corthex-text-secondary hover:bg-corthex-border-strong'
                    }`}
                  >
                    {f === 'active' ? '활성' : f === 'all' ? '전체' : '비활성'}
                  </button>
                ))}
              </div>
            </header>

            {/* Agent List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {filteredAgents.length === 0 && (
                <EmptyState title="에이전트가 없습니다" description="첫 에이전트를 생성하여 AI 조직을 구성하세요" />
              )}
              {filteredAgents.map((agent) => {
                const deptName = agent.departmentId ? deptMap.get(agent.departmentId) || '부서' : '미배속'
                const status = statusConfig[agent.status] || statusConfig.offline
                const isSelected = selectedAgent?.id === agent.id

                return (
                  <div
                    key={agent.id}
                    data-testid={`agent-row-${agent.id}`}
                    onClick={() => setSelectedAgent(isSelected ? null : agent)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-corthex-border border-l-4 border-corthex-accent shadow-sm'
                        : 'bg-corthex-elevated hover:bg-corthex-elevated'
                    } ${!agent.isActive ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-corthex-accent-deep text-white flex items-center justify-center font-bold text-sm">
                        {getInitials(agent.name, agent.nameEn)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className={`${isSelected ? 'font-bold' : 'font-medium'} text-corthex-text-primary truncate`}>
                            {agent.name}
                            {agent.nameEn && <span className="text-[10px] text-corthex-text-secondary ml-1">{agent.nameEn}</span>}
                          </h3>
                          <span className={`flex h-2 w-2 rounded-full ${status.dot}`} />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-corthex-text-secondary mt-0.5">
                          <span className="font-medium">{deptName}</span>
                          <span className="w-1 h-1 rounded-full bg-corthex-border" />
                          <span className="font-mono">{agent.tier === 'manager' ? 'T1' : agent.tier === 'specialist' ? 'T2' : 'T3'}</span>
                          <span className="w-1 h-1 rounded-full bg-corthex-border" />
                          <span>{status.labelKo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>

          {/* RIGHT PANEL: Agent Details */}
          <main className="flex-1 bg-corthex-elevated rounded-[2rem] p-8 overflow-y-auto flex flex-col">
            {selectedAgent ? (
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
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Bot className="w-16 h-16 text-corthex-border mx-auto" />
                  <p className="text-corthex-text-secondary font-medium">에이전트를 선택하세요</p>
                  <p className="text-corthex-text-secondary text-sm">좌측 목록에서 에이전트를 클릭하면 상세 정보가 표시됩니다</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="에이전트 생성">
        <AgentForm departments={departmentsList} users={usersList} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} isSubmitting={createMutation.isPending} submitLabel="생성" />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteAgent} onClose={() => setDeleteAgent(null)} title={`"${deleteAgent?.name}" 에이전트 삭제`}>
        {deleteAgent && (
          <div className="space-y-4">
            {deleteAgent.isSecretary && (
              <div className="bg-amber-700/10 border border-amber-700/20 rounded-lg p-3">
                <p className="text-sm text-amber-700">비서 에이전트는 삭제할 수 없습니다.</p>
              </div>
            )}
            {deleteAgent.isSystem && (
              <div className="bg-amber-700/10 border border-amber-700/20 rounded-lg p-3">
                <p className="text-sm text-amber-700">시스템 에이전트는 삭제할 수 없습니다.</p>
              </div>
            )}
            {!deleteAgent.isSecretary && !deleteAgent.isSystem && (
              <>
                <p className="text-sm text-corthex-text-secondary">이 에이전트를 비활성화하시겠습니까? 에이전트가 부서에서 해제되고 비활성화됩니다.</p>
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
