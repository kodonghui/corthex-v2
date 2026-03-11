import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

// ============================================================
// Types
// ============================================================
type TemplateAgent = {
  name: string
  nameEn?: string
  role: string
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
}

type TemplateDepartment = {
  name: string
  description?: string
  agents: TemplateAgent[]
}

type OrgTemplate = {
  id: string
  name: string
  description: string | null
  templateData: { departments: TemplateDepartment[] }
  isBuiltin: boolean
  tags: string[] | null
}

type ApplyResult = {
  templateId: string
  templateName: string
  departmentsCreated: number
  departmentsSkipped: number
  agentsCreated: number
  agentsSkipped: number
}

// ============================================================
// Constants
// ============================================================
const TIER_LABELS: Record<string, { label: string; color: string }> = {
  manager: { label: 'Manager', color: 'bg-blue-900 text-blue-300' },
  specialist: { label: 'Specialist', color: 'bg-cyan-900 text-cyan-300' },
  worker: { label: 'Worker', color: 'bg-slate-700 text-slate-400' },
}

const TEMPLATE_ICONS: Record<string, string> = {
  '기본': '🏢',
  '기술': '💻',
  '마케팅': '📢',
  '투자': '📈',
}

function getTemplateIcon(name: string): string {
  for (const [key, icon] of Object.entries(TEMPLATE_ICONS)) {
    if (name.includes(key)) return icon
  }
  return '🏢'
}

// ============================================================
// Step 1: Template Selection
// ============================================================
function TemplateStep({
  templates,
  onSelect,
  applying,
}: {
  templates: OrgTemplate[]
  onSelect: (templateId: string) => void
  applying: boolean
}) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const previewTemplate = templates.find((t) => t.id === previewId)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-50">조직 구조를 선택하세요</h2>
        <p className="text-sm text-slate-400 mt-2">
          회사에 맞는 조직 템플릿을 선택하면 부서와 AI 에이전트가 자동으로 생성됩니다.
          <br />
          나중에 자유롭게 수정할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {templates.map((t) => {
          const depts = t.templateData?.departments || []
          const totalAgents = depts.reduce((s, d) => s + d.agents.length, 0)
          return (
            <button
              key={t.id}
              onClick={() => setPreviewId(t.id)}
              disabled={applying}
              className="text-left rounded-xl p-5 transition-all cursor-pointer group bg-slate-800/50 border border-slate-700 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getTemplateIcon(t.name)}</span>
                <h3 className="text-base font-semibold text-slate-50 group-hover:text-blue-400 transition-colors">
                  {t.name}
                </h3>
              </div>
              {t.description && (
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{t.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{depts.length}개 부서</span>
                <span>{totalAgents}명 에이전트</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setPreviewId(null)}>
          <div
            role="dialog"
            aria-modal="true"
            className="bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-slate-50">
                  {getTemplateIcon(previewTemplate.name)} {previewTemplate.name}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {previewTemplate.templateData.departments.length}개 부서 ·{' '}
                  {previewTemplate.templateData.departments.reduce((s, d) => s + d.agents.length, 0)}명 에이전트
                </p>
              </div>
              <button onClick={() => setPreviewId(null)} className="text-slate-500 hover:text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {previewTemplate.description && (
                <p className="text-sm text-slate-400">{previewTemplate.description}</p>
              )}
              {previewTemplate.templateData.departments.map((dept) => (
                <div key={dept.name} className="border border-slate-700 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800">
                    <span className="text-sm font-medium text-slate-50">{dept.name}</span>
                    {dept.description && (
                      <span className="text-xs text-slate-500 truncate">— {dept.description}</span>
                    )}
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 ml-auto flex-shrink-0">
                      {dept.agents.length}명
                    </span>
                  </div>
                  {dept.agents.length > 0 && (
                    <div className="divide-y divide-slate-700">
                      {dept.agents.map((agent) => {
                        const tier = TIER_LABELS[agent.tier] || TIER_LABELS.specialist
                        return (
                          <div key={agent.name} className="flex items-center gap-3 px-4 py-2">
                            <span className="text-sm text-slate-50">{agent.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${tier.color}`}>{tier.label}</span>
                            <span className="text-xs text-slate-500 ml-auto">{agent.modelName}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => setPreviewId(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
              >
                돌아가기
              </button>
              <button
                onClick={() => onSelect(previewTemplate.id)}
                disabled={applying}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {applying ? '적용 중...' : '이 템플릿으로 시작'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Step 2: CLI Token Guide
// ============================================================
function CliGuideStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-50">Claude CLI 설정</h2>
        <p className="text-sm text-slate-400 mt-2">
          AI 에이전트가 작업하려면 Claude CLI 토큰이 필요합니다.
          <br />
          지금 설정하거나 나중에 자격증명 페이지에서 등록할 수 있습니다.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-5">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="text-sm font-medium text-slate-50">Claude Max 구독</p>
              <p className="text-xs text-slate-400 mt-0.5">anthropic.com에서 Claude Max ($220/월) 구독이 필요합니다.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="text-sm font-medium text-slate-50">CLI 설치</p>
              <div className="mt-1 bg-slate-900 rounded-lg px-3 py-2 font-mono text-xs text-slate-300">
                npm install -g @anthropic-ai/claude-code
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="text-sm font-medium text-slate-50">OAuth 인증</p>
              <div className="mt-1 bg-slate-900 rounded-lg px-3 py-2 font-mono text-xs text-slate-300">
                claude auth login
              </div>
              <p className="text-xs text-slate-400 mt-1">브라우저가 열리면 인증을 완료하세요. 토큰이 자동으로 발급됩니다.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <p className="text-sm font-medium text-slate-50">토큰 등록</p>
              <p className="text-xs text-slate-400 mt-0.5">
                관리자 콘솔 &rarr; 자격증명 관리에서 발급받은 토큰을 등록합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={onSkip}
          className="px-6 py-2.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          나중에 설정
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Step 3: Completion
// ============================================================
function CompleteStep({
  applyResult,
  onFinish,
  completing,
}: {
  applyResult: ApplyResult | null
  onFinish: () => void
  completing: boolean
}) {
  return (
    <div className="space-y-6 max-w-lg mx-auto text-center">
      <div>
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-50">준비 완료!</h2>
        <p className="text-sm text-slate-400 mt-2">
          AI 조직이 구성되었습니다. 사령관실에서 첫 명령을 내려보세요.
        </p>
      </div>

      {applyResult && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-900/20 rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-emerald-300">{applyResult.departmentsCreated}</p>
            <p className="text-xs text-emerald-400">부서 생성</p>
          </div>
          <div className="bg-blue-900/20 rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-blue-300">{applyResult.agentsCreated}</p>
            <p className="text-xs text-blue-400">에이전트 생성</p>
          </div>
        </div>
      )}

      <button
        onClick={onFinish}
        disabled={completing}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors"
      >
        {completing ? '완료 중...' : '사령관실로 이동'}
      </button>
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================
export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null)

  // Check onboarding status
  const { data: statusData } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => api.get<{ data: { completed: boolean } }>('/onboarding/status'),
  })

  // If already completed, redirect
  useEffect(() => {
    if (statusData?.data?.completed) {
      navigate('/', { replace: true })
    }
  }, [statusData, navigate])

  // Load templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['onboarding-templates'],
    queryFn: () => api.get<{ data: OrgTemplate[] }>('/onboarding/templates'),
    enabled: statusData?.data?.completed !== true,
  })

  // Apply template mutation
  const applyMutation = useMutation({
    mutationFn: (templateId: string) =>
      api.post<{ data: ApplyResult }>('/onboarding/select-template', { templateId }),
    onSuccess: (result) => {
      setApplyResult(result.data)
      setStep(2)
    },
    onError: (err: Error) => {
      alert(err.message || '템플릿 적용에 실패했습니다')
    },
  })

  // Complete onboarding mutation
  const completeMutation = useMutation({
    mutationFn: () => api.post<{ data: { message: string } }>('/onboarding/complete', {}),
    onSuccess: () => {
      navigate('/command-center', { replace: true })
    },
  })

  const templates = templatesData?.data || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-slate-900 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    s <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-xs hidden sm:block ${s <= step ? 'text-slate-300' : 'text-slate-600'}`}>
                  {s === 1 ? '조직 선택' : s === 2 ? 'CLI 설정' : '완료'}
                </span>
                {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-slate-800'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {step === 1 && (
          <TemplateStep
            templates={templates}
            onSelect={(id) => applyMutation.mutate(id)}
            applying={applyMutation.isPending}
          />
        )}
        {step === 2 && (
          <CliGuideStep onNext={() => setStep(3)} onSkip={() => setStep(3)} />
        )}
        {step === 3 && (
          <CompleteStep
            applyResult={applyResult}
            onFinish={() => completeMutation.mutate()}
            completing={completeMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}
