/**
 * Onboarding Wizard Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET   /api/admin/companies/:id
 *   PATCH /api/admin/companies/:id
 *   GET   /api/admin/org-templates?companyId=...
 *   POST  /api/admin/org-templates/:id/apply
 *   GET   /api/admin/api-keys/providers
 *   GET   /api/admin/api-keys
 *   POST  /api/admin/api-keys
 *   GET   /api/admin/departments
 *   POST  /api/admin/employees
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

// -- Natural Organic color tokens --
const OC = {
  olive: '#556B2F',
  oliveDark: '#3E4E22',
  leaf: '#A3B18A',
  cream: '#F9F7F2',
  sand: '#E9E5D6',
}

// ============================================================
// Types
// ============================================================

type Company = {
  id: string
  name: string
  slug: string
  settings: Record<string, unknown> | null
}

type TemplateAgent = {
  name: string
  nameEn?: string
  role: string
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  soul: string
  allowedTools: string[]
}

type TemplateDepartment = {
  name: string
  description?: string
  agents: TemplateAgent[]
}

type OrgTemplate = {
  id: string
  companyId: string | null
  name: string
  description: string | null
  templateData: { departments: TemplateDepartment[] }
  isBuiltin: boolean
  isActive: boolean
}

type ApplyResult = {
  templateId: string
  templateName: string
  departmentsCreated: number
  departmentsSkipped: number
  agentsCreated: number
  agentsSkipped: number
  details: Array<{
    departmentName: string
    action: 'created' | 'skipped'
    departmentId: string
    agentsCreated: string[]
    agentsSkipped: string[]
  }>
}

type Department = {
  id: string
  name: string
}

type ProviderSchemas = Record<string, string[]>

type InvitedEmployee = {
  name: string
  email: string
  initialPassword: string
}

// ============================================================
// Constants
// ============================================================

const STEPS = [
  { num: 1, label: 'Company' },
  { num: 2, label: 'Departments' },
  { num: 3, label: 'Agents' },
  { num: 4, label: 'CLI Token' },
  { num: 5, label: 'Complete' },
]

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  manager: { label: 'Manager', color: 'bg-[#556B2F]/10 text-[#556B2F]' },
  specialist: { label: 'Specialist', color: 'bg-blue-100 text-blue-700' },
  worker: { label: 'Worker', color: 'bg-gray-100 text-gray-600' },
}

const ONBOARDING_PROVIDERS = ['anthropic'] as const

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
}

// ============================================================
// Step Indicator (Organic stepper matching Stitch HTML)
// ============================================================

function StepIndicator({ current, completed }: { current: number; completed: Set<number> }) {
  return (
    <nav className="mb-12">
      <ul className="flex items-center justify-between w-full relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0" style={{ backgroundColor: OC.sand }}></div>
        {STEPS.map((step) => {
          const isActive = step.num === current
          const isDone = completed.has(step.num)
          return (
            <li key={step.num} className="relative z-10 flex flex-col items-center group">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-4 mb-2"
                style={{
                  borderColor: OC.cream,
                  backgroundColor: isDone || isActive ? OC.olive : '#ffffff',
                  color: isDone || isActive ? '#ffffff' : '#94a3b8',
                  ...(isActive ? { boxShadow: `0 0 0 4px rgba(85,107,47,0.2)` } : {}),
                  ...(!(isDone || isActive) ? { border: `2px solid ${OC.sand}` } : {}),
                }}
              >
                {isDone ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                ) : (
                  <span className="font-bold">{step.num}</span>
                )}
              </div>
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{
                  color: isActive ? OC.olive : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  ...(isActive ? { textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '4px' } : {}),
                }}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// ============================================================
// Footer Nav
// ============================================================

function FooterNav({
  step,
  onPrev,
  onNext,
  onSkip,
  nextLabel,
  nextDisabled,
  showSkip,
}: {
  step: number
  onPrev: () => void
  onNext: () => void
  onSkip?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  showSkip?: boolean
}) {
  return (
    <div className="p-8 flex justify-between items-center border-t" style={{ backgroundColor: 'rgba(249,247,242,0.5)', borderColor: OC.sand }}>
      <div>
        {step > 1 && (
          <button
            onClick={onPrev}
            className="px-6 py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            Previous
          </button>
        )}
      </div>
      <div className="flex space-x-4">
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="px-6 py-2 text-slate-400 font-medium hover:text-slate-600"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="px-10 py-3 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: OC.olive,
            boxShadow: `0 10px 15px -3px rgba(85,107,47,0.2)`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = OC.oliveDark)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = OC.olive)}
        >
          {nextLabel || 'Continue to Agents'}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Step 1: Welcome
// ============================================================

function WelcomeStep({
  company,
  onNext,
}: {
  company: Company
  onNext: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(company.name)
  const addToast = useToastStore((s) => s.addToast)
  const qc = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: (newName: string) =>
      api.patch<{ data: Company }>(`/admin/companies/${company.id}`, { name: newName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-detail'] })
      setEditing(false)
      addToast({ type: 'success', message: '회사명이 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: OC.sand }}>
      <div className="p-8 border-b" style={{ borderColor: `${OC.sand}80` }}>
        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl text-white flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: OC.olive }}>
            C
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">CORTHEX에 오신 것을 환영합니다!</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            AI 조직을 구성하고 운영하기 위한 관리자 콘솔입니다.
            몇 가지 기본 설정을 완료하면 바로 시작할 수 있습니다.
          </p>
        </div>

        <div className="rounded-xl p-5 max-w-md mx-auto" style={{ backgroundColor: `${OC.cream}80` }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">회사 정보</h3>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-xs" style={{ color: OC.olive }}>
                수정
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">회사명</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white text-sm text-slate-900"
                  style={{ borderColor: OC.sand }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setEditing(false); setName(company.name) }} className="px-3 py-1.5 text-xs text-slate-500">
                  취소
                </button>
                <button
                  onClick={() => saveMutation.mutate(name)}
                  disabled={saveMutation.isPending || !name.trim()}
                  className="px-3 py-1.5 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: OC.olive }}
                >
                  {saveMutation.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-slate-900">{company.name}</p>
              <p className="text-xs text-slate-400 mt-1">slug: {company.slug}</p>
            </div>
          )}
        </div>
      </div>

      <FooterNav step={1} onPrev={() => {}} onNext={() => onNext(name)} nextLabel="Continue" />
    </section>
  )
}

// ============================================================
// Step 2: Template Selection (Departments)
// ============================================================

function TemplateStep({
  companyId,
  onNext,
  onPrev,
}: {
  companyId: string
  onNext: (result: ApplyResult | null) => void
  onPrev: () => void
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<OrgTemplate | null>(null)
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null)
  const [customDept, setCustomDept] = useState('')
  const addToast = useToastStore((s) => s.addToast)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['org-templates', companyId],
    queryFn: () => api.get<{ data: OrgTemplate[] }>(`/admin/org-templates?companyId=${companyId}`),
    enabled: !!companyId,
  })

  const applyMutation = useMutation({
    mutationFn: (templateId: string) =>
      api.post<{ data: ApplyResult }>(`/admin/org-templates/${templateId}/apply`, {}),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['org-chart'] })
      qc.invalidateQueries({ queryKey: ['departments'] })
      qc.invalidateQueries({ queryKey: ['agents'] })
      setApplyResult(result.data)
      setSelectedTemplate(null)
      addToast({ type: 'success', message: '조직 템플릿이 적용되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const templates = data?.data || []

  // Show apply result
  if (applyResult) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: OC.sand }}>
        <div className="p-8">
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(85,107,47,0.1)' }}>
              <svg className="w-6 h-6" style={{ color: OC.olive }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              &quot;{applyResult.templateName}&quot; 적용 완료
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="rounded-lg px-4 py-3 text-center" style={{ backgroundColor: 'rgba(85,107,47,0.1)' }}>
              <p className="text-2xl font-bold" style={{ color: OC.olive }}>{applyResult.departmentsCreated}</p>
              <p className="text-xs" style={{ color: OC.oliveDark }}>부서 생성</p>
            </div>
            <div className="rounded-lg px-4 py-3 text-center" style={{ backgroundColor: 'rgba(163,177,138,0.2)' }}>
              <p className="text-2xl font-bold" style={{ color: OC.oliveDark }}>{applyResult.agentsCreated}</p>
              <p className="text-xs" style={{ color: OC.olive }}>에이전트 생성</p>
            </div>
          </div>
        </div>
        <FooterNav step={2} onPrev={onPrev} onNext={() => onNext(applyResult)} nextLabel="Continue to Agents" />
      </section>
    )
  }

  // Content card matching Stitch HTML structure
  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: OC.sand }}>
      <div className="p-8 border-b" style={{ borderColor: `${OC.sand}80` }}>
        <h1 className="text-2xl font-semibold text-slate-900">Define Your Departments</h1>
        <p className="mt-2 text-slate-500">Configure the logical structures of your organization. This helps CORTHEX categorize data and agent permissions.</p>
      </div>
      <div className="p-8">
        {/* Suggested Departments List */}
        <div className="space-y-4 mb-10">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Suggested Departments</h3>

          {isLoading ? (
            <div className="text-center text-slate-500 py-8">로딩 중...</div>
          ) : (
            <>
              {templates.map((t) => {
                const depts = t.templateData?.departments || []
                return depts.map((dept) => (
                  <div
                    key={`${t.id}-${dept.name}`}
                    className="flex items-center justify-between p-4 rounded-xl border transition-all"
                    style={{
                      backgroundColor: `${OC.cream}80`,
                      borderColor: OC.sand,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = OC.leaf)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = OC.sand)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5" style={{ color: OC.olive }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{dept.name}</p>
                        <p className="text-xs text-slate-500">{dept.agents.length} agents &middot; {dept.description || t.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTemplate(t)
                        applyMutation.mutate(t.id)
                      }}
                      disabled={applyMutation.isPending}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors text-white disabled:opacity-50"
                      style={{ backgroundColor: OC.olive }}
                    >
                      {applyMutation.isPending ? '적용 중...' : 'Apply'}
                    </button>
                  </div>
                ))
              })}

              {/* Blank org option */}
              <div
                className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer"
                style={{ borderColor: OC.sand }}
                onClick={() => onNext(null)}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = OC.leaf)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = OC.sand)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">빈 조직으로 시작</p>
                    <p className="text-xs text-slate-500">템플릿 없이 부서와 에이전트를 직접 구성</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Department Add */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: `${OC.sand}80` }}>
          <label className="block text-sm font-semibold text-slate-700 mb-3" htmlFor="custom-dept">Add Custom Department</label>
          <div className="flex gap-4">
            <input
              className="flex-grow rounded-lg bg-white"
              style={{ borderColor: OC.sand }}
              id="custom-dept"
              placeholder="e.g. Research & Development"
              type="text"
              value={customDept}
              onChange={(e) => setCustomDept(e.target.value)}
            />
            <button
              className="px-6 py-2 font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: OC.sand, color: OC.olive }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${OC.leaf}4d`)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = OC.sand)}
              onClick={() => {
                if (customDept.trim()) {
                  addToast({ type: 'success', message: `${customDept} 부서가 추가되었습니다.` })
                  setCustomDept('')
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <FooterNav
        step={2}
        onPrev={onPrev}
        onNext={() => onNext(null)}
        showSkip
        onSkip={() => onNext(null)}
        nextLabel="Continue to Agents"
      />
    </section>
  )
}

// ============================================================
// Step 3: API Keys
// ============================================================

function ApiKeyStep({
  companyId,
  onNext,
  onPrev,
}: {
  companyId: string
  onNext: (keysRegistered: number) => void
  onPrev: () => void
}) {
  const addToast = useToastStore((s) => s.addToast)
  const qc = useQueryClient()
  const [savedCount, setSavedCount] = useState(0)
  const [fields, setFields] = useState<Record<string, Record<string, string>>>({
    anthropic: {},
  })

  const { data: providerData } = useQuery({
    queryKey: ['api-key-providers'],
    queryFn: () => api.get<{ data: ProviderSchemas }>('/admin/api-keys/providers'),
  })

  const { data: existingKeys } = useQuery({
    queryKey: ['company-api-keys', companyId],
    queryFn: () => api.get<{ data: Array<{ id: string; provider: string }> }>('/admin/api-keys'),
    enabled: !!companyId,
  })

  const providerSchemas = providerData?.data || {}
  const existingProviders = new Set((existingKeys?.data || []).map((k) => k.provider))

  const saveMutation = useMutation({
    mutationFn: (body: { companyId: string; provider: string; credentials: Record<string, string>; scope: 'company' }) =>
      api.post('/admin/api-keys', body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['company-api-keys'] })
      setSavedCount((c) => c + 1)
      setFields((f) => ({ ...f, [variables.provider]: {} }))
      addToast({ type: 'success', message: `${PROVIDER_LABELS[variables.provider]} 키가 등록되었습니다` })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const handleSave = (provider: string) => {
    const creds = fields[provider]
    if (!creds || Object.values(creds).some((v) => !v.trim())) {
      addToast({ type: 'error', message: '모든 필드를 입력해주세요' })
      return
    }
    saveMutation.mutate({ companyId, provider, credentials: creds, scope: 'company' })
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: OC.sand }}>
      <div className="p-8 border-b" style={{ borderColor: `${OC.sand}80` }}>
        <h1 className="text-2xl font-semibold text-slate-900">API Key Setup</h1>
        <p className="mt-2 text-slate-500">
          AI 에이전트가 사용할 외부 API 키를 등록합니다. 나중에 설정해도 됩니다.
        </p>
      </div>
      <div className="p-8 space-y-4">
        {ONBOARDING_PROVIDERS.map((provider) => {
          const schemaFields = providerSchemas[provider] || ['api_key']
          const alreadyExists = existingProviders.has(provider)

          return (
            <div
              key={provider}
              className="rounded-xl border p-4"
              style={{ borderColor: OC.sand, backgroundColor: `${OC.cream}40` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {PROVIDER_LABELS[provider]}
                </h3>
                {alreadyExists && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(85,107,47,0.1)', color: OC.olive }}>
                    등록됨
                  </span>
                )}
              </div>

              {alreadyExists ? (
                <p className="text-xs text-slate-500">이미 등록된 키가 있습니다. 설정 페이지에서 변경할 수 있습니다.</p>
              ) : (
                <div className="space-y-2">
                  {schemaFields.map((field) => (
                    <div key={field}>
                      <label className="block text-xs text-slate-500 mb-1">{field}</label>
                      <input
                        type="password"
                        value={fields[provider]?.[field] || ''}
                        onChange={(e) =>
                          setFields((f) => ({
                            ...f,
                            [provider]: { ...f[provider], [field]: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-white text-sm text-slate-900 font-mono"
                        style={{ borderColor: OC.sand }}
                        placeholder={`${PROVIDER_LABELS[provider]} ${field}`}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => handleSave(provider)}
                    disabled={saveMutation.isPending}
                    className="px-3 py-1.5 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: OC.olive }}
                  >
                    {saveMutation.isPending ? '등록 중...' : '등록'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <FooterNav
        step={3}
        onPrev={onPrev}
        onNext={() => onNext(savedCount + existingProviders.size)}
        showSkip
        onSkip={() => onNext(savedCount + existingProviders.size)}
        nextLabel={savedCount > 0 || existingProviders.size > 0 ? 'Continue' : 'Set up later'}
      />
    </section>
  )
}

// ============================================================
// Step 4: Invite Employee
// ============================================================

function InviteStep({
  companyId,
  onNext,
  onPrev,
}: {
  companyId: string
  onNext: (invited: InvitedEmployee[]) => void
  onPrev: () => void
}) {
  const addToast = useToastStore((s) => s.addToast)
  const [form, setForm] = useState({ username: '', name: '', email: '', departmentIds: [] as string[] })
  const [invited, setInvited] = useState<InvitedEmployee[]>([])
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const { data: deptData } = useQuery({
    queryKey: ['departments', companyId],
    queryFn: () => api.get<{ data: Department[] }>('/admin/departments'),
    enabled: !!companyId,
  })

  const departments = deptData?.data || []

  const inviteMutation = useMutation({
    mutationFn: (body: { username: string; name: string; email: string; departmentIds?: string[] }) =>
      api.post<{ data: { employee: { id: string }; initialPassword: string } }>('/admin/employees', body),
    onSuccess: (result) => {
      setInvited((prev) => [...prev, { name: form.name, email: form.email, initialPassword: result.data.initialPassword }])
      setForm({ username: '', name: '', email: '', departmentIds: [] })
      addToast({ type: 'success', message: `${form.name}님을 초대했습니다` })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const handleInvite = () => {
    if (!form.username.trim() || !form.name.trim() || !form.email.trim()) {
      addToast({ type: 'error', message: '아이디, 이름, 이메일을 모두 입력해주세요' })
      return
    }
    inviteMutation.mutate({
      username: form.username,
      name: form.name,
      email: form.email,
      ...(form.departmentIds.length > 0 ? { departmentIds: form.departmentIds } : {}),
    })
  }

  const copyPassword = useCallback(async (password: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(password)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch {
      addToast({ type: 'error', message: '복사에 실패했습니다' })
    }
  }, [addToast])

  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: OC.sand }}>
      <div className="p-8 border-b" style={{ borderColor: `${OC.sand}80` }}>
        <h1 className="text-2xl font-semibold text-slate-900">Invite Team Members</h1>
        <p className="mt-2 text-slate-500">
          팀원을 초대해보세요. 나중에 직원 관리 페이지에서도 추가할 수 있습니다.
        </p>
      </div>
      <div className="p-8 space-y-6">
        {/* Invited list */}
        {invited.length > 0 && (
          <div className="space-y-2">
            {invited.map((emp, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-lg border" style={{ backgroundColor: 'rgba(85,107,47,0.05)', borderColor: OC.leaf }}>
                <div>
                  <p className="text-sm font-medium text-slate-900">{emp.name}</p>
                  <p className="text-xs text-slate-500">{emp.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white px-2 py-1 rounded border font-mono" style={{ borderColor: OC.sand }}>
                    {emp.initialPassword}
                  </code>
                  <button
                    onClick={() => copyPassword(emp.initialPassword, idx)}
                    className="text-xs" style={{ color: OC.olive }}
                  >
                    {copiedIdx === idx ? '복사됨!' : '복사'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invite form */}
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: OC.sand }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">아이디</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white text-sm text-slate-900"
                style={{ borderColor: OC.sand }}
                placeholder="user01"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">이름</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white text-sm text-slate-900"
                style={{ borderColor: OC.sand }}
                placeholder="홍길동"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white text-sm text-slate-900"
              style={{ borderColor: OC.sand }}
              placeholder="hong@company.com"
            />
          </div>
          {departments.length > 0 && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">부서 (선택)</label>
              <select
                value={form.departmentIds[0] || ''}
                onChange={(e) => setForm({ ...form, departmentIds: e.target.value ? [e.target.value] : [] })}
                className="w-full px-3 py-2 border rounded-lg bg-white text-sm text-slate-900"
                style={{ borderColor: OC.sand }}
              >
                <option value="">부서 선택 (선택사항)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
              className="px-4 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: OC.olive }}
            >
              {inviteMutation.isPending ? '초대 중...' : '초대하기'}
            </button>
          </div>
        </div>
      </div>

      <FooterNav
        step={4}
        onPrev={onPrev}
        onNext={() => onNext(invited)}
        showSkip={invited.length === 0}
        onSkip={() => onNext([])}
        nextLabel={invited.length > 0 ? 'Continue' : 'Skip for now'}
      />
    </section>
  )
}

// ============================================================
// Step 5: Summary
// ============================================================

function SummaryStep({
  companyName,
  templateResult,
  apiKeysCount,
  invitedEmployees,
  companyId,
  onComplete,
  onPrev,
}: {
  companyName: string
  templateResult: ApplyResult | null
  apiKeysCount: number
  invitedEmployees: InvitedEmployee[]
  companyId: string
  onComplete: () => void
  onPrev: () => void
}) {
  const addToast = useToastStore((s) => s.addToast)
  const qc = useQueryClient()

  const completeMutation = useMutation({
    mutationFn: async () => {
      const companyRes = await api.get<{ data: Company }>(`/admin/companies/${companyId}`)
      const existingSettings = companyRes.data.settings || {}
      return api.patch<{ data: Company }>(`/admin/companies/${companyId}`, {
        settings: { ...existingSettings, onboardingCompleted: true },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-detail'] })
      qc.invalidateQueries({ queryKey: ['companies'] })
      addToast({ type: 'success', message: '온보딩이 완료되었습니다!' })
      onComplete()
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const summaryItems = [
    { label: '회사', value: companyName },
    {
      label: '조직 템플릿',
      value: templateResult
        ? `${templateResult.templateName} (부서 ${templateResult.departmentsCreated}개, 에이전트 ${templateResult.agentsCreated}명)`
        : '빈 조직 (직접 구성)',
    },
    { label: 'API 키', value: apiKeysCount > 0 ? `${apiKeysCount}개 등록` : '미등록 (나중에 설정)' },
    { label: '초대 직원', value: invitedEmployees.length > 0 ? `${invitedEmployees.length}명` : '없음 (나중에 초대)' },
  ]

  return (
    <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: OC.sand }}>
      <div className="p-8">
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl text-white flex items-center justify-center" style={{ backgroundColor: OC.olive }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Setup Complete!</h2>
          <p className="text-sm text-slate-500">아래 설정이 완료되었습니다. 관리자 콘솔에서 조직을 관리하세요.</p>
        </div>

        <div className="max-w-md mx-auto space-y-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: `${OC.cream}80` }}>
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 pt-8">
          <button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="px-10 py-3 text-white text-sm font-bold rounded-xl transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 shadow-lg"
            style={{
              backgroundColor: OC.olive,
              boxShadow: `0 10px 15px -3px rgba(85,107,47,0.2)`,
            }}
          >
            {completeMutation.isPending ? '저장 중...' : 'CORTHEX 사용 시작하기'}
          </button>
          <button
            onClick={onPrev}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            &larr; 이전 단계로 돌아가기
          </button>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Main Onboarding Wizard Page
// ============================================================

export function OnboardingWizardPage() {
  const navigate = useNavigate()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const [companyName, setCompanyName] = useState('')
  const [templateResult, setTemplateResult] = useState<ApplyResult | null>(null)
  const [apiKeysCount, setApiKeysCount] = useState(0)
  const [invitedEmployees, setInvitedEmployees] = useState<InvitedEmployee[]>([])

  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company-detail', selectedCompanyId],
    queryFn: () => api.get<{ data: Company }>(`/admin/companies/${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const company = companyData?.data

  const markComplete = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  if (!selectedCompanyId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: OC.cream, fontFamily: "'Public Sans', sans-serif" }}>
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-500">사이드바에서 회사를 선택해주세요.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-white text-sm rounded-lg transition-colors"
            style={{ backgroundColor: OC.olive }}
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: OC.cream, fontFamily: "'Public Sans', sans-serif" }}>
        <div className="text-center text-slate-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: OC.cream, fontFamily: "'Public Sans', sans-serif", color: '#1e293b' }}>
      {/* Navigation Header */}
      <header className="w-full py-6 px-8 border-b bg-white/50 backdrop-blur-md sticky top-0 z-50" style={{ borderColor: OC.sand }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: OC.olive }}>
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-semibold tracking-tight" style={{ color: OC.olive }}>
              CORTHEX <span className="text-slate-400 font-light">v2</span>
            </span>
          </div>
          <div className="text-sm text-slate-500 italic">Admin Onboarding Experience</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12" data-testid="onboarding-page">
        {/* Step Indicator */}
        <StepIndicator current={currentStep} completed={completedSteps} />

        {/* Step content */}
        {currentStep === 1 && (
          <WelcomeStep
            company={company}
            onNext={(name) => {
              setCompanyName(name || company.name)
              markComplete(1)
              goToStep(2)
            }}
          />
        )}

        {currentStep === 2 && (
          <TemplateStep
            companyId={selectedCompanyId}
            onPrev={() => goToStep(1)}
            onNext={(result) => {
              setTemplateResult(result)
              markComplete(2)
              goToStep(3)
            }}
          />
        )}

        {currentStep === 3 && (
          <ApiKeyStep
            companyId={selectedCompanyId}
            onPrev={() => goToStep(2)}
            onNext={(count) => {
              setApiKeysCount(count)
              markComplete(3)
              goToStep(4)
            }}
          />
        )}

        {currentStep === 4 && (
          <InviteStep
            companyId={selectedCompanyId}
            onPrev={() => goToStep(3)}
            onNext={(employees) => {
              setInvitedEmployees(employees)
              markComplete(4)
              goToStep(5)
            }}
          />
        )}

        {currentStep === 5 && (
          <SummaryStep
            companyName={companyName || company.name}
            templateResult={templateResult}
            apiKeysCount={apiKeysCount}
            invitedEmployees={invitedEmployees}
            companyId={selectedCompanyId}
            onPrev={() => goToStep(4)}
            onComplete={() => navigate('/')}
          />
        )}

        <p className="text-center mt-8 text-xs text-slate-400">
          Need help? Check our <span className="underline" style={{ color: OC.olive }}>Onboarding Documentation</span>
        </p>
      </main>
    </div>
  )
}
