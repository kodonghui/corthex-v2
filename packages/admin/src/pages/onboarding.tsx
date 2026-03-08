import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

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
  { num: 1, label: '환영' },
  { num: 2, label: '조직 템플릿' },
  { num: 3, label: 'API 키' },
  { num: 4, label: '직원 초대' },
  { num: 5, label: '완료' },
]

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  manager: { label: 'Manager', color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' },
  specialist: { label: 'Specialist', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  worker: { label: 'Worker', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
}

const ONBOARDING_PROVIDERS = ['openai', 'google_ai'] as const

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI (GPT)',
  google_ai: 'Google AI (Gemini)',
}

// ============================================================
// Step Indicator
// ============================================================

function StepIndicator({ current, completed }: { current: number; completed: Set<number> }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, idx) => {
        const isActive = step.num === current
        const isDone = completed.has(step.num)
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-[10px] mt-1 whitespace-nowrap ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-zinc-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 mb-4 ${
                  completed.has(step.num) ? 'bg-green-400' : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
              />
            )}
          </div>
        )
      })}
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
    <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-700">
      <div>
        {step > 1 && (
          <button
            onClick={onPrev}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ← 이전
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            건너뛰기
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {nextLabel || '다음 →'}
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
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
          C
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          CORTHEX에 오신 것을 환영합니다!
        </h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          AI 조직을 구성하고 운영하기 위한 관리자 콘솔입니다.
          몇 가지 기본 설정을 완료하면 바로 시작할 수 있습니다.
        </p>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">회사 정보</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              수정
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">회사명</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setEditing(false); setName(company.name) }}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400"
              >
                취소
              </button>
              <button
                onClick={() => saveMutation.mutate(name)}
                disabled={saveMutation.isPending || !name.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
              >
                {saveMutation.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{company.name}</p>
            <p className="text-xs text-zinc-400 mt-1">slug: {company.slug}</p>
          </div>
        )}
      </div>

      <FooterNav step={1} onPrev={() => {}} onNext={() => onNext(name)} />
    </div>
  )
}

// ============================================================
// Step 2: Template Selection
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
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            "{applyResult.templateName}" 적용 완료
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{applyResult.departmentsCreated}</p>
            <p className="text-xs text-green-600 dark:text-green-400">부서 생성</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{applyResult.agentsCreated}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">에이전트 생성</p>
          </div>
        </div>

        <FooterNav
          step={2}
          onPrev={onPrev}
          onNext={() => onNext(applyResult)}
        />
      </div>
    )
  }

  // Show template preview
  if (selectedTemplate) {
    const depts = selectedTemplate.templateData?.departments || []
    const totalAgents = depts.reduce((s, d) => s + d.agents.length, 0)

    return (
      <div className="space-y-6">
        <div>
          <button onClick={() => setSelectedTemplate(null)} className="text-xs text-indigo-600 dark:text-indigo-400 mb-2">
            ← 다른 템플릿 보기
          </button>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedTemplate.name}</h3>
          <p className="text-sm text-zinc-500">{depts.length}개 부서 · {totalAgents}명 에이전트</p>
        </div>

        {selectedTemplate.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedTemplate.description}</p>
        )}

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {depts.map((dept) => (
            <div key={dept.name} className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-800">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{dept.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 ml-auto">
                  {dept.agents.length}명
                </span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {dept.agents.map((agent) => {
                  const tier = TIER_LABELS[agent.tier] || TIER_LABELS.specialist
                  return (
                    <div key={agent.name} className="flex items-center gap-3 px-4 py-2">
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">{agent.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.color}`}>{tier.label}</span>
                      <span className="text-xs text-zinc-400 ml-auto">{agent.modelName}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => applyMutation.mutate(selectedTemplate.id)}
          disabled={applyMutation.isPending}
          className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {applyMutation.isPending ? '적용 중...' : '이 조직 사용하기'}
        </button>

        <FooterNav
          step={2}
          onPrev={onPrev}
          onNext={() => setSelectedTemplate(null)}
          showSkip
          onSkip={() => onNext(null)}
          nextLabel="다른 템플릿"
        />
      </div>
    )
  }

  // Show template cards
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">조직 템플릿 선택</h2>
        <p className="text-sm text-zinc-500">
          미리 구성된 템플릿으로 빠르게 시작하거나, 빈 조직으로 직접 설계하세요.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-500 py-8">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => {
            const depts = t.templateData?.departments || []
            const totalAgents = depts.reduce((s, d) => s + d.agents.length, 0)
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className="text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
              >
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                  {t.name}
                </h3>
                {t.description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">{t.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span>{depts.length}개 부서</span>
                  <span>{totalAgents}명 에이전트</span>
                </div>
              </button>
            )
          })}

          {/* Blank org option */}
          <button
            onClick={() => onNext(null)}
            className="text-left bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
              빈 조직으로 시작
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
              템플릿 없이 부서와 에이전트를 직접 구성합니다.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>비서실장만 포함</span>
            </div>
          </button>
        </div>
      )}

      <FooterNav
        step={2}
        onPrev={onPrev}
        onNext={() => onNext(null)}
        showSkip
        onSkip={() => onNext(null)}
        nextLabel="건너뛰기"
      />
    </div>
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
    openai: {},
    google_ai: {},
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">API 키 설정</h2>
        <p className="text-sm text-zinc-500">
          AI 에이전트가 사용할 외부 API 키를 등록합니다. 나중에 설정해도 됩니다.
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        {ONBOARDING_PROVIDERS.map((provider) => {
          const schemaFields = providerSchemas[provider] || ['api_key']
          const alreadyExists = existingProviders.has(provider)

          return (
            <div
              key={provider}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {PROVIDER_LABELS[provider]}
                </h3>
                {alreadyExists && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    등록됨
                  </span>
                )}
              </div>

              {alreadyExists ? (
                <p className="text-xs text-zinc-500">이미 등록된 키가 있습니다. 설정 페이지에서 변경할 수 있습니다.</p>
              ) : (
                <div className="space-y-2">
                  {schemaFields.map((field) => (
                    <div key={field}>
                      <label className="block text-xs text-zinc-500 mb-1">{field}</label>
                      <input
                        type="password"
                        value={fields[provider]?.[field] || ''}
                        onChange={(e) =>
                          setFields((f) => ({
                            ...f,
                            [provider]: { ...f[provider], [field]: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder={`${PROVIDER_LABELS[provider]} ${field}`}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => handleSave(provider)}
                    disabled={saveMutation.isPending}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
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
        nextLabel={savedCount > 0 || existingProviders.size > 0 ? '다음 →' : '나중에 설정하기'}
      />
    </div>
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">첫 직원 초대</h2>
        <p className="text-sm text-zinc-500">
          팀원을 초대해보세요. 나중에 직원 관리 페이지에서도 추가할 수 있습니다.
        </p>
      </div>

      {/* Invited list */}
      {invited.length > 0 && (
        <div className="space-y-2 max-w-lg mx-auto">
          {invited.map((emp, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{emp.name}</p>
                <p className="text-xs text-zinc-500">{emp.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 font-mono">
                  {emp.initialPassword}
                </code>
                <button
                  onClick={() => copyPassword(emp.initialPassword, idx)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                >
                  {copiedIdx === idx ? '복사됨!' : '복사'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite form */}
      <div className="max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">아이디</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="user01"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">이름</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="홍길동"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="hong@company.com"
          />
        </div>
        {departments.length > 0 && (
          <div>
            <label className="block text-xs text-zinc-500 mb-1">부서 (선택)</label>
            <select
              value={form.departmentIds[0] || ''}
              onChange={(e) => setForm({ ...form, departmentIds: e.target.value ? [e.target.value] : [] })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {inviteMutation.isPending ? '초대 중...' : '초대하기'}
          </button>
        </div>
      </div>

      <FooterNav
        step={4}
        onPrev={onPrev}
        onNext={() => onNext(invited)}
        showSkip={invited.length === 0}
        onSkip={() => onNext([])}
        nextLabel={invited.length > 0 ? '다음 →' : '건너뛰기'}
      />
    </div>
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
      // First fetch current settings to preserve them
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
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500 text-white flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">준비 완료!</h2>
        <p className="text-sm text-zinc-500">아래 설정이 완료되었습니다. 관리자 콘솔에서 조직을 관리하세요.</p>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{item.label}</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 pt-4">
        <button
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
        >
          {completeMutation.isPending ? '저장 중...' : 'CORTHEX 사용 시작하기'}
        </button>
        <button
          onClick={onPrev}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← 이전 단계로 돌아가기
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Main Onboarding Wizard Page
// ============================================================

export function OnboardingWizardPage() {
  const navigate = useNavigate()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)

  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Wizard data
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-sm text-zinc-500">사이드바에서 회사를 선택해주세요.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !company) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-zinc-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        <StepIndicator current={currentStep} completed={completedSteps} />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-8">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>

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
    </div>
  )
}
