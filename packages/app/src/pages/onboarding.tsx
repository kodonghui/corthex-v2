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
      <div className="min-h-screen flex items-center justify-center p-4 bg-corthex-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-corthex-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-corthex-text-secondary">로딩 중...</p>
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
