import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { api } from '../lib/api'
import { RateLimitError } from '../lib/api'

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

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Branded header */}
        <div className="text-center">
          <h1 className="text-white tracking-tight text-3xl sm:text-4xl font-bold leading-tight pb-1 inline-block border-b-4 border-cyan-400">CORTHEX</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-3">AI 조직 관리 플랫폼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Username input with icon */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 px-1">
              이메일 주소
            </label>
            <div className="flex w-full items-stretch rounded-xl bg-slate-900 border border-slate-800 focus-within:border-cyan-400 transition-colors">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex w-full min-w-0 flex-1 rounded-xl text-white bg-transparent h-14 placeholder:text-slate-500 p-4 pr-2 text-base border-none focus:outline-none focus:ring-0"
                placeholder="이메일을 입력하세요"
                required
                autoComplete="username"
              />
              <div className="text-slate-500 flex items-center justify-center pr-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>

          {/* Password input with visibility toggle */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 px-1">
              비밀번호
            </label>
            <div className="flex w-full items-stretch rounded-xl bg-slate-900 border border-slate-800 focus-within:border-cyan-400 transition-colors">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex w-full min-w-0 flex-1 rounded-xl text-white bg-transparent h-14 placeholder:text-slate-500 p-4 pr-2 text-base border-none focus:outline-none focus:ring-0"
                placeholder="비밀번호를 입력하세요"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-white flex items-center justify-center pr-4 transition-colors"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Login button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || countdown > 0}
              className="w-full h-14 bg-cyan-400 hover:bg-cyan-400/90 disabled:opacity-50 text-slate-950 rounded-xl text-base font-bold tracking-wide transition-colors"
            >
              {countdown > 0
                ? `${countdown}초 후 재시도`
                : loading
                  ? '로그인 중...'
                  : '로그인'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-slate-500 text-sm font-medium">또는</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Google OAuth button */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 h-14 bg-slate-900 text-white border border-slate-800 rounded-xl text-base font-medium hover:bg-slate-800 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-slate-900 font-bold text-xs">G</div>
            <span>Google로 계속하기</span>
          </button>
        </form>
      </div>
    </div>
  )
}
