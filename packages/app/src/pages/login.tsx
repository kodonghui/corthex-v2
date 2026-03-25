import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { api } from '../lib/api'
import { RateLimitError } from '../lib/api'
import { Hexagon } from 'lucide-react'

/* API: POST /api/auth/login */

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-corthex-bg">
      {/* API: POST /api/auth/login */}
      <main className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-corthex-surface rounded-full mb-4 shadow-lg border border-corthex-border">
            <Hexagon className="w-8 h-8 text-corthex-accent" />
          </div>
          <h1 className="text-2xl font-bold text-corthex-text-primary">CORTHEX</h1>
          <p className="text-corthex-text-secondary mt-2">AI Virtual Office Platform</p>
        </header>

        {/* Login Form Card */}
        <section className="bg-corthex-surface rounded-2xl p-8 shadow-lg border border-corthex-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-corthex-text-primary" htmlFor="username">사용자 아이디</label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-corthex-elevated border border-corthex-border text-corthex-text-primary placeholder:text-corthex-text-disabled focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent focus:outline-none transition-colors duration-200"
                id="username"
                placeholder="아이디를 입력하세요"
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-corthex-text-primary" htmlFor="password">비밀번호</label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-corthex-elevated border border-corthex-border text-corthex-text-primary placeholder:text-corthex-text-disabled focus:border-corthex-accent focus:ring-1 focus:ring-corthex-accent focus:outline-none transition-colors duration-200"
                id="password"
                placeholder="비밀번호를 입력하세요"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg text-sm bg-corthex-error/10 border border-corthex-error/20 text-corthex-error">
                <p>{error}</p>
              </div>
            )}

            {/* Login Button */}
            <div className="pt-2">
              <button
                className="w-full text-corthex-text-on-accent font-semibold py-3 px-6 rounded-xl bg-corthex-accent hover:bg-corthex-accent-hover transition-all duration-300 transform active:scale-[0.98] shadow-md disabled:opacity-50 cursor-pointer"
                type="submit"
                disabled={loading || countdown > 0}
              >
                {countdown > 0
                  ? `${countdown}초 후 재시도`
                  : loading
                    ? '로그인 중...'
                    : '로그인'}
              </button>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between text-xs text-corthex-text-secondary pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input className="rounded border-corthex-border accent-corthex-accent" type="checkbox" />
                <span>아이디 저장</span>
              </label>
              <div className="space-x-3">
                <span className="text-corthex-text-disabled cursor-pointer hover:text-corthex-text-secondary transition-colors">아이디 찾기</span>
                <span className="text-corthex-border">|</span>
                <span className="text-corthex-text-disabled cursor-pointer hover:text-corthex-text-secondary transition-colors">비밀번호 찾기</span>
              </div>
            </div>
          </form>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-corthex-text-disabled">
          <p>© 2026 CORTHEX. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <span>개인정보처리방침</span>
            <span>이용약관</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
