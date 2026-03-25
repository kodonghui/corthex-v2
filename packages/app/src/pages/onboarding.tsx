// API: GET /onboarding/status, GET /onboarding/templates, POST /onboarding/select-template, POST /onboarding/complete

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { WelcomeScreen } from '../components/onboarding/WelcomeScreen'
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard'

// ============================================================
// Onboarding state detection
// ============================================================
type OnboardingStatus = {
  completed: boolean
  hasAgents: boolean
  hasDepartments: boolean
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [showWizard, setShowWizard] = useState(false)

  // Check onboarding status
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => api.get<{ data: OnboardingStatus }>('/onboarding/status'),
  })

  const status = statusData?.data

  // If already completed (has agents), redirect to hub
  useEffect(() => {
    if (status?.completed || status?.hasAgents) {
      navigate('/hub', { replace: true })
    }
  }, [status, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-corthex-bg flex items-center justify-center p-4">
        {/* Background dot grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #44403C 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="w-10 h-10 border-2 border-corthex-accent border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-corthex-accent mb-1">
              Mission Initialization
            </p>
            <p className="text-sm text-corthex-text-secondary">시스템 상태 확인 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // No agents → show onboarding
  if (!showWizard) {
    return <WelcomeScreen onGetStarted={() => setShowWizard(true)} />
  }

  return <OnboardingWizard />
}
