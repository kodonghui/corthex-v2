/**
 * OnboardingWizard — Multi-step wizard with progress indicator.
 * Step 1: Company setup
 * Step 2: First department creation
 * Step 3: First agent creation
 * Step 4: API key configuration
 * Step 5: Welcome / tutorial
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../lib/api'
import {
  Building2,
  Users,
  Bot,
  Key,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────
interface WizardData {
  companyName: string
  companyLogo: string
  departmentName: string
  departmentDescription: string
  agentName: string
  agentRole: string
  agentModel: string
  apiProvider: string
  apiKey: string
}

const STEPS = [
  { id: 1, title: '회사 설정', icon: Building2 },
  { id: 2, title: '부서 생성', icon: Users },
  { id: 3, title: '에이전트 생성', icon: Bot },
  { id: 4, title: 'API 설정', icon: Key },
  { id: 5, title: '시작하기', icon: PartyPopper },
] as const

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
]

const initialData: WizardData = {
  companyName: '',
  companyLogo: '',
  departmentName: '',
  departmentDescription: '',
  agentName: '',
  agentRole: '',
  agentModel: 'claude-sonnet-4-6',
  apiProvider: 'anthropic',
  apiKey: '',
}

// ── Progress Indicator ─────────────────────────────
function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isActive = currentStep === step.id
        const isComplete = currentStep > step.id
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                isComplete
                  ? 'bg-[#606C38] text-white'
                  : isActive
                    ? 'bg-[#606C38]/10 text-[#606C38] ring-2 ring-[#606C38]'
                    : 'bg-[#f5f0e8] text-[#a3a08e]'
              }`}
            >
              {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-colors ${
                  currentStep > step.id ? 'bg-[#606C38]' : 'bg-[#e5e1d3]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step Components ────────────────────────────────
function StepCompany({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">회사 정보를 입력해 주세요</h2>
        <p className="text-sm text-[#6b705c]">CORTHEX에서 사용할 회사 이름을 설정합니다.</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">회사 이름 *</label>
          <input
            value={data.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="예: CORTHEX Corp."
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#a3a08e] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">로고 URL (선택)</label>
          <input
            value={data.companyLogo}
            onChange={(e) => onChange({ companyLogo: e.target.value })}
            placeholder="https://example.com/logo.png"
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#a3a08e] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38]"
          />
        </div>
      </div>
    </div>
  )
}

function StepDepartment({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">첫 부서를 만들어 보세요</h2>
        <p className="text-sm text-[#6b705c]">AI 에이전트를 배치할 부서를 생성합니다.</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">부서 이름 *</label>
          <input
            value={data.departmentName}
            onChange={(e) => onChange({ departmentName: e.target.value })}
            placeholder="예: 경영전략부"
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#a3a08e] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">설명 (선택)</label>
          <textarea
            value={data.departmentDescription}
            onChange={(e) => onChange({ departmentDescription: e.target.value })}
            placeholder="부서의 역할과 목적을 간단히 설명해 주세요"
            rows={3}
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#a3a08e] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38] resize-none"
          />
        </div>
      </div>
    </div>
  )
}

function StepAgent({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">첫 AI 에이전트를 만들어 보세요</h2>
        <p className="text-sm text-[#6b705c]">{data.departmentName || '부서'}에 배치할 에이전트를 설정합니다.</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">에이전트 이름 *</label>
          <input
            value={data.agentName}
            onChange={(e) => onChange({ agentName: e.target.value })}
            placeholder="예: 전략 분석관"
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#a3a08e] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">역할</label>
          <input
            value={data.agentRole}
            onChange={(e) => onChange({ agentRole: e.target.value })}
            placeholder="예: 시장 분석 및 전략 보고서 작성"
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#a3a08e] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38]"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">AI 모델</label>
          <select
            value={data.agentModel}
            onChange={(e) => onChange({ agentModel: e.target.value })}
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38] appearance-none"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

function StepApiKey({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">API 키를 설정하세요</h2>
        <p className="text-sm text-[#6b705c]">AI 에이전트가 동작하려면 API 키가 필요합니다. 나중에 설정할 수도 있습니다.</p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">API Provider</label>
          <select
            value={data.apiProvider}
            onChange={(e) => onChange({ apiProvider: e.target.value })}
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38] appearance-none"
          >
            <option value="anthropic">Anthropic (Claude)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#1a1a1a] mb-1 block">API Key (선택)</label>
          <input
            type="password"
            value={data.apiKey}
            onChange={(e) => onChange({ apiKey: e.target.value })}
            placeholder="sk-ant-..."
            className="w-full rounded-lg border border-[#e5e1d3] bg-white px-3 py-2 text-sm font-mono text-[#1a1a1a] placeholder:text-[#a3a08e] focus:outline-none focus:ring-2 focus:ring-[#606C38]/40 focus:border-[#606C38]"
          />
          <p className="text-xs text-[#6b705c] mt-1">나중에 설정 페이지에서 변경할 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}

function StepComplete({ data }: { data: WizardData }) {
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#606C38]/10 mb-4">
        <PartyPopper className="w-7 h-7 text-[#606C38]" />
      </div>
      <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">모든 준비가 완료되었습니다!</h2>
      <p className="text-sm text-[#6b705c] mb-6">
        {data.companyName || 'CORTHEX'}의 AI 조직이 구성되었습니다.
        허브에서 에이전트와 대화를 시작해 보세요.
      </p>
      <div className="bg-[#f5f0e8] rounded-xl p-4 text-left space-y-2 max-w-xs mx-auto">
        {data.companyName && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-[#606C38]" />
            <span className="text-[#1a1a1a]">{data.companyName}</span>
          </div>
        )}
        {data.departmentName && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-[#606C38]" />
            <span className="text-[#1a1a1a]">{data.departmentName}</span>
          </div>
        )}
        {data.agentName && (
          <div className="flex items-center gap-2 text-sm">
            <Bot className="w-4 h-4 text-[#606C38]" />
            <span className="text-[#1a1a1a]">{data.agentName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Wizard ────────────────────────────────────
export function OnboardingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(initialData)

  const updateData = (partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }

  const completeMutation = useMutation({
    mutationFn: () => api.post('/onboarding/complete', {
      companyName: data.companyName,
      department: data.departmentName ? { name: data.departmentName, description: data.departmentDescription } : undefined,
      agent: data.agentName ? { name: data.agentName, role: data.agentRole, modelName: data.agentModel } : undefined,
      apiKey: data.apiKey || undefined,
    }),
    onSuccess: () => {
      navigate('/hub', { replace: true })
    },
  })

  const canProceed = () => {
    switch (step) {
      case 1: return data.companyName.trim().length > 0
      case 2: return data.departmentName.trim().length > 0
      case 3: return data.agentName.trim().length > 0
      case 4: return true // API key is optional
      case 5: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
    else completeMutation.mutate()
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#faf8f5]">
      <main className="w-full max-w-lg" data-testid="onboarding-wizard">
        <section className="bg-white rounded-2xl shadow-sm border border-[#e5e1d3] overflow-hidden">
          <div className="px-6 pt-6">
            <StepProgress currentStep={step} />
          </div>

          <div className="px-6 pb-2">
            {step === 1 && <StepCompany data={data} onChange={updateData} />}
            {step === 2 && <StepDepartment data={data} onChange={updateData} />}
            {step === 3 && <StepAgent data={data} onChange={updateData} />}
            {step === 4 && <StepApiKey data={data} onChange={updateData} />}
            {step === 5 && <StepComplete data={data} />}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e1d3]">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-1 text-sm text-[#6b705c] hover:text-[#283618] disabled:invisible transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> 이전
            </button>
            <div className="text-xs text-[#a3a08e]">
              {step} / {STEPS.length}
            </div>
            <button
              onClick={handleNext}
              disabled={!canProceed() || completeMutation.isPending}
              className="flex items-center gap-1 px-4 py-2 bg-[#606C38] text-white text-sm font-medium rounded-lg hover:bg-[#7a8f5a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {step === 5 ? (completeMutation.isPending ? '완료 중...' : 'CORTHEX 시작') : '다음'}
              {step < 5 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
