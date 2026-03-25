/**
 * WelcomeScreen — Shown on first login when no agents/departments exist.
 * "Get Started" button leads to OnboardingWizard.
 */
import { Sprout, ArrowRight } from 'lucide-react'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-corthex-bg">
      <div className="text-center max-w-md">
        {/* Logo/icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-corthex-accent/10 mb-6">
          <Sprout className="w-8 h-8 text-corthex-accent" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-corthex-text-primary mb-3">
          CORTHEX에 오신 것을 환영합니다
        </h1>
        <p className="text-corthex-text-secondary text-sm leading-relaxed mb-8">
          AI 에이전트 조직을 구성하고 운영하기 위한 모든 것을 준비해 드리겠습니다.
          간단한 설정만으로 바로 시작하실 수 있습니다.
        </p>

        {/* CTA */}
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-6 py-3 bg-corthex-accent text-white font-semibold rounded-xl hover:bg-corthex-accent-hover transition-colors shadow-md active:scale-[0.98]"
        >
          시작하기
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Footer hint */}
        <p className="mt-12 text-xs text-corthex-text-disabled">
          5단계 설정 가이드 · 약 3분 소요
        </p>
      </div>
    </div>
  )
}
