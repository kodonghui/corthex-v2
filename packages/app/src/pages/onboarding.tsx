// API: GET /onboarding/status, GET /onboarding/templates, POST /onboarding/select-template, POST /onboarding/complete

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
const ORGANIC = {
  bg: '#faf8f5',
  olive: '#556b2f',
  oliveLight: '#6b8e23',
  olivePale: '#f0f2eb',
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

const customStyles = `
body {
  background-color: #faf8f5;
}
.step-transition {
  transition: all 0.3s ease-in-out;
}
`

// ============================================================
// Step 1: Template Selection (Stitch HTML structure)
// ============================================================
function Step1TemplateSelection({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onNext,
  applying,
}: {
  templates: OrgTemplate[]
  selectedTemplate: string
  onSelectTemplate: (id: string) => void
  onNext: () => void
  applying: boolean
}) {
  return (
    <div className="step-transition">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-3" style={{ fontFamily: "'Noto Serif KR', serif" }}>템플릿 선택</h1>
        <p className="text-stone-500">CORTHEX v2 시작을 위한 비즈니스 환경을 선택해 주세요.</p>
      </header>
      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10" data-purpose="template-selection-grid">
        {templates.map((t) => {
          const isSelected = selectedTemplate === t.id
          const icon = getTemplateIcon(t.name)
          return (
            <label
              key={t.id}
              className="relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-colors group"
              style={{
                borderColor: isSelected ? ORGANIC.olive : '#f5f5f4',
                backgroundColor: isSelected ? ORGANIC.olivePale : 'transparent',
              }}
            >
              <input
                checked={isSelected}
                className="sr-only peer"
                name="template"
                type="radio"
                value={t.id}
                onChange={() => onSelectTemplate(t.id)}
              />
              <span className="text-4xl mb-4">{icon}</span>
              <h3 className="text-lg font-bold text-stone-800 mb-1" style={{ fontFamily: "'Noto Serif KR', serif" }}>{t.name}</h3>
              <p className="text-sm text-stone-500">{t.description}</p>
              <div
                className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: isSelected ? ORGANIC.olive : '#e7e5e4',
                  backgroundColor: isSelected ? ORGANIC.olive : 'transparent',
                }}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </label>
          )
        })}
      </div>
      <div className="flex justify-end">
        <button
          className="px-8 py-3 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
          style={{ backgroundColor: ORGANIC.olive }}
          onClick={onNext}
          disabled={applying || !selectedTemplate}
          data-purpose="btn-next"
        >
          {applying ? '적용 중...' : '다음 단계로'}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Step 2: Summary / Completion (Stitch HTML structure)
// ============================================================
function Step2Summary({
  applyResult,
  selectedTemplate,
  templates,
  onBack,
  onComplete,
  completing,
}: {
  applyResult: ApplyResult | null
  selectedTemplate: string
  templates: OrgTemplate[]
  onBack: () => void
  onComplete: () => void
  completing: boolean
}) {
  const template = templates.find((t) => t.id === selectedTemplate)
  const departments = template?.templateData?.departments || []
  const agents = departments.flatMap((d) => d.agents)

  return (
    <div className="step-transition">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-3" style={{ fontFamily: "'Noto Serif KR', serif" }}>설정 완료</h1>
        <p className="text-stone-500">선택하신 템플릿에 따라 다음 부서와 에이전트가 생성됩니다.</p>
      </header>
      <div className="space-y-6 mb-10" data-purpose="summary-container">
        {/* Department Summary */}
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: ORGANIC.olivePale, borderColor: `${ORGANIC.olive}1a` }}>
          <h3 className="font-bold mb-4 flex items-center" style={{ color: ORGANIC.olive, fontFamily: "'Noto Serif KR', serif" }}>
            <span className="mr-2">🏢</span> 생성될 부서
          </h3>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <span key={dept.name} className="px-3 py-1 bg-white border border-stone-200 rounded-full text-sm text-stone-600 font-medium">
                {dept.name}
              </span>
            ))}
            {departments.length === 0 && (
              <>
                <span className="px-3 py-1 bg-white border border-stone-200 rounded-full text-sm text-stone-600 font-medium">경영전략부</span>
                <span className="px-3 py-1 bg-white border border-stone-200 rounded-full text-sm text-stone-600 font-medium">기술개발팀</span>
                <span className="px-3 py-1 bg-white border border-stone-200 rounded-full text-sm text-stone-600 font-medium">데이터분석실</span>
              </>
            )}
          </div>
        </div>
        {/* Agent Summary */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
          <h3 className="text-stone-800 font-bold mb-4 flex items-center" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            <span className="mr-2">🤖</span> 배치될 AI 에이전트
          </h3>
          <ul className="space-y-3">
            {agents.length > 0 ? agents.map((agent) => (
              <li key={agent.name} className="flex items-center text-sm text-stone-600">
                <div className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: ORGANIC.olive }}></div>
                {agent.name} ({agent.tier === 'manager' ? 'Manager' : agent.tier === 'specialist' ? 'Specialist' : 'Worker'})
              </li>
            )) : (
              <>
                <li className="flex items-center text-sm text-stone-600">
                  <div className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: ORGANIC.olive }}></div>
                  수석 오케스트레이터 (Manager)
                </li>
                <li className="flex items-center text-sm text-stone-600">
                  <div className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: ORGANIC.olive }}></div>
                  기술 리서치 어시스턴트
                </li>
                <li className="flex items-center text-sm text-stone-600">
                  <div className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: ORGANIC.olive }}></div>
                  성과 분석 자동화 봇
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Apply result stats */}
        {applyResult && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg px-4 py-3" style={{ backgroundColor: `${ORGANIC.olive}1a` }}>
              <p className="text-2xl font-bold" style={{ color: ORGANIC.olive }}>{applyResult.departmentsCreated}</p>
              <p className="text-xs" style={{ color: ORGANIC.oliveLight }}>부서 생성</p>
            </div>
            <div className="bg-stone-50 rounded-lg px-4 py-3 border border-stone-100">
              <p className="text-2xl font-bold text-stone-700">{applyResult.agentsCreated}</p>
              <p className="text-xs text-stone-500">에이전트 생성</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <button
          className="text-stone-400 hover:text-stone-600 font-medium px-4 py-2 transition-colors"
          onClick={onBack}
        >
          이전으로
        </button>
        <button
          className="px-10 py-3 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          style={{ backgroundColor: ORGANIC.olive }}
          data-purpose="btn-complete"
          onClick={onComplete}
          disabled={completing}
        >
          {completing ? '완료 중...' : 'CORTHEX v2 시작하기'}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================
export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('')
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

  // Auto-select first template
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].id)
    }
  }, [templates, selectedTemplate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: ORGANIC.bg }}>
        <p className="text-stone-500">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: ORGANIC.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{customStyles}</style>
      {/* OnboardingWizardContainer */}
      <main className="w-full max-w-4xl" data-purpose="onboarding-wizard">
        {/* WizardCard */}
        <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden" data-purpose="wizard-card">
          {/* Progress Bar Header */}
          <div className="bg-stone-50 px-8 py-4 border-b border-stone-100 flex justify-between items-center" data-purpose="wizard-header">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Step</span>
              <div className="flex space-x-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: step === 1 ? ORGANIC.olive : '#e7e5e4' }}
                ></div>
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: step === 2 ? ORGANIC.olive : '#e7e5e4' }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-stone-500">{step} / 2</div>
          </div>
          <div className="p-8 md:p-12">
            {step === 1 && (
              <Step1TemplateSelection
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                onNext={() => {
                  if (selectedTemplate) {
                    applyMutation.mutate(selectedTemplate)
                  }
                }}
                applying={applyMutation.isPending}
              />
            )}
            {step === 2 && (
              <Step2Summary
                applyResult={applyResult}
                selectedTemplate={selectedTemplate}
                templates={templates}
                onBack={() => setStep(1)}
                onComplete={() => completeMutation.mutate()}
                completing={completeMutation.isPending}
              />
            )}
          </div>
        </section>
        {/* Footer */}
        <footer className="mt-8 text-center text-stone-400 text-sm">
          &copy; 2026 CORTHEX Corp. All rights reserved.
        </footer>
      </main>
    </div>
  )
}
