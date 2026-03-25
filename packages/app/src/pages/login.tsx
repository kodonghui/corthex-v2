import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { api } from '../lib/api'
import { RateLimitError } from '../lib/api'
import { AtSign, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

/* API: POST /api/auth/login */

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated, navigate, redirectTo])

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
      const res = await api.post<{ data: { token: string; user: { id: string; name: string; role: 'admin' | 'user'; companyId: string } } }>(
        '/auth/login',
        { username, password },
      )
      login(res.data.token, res.data.user)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof RateLimitError) {
        setCountdown(err.retryAfter)
        setError(`로그인 시도가 너무 많습니다. ${err.retryAfter}초 후 다시 시도해주세요`)
      } else {
        setError(err instanceof Error ? err.message : '로그인 실패')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-corthex-bg text-corthex-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #44403C 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Accent glow blobs */}
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] opacity-10 pointer-events-none blur-3xl rounded-full bg-corthex-accent" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] opacity-5 pointer-events-none blur-3xl rounded-full bg-corthex-info" />

      <main className="w-full max-w-md z-10 pb-20">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 flex items-center justify-center relative">
            <svg
              className="absolute inset-0 w-full h-full fill-none"
              stroke="currentColor"
              strokeWidth="5"
              viewBox="0 0 100 100"
              style={{ color: 'var(--color-corthex-accent)' }}
            >
              <path d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" />
            </svg>
            <span className="font-mono font-bold text-xl text-corthex-accent z-10">C</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-corthex-text-primary">CORTHEX</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary mt-1">
            AI Virtual Office Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-corthex-surface border border-corthex-border rounded-xl p-5 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-corthex-text-primary">Command Access</h2>
            <p className="text-corthex-text-secondary text-sm mt-1">
              Enter your credentials to access the terminal.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-corthex-text-primary" htmlFor="username">
                사용자 아이디
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="w-4 h-4 text-corthex-text-disabled group-focus-within:text-corthex-accent transition-colors" />
                </div>
                <input
                  className="block w-full pl-10 pr-4 py-2.5 text-base bg-corthex-elevated border border-corthex-border rounded-lg text-corthex-text-primary placeholder:text-corthex-text-disabled focus:outline-none focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent transition-all duration-200"
                  id="username"
                  placeholder="아이디를 입력하세요"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-corthex-text-primary" htmlFor="password">
                  비밀번호
                </label>
                <span className="text-xs font-medium text-corthex-accent hover:text-corthex-accent-hover transition-colors cursor-pointer">
                  비밀번호 찾기
                </span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-corthex-text-disabled group-focus-within:text-corthex-accent transition-colors" />
                </div>
                <input
                  className="block w-full pl-10 pr-10 py-2.5 text-base bg-corthex-elevated border border-corthex-border rounded-lg text-corthex-text-primary placeholder:text-corthex-text-disabled focus:outline-none focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent transition-all duration-200"
                  id="password"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center min-w-[44px] justify-center text-corthex-text-disabled hover:text-corthex-text-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                className="h-4 w-4 rounded bg-corthex-elevated border-corthex-border accent-corthex-accent"
                id="remember-me"
                type="checkbox"
              />
              <label className="ml-2 block text-sm text-corthex-text-secondary select-none" htmlFor="remember-me">
                Keep session persistent
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg text-sm bg-corthex-error/10 border border-corthex-error/20 text-corthex-error">
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent font-bold rounded-lg transition-all duration-200 active:scale-[0.98] group disabled:opacity-50"
              type="submit"
              disabled={loading || countdown > 0}
            >
              <span>
                {countdown > 0
                  ? `${countdown}초 후 재시도`
                  : loading
                    ? '로그인 중...'
                    : 'INITIALIZE COMMAND'}
              </span>
              {!loading && countdown <= 0 && (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          {/* Bottom Actions */}
          <div className="mt-8 pt-6 border-t border-corthex-border flex flex-col items-center gap-4">
            <p className="text-sm text-corthex-text-secondary text-center">
              Unauthorized access is monitored.{' '}
              <span className="text-corthex-accent font-medium cursor-pointer ml-1 hover:text-corthex-accent-hover">
                Request access
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-4 sm:py-6 flex flex-col items-center justify-center gap-2 px-4 z-10">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-1">
          {['Privacy Policy', 'Terms of Service', 'Support'].map((link) => (
            <span
              key={link}
              className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled hover:text-corthex-text-primary transition-colors cursor-pointer"
            >
              {link}
            </span>
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-secondary">
          © 2026 CORTHEX. AI Virtual Office Management Platform.
        </p>
      </footer>
    </div>
  )
}
