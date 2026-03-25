/**
 * Onboarding Wizard Page — Industrial Dark Theme
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
import { ChevronLeft, ChevronRight, Check, Building2, Plus, Key, Users, ArrowRight } from 'lucide-react'

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
  manager: { label: 'Manager', color: 'bg-corthex-accent-deep/10 text-corthex-accent-deep' },
  specialist: { label: 'Specialist', color: 'bg-corthex-accent/10 text-corthex-accent' },
  worker: { label: 'Worker', color: 'bg-corthex-elevated text-corthex-text-secondary' },
}

const ONBOARDING_PROVIDERS = ['anthropic'] as const

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
}

// ============================================================
// Segmented Progress Bar (Industrial)
// ============================================================

const TOTAL_SEGMENTS = 20

function StepIndicator({ current }: { current: number }) {
  const activeSegments = Math.round((current / STEPS.length) * TOTAL_SEGMENTS)
  return (
    <div className="w-full mb-12">
      <div className="flex justify-between items-end mb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent">
          System Initialization
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-secondary">
          Step {String(current).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
        </div>
      </div>
      <div className="flex gap-1 h-2 w-full">
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 transition-colors duration-200 ${
              i < activeSegments ? 'bg-corthex-accent' : 'bg-corthex-elevated'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className={`font-mono text-[9px] uppercase tracking-widest transition-colors ${
              step.num === current
                ? 'text-corthex-accent'
                : step.num < current
                ? 'text-corthex-text-secondary'
                : 'text-corthex-text-disabled'
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Card Wrapper (industrial border-l-4 style)
// ============================================================

function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-corthex-surface border-l-4 border-corthex-accent relative">
      {/* Decorative corner bracket */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-corthex-border opacity-30 pointer-events-none" />
      {children}
    </div>
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
    <div className="px-8 py-6 flex justify-between items-center border-t border-corthex-border/40">
      <div>
        {step > 1 && (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-corthex-text-secondary hover:text-corthex-text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="font-mono text-xs uppercase tracking-[0.15em] text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors"
          >
            Skip for now
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex items-center gap-3 bg-corthex-elevated hover:bg-corthex-accent text-corthex-text-primary hover:text-corthex-text-on-accent font-mono font-bold text-xs uppercase tracking-[0.15em] py-4 px-8 transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-corthex-border hover:border-corthex-accent"
        >
          {nextLabel || 'Continue'}
          <ArrowRight className="w-4 h-4" />
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
    <StepCard>
      <div className="p-10 border-b border-corthex-border/40">
        <h1 className="font-mono text-3xl font-extrabold tracking-tighter uppercase text-corthex-text-primary mb-2">
          Create Company Entity
        </h1>
        <p className="text-corthex-text-secondary text-sm max-w-md">
          Provision a new industrial workspace on the CORTHEX backbone. Define your corporate parameters below.
        </p>
      </div>

      <div className="p-10 space-y-8">
        {/* Company Name */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-corthex-text-secondary block">
            Company Name
          </label>
          {editing ? (
            <div className="space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-corthex-bg border-0 border-b-2 border-corthex-border focus:border-corthex-accent focus:ring-0 text-corthex-text-primary font-mono tracking-tight py-3 px-0 placeholder:text-corthex-text-disabled transition-colors duration-150 text-lg"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setEditing(false); setName(company.name) }}
                  className="font-mono text-xs uppercase tracking-[0.15em] text-corthex-text-secondary hover:text-corthex-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveMutation.mutate(name)}
                  disabled={saveMutation.isPending || !name.trim()}
                  className="font-mono text-xs uppercase tracking-[0.15em] text-corthex-text-on-accent bg-corthex-accent px-4 py-2 disabled:opacity-50 transition-colors"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-corthex-border py-3">
              <span className="font-mono text-xl text-corthex-text-primary tracking-tight">{company.name}</span>
              <button
                onClick={() => setEditing(true)}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent hover:text-corthex-accent-hover transition-colors"
              >
                Edit
              </button>
            </div>
          )}
          <p className="font-mono text-[9px] text-corthex-text-disabled uppercase tracking-widest">
            slug: {company.slug}
          </p>
        </div>

        {/* Welcome message */}
        <div className="bg-corthex-elevated border-l-2 border-corthex-accent px-5 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-corthex-accent mb-1">System Ready</p>
          <p className="text-corthex-text-secondary text-sm">
            AI 조직을 구성하고 운영하기 위한 관리자 콘솔입니다. 몇 가지 기본 설정을 완료하면 바로 시작할 수 있습니다.
          </p>
        </div>
      </div>

      <FooterNav step={1} onPrev={() => {}} onNext={() => onNext(name)} nextLabel="Next: Departments" />
    </StepCard>
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
      <StepCard>
        <div className="p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-corthex-accent/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-corthex-accent" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent">Applied</p>
              <h3 className="font-mono text-lg font-bold text-corthex-text-primary tracking-tighter">
                &quot;{applyResult.templateName}&quot;
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div className="bg-corthex-elevated border border-corthex-border px-4 py-4">
              <p className="font-mono text-2xl font-bold text-corthex-accent">{applyResult.departmentsCreated}</p>
              <p className="font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mt-1">부서 생성</p>
            </div>
            <div className="bg-corthex-elevated border border-corthex-border px-4 py-4">
              <p className="font-mono text-2xl font-bold text-corthex-accent">{applyResult.agentsCreated}</p>
              <p className="font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mt-1">에이전트 생성</p>
            </div>
          </div>
        </div>
        <FooterNav step={2} onPrev={onPrev} onNext={() => onNext(applyResult)} nextLabel="Continue to Agents" />
      </StepCard>
    )
  }

  return (
    <StepCard>
      <div className="p-10 border-b border-corthex-border/40">
        <h1 className="font-mono text-3xl font-extrabold tracking-tighter uppercase text-corthex-text-primary mb-2">
          Define Your Departments
        </h1>
        <p className="text-corthex-text-secondary text-sm">
          Configure the logical structures of your organization. This helps CORTHEX categorize data and agent permissions.
        </p>
      </div>
      <div className="p-10 space-y-6">
        {/* Template list */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-corthex-text-secondary mb-4">
            Suggested Departments
          </p>

          {isLoading ? (
            <div className="text-center text-corthex-text-secondary py-8 font-mono text-sm">로딩 중...</div>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => {
                const depts = t.templateData?.departments || []
                return depts.map((dept) => (
                  <div
                    key={`${t.id}-${dept.name}`}
                    className="flex items-center justify-between p-4 border border-corthex-border hover:border-corthex-accent bg-corthex-elevated transition-colors duration-150"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 bg-corthex-surface flex items-center justify-center border border-corthex-border">
                        <Building2 className="w-4 h-4 text-corthex-accent" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-bold text-corthex-text-primary">{dept.name}</p>
                        <p className="font-mono text-[10px] text-corthex-text-secondary">
                          {dept.agents.length} agents &middot; {dept.description || t.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTemplate(t)
                        applyMutation.mutate(t.id)
                      }}
                      disabled={applyMutation.isPending}
                      className="font-mono text-[10px] uppercase tracking-[0.15em] bg-corthex-accent text-corthex-text-on-accent px-4 py-2 hover:bg-corthex-accent-hover disabled:opacity-50 transition-colors"
                    >
                      {applyMutation.isPending && selectedTemplate?.id === t.id ? '적용 중...' : 'Apply'}
                    </button>
                  </div>
                ))
              })}

              {/* Blank org option */}
              <div
                className="flex items-center gap-4 p-4 border border-dashed border-corthex-border hover:border-corthex-accent transition-colors cursor-pointer"
                onClick={() => onNext(null)}
              >
                <div className="w-9 h-9 bg-corthex-surface flex items-center justify-center border border-corthex-border">
                  <Plus className="w-4 h-4 text-corthex-text-disabled" />
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-corthex-text-primary">빈 조직으로 시작</p>
                  <p className="font-mono text-[10px] text-corthex-text-secondary">
                    템플릿 없이 부서와 에이전트를 직접 구성
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Department Add */}
        <div className="pt-6 border-t border-corthex-border/40">
          <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-corthex-text-secondary block mb-3" htmlFor="custom-dept">
            Add Custom Department
          </label>
          <div className="flex gap-2">
            <input
              id="custom-dept"
              type="text"
              value={customDept}
              onChange={(e) => setCustomDept(e.target.value)}
              className="flex-grow bg-corthex-bg border-0 border-b-2 border-corthex-border focus:border-corthex-accent focus:ring-0 text-corthex-text-primary font-mono py-3 px-0 placeholder:text-corthex-text-disabled transition-colors"
              placeholder="e.g. Research & Development"
            />
            <button
              className="font-mono text-[10px] uppercase tracking-[0.15em] bg-corthex-elevated hover:bg-corthex-accent text-corthex-text-secondary hover:text-corthex-text-on-accent px-5 py-3 border border-corthex-border hover:border-corthex-accent transition-all"
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
    </StepCard>
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
    queryFn: () => api.get<{ data: Array<{ id: string; provider: string }> }>(`/admin/api-keys?companyId=${companyId}`),
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
    <StepCard>
      <div className="p-10 border-b border-corthex-border/40">
        <h1 className="font-mono text-3xl font-extrabold tracking-tighter uppercase text-corthex-text-primary mb-2">
          API Key Setup
        </h1>
        <p className="text-corthex-text-secondary text-sm">
          AI 에이전트가 사용할 외부 API 키를 등록합니다. 나중에 설정해도 됩니다.
        </p>
      </div>
      <div className="p-10 space-y-4">
        {ONBOARDING_PROVIDERS.map((provider) => {
          const schemaFields = providerSchemas[provider] || ['api_key']
          const alreadyExists = existingProviders.has(provider)

          return (
            <div
              key={provider}
              className="border border-corthex-border bg-corthex-elevated p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-corthex-accent" />
                  <h3 className="font-mono text-sm font-bold text-corthex-text-primary uppercase tracking-wider">
                    {PROVIDER_LABELS[provider]}
                  </h3>
                </div>
                {alreadyExists && (
                  <span className="font-mono text-[9px] uppercase tracking-widest bg-corthex-accent/10 text-corthex-accent px-2 py-1">
                    등록됨
                  </span>
                )}
              </div>

              {alreadyExists ? (
                <p className="font-mono text-xs text-corthex-text-secondary">
                  이미 등록된 키가 있습니다. 설정 페이지에서 변경할 수 있습니다.
                </p>
              ) : (
                <div className="space-y-4">
                  {schemaFields.map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-corthex-text-secondary block">
                        {field}
                      </label>
                      <input
                        type="password"
                        value={fields[provider]?.[field] || ''}
                        onChange={(e) =>
                          setFields((f) => ({
                            ...f,
                            [provider]: { ...f[provider], [field]: e.target.value },
                          }))
                        }
                        className="w-full bg-corthex-bg border-0 border-b-2 border-corthex-border focus:border-corthex-accent focus:ring-0 text-corthex-text-primary font-mono py-3 px-0 placeholder:text-corthex-text-disabled transition-colors"
                        placeholder={`${PROVIDER_LABELS[provider]} ${field}`}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => handleSave(provider)}
                    disabled={saveMutation.isPending}
                    className="font-mono text-[10px] uppercase tracking-[0.15em] bg-corthex-accent text-corthex-text-on-accent px-5 py-2 disabled:opacity-50 hover:bg-corthex-accent-hover transition-colors"
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
    </StepCard>
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
    <StepCard>
      <div className="p-10 border-b border-corthex-border/40">
        <h1 className="font-mono text-3xl font-extrabold tracking-tighter uppercase text-corthex-text-primary mb-2">
          Invite Team Members
        </h1>
        <p className="text-corthex-text-secondary text-sm">
          팀원을 초대해보세요. 나중에 직원 관리 페이지에서도 추가할 수 있습니다.
        </p>
      </div>
      <div className="p-10 space-y-6">
        {/* Invited list */}
        {invited.length > 0 && (
          <div className="space-y-2">
            {invited.map((emp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 bg-corthex-elevated border border-corthex-accent/30"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-corthex-text-primary">{emp.name}</p>
                  <p className="font-mono text-[10px] text-corthex-text-secondary">{emp.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="font-mono text-xs bg-corthex-bg border border-corthex-border px-2 py-1 text-corthex-text-secondary">
                    {emp.initialPassword}
                  </code>
                  <button
                    onClick={() => copyPassword(emp.initialPassword, idx)}
                    className="font-mono text-[10px] uppercase tracking-[0.15em] text-corthex-accent hover:text-corthex-accent-hover transition-colors"
                  >
                    {copiedIdx === idx ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invite form */}
        <div className="border border-corthex-border bg-corthex-elevated p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-4 h-4 text-corthex-accent" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent">Add Member</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-corthex-text-secondary block">아이디</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-corthex-bg border-0 border-b-2 border-corthex-border focus:border-corthex-accent focus:ring-0 text-corthex-text-primary font-mono py-3 px-0 placeholder:text-corthex-text-disabled transition-colors"
                placeholder="user01"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-corthex-text-secondary block">이름</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-corthex-bg border-0 border-b-2 border-corthex-border focus:border-corthex-accent focus:ring-0 text-corthex-text-primary font-mono py-3 px-0 placeholder:text-corthex-text-disabled transition-colors"
                placeholder="홍길동"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-corthex-text-secondary block">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-corthex-bg border-0 border-b-2 border-corthex-border focus:border-corthex-accent focus:ring-0 text-corthex-text-primary font-mono py-3 px-0 placeholder:text-corthex-text-disabled transition-colors"
              placeholder="hong@company.com"
            />
          </div>
          {departments.length > 0 && (
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-corthex-text-secondary block">부서 (선택)</label>
              <select
                value={form.departmentIds[0] || ''}
                onChange={(e) => setForm({ ...form, departmentIds: e.target.value ? [e.target.value] : [] })}
                className="w-full bg-corthex-bg border-0 border-b-2 border-corthex-border focus:border-corthex-accent focus:ring-0 text-corthex-text-primary font-mono py-3 px-0 transition-colors"
              >
                <option value="">부서 선택 (선택사항)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleInvite}
              disabled={inviteMutation.isPending}
              className="font-mono text-[10px] uppercase tracking-[0.15em] bg-corthex-accent text-corthex-text-on-accent px-6 py-2.5 disabled:opacity-50 hover:bg-corthex-accent-hover transition-colors"
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
    </StepCard>
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
    onSuccess: async () => {
      await qc.refetchQueries({ queryKey: ['company-detail', companyId] })
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
    <StepCard>
      <div className="p-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-corthex-accent flex items-center justify-center">
            <Check className="w-6 h-6 text-corthex-text-on-accent" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent">Setup Complete</p>
            <h2 className="font-mono text-2xl font-extrabold tracking-tighter uppercase text-corthex-text-primary">
              CORTHEX 준비 완료
            </h2>
          </div>
        </div>
        <p className="text-corthex-text-secondary text-sm mb-8">
          아래 설정이 완료되었습니다. 관리자 콘솔에서 조직을 관리하세요.
        </p>

        <div className="space-y-2 mb-10">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-5 py-3 bg-corthex-elevated border border-corthex-border"
            >
              <span className="font-mono text-xs text-corthex-text-secondary uppercase tracking-widest">{item.label}</span>
              <span className="font-mono text-sm font-bold text-corthex-text-primary">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-3">
          <button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="flex items-center gap-3 bg-corthex-accent text-corthex-text-on-accent font-mono font-bold text-xs uppercase tracking-[0.15em] py-4 px-10 hover:bg-corthex-accent-hover disabled:opacity-50 active:scale-95 transition-all duration-150"
          >
            {completeMutation.isPending ? '저장 중...' : 'CORTHEX 사용 시작하기'}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onPrev}
            className="font-mono text-xs text-corthex-text-secondary hover:text-corthex-text-primary transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" />
            이전 단계로 돌아가기
          </button>
        </div>
      </div>
    </StepCard>
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
      <div className="min-h-screen bg-corthex-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-mono text-sm text-corthex-text-secondary">사이드바에서 회사를 선택해주세요.</p>
          <button
            onClick={() => navigate('/')}
            className="font-mono text-xs uppercase tracking-[0.15em] bg-corthex-accent text-corthex-text-on-accent px-6 py-3 hover:bg-corthex-accent-hover transition-colors"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !company) {
    return (
      <div className="min-h-screen bg-corthex-bg flex items-center justify-center">
        <div className="font-mono text-sm text-corthex-text-secondary">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-corthex-bg" data-testid="onboarding-page">
      {/* dot grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#44403C 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-10 w-full bg-corthex-surface border-b-2 border-corthex-accent flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-black text-corthex-accent tracking-tighter">CORTHEX</span>
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-corthex-text-secondary">
          Admin Onboarding
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-20">
        {/* Industrial Progress Bar */}
        <StepIndicator current={currentStep} />

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

        {/* Technical metadata footer */}
        <div className="mt-12 flex justify-between items-center opacity-30">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-corthex-border" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled">
              Node: Admin-Primary-01
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled">
            v2 // Industrial Authority Protocol
          </span>
        </div>
      </main>
    </div>
  )
}

// Suppress unused import warning for TIER_LABELS (used by future agent tier display)
void TIER_LABELS
