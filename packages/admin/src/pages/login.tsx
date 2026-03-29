import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { api } from '../lib/api'
import { Shield, AtSign, Lock, LogIn } from 'lucide-react'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (countdown > 0) return
    setError('')
    setLoading(true)

    try {
      const res = await api.post<{
        data: { token: string; user: { id: string; name: string; role: string } }
      }>('/auth/admin/login', { username, password })

      login(res.data.token, { ...res.data.user, role: res.data.user.role as 'admin' | 'user' })
      const redirect = (searchParams.get('redirect') || '/').replace(/^\/admin/, '')
      navigate(redirect || '/')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'retryAfter' in err) {
        setCountdown((err as { retryAfter: number }).retryAfter)
        setError('')
      } else {
        setError(err instanceof Error ? err.message : '로그인 실패')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-corthex-bg text-corthex-text-primary">
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md">
          {/* Decorative blur orbs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-corthex-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-corthex-info/5 rounded-full blur-3xl pointer-events-none" />

          {/* Login card */}
          <div className="relative overflow-hidden rounded-xl p-6 sm:p-8 md:p-10 bg-corthex-surface border border-corthex-border/20">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-corthex-accent to-transparent opacity-50" />

            {/* Header */}
            <div className="flex flex-col items-center mb-8 sm:mb-10">
              <div
                className="w-16 h-16 bg-corthex-accent flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(202,138,4,0.3)]"
                style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
              >
                <Shield className="w-8 h-8 text-corthex-text-on-accent" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-corthex-text-primary">CORTHEX ADMIN</h1>
              <p className="text-corthex-text-secondary text-sm mt-1 font-mono tracking-widest uppercase">Central Command Access</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-corthex-accent font-mono">관리자 ID</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-corthex-text-secondary" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-black/30 border border-corthex-border/40 text-base text-corthex-text-primary placeholder:text-corthex-text-disabled focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent outline-none transition-all"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-corthex-accent font-mono">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-corthex-text-secondary" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-black/30 border border-corthex-border/40 text-base text-corthex-text-primary placeholder:text-corthex-text-disabled focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-corthex-error/10 border border-corthex-error/30">
                  <p className="text-sm text-corthex-error">{error}</p>
                </div>
              )}

              {countdown > 0 && (
                <div className="px-3 py-2 rounded-lg bg-corthex-warning/10 border border-corthex-warning/30">
                  <p className="text-sm text-corthex-warning">잠시 후 다시 시도하세요 ({countdown}초 후 잠금 해제)</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || countdown > 0}
                className="w-full bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent font-bold py-4 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50 min-h-[48px]"
              >
                {loading ? '로그인 중...' : countdown > 0 ? `${countdown}초 후 재시도` : '세션 시작'}
                {!loading && countdown <= 0 && <LogIn className="w-5 h-5" />}
              </button>
            </form>

            {/* Status indicators */}
            <div className="mt-8 flex justify-between items-center border-t border-corthex-border/30 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-corthex-success animate-pulse" />
                <span className="text-[10px] text-corthex-text-secondary font-mono uppercase tracking-widest">Mainframe Online</span>
              </div>
              <span className="text-[10px] text-corthex-text-secondary font-mono uppercase tracking-widest">v4.2.0-secure</span>
            </div>
          </div>

          {/* System message */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-corthex-text-disabled font-mono tracking-[0.2em] uppercase">Authorized Personnel Only. Unauthorized access is monitored and logged.</p>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 py-4 sm:py-6">
        <span className="text-corthex-text-disabled text-xs tracking-wide">© 2024 CORTHEX. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="/privacy" className="text-corthex-text-disabled text-xs hover:text-corthex-text-secondary transition-colors cursor-pointer">Privacy Policy</a>
          <a href="/terms" className="text-corthex-text-disabled text-xs hover:text-corthex-text-secondary transition-colors cursor-pointer">Terms of Service</a>
        </div>
      </footer>
    </div>
  )
}
