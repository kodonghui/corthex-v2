import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const FIRST_VISIT_KEY = 'corthex_first_visit'
const DISMISSED_KEY = 'corthex_install_dismissed'
const THREE_DAYS = 3 * 24 * 60 * 60 * 1000
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Record first visit
    if (!localStorage.getItem(FIRST_VISIT_KEY)) {
      localStorage.setItem(FIRST_VISIT_KEY, String(Date.now()))
    }

    // Already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      const evt = e as BeforeInstallPromptEvent
      setDeferredPrompt(evt)

      // Check timing: 3 days since first visit
      const firstVisit = Number(localStorage.getItem(FIRST_VISIT_KEY) || '0')
      if (Date.now() - firstVisit < THREE_DAYS) return

      // Check dismissed: 7 day cooldown
      const dismissed = Number(localStorage.getItem(DISMISSED_KEY) || '0')
      if (dismissed && Date.now() - dismissed < SEVEN_DAYS) return

      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-2 mb-2 bg-indigo-600 rounded-xl p-4 shadow-2xl flex items-center justify-between gap-3"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-corthex-surface/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
            C
          </div>
          <p className="text-white text-sm font-medium truncate">CORTHEX 앱 설치하기</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleDismiss}
            className="px-3 py-2 text-white/70 text-sm hover:text-white transition-colors">
            나중에
          </button>
          <button onClick={handleInstall}
            className="px-4 py-2 bg-corthex-surface text-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors">
            설치
          </button>
        </div>
      </div>
    </div>
  )
}
